const express = require("express");
const path = require("path");
const fs = require("fs");
const async = require("async");
const server = express();

let port = process.argv[2]; //Kommandozeilenargument für Port übernehmen
server.use("/", express.static("Client/dist"));//Statische Dateien in Client/dist bereitstellen

server.get("/tracks", function(request, response){
	readTrackNames(response)
});

var listener = server.listen(port, function () {
	console.log("Listening on port " + listener.address().port); //Listening on port 8080
});

function readTrackNames(response)
{
	var directoryName = "./Server/data/";
	var trackNames = [];
	var trackFilePath;
	fs.readdir(directoryName, function(err, files)
	{
		if(err)
			{
				console.log("Error while reading data directory");
				console.error(err);
				return;
			}
		async.each(files,function(f, callback)
		{
			trackFilePath = path.join(directoryName, f);
			fs.readFile(trackFilePath, function(err, data)
			{
				if(err)
					{
						console.error(err);
					}
				var track = JSON.parse(data);
				trackNames.push(track.features[0].properties.name);
				callback(null);
			})
		},function(err)
		{
			if(err)
				{
					console.error(err);
				}
			console.log(trackNames);
			response.json(trackNames);
		})
	})
}