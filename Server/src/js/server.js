const express = require("express");
const server = express();
/*process.argv übernimmt die Kommandozeilenargumente
 *argv[0] enthält process.execPath
 *argv[1] enthält enthält den Pfad zum .js File das ausgeführt wird
 *alle weiteren Elemente sind Kommandozeilenargumente*/
let port = process.argv[2];
server.use("/static", express.static("Client/dist"));
server.get("/", function (req, res) {
	res.send("Server gestartet");
});

var listener = server.listen(port, function () {
	console.log("Listening on port " + listener.address().port); //Listening on port 8080
});
