var chai = require("chai");

var sampleDataFactory = require("../data/sample-data-factory");

var { mockFsSetup, mockFs } = require("../mocks/fs.mock");
var { mockNodeFetchSetup, mockNodeFetch } = require("../mocks/node-fetch.mock");
var { mockProcessSetup, mockProcess } = require("../mocks/process.mock");
var { mockLoggerSetup, mockLogger } = require("../mocks/logger.mock");

var mock = require("mock-require");

describe("Index", function() {

    var getData;

    beforeEach(function() {
        mock("fs",  mockFs);
        mock("node-fetch", mockNodeFetch);
        mock("process", mockProcess);
        mock("../../logger", mockLogger);
        
        getData = mock.reRequire("../../get-data");

        mockLoggerSetup.clear();
        mockNodeFetchSetup.clear();
        mockFsSetup.clear();

        mockNodeFetchSetup.addResponse(/https:\/\/www.olx.pl\/nieruchomosci\/mieszkania\/wynajem\/warszawa\/\?search.*page=\d+/, sampleDataFactory.generateSearchPage());
        mockNodeFetchSetup.addResponse(/https:\/\/www.olx.pl\/oferta\.*/, sampleDataFactory.generateAd("olx"));
        mockNodeFetchSetup.addResponse(/https:\/\/www.otodom.pl\/oferta\.*/, sampleDataFactory.generateAd("otodom"));
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

