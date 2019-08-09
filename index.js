const express = require('express');
const app = express();
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
http.listen(3000, function () {
	console.log('listening on *:3000');
});