const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const http = require('http').Server(app);
const io = require('socket.io')(http);
const sock = require('./sock.js');

app.use(express.static('public'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
	console.log('Connection');
	sock.initGame(io, socket);
});
http.listen(PORT, function () {
	console.log('listening on *:3000');
});