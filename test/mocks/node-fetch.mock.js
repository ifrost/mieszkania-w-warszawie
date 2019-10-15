var mockNodeFetchSetup = {
    clear: function() {
        this.responses = [];
    },
    addResponse: function(urlRegExp, response) {
        this.responses.push({ urlRegExp: urlRegExp, response: response });
    },
    getResponse: function(url) {
        if (!this.responses) {
            throw new Error("node fetch not initialised. Please call mockNodeFetchSetup.clear() before the test.");
        }
        var responses = this.responses.filter(function(pattern) {
            return pattern.urlRegExp.test(url);
        });

        if (responses.length === 0) {
            throw new Error("Response for URL " + url + " not set up. Please call mockNodeFetchSetup.addResponse(urlRegExp, response).");
        }
        else if (responses.length > 1) {
            throw new Error("More than one pattern matches " + url + " URL. Please add unambiguous mockNodeFetchSetup.addResponse(urlRegExp, response).");
        }

        return responses[0].response;
    }
};

var mockNodeFetch = async function(url) {
    var mockResult = {};
    mockResult.text = async function() {
        return Promise.resolve(mockNodeFetchSetup.getResponse(url));
    }
    return Promise.resolve(mockResult);
}

module.exports = { mockNodeFetchSetup, mockNodeFetch }