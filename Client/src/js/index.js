var GoogleMapsLoader = require("google-maps");
GoogleMapsLoader.KEY = "AIzaSyDphoZGe9mIqPoZ4e5aWG7RORkw-yH4JSA";

GoogleMapsLoader.load(function (google) { 							//google-maps Karte laden
	var map = new google.maps.Map(document.getElementById("map"),
		{
			zoom: 12,
			center: { lat: 49.75, lng: 6.63 }
		});
});

var trackNameList;
var trackRouteData;
var listItemHeight;
var totalPages;
var currentPage;
var tracksPerPage;
var totalTrackNames;
var currentStartElementOnPage;
var currentLastElementOnPage;


window.onload = function()
{
	trackNameList = [];
	totalTrackNames = 0;
	listItemHeight = 30;
	totalPages = 1;
	currentPage = 1;
	tracksPerPage = 0;
	currentStartElementOnPage = 0;
	currentLastElementOnPage = 0;

	getTracks();

}

window.onresize = calculateListSize;

document.getElementById("leftButton").onclick = function()
{
	if(currentPage > 1)
		{
			currentPage--;
			calculateListSize();
		}
};

document.getElementById("rightButton").onclick = function()
{
	if(currentPage < totalPages)
		{
			currentPage++;
			calculateListSize(); 
		}
}

function getTracks()
{
	var request = new XMLHttpRequest();
	request.open("GET", "/tracks", true);
	request.setRequestHeader("Content-Type","application/json");
	request.onreadystatechange = function()
	{
		if(request.readyState === 4 && request.status ===200)
		{
				trackNameList=JSON.parse(request.responseText);
				trackNameList.sort(function(a,b)
			{
				a = a.toLowerCase();
				b = b.toLowerCase();
				if(a > b) return 1;
				if(a < b) return -1;
				return 0;
			})	
				calculateListSize();
		}
	};
	request.send();
};

function calculateListSize()
{
	trackListHeight = window.outerHeight * 0.98;
	totalTrackNames = trackNameList.length;
	tracksPerPage = Math.floor(trackListHeight / listItemHeight);
	totalPages = Math.ceil(totalTrackNames / tracksPerPage);
	if(currentPage > totalPages)
		{
			currentPage = totalPages;
		}
	currentStartElementOnPage = tracksPerPage * (currentPage - 1);
	currentLastElementOnPage = tracksPerPage * currentPage - 1;

	if(currentLastElementOnPage > totalTrackNames)
		{
			currentLastElementOnPage = totalTrackNames - 1;
		}

	document.getElementById("pageNumber").innerHTML = currentPage + "/" + totalPages;
	fillInTrackListNames();
}

function fillInTrackListNames()
{
	var  tracklist = document.getElementById("tracklist");
	while(tracklist.firstChild)
		{
			tracklist.removeChild(tracklist.firstChild);
		}
	for (var i = currentStartElementOnPage; i <= currentLastElementOnPage; i++)
	{
		var item = document.createElement("li");
		item.className="item"
		item.appendChild(document.createTextNode(trackNameList[i]));
		item.addEventListener("click", getTrackRoute, false);
		tracklist.appendChild(item);
	}
}

//mehr Pseudo klappt also noch nicht 
function drawHeightMeter(array){
	var canvas=document.getElementById("heightMeterCanvas");
	var ctx=canvas.getContext("2d");
	var mini=0;
	var maxi=0;
	var stroke=canvas.width/array.length;
	var start=canvas.height;
	for (var i=0;i<array.length();i++){
		maxi=Math.max(array[i][2],maxi);
		mini=Math.min(array[i][2],mini);
	}
	var maxDifferent=maxi-mini;
	var factor=canvas.height/maxDifferent;
	if(mini>=0){
		for (var i=0;i<array.length;i+=stroke){
			ctx.moveTo(i,start);
			ctx.lineTo(i,array[i][2]*factor);
			ctx.stroke();
		}
	}
	else{
		for (var i=0 ;i<array.length;i+=stroke){
			ctx.moveTo(i,start);
			ctx.lineTo(i,(array[i][2]-mini)*factor);
			ctx.stroke();
		}
	}
}

function getTrackRoute()
{
	var trackID;
	var clickedTrack = this;
	var pageElements = clickedTrack.parentNode.childNodes;
	for(var i = 0; i < pageElements.length; i++)
	{
		if(this == pageElements.item(i))
		{
			trackID = i + currentStartElementOnPage;
		}
	}
	var trackRouteRequest = new XMLHttpRequest();
	trackRouteRequest.open("POST", "/data?id=" + trackID, true);

	trackRouteRequest.onreadystatechange = function()
	{
		if(trackRouteRequest.readyState === 4 && trackRouteRequest.status === 200)
		{
			trackRouteData = JSON.parse(trackRouteRequest.responseText);
			//drawHeightMeter(trackRouteData);
			drawRoute(trackRouteData);
		}
	}
	console.log("Sending Request");
	trackRouteRequest.send();
}

function createPath(trackRouteData)
 {
	var path = [];
	var latitude;
	var longitude;
	var latlngObject;

	 for(var i = 0; i < trackRouteData.features[0].geometry.coordinates.length; i++)
		{
			latitude = trackRouteData.features[0].geometry.coordinates[i][1];
			longitude = trackRouteData.features[0].geometry.coordinates[i][0];
			latlngObject = new google.maps.LatLng(latitude, longitude);
			path.push(latlngObject);
		}

	return path;
 }

function drawRoute(trackRouteData)
{	
	var path = createPath(trackRouteData);
	var bounds = new google.maps.LatLngBounds();
	var map = new google.maps.Map(document.getElementById("map"),
	{
		zoom: 12
	});

	route = new google.maps.Polyline(
	{
		path : path,
		geodesic: true,
		strokeColor: "#FF0000",
		strokeOpacity: 1.0,
		strokeWeight: 2,
		map: map
	}
	);
	
	for(var i = 0; i < path.length; i++)
	{
		bounds.extend(path[i]);
	}

	map.fitBounds(bounds);
}