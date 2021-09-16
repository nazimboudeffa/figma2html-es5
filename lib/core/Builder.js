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
    this.buildSpaces = function(baseSpaces, level) {
        let spacesStr = ''
    
        for (let i = 0; i < baseSpaces; i++) {
        spacesStr += ' '
        }
    
        for (let i = 0; i < level; i++) {
        spacesStr += '  '
        }
        return spacesStr
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
    this.kebabize = function (str) {
        return str
            .split('')
            .map((letter, idx) => {
            return letter.toUpperCase() === letter ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}` : letter
            })
            .join('')
            .replace(/\s/g, '')
    }
    this.capitalizeFirstLetter = function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }
    this.getClassName = function (tag, cssStyle) {
        if (cssStyle === 'css' && !tag.isComponent) {
            if (tag.isImg) {
            return ''
            }
            if (tag.isText) {
            return ' className="text"'
            }
            return ` className="${this.kebabize(tag.name)}"`
        }
        return ''
    }
    this.buildChildTagsString = function (tag, cssStyle, level) {
        if (tag.children.length > 0) {
            return '\n' + tag.children.map((child) => buildJsxString(child, cssStyle, level + 1)).join('\n')
        }
        if (tag.isText) {
            return `${tag.textCharacters}`
        }
        return ''
    }
    this.buildJSXString = function (tag, cssStyle, level) {
        if (!tag) {
            return ''
          }
        
        var spaceString = this.buildSpaces(4, level)
        var hasChildren = tag.children.length > 0
        
        var tagName = this.getTagName(tag);
        var className = this.getClassName(tag, cssStyle)

        const openingTag = `<${tagName}${className}${hasChildren || tag.isText ? `` : ' /'}>`
        const childTags = this.buildChildTagsString(tag, cssStyle, level)
        const closingTag = hasChildren || tag.isText ? `${!tag.isText ? '\n' + spaceString : ''}</${tagName}>` : ''
      
        return openingTag + childTags + closingTag
        //return '<div></div>'
    }
    this.buildCode =  function (tag, codeType, cssStyle){
        var code = ''; 
        if (codeType == 'react') {
            code += 'const ' + this.capitalizeFirstLetter(tag.name.replace(/\s/g, '')) + '() => {\n';
            code += 'return (' + this.buildJSXString(tag, cssStyle, 0) +')\n';
            code += '}';
        } else {
            code += '<' + tag.name + '></' + tag.name + '>';
        }
        return code;
    }
    this.generate = async function (fileId, config) {
        this.fileKey = fileId;
        var doc = await this.getDocument();
        var tag = this.buildTagTree(doc.children[0].children[0].children[0]);
        var generatedCode = this.buildCode(tag, config.codeType, config.cssStyle);
        return generatedCode;
        //return tag;
    }
}