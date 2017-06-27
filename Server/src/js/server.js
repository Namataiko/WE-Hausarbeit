const express = require("express");
const path = require("path");
const server = express();

let port = process.argv[2]; //Kommandozeilenargument für Port übernehmen
server.use("/", express.static("Client/dist"));//Statische Dateien in Client/dist unter /static bereitstellen


var listener = server.listen(port, function () {
	console.log("Listening on port " + listener.address().port); //Listening on port 8080
});
