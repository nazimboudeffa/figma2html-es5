Figma.Tag = function () {
    this.name,
    this.isText,
    this.textCharacters = null,
    this.isImg,
    this.properties,
    this.css,
    this.children = [],
    this.node,
    this.isComponent,
    this.buildTagTree = function (node, unitType) {
        if (!node.visible) {
            return null
          }
        const isImg = isImageNode(node)
        const properties = []

        if (isImg) {
            properties.push({ name: 'src', value: '' })
        }

        const childTags = []
        if ('children' in node && !isImg) {
            node.children.forEach((child) => {
            const childTag = buildTagTree(child, unitType)
            if (childTag) {
                childTags.push(childTag)
            }
            })
        }
        return {
            name : this.isImage ? 'img' : node.name,
            isText : node.type === 'TEXT',
            textCharacters : node.type === 'TEXT' ? node.characters : null,
            isImg : this.isImage,
            css : getCssDataForTag(node, unitType),
            properties,
            children : childTags,
            node
        }
    }
}