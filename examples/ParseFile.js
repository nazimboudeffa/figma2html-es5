const FigmaParser = require('../index.js');

var fp = new FigmaParser();
(async() => {
    var output = await fp.parse('geAMrwlV7cJBTia4YMSODH')
    console.log(output);
})();