Figma.Builder = function () {
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
    this.buildTagTree = function (node, unitType) {
        /*
        if (!node.visible) {
            return null
          }
        
        const isImg = isImageNode(node)
        const properties = []

        if (isImg) {
            properties.push({ name: 'src', value: '' })
        }
        */
        const childTags = []
        if ('children' in node /* && !isImg */) {
            node.children.forEach((child) => {
            const childTag = this.buildTagTree(child, unitType)
            if (childTag) {
                childTags.push(childTag)
            }
            })
        }
        return {
            name : node.name,
            isText : node.type === 'TEXT',
            textCharacters : node.type === 'TEXT' ? node.characters : null,
            isImg : false,
            //css : getCssDataForTag(node, unitType),
            //properties,
            children : childTags,
            node
        }
    }
    this.guessTagName = function(name) {
        const _name = name.toLowerCase()
        if (_name.includes('button')) {
            return 'button'
        }
        if (_name.includes('section')) {
            return 'section'
        }
        if (_name.includes('article')) {
            return 'article'
        }
        return 'div'
    }
    this.getTagName = function(tag, cssStyle) {
        if (cssStyle === 'css' && !tag.isComponent) {
            if (tag.isImg) {
            return 'img'
            }
            if (tag.isText) {
            return 'p'
            }
            return guessTagName(tag.name)
        }
        return tag.isText ? 'Text' : tag.name.replace(/\s/g, '')
    }
    this.buildCode =  function (tagName, cssStyle){
        return 'const';
    }
    this.generate = async function (fileId, config) {
        this.fileKey = fileId;
        var doc = await this.getDocument();
        var tag = this.buildTagTree(doc.children[0].children[0]);
        var generatedCode = this.buildCode(tag, null);
        return tag;
    }
}