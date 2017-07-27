const express = require("express");
const path = require("path");
const fs = require("fs");
const async = require("async");
const server = express();

/* Kommandozeilenargument für Port übernehmen */
let port = process.argv[2];

/* Statische Daten in Client/dist bereitstellen */
server.use("/", express.static("Client/dist"));//Statische Dateien in Client/dist bereitstellen

/* Route unter /tracks */
server.get("/tracks", function (request, response) {
	readTrackNames(response);
});

/* Route unter /data */
server.post("/data", function (request, response) {
	var id = request.query.id;
	id++;
	getTrackRoute(id, response);
});

/* Server starten */
server.listen(port);

/* Inhalt des data-Ordners lesen und die Namen der Tracks aus den jeweiligen Dateien
   in ein Array schreiben welches zum Response hinzugefügt wird. */
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

/* Geodaten anhand der ID in data finden und den gesamten Inhalt der jeweiligen json-Datei
   in den Response setzen */
function getTrackRoute(id, response) {
	console.log("Getting TrackRoute");
	var directoryName = "./Server/data/";
	var trackFilePath;
	fs.readdir(directoryName, function (err, files) {
		if (err) {
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
					response.json(track);
				});
			}
		});
	});
}
