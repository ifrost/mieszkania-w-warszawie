var mockFsSetup = {
    clear: function() {
        this.contents = {};
    },
    writeContent: function(filename, content) {
        if (!this.contents) {
            throw new Error("fs mock is not set up. Please call mockFsSetup.clear().")
        }
        this.contents[filename] = content;
    },
    getContent: function(filename) {
        return this.contents[filename];
    }
};

var mockFs = {
    writeFileSync: function(filename, content) {
        mockFsSetup.writeContent(filename, content);
    }
};

module.exports = { mockFsSetup, mockFs }