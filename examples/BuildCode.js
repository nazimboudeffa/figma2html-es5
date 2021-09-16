require('..');

var builder = new Figma.Builder();

(async() => {

    const config = {
        codeType : 'react', //or 'html'
        cssStyle : 'css', //or 'scss'
    }

    var output = await builder.generate('1BxUUxfG68UY9XNj1Jcc5n', config)
    console.log(output)

})();