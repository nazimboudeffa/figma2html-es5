require('..');

var fp = new Figma.Parser();

(async() => {

    var output = await fp.toReact('1BxUUxfG68UY9XNj1Jcc5n')
    console.log(output)

})();