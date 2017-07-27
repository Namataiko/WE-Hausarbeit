const express = require("express");
const path = require("path");
const fs = require("fs");
const async = require("async");
const server = express();

let port = process.argv[2]; //Kommandozeilenargument für Port übernehmen
server.use("/", express.static("Client/dist"));//Statische Dateien in Client/dist bereitstellen

server.get("/tracks", function (request, response) {
	readTrackNames(response);
});

server.post("/data", function (request, response) {
	var id = request.query.id;
	id++;
	getTrackRoute(id, response);
});
var listener = server.listen(port, function () {
	console.log("Listening on port " + listener.address().port);
});

function readTrackNames(response) {
	var directoryName = "./Server/data/";
	var trackNames = [];
	var trackFilePath;
	fs.readdir(directoryName, function (err, files) {
		if (err) {
			console.error(err);
			return;
		}
		async.each(files, function (f, callback) {
			trackFilePath = path.join(directoryName, f);
			fs.readFile(trackFilePath, function (err, data) {
				if (err) {
					console.error(err);
				}
				var track = JSON.parse(data);
				trackNames.push(track.features[0].properties.name);
				callback(null);
			});
		}, function (err) {
			if (err) {
				console.error(err);
			}
			response.json(trackNames);
		});
	});
}

function getTrackRoute(id, response) {
	console.log("Getting TrackRoute");
	var directoryName = "./Server/data/";
	var trackFilePath;
	fs.readdir(directoryName, function (err, files) {
		if (err) {
			console.log("Error while reading data directory");
			console.error(err);
			return;
		}
		files.forEach(function (file) {
			if (file === id + ".json") {
				trackFilePath = path.join(directoryName, file);
				fs.readFile(trackFilePath, function (err, fileContent) {
					if (err) {
						console.error(err);
						return;
					}
					var track = JSON.parse(fileContent);
					console.log(track);
					response.json(track);
				});
			}
		});
	});
}
