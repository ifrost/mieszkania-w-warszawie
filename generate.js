var fs = require("fs");

data = JSON.parse(fs.readFileSync("data.json", { encoding: "utf-8" }));

console.log(data);

