var GoogleMapsLoader = require("google-maps");
GoogleMapsLoader.KEY = "AIzaSyDphoZGe9mIqPoZ4e5aWG7RORkw-yH4JSA";
GoogleMapsLoader.load(function (google) {
	var map = new google.maps.Map(document.getElementById("map"),
		{
			zoom: 10,
			center: { lat: 49.75, lng: 6.63 }
		});
});
