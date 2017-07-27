var googleMapsLoader = require("google-maps");
googleMapsLoader.KEY = "AIzaSyDphoZGe9mIqPoZ4e5aWG7RORkw-yH4JSA";

/*Globale Variablen*/
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
var map;

/* Laden der initial dargestellten Karte*/
googleMapsLoader.load(function (google) {
	map = new google.maps.Map(document.getElementById("map"),
		{
			zoom: 12,
			center: { lat: 49.75, lng: 6.63 }
		});
	loader = google;
});

/* Initilaisierung der globalen Variablen beim Laden des Fensters */
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

/* Neuberechnung der Trackliste bei Veränderung der Fenstergröße */
window.onresize = calculateListSize;

/* Events zum Wechseln der Seite in der Liste */
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
/* Anfrage an den Server per XMLHttpRequest um eine Liste der Tracknamen zu erhalten
   Die Namen der Trackliste werden alphabetisch sortiert
   Danach wird die benötigte Listengröße errechnet*/
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

/* Größe der Liste anhand der Fenstergröße berechnen
   Index des ersten Elements sowie des letzten Elements auf der Seite berechnen */
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

/* Alte Seite löschen und neue Namen auf der aktuellen Seite einfügen*/
function fillInTrackListNames() {
	var tracklist = document.getElementById("tracklist");
	while (tracklist.firstChild) {
		tracklist.removeChild(tracklist.firstChild);
	}
	for (var i = currentStartElementOnPage; i <= currentLastElementOnPage; i++) {
		var item = document.createElement("p");
		item.className = "item";
		item.appendChild(document.createTextNode(trackNameList[i]));
		item.addEventListener("click", getTrackRoute);
		tracklist.appendChild(item);
	}
}

/* Höhenmeter anhand der Daten eines Tracks aus array einzeichnen */
function drawHeightMeter(array) {
	var canvas = document.getElementById("heightMeterCanvas");
	var ctx = canvas.getContext("2d");
	var xrangeStep = canvas.width / (array.features[0].geometry.coordinates.length);
	var mini = 9000;
	var maxi = -12000;
	var factor;
	/* Feststellung des kleinsten und größten Höhenwerts */
	for (var i = 0; i < array.features[0].geometry.coordinates.length; i++) {
		maxi = Math.max(array.features[0].geometry.coordinates[i][2], maxi);
		mini = Math.min(array.features[0].geometry.coordinates[i][2], mini);
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	var differenz = maxi - mini;
	factor = canvas.height / differenz;
	ctx.beginPath();
	ctx.moveTo(0, canvas.height);
	for (var k = 0, j = 0; j < array.features[0].geometry.coordinates.length; k += xrangeStep, j++) {
		ctx.lineTo(k, canvas.height - ((array.features[0].geometry.coordinates[j][2]) * factor) + (mini * factor));
	}
	ctx.lineTo(canvas.width, canvas.height);
	ctx.lineTo(0, canvas.height);
	ctx.fillStyle = "white";
	ctx.closePath();
	ctx.fill();
}

/* Trackdaten des geklickten Tracknamens vom Server per XMLHttpRequest anfordern
   Die erhaltenen Daten an drawHeightMeter und drawRoute weitergeben */
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

/* Patharray mit LatLng-Objekten anhand der Längen- und Breitengradwerte des geklickten Tracks erstellen
   Rückgabe eines Arrays mit LatLng-Objekten*/
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

/* Die Route anhand des erstellen path-Arrays per Polyline in die Karte einzeichnen */
function drawRoute(trackRouteData) {
	var path = createPath(trackRouteData);
	var bounds = new loader.maps.LatLngBounds();
	map = new loader.maps.Map(document.getElementById("map"),
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
