const express = require("express");
const server = express();

let port = process.argv[2]; //Kommandozeilenargument für Port übernehmen
server.use("/static", express.static("Client/dist"));//Statische Dateien in Client/dist unter /static bereitstellen
server.get("/", function (req, res) {
	res.send("Server gestartet");
});

var listener = server.listen(port, function () {
	console.log("Listening on port " + listener.address().port); //Listening on port 8080
});
