/**
 * Sample data entry:
 * {
      "title": "Wyszogrocka 2 pokoje 40m2 bezpośrednio umeblowane od zaraz",
      "lon": 21.05787,
      "lat": 52.28055,
      "rad": 3000,
      "price": 1500,
      "link": "https://www.olx.pl/oferta/wyszogrocka-2-pokoje-40m2-bezposrednio-umeblowane-od-zaraz-CID3-IDC0dBt.html#c2a11a1fef;promoted",
      "source": "olx"
    }
 */

function getPage(list, page, resultsPerPage) {
    var start = (page -1) * resultsPerPage;
    var end = start + resultsPerPage;
    return list.slice(start, end);
}

module.exports = {
    setData(data, resultsPerPage) {
        this.data = data;
        this.resultsPerPage = resultsPerPage;
    },
    generateSearchPage(page) {
        var ads = getPage(this.data, page, this.resultsPerPage);

        var page = ads.map(function(ad) {
            return `<a href="${ad.link}" data-cy="listing-ad-title">NOT_USED</a>`
        }).join();

        return page;
    },
    generateAd(link) {
        if (source === 'olx') {
            return olxResultPage;
        } else if (source === 'otodom') {
            return otoDomResultPage;
        }
    }
}