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
	console.log("Test");
	var directoryName = "./Server/data/";
	var trackNames = [];
	var trackFile;
	fs.readdir(directoryName, function(err, files)
	{
		if(err)
			{
				console.log("Error while reading data directory");
				console.log(err);
				return;
			}
		files.forEach(function(f)
		{
			LocationFile = require(directoryName+f);
			console.log(LocationFile);
			trackNames.push(LocationFile.features[0].properties.name);
		})
	})
	
	response.json(trackNames);
}