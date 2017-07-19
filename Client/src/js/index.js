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
	totalPages = 0;
	currentPage = 1;
	tracksPerPage = 0;
	currentStartElementOnPage = 0;
	currentLastElementOnPage = 0;

	getTracks();

}

window.onresize = calculateListSize;

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
	currentStartElementOnPage = tracksPerPage * (currentPage - 1);
	currentLastElementOnPage = tracksPerPage * currentPage - 1;

	if(currentLastElementOnPage > totalTrackNames)
		{
			currentLastElementOnPage = totalTrackNames;
		}

	totalPages = Math.ceil(totalTrackNames / tracksPerPage);

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
		tracklist.appendChild(item);
	}
}


function drawHeightMeter(array){
	var canvas=getElementById("heightMeterCanvas");
	var ctx=canvas.getContext("2d");
	var mini=0;
	var maxi=0;
	for (var i=0;i<array.length();i++){
		maxi=Math.max(array[i][2])
		mini=Math.min(array[i][2])
	}
	var maxDifferent=maxi +Math.abs(mini);
	var hightfactor=canvas.height/maxDifferent
	var stroke=canvas.width/array.length;
	var start=canvas.height;
	for (var i=0;i<array.length;i+=stroke){
		ctx.moveTo(i,start);
		ctx.lineTo(i,array[i][2]*hightfactor);
		ctx.stroke();
	}




}
