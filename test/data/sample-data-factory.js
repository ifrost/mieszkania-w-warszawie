var fs = require("fs");

var searchPage = fs.readFileSync("./test/data/search-page.html", { encoding: "utf-8" });
var olxResultPage = fs.readFileSync("./test/data/olx.result.html", { encoding: "utf-8" });
var otoDomResultPage = fs.readFileSync("./test/data/otodom.result.html", { encoding: "utf-8" });

module.exports = {
    generateSearchPage(page) {
        return searchPage;
    },
    generateAd(source) {
        if (source === 'olx') {
            return olxResultPage;
        } else if (source === 'otodom') {
            return otoDomResultPage;
        }
    }
}