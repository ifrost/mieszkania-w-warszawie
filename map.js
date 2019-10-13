async function main() {
    console.log("Starting");
    var mymap = L.map('mapid').setView([52.21374000, 20.97928000], 11);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	id: 'mapbox.streets',
	accessToken: 'pk.eyJ1IjoicGlkemVqdSIsImEiOiJjazFubm9zc2QwYTZ1M2RrNjZlYXhoZGt6In0.-u6IuJTQBG8KdIkDJxfXHA'
}).addTo(mymap);

    var response = await fetch("./data.json");
    var json = await response.json();

    var color = d3.scaleLinear().domain([1000,4000]).range(["yellow", "red"]);

    var grouped = [];
    var groupsMap = {};
    function hash(data) { return data.lon.toString() + '-' + data.lat.toString();}
    json.forEach(function(ad) {
        var dataHash = hash(ad);
        groupsMap[dataHash] = groupsMap[dataHash] || [];
        groupsMap[dataHash].push(ad);
    });
    for (dataHash in groupsMap) {
        var group = {
            rad: Math.max.apply(null, groupsMap[dataHash].map(function(ad) {return ad.rad;})),
            lat: groupsMap[dataHash][0].lat,
            lon: groupsMap[dataHash][0].lon,
            ads: groupsMap[dataHash]
        }
        grouped.push(group);
    }
    
    console.log('Entries:', json.length);
    grouped.forEach(function(group) {

        if (group.ads.length > 1) {
            var c = '#999999';
        }
        else {
            var c = color(parseInt(group.ads[0].price.replace(/[^0-9]/g,'')));
        }
        
        var circle = L.circle([group.lat, group.lon], {
            color: c,
            fillColor: c,
            opacity: group.ads.length > 1 ? 0.2 : 0.4, 
            fillOpacity: group.ads.length > 1 ? 0.2 : 0.4,
            radius: Math.min(Math.max(group.rad, 15),500)
        }).addTo(mymap);

        var marker =  L.marker([group.lat, group.lon], {
            color: c
        }).addTo(mymap);

        var popup = group.ads.map(function(ad) {
            return '- ' + ad.price + ": " + ad.title + ' (' + ad.date + ') | <a href="' + ad.link + '" target="_blank">link</a><br />';
        }).join('');
        marker.bindPopup(popup, { maxWidth: 800 });
        (function(bindPopup) {
            marker.on('popupopen', function() {
                console.log(bindPopup);
            });    
        })(popup);
    });
}