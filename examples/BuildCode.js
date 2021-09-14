require('..');

var builder = new Figma.Builder();

(async() => {

    var output = await builder.generate('1BxUUxfG68UY9XNj1Jcc5n')
    console.log(output)

})();