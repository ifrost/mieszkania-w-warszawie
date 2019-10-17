var mockLoggerSetup = {
    logs: [],
    clear: function() {
        this.logs = [];
    }
}

var mockLogger = {
    log: function() {
        var message = Array.prototype.slice.call(arguments).join(' ');
        mockLoggerSetup.logs.push(message);
    }
}

module.exports = { mockLoggerSetup, mockLogger };