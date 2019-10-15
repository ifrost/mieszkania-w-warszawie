var fs = require("fs");
var searchPage = fs.readFileSync("./test/data/search-page.html", { encoding: "utf-8" });
var olxResultPage = fs.readFileSync("./test/data/olx.result.html", { encoding: "utf-8" });
var otoDomResultPage = fs.readFileSync("./test/data/otodom.result.html", { encoding: "utf-8" });
var chai = require("chai");

var { mockFsSetup, mockFs } = require("../mocks/fs.mock");
var { mockNodeFetchSetup, mockNodeFetch } = require("../mocks/node-fetch.mock");
var { mockProcessSetup, mockProcess } = require("../mocks/process.mock");

var mock = require("mock-require");


describe("Index", function() {

    var getData;

    beforeEach(function() {
        mock("fs",  mockFs);
        mock("node-fetch", mockNodeFetch);
        mock("process", mockProcess);
        
        getData = mock.reRequire("../../get-data")

        mockNodeFetchSetup.clear();
        mockFsSetup.clear();

        mockNodeFetchSetup.addResponse(/https:\/\/www.olx.pl\/nieruchomosci\/mieszkania\/wynajem\/warszawa\/\?search.*page=\d+/, searchPage);
        mockNodeFetchSetup.addResponse(/https:\/\/www.olx.pl\/oferta\.*/, olxResultPage);
        mockNodeFetchSetup.addResponse(/https:\/\/www.otodom.pl\/oferta\.*/, otoDomResultPage);
    });

    it("runs without errors", async function() {
        await getData();
        var data = JSON.parse(mockFsSetup.getContent("data.json"));
        chai.assert.lengthOf(data.ads, 44);
    });

    afterEach(function() {
        mock.stopAll();
    });

});

