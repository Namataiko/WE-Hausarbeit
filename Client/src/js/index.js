var GoogleMapsLoader = require("google-maps");
var JsonTracks;
GoogleMapsLoader.KEY = "AIzaSyDphoZGe9mIqPoZ4e5aWG7RORkw-yH4JSA";
GoogleMapsLoader.load(function (google) { 							//google-maps Karte laden
	var map = new google.maps.Map(document.getElementById("map"),
		{
			zoom: 12,
			center: { lat: 49.75, lng: 6.63 }
		});
});


function getTracks()
{
	var request = new XMLHttpRequest();
	request.open("GET", "/tracks", true);
	request.setRequestHeader("Content-Type","application/json");
	request.onreadystatechange = function()
	{
		if(request.readyState === 4 && request.status ===200)
		{
				JsonTracks=JSON.parse(request.responseText);			
		}
	};
	request.send();
};


function fillList()
var  tracklist =document.getElementById("Trackliste");
	for (var i=0;i<JsonTracks.length();i++)
		var item= document.createElement(li)
		item.appendChild(document.createTextNode(JsonTracks[i]))
		tracklist.appendChild(item)
