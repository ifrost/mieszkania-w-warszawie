var process = require("process");
var fetch = require("node-fetch");
var { parse } = require("node-html-parser");
var fs = require("fs"); 

var SEARCH_1 = "%5Bfilter_enum_floor_select%5D%5B0%5D=floor_2&search%5Bfilter_enum_floor_select%5D%5B1%5D=floor_3&search%5Bfilter_enum_floor_select%5D%5B2%5D=floor_4&search%5Bfilter_enum_floor_select%5D%5B3%5D=floor_5&search%5Bfilter_enum_floor_select%5D%5B4%5D=floor_6&search%5Bfilter_enum_floor_select%5D%5B5%5D=floor_7&search%5Bfilter_enum_furniture%5D%5B0%5D=yes&search%5Bfilter_float_m%3Afrom%5D=40&search%5Bfilter_enum_rooms%5D%5B0%5D=two&search%5Bphotos%5D=1";

var SEARCH = process.argv[2]  || SEARCH_1;
var URL = "https://www.olx.pl/nieruchomosci/mieszkania/wynajem/warszawa/?search";

console.log("Search:", SEARCH);

async function fetchHtml(url) {
    var result = await fetch(url);
    var html = await result.text();
    return parse(html);
}

async function getLinks(url) {
    var root = await fetchHtml(url);

    var ads = root.querySelectorAll("[data-cy=listing-ad-title]");
    var links = ads.map(function(element) {
        return element.attributes.href;
    });

    return links;
};

async function getAd(link) {
    var maxRetries = 3, data = null;

    while (maxRetries) {
        var root = await fetchHtml(link);

        if (link.indexOf('olx.pl') === -1) {
            console.log("Oferta spoza OLX:", link);
            return null;
        }
    
        try {
            var title = root.querySelector(".offer-titlebox h1").innerHTML.trim();
            var map = root.querySelector("#mapcontainer");
            var price = root.querySelector(".price-label strong").innerHTML.trim();
        
            var date = root.querySelector(".offer-titlebox__details em").innerHTML;
            var dateText = date.match(/[0-9]{2}:[0-9]{2}, \d+ \S+ \d+/)[0];
            
            data = {
                lon: map.attributes["data-lon"],
                lat: map.attributes["data-lat"],
                rad: map.attributes["data-rad"],
                title: title,
                price: price,
                link: link,
                date: dateText
            }
            break;        
        }
        catch (e) {
            console.log('Could not parse the page. Retries left: ', maxRetries);
            maxRetries--;
        }
    
    }

    return data;
};

(async function() {

    var loadedLinks = [], maxPages = 10;

    var ads = [];
    for (var i=1; i <= maxPages; i++) {
        console.log("Loading page:", i, "of", maxPages)
        var links = await getLinks(URL + SEARCH + '&page=' + i);
    
        for (var l=0; l < links.length; l++) {
            var link = links[l];           
            console.log("Loading link", l+1, "of", links.length, "(page: " + i + ")", link);
            var ad = await getAd(link);
            if (ad && loadedLinks.indexOf(link) === -1) {
                ads.push(ad);
                loadedLinks.push(link);
            }

        }
    };

    fs.writeFileSync("data.json", JSON.stringify(ads), { encoding: 'utf-8' });
})();

