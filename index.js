var process = require("process");
var fetch = require("node-fetch");
var { parse } = require("node-html-parser");
var fs = require("fs"); 

var SEARCH_1 = "%5Bfilter_enum_floor_select%5D%5B0%5D=floor_2&search%5Bfilter_enum_floor_select%5D%5B1%5D=floor_3&search%5Bfilter_enum_floor_select%5D%5B2%5D=floor_4&search%5Bfilter_enum_floor_select%5D%5B3%5D=floor_5&search%5Bfilter_enum_floor_select%5D%5B4%5D=floor_6&search%5Bfilter_enum_floor_select%5D%5B5%5D=floor_7&search%5Bfilter_enum_furniture%5D%5B0%5D=yes&search%5Bfilter_float_m%3Afrom%5D=40&search%5Bfilter_enum_rooms%5D%5B0%5D=two&search%5Bphotos%5D=1";

var SEARCH = process.argv[2]  || SEARCH_1;
var URL = "https://www.olx.pl/nieruchomosci/mieszkania/wynajem/warszawa/?search";

console.log("Search:", SEARCH);

function pad(n) {
    if (n >= 10) {
        return n.toString();
    }
    else {
        return '0' + n.toString();
    }
}

function getCurrentDate() {
    var d = new Date();
    return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ' ' + pad(d.getDate()) + '/' + pad(d.getMonth())
}

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

async function parseOlx(link) {

    var result = await fetch(link);
    var html = await result.text();
    var root = parse(html);

    var title = root.querySelector(".offer-titlebox h1").innerHTML.trim();
    var map = root.querySelector("#mapcontainer");
    var price = root.querySelector(".price-label strong").innerHTML.trim();

    var date = root.querySelector(".offer-titlebox__details em").innerHTML;
    
    price = parseInt(price.replace(/[^0-9]/g,''));

    return {
        title: title,
        lon: parseFloat(map.attributes["data-lon"]),
        lat: parseFloat(map.attributes["data-lat"]),
        rad: parseFloat(map.attributes["data-rad"]),
        price: price,
        link: link,
        source: 'olx'
    }
}

async function parseOtoDom(link) {
    var result = await fetch(link);
    var html = await result.text();
    var root = parse(html);

    var title = root.querySelector(".css-18igut2").innerHTML.trim();
    var lat = parseFloat(html.match(/"latitude":([0-9.]+)/)[0].split(":")[1]);
    var lon = parseFloat(html.match(/"longitude":([0-9.]+)/)[0].split(":")[1]);
    var price = root.querySelector(".css-1vr19r7").innerHTML.split('/')[0];
    price = parseInt(price.replace(/[^0-9]/g,''));

    return {
        title: title,
        lon: parseFloat(lon),
        lat: parseFloat(lat),
        rad: 10,
        price: price,
        link: link,
        source: 'otodom'
    }
}

async function getAd(link) {
    var maxRetries = 3, data = null;

    while (maxRetries) {
    
        try {
            if (link.indexOf('olx.pl') !== -1) {
                data = await parseOlx(link);
            } else if (link.indexOf('otodom.pl') !== -1) {
                data = await parseOtoDom(link);
            } else {
                console.log("Nieznane zrodlo oferty:", link);
                return null;
            }
            break;        
        }
        catch (e) {
            console.log('Could not parse the page. Retries left: ', maxRetries, e.stack);
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

    var json = {
        date: getCurrentDate(),
        ads: ads
    }

    fs.writeFileSync("data.json", JSON.stringify(json, null, 2), { encoding: 'utf-8' });
})();

