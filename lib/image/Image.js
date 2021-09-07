Figma.Image = function () {
    
    this.imageURL = function (hash) {
        const squash = hash.split('-').join('');
        return `url(https://s3-us-west-2.amazonaws.com/figma-alpha/img/${squash.substring(0, 4)}/${squash.substring(4, 8)}/${squash.substring(8)})`;
    }

}