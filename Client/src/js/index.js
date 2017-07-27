var googleMapsLoader = require("google-maps");
googleMapsLoader.KEY = "AIzaSyDphoZGe9mIqPoZ4e5aWG7RORkw-yH4JSA";
var loader;
var trackNameList;
var trackRouteData;
var listItemHeight;
var totalPages;
var currentPage;
var tracksPerPage;
var totalTrackNames;
var currentStartElementOnPage;
var currentLastElementOnPage;

googleMapsLoader.load(function (google) { 							//google-maps Karte laden map evtl groß
	google.maps.Map(document.getElementById("map"),
		{
			zoom: 12,
			center: { lat: 49.75, lng: 6.63 }
		});
	loader = google;
});

window.onload = function () {
	trackNameList = [];
	totalTrackNames = 0;
	listItemHeight = 32;
	totalPages = 1;
	currentPage = 1;
	tracksPerPage = 0;
	currentStartElementOnPage = 0;
	currentLastElementOnPage = 0;

	getTracks();
};

window.onresize = calculateListSize;

document.getElementById("leftButton").onclick = function () {
	if (currentPage > 1) {
		currentPage--;
		calculateListSize();
	}
};

document.getElementById("rightButton").onclick = function () {
	if (currentPage < totalPages) {
		currentPage++;
		calculateListSize();
	}
};

function getTracks() {
	var request = new XMLHttpRequest();
	request.open("GET", "/tracks", true);
	request.setRequestHeader("Content-Type", "application/json");
	request.onreadystatechange = function () {
		if (request.readyState === 4 && request.status === 200) {
			trackNameList = JSON.parse(request.responseText);
			trackNameList.sort(function (a, b) {
				a = a.toLowerCase();
				b = b.toLowerCase();
				if (a > b) { return 1; }
				if (a < b) { return -1; }
				return 0;
			});
			calculateListSize();
		}
	};
	request.send();
}

function calculateListSize() {
	var trackListHeight = window.innerHeight - document.getElementById("buttoncontainer").clientHeight;
	totalTrackNames = trackNameList.length;
	tracksPerPage = Math.floor(trackListHeight / listItemHeight);
	totalPages = Math.ceil(totalTrackNames / tracksPerPage);
	if (currentPage > totalPages) {
		currentPage = totalPages;
	}
	currentStartElementOnPage = tracksPerPage * (currentPage - 1);
	currentLastElementOnPage = (tracksPerPage * currentPage) - 1;

	if (currentLastElementOnPage > totalTrackNames) {
		currentLastElementOnPage = totalTrackNames - 1;
	}

	document.getElementById("pageNumber").innerHTML = currentPage + "/" + totalPages;
	fillInTrackListNames();
}

function fillInTrackListNames() {
	var tracklist = document.getElementById("tracklist");
	while (tracklist.firstChild) {
		tracklist.removeChild(tracklist.firstChild);
	}
	for (var i = currentStartElementOnPage; i <= currentLastElementOnPage; i++) {
		var item = document.createElement("p");
		item.className = "item";
		item.appendChild(document.createTextNode(trackNameList[i]));
		item.addEventListener("click", getTrackRoute, false);
		tracklist.appendChild(item);
	}
}

function drawHeightMeter(array) {
	var canvas = document.getElementById("heightMeterCanvas");
	var ctx = canvas.getContext("2d");
	var xrange = canvas.width / (array.features[0].geometry.coordinates.length);
	var mini = 9000;
	var maxi = -12000;
	var factor;
	for (var i = 0; i < array.features[0].geometry.coordinates.length; i++) {
		maxi = Math.max(array.features[0].geometry.coordinates[i][2], maxi);
		mini = Math.min(array.features[0].geometry.coordinates[i][2], mini);
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	var differenz = maxi - mini;
	factor = canvas.height / differenz;
	ctx.beginPath();
	ctx.moveTo(0, canvas.height);
	for (var k = 0, j = 0; j < array.features[0].geometry.coordinates.length; k += xrange, j++) {
		ctx.lineTo(k, canvas.height - ((array.features[0].geometry.coordinates[j][2]) * factor) + (mini * factor));
	}
	ctx.lineTo(canvas.width, canvas.height);
	ctx.lineTo(0, canvas.height);
	ctx.fillStyle = "white";
	ctx.closePath();
	ctx.fill();
}

function getTrackRoute() {
	var trackID;
	var clickedTrack = this;
	var pageElements = clickedTrack.parentNode.childNodes;
	for (var i = 0; i < pageElements.length; i++) {
		if (this === pageElements.item(i)) {
			trackID = i + currentStartElementOnPage;
		}
	}
	var trackRouteRequest = new XMLHttpRequest();
	trackRouteRequest.open("POST", "/data?id=" + trackID, true);

	trackRouteRequest.onreadystatechange = function () {
		if (trackRouteRequest.readyState === 4 && trackRouteRequest.status === 200) {
			trackRouteData = JSON.parse(trackRouteRequest.responseText);
			drawHeightMeter(trackRouteData);
			drawRoute(trackRouteData);
		}
	};
	trackRouteRequest.send();
}

function createPath(trackRouteData) {
	var path = [];
	var latitude;
	var longitude;
	var latlngObject;

	for (var i = 0; i < trackRouteData.features[0].geometry.coordinates.length; i++) {
		latitude = trackRouteData.features[0].geometry.coordinates[i][1];
		longitude = trackRouteData.features[0].geometry.coordinates[i][0];
		latlngObject = new loader.maps.LatLng(latitude, longitude);
		path.push(latlngObject);
	}

	return path;
}

function drawRoute(trackRouteData) {
	var path = createPath(trackRouteData);
	var bounds = new loader.maps.LatLngBounds();
	var map = new loader.maps.Map(document.getElementById("map"),
		{
			zoom: 12
		});

	var route = new loader.maps.Polyline(
		{
			path: path,
			geodesic: true,
			strokeColor: "#FF0000",
			strokeOpacity: 1.0,
			strokeWeight: 2,
			map: map
		}
	);

	for (var i = 0; i < path.length; i++) {
		bounds.extend(path[i]);
	}

	map.fitBounds(bounds);
}
