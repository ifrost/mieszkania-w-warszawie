var fs = require("fs"); 

function generateIndexHtml() {
    var html = fs.readFileSync('index.html.template', { encoding: 'utf-8' });
    html = html.replace('<%= cachebuster %>', Date.now());
    fs.writeFileSync("index.html", html, { encoding: 'utf-8' });
}

generateIndexHtml();
