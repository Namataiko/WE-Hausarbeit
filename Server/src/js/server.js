const express = require("express");
const path = require("path");
const fs = require("fs");
const server = express();

let port = process.argv[2]; //Kommandozeilenargument für Port übernehmen
server.use("/", express.static("Client/dist"));//Statische Dateien in Client/dist bereitstellen

server.get("/tracks", (request, response) => {
	readLocationNames(response)
});

var listener = server.listen(port, function () {
	console.log("Listening on port " + listener.address().port); //Listening on port 8080
});

function readLocationNames(response)
{
	var directoryName = "../../data/";
	var locationNames = [];
	var locationFile;
	fs.readdir(directoryName, function(err, files)
	{
		if(err)
			{
				return;
			}
		files.forEach(function(f)
		{
			LocationFile = require(directoryName+f);
			console.log(LocationFile);
			locationNames.push(LocationFile.features[0].properties.name);
		})
	})
	
	response.json(locationNames);
}