Figma.Parser = function(){
    this.fileKey;
    this.baseUrl = 'https://api.figma.com';

    this.react = new Figma.Component();

    this.vectorMap = {};
    this.vectorList = [];
    this.vectorTypes = ['VECTOR', 'LINE', 'REGULAR_POLYGON', 'ELLIPSE', 'STAR'];
    this.output = [];

    this.client = axios.create({
        baseURL: `https://api.figma.com/v1/`,
        headers: {
            "X-Figma-Token": process.env.TOKEN,
        },
    })

    this.getDocument = async function (){
        return this.client
            .get('files/'+ this.fileKey)
            .then((data) => {
                return data.data.document;
            })
            .catch((error) => {
                return error.data.status;
            })
    }

    this.parse = async function (fileId){
        this.fileKey = fileId;
        var document = await this.getDocument();
        //console.log(document);
		await this.parseTree(document.children, "");
		return this.output;
    }

    this.parseTree = function(pages, name){
        console.log(pages);
        for (var i = 0; i < pages.length; i++) {
			var page = pages[i];


			if (page["children"]) {
				this.parseTree(page["children"], page.name);
			}

			var layer = page["children"] ? page["children"][0] : page;

            this.output.push({
                name : page.name,
                parent : name
            });
        }
        /*
        this.output = {
            name : pages[0].name,
            backgroundColor : pages[0].backgroundColor[0],
            degree: pages[0].children.length,
            children1 : pages[0].children[0]
        }   
        */
        return this.output;
    }
    
    this.toHTML = async function () {
        this.fileKey = fileId;
        var doc = await this.getDocument();
        const canvas = doc.children[0];
        var html = ''
        return html;
    }

    this.preprocessTree = function (node) {
        let vectorsOnly = node.name.charAt(0) !== '#';
        let vectorVConstraint = null;
        let vectorHConstraint = null;

        function paintsRequireRender(paints) {
            if (!paints) return false;

            let numPaints = 0;
            for (const paint of paints) {
            if (paint.visible === false) continue;

            numPaints++;
            if (paint.type === 'EMOJI') return true;
            }

            return numPaints > 1;
        }

        if (paintsRequireRender(node.fills) ||
            paintsRequireRender(node.strokes) ||
            (node.blendMode != null && ['PASS_THROUGH', 'NORMAL'].indexOf(node.blendMode) < 0)) {
            node.type = 'VECTOR';
        }

        const children = node.children && node.children.filter((child) => child.visible !== false);
        if (children) {
            for (let j=0; j<children.length; j++) {
            if (this.vectorTypes.indexOf(children[j].type) < 0) vectorsOnly = false;
            else {
                if (vectorVConstraint != null && children[j].constraints.vertical != vectorVConstraint) vectorsOnly = false;
                if (vectorHConstraint != null && children[j].constraints.horizontal != vectorHConstraint) vectorsOnly = false;
                vectorVConstraint = children[j].constraints.vertical;
                vectorHConstraint = children[j].constraints.horizontal;
            }
            }
        }
        node.children = children;

        if (children && children.length > 0 && vectorsOnly) {
            node.type = 'VECTOR';
            node.constraints = {
            vertical: vectorVConstraint,
            horizontal: vectorHConstraint,
            };
        }

        if (this.vectorTypes.indexOf(node.type) >= 0) {
            node.type = 'VECTOR';
            vectorMap[node.id] = node;
            vectorList.push(node.id);
            node.children = [];
        }

        if (node.children) {
            for (const child of node.children) {
            this.preprocessTree(child);
            }
        }
    }

    this.toReact = async function (fileId) {
        this.fileKey = fileId;
        var doc = await this.getDocument();
        const canvas = doc.children[0];
        let html = '';

        for (let i=0; i<canvas.children.length; i++) {
            const child = canvas.children[i]
            if (child.name.charAt(0) === '#'  && child.visible !== false) {
            const child = canvas.children[i];
            this.preprocessTree(child);
            }
        }

        let guids = this.vectorList.join(',');

        var client = axios.create({
            baseURL: `https://api.figma.com/v1/`,
            headers: {
                "X-Figma-Token": process.env.TOKEN,
            },
        })

        data = await client
            .get('files/'+ this.fileKey)
            .then((data) => {
                return data;
            })
            .catch((error) => {
                return error.data.status;
            })
        
        const imageJSON = data;
        //data = await fetch(`${baseUrl}/v1/images/${fileKey}?ids=${guids}&format=svg`, {headers});
        //const imageJSON = await data.json();

        const images = imageJSON.images || {};
        if (images) {
            let promises = [];
            let guids = [];
            for (const guid in images) {
            if (images[guid] == null) continue;
            guids.push(guid);
            promises.push(fetch(images[guid]));
            }

            let responses = await Promise.all(promises);
            promises = [];
            for (const resp of responses) {
            promises.push(resp.text());
            }

            responses = await Promise.all(promises);
            for (let i=0; i<responses.length; i++) {
            images[guids[i]] = responses[i].replace('<svg ', '<svg preserveAspectRatio="none" ');
            }
        }

        const componentMap = {};
        let contents = `import React, { PureComponent } from 'react';\n`;
        let nextSection = '';

        for (let i=0; i<canvas.children.length; i++) {
            const child = canvas.children[i]
            if (child.name.charAt(0) === '#' && child.visible !== false) {
            const child = canvas.children[i];
            this.react.createComponent(child, images, componentMap);
            nextSection += `export class Master${child.name.replace(/\W+/g, "")} extends PureComponent {\n`;
            nextSection += "  render() {\n";
            nextSection += `    return <div className="master" style={{backgroundColor: "${this.react.colorString(child.backgroundColor)}"}}>\n`;
            nextSection += `      <C${child.name.replace(/\W+/g, "")} {...this.props} nodeId="${child.id}" />\n`;
            nextSection += "    </div>\n";
            nextSection += "  }\n";
            nextSection += "}\n\n";
            }
        }

        const imported = {};
        for (const key in componentMap) {
            const component = componentMap[key];
            const name = component.name;
            if (!imported[name]) {
            contents += `import { ${name} } from './components/${name}';\n`;
            }
            imported[name] = true;
        }
        contents += "\n";
        contents += nextSection;
        nextSection = '';

        contents += `export function getComponentFromId(id) {\n`;

        for (const key in componentMap) {
            contents += `  if (id === "${key}") return ${componentMap[key].instance};\n`;
            nextSection += componentMap[key].doc + "\n";
        }

        contents += "  return null;\n}\n\n";
        contents += nextSection;

        /*
        const path = "./src/figmaComponents.js";
        fs.writeFile(path, contents, function(err) {
            if (err) console.log(err);
            console.log(`wrote ${path}`);
        });
        */
        return contents;
    }
}