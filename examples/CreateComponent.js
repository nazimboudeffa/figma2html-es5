require('..');

var component = new Figma.Component();

(async() => {

    var output = await component.toReact('1BxUUxfG68UY9XNj1Jcc5n')
    console.log(output)

})();