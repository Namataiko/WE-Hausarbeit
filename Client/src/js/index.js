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
	trackListHeight = window.outerHeight;
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
			currentLastElementOnPage = totalTrackNames;
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
 
function drawHeightMeter(array){
	var canvas=document.getElementById("heightMeterCanvas");
	var ctx=canvas.getContext("2d");
	var xrange=canvas.width/(array.features[0].geometry.coordinates.length);
	var mini=9000;
	var maxi=-12000;
	var factor;
	for (var i=0;i<array.features[0].geometry.coordinates.length;i++){
		maxi=Math.max(array.features[0].geometry.coordinates[i][2],maxi);
		mini=Math.min(array.features[0].geometry.coordinates[i][2],mini);
	}
	var differenz=maxi-mini;
	if(mini>=0){
		factor=(canvas.height-10)/maxi;
		ctx.beginPath();
		ctx.moveTo(0,canvas.height);
		for (var i=0,j=0;j<array.features[0].geometry.coordinates.length;i+=xrange,j++){
			ctx.lineTo(i,canvas.height-(array.features[0].geometry.coordinates[j][2])*factor);
		}
	}
	ctx.lineTo(canvas.width,canvas.height);
	ctx.lineTo(0,canvas.height);
	ctx.fillStyle="white";
	ctx.closePath();
	ctx.globalAlpha=1;
	ctx.strokeStyle="white";
	ctx.fill();


	/*
	//ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.fillStyle = "black";
	//ctx.globalAlpha = 0.5;
	ctx.fillRect(0,0,canvas.width,canvas.height);
	console.log("Rect filled");
	
	
	var maxDifferent=maxi-mini;
	var factor;
	if(mini>=0){
		ctx.beginPath();
		ctx.moveTo(0,canvas.height);
		factor=canvas.height-10/maxi;
		for (var i=0,j=0;j<array.features[0].geometry.coordinates.length;i+=stroke,j++){
			ctx.lineTo(i,canvas.height-array.features[0].geometry.coordinates[j][2]*factor);
			
		}
		console.log("mini>=0");
	ctx.lineTo(canvas.width,canvas.height);
	ctx.lineTo(0,canvas.height);
	ctx.fillStyle="black";
	ctx.closePath();
	ctx.fill();
	console.log("Done");

	}
	else{
		console.log("mini <0");
		ctx.beginPath();
		ctx.moveTo(0,canvas.height);
		factor=canvas.height-10/maxDifferent;
		for (var i=0,j=0 ;j<array.features[0].geometry.coordinates.length;i+=stroke,j++){
			ctx.lineTo(i,(canvas.height-array.features[0].geometry.coordinates[j][2]-mini)*factor);
			
		}
	ctx.lineTo(canvas.width,canvas.height);
	ctx.lineTo(0,canvas.height);
	ctx.fillStyle="black";
	ctx.closePath();
	ctx.fill();
	console.log("done");
	}
	
*/
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
			console.log("trackRouteData:"+trackRouteData);
			drawHeightMeter(trackRouteData);
		}
	}
	trackRouteRequest.send();
}


