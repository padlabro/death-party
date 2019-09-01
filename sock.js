let io;
let hosts = [];

const data = [
	['Сколько длилась столетняя война?', '101', '102', '116', '104','3'],
	['Когда умер Наполеон?', '1812', '1817', '1821', '1825','3'],
	['Кто победил в Крымской войне', 'Никто', 'Турция', 'Российская империя', 'Польша','2']
];

exports.initGame = function (sio, socket) {
	io = sio;
	socket.on('disconnect', () => {
		hosts.forEach((item, i) => {
			if (item.socketid === socket.id) {
				hosts.splice(i, 1);
			}
		});
	});
	socket.on('HostCreatedGame', (gameID, id) => {
		hosts.push({
			gameid: gameID,
			socketid: id,
			players: [],
			playersPunished: [],
			miniGames: ['Math','Math2'],
			numofplayers: 0,
			playersAnswered: 0,
			alivePlayers: 0,
			round: 0
		});
		let room = (gameID + 'host');
		socket.join(room);
		socket.leave(socket.id);
	});
	socket.on('addInRoom', (ID, name) => {
		if (hosts.length > 0) {
			for (i = 0; i < hosts.length; i++) {
				if ((hosts[i].gameid === ID) && (hosts[i].numofplayers < 8)) {
					socket.join(ID);
					socket.leave(socket.id);
					hosts[i].numofplayers++;
					hosts[i].alivePlayers++;
					hosts[i].players.push({
						socketid: socket.id,
						gameid: ID,
						playerName: name,
						alive: true,
						score: 0,
						answer: true
					});
					socket.emit('getReady');
					io.in(ID + 'host').emit('joinedServer', name);
					return;
				}
				if (i === hosts.length - 1) {
					socket.emit('noroom');
				}
			}
		} else {
			socket.emit('noroom');
		}
	});
	socket.on('startGame', (gameID) => {
		let numberOfHost = 0;
		hosts.forEach((host, i) => {
			if (host.gameid === gameID) {
				numberOfHost = i;
			}
		});
		io.in(gameID).emit('questions', data[hosts[numberOfHost].round], numberOfHost);
		io.in(gameID + 'host').emit('hostQuestion', data[hosts[numberOfHost].round]);
	});
	socket.on('playerAnswered', (answer, numberOfHost) => {
		let playerNumber;
		hosts[numberOfHost].players.forEach((item, i) => {
			if (item.socketid === socket.id) {
				playerNumber = i;
			}
		});
		playerAnswer(answer, numberOfHost, playerNumber);
	});
	socket.on('newRound', (numberOfHost) => {
		gameID = hosts[numberOfHost].gameid;
		hosts[numberOfHost].playersPunished=[];
		hosts[numberOfHost].round++;
		let i = hosts[numberOfHost].round;
		io.in(gameID).emit('questions', data[i], numberOfHost);
		io.in(gameID + 'host').emit('hostQuestion', data[i]);
	});
	socket.on('punishment', (numberOfHost) => {
		let rand = Math.floor(Math.random() * hosts[numberOfHost].miniGames.length);
		switch (hosts[numberOfHost].miniGames[rand]) {
			case 'Math':
				math(numberOfHost);
				break;
			case 'Math2':
				math2(numberOfHost);
		}
		hosts[numberOfHost].miniGames.splice(rand, 1);
	});
	socket.on('mathRight', (numberOfHost, booleanAnswer, playerName) => {
		io.in(hosts[numberOfHost].gameid + 'host').emit('mathRoundAnswer', numberOfHost, playerName, booleanAnswer);
	});
	socket.on('math2Right', (numberOfHost, booleanAnswer, playerName) => {
		io.in(hosts[numberOfHost].gameid + 'host').emit('math2RoundAnswer', numberOfHost, playerName, booleanAnswer);
	});
	socket.on('finalMath', (numberOfHost, playersWin, playersLost) => {
		host = hosts[numberOfHost];
		playersWin.forEach(item => {
			host.players[item].score += 500;
			host.players[item].answer = true;
		});
		playersLost.forEach(item => {
			host.players[item].answer = true;
			host.players[item].alive = false;
		});
		io.in(host.gameid + 'host').emit('gamestats', host.players, numberOfHost);
	});
};

function math(numberOfHost, socket) {
	hosts[numberOfHost].playersPunished.forEach(item => {
		io.sockets.sockets[item.socketid].emit('punishmentMath', numberOfHost, item.i);
		setTimeout(() => {
			io.sockets.sockets[item.socketid].emit('endMath');
		}, 15000);
	});
	io.in(hosts[numberOfHost].gameid + 'host').emit('punishmentMathHost', numberOfHost, hosts[numberOfHost].playersPunished);
	setTimeout(() => {
		io.in(hosts[numberOfHost].gameid + 'host').emit('endMathHost', numberOfHost, hosts[numberOfHost].playersPunished);
	}, 15000);
}

function math2(numberOfHost, socket) {
	hosts[numberOfHost].playersPunished.forEach(item => {
		io.sockets.sockets[item.socketid].emit('punishmentMath2', numberOfHost, item.i);
		setTimeout(() => {
			io.sockets.sockets[item.socketid].emit('endMath');
		}, 15000);
	});
	io.in(hosts[numberOfHost].gameid + 'host').emit('punishmentMath2Host', numberOfHost, hosts[numberOfHost].playersPunished);
	setTimeout(() => {
		io.in(hosts[numberOfHost].gameid + 'host').emit('endMathHost', numberOfHost, hosts[numberOfHost].playersPunished);
	}, 15000);
}

function playerAnswer(answer, numberOfHost, playerNumber) {
	let host = hosts[numberOfHost];
	let i = host.round;
	let finalGame;
	host.playersAnswered++;
	if (answer == data[i][5]) {
		host.players[playerNumber].score += 1000;
	}
	if ((host.players[playerNumber].alive) && (answer != data[i][5])) {
		host.playersPunished.push({
			i: playerNumber,
			playerName: host.players[playerNumber].playerName,
			socketid: host.players[playerNumber].socketid
		});
		host.players[playerNumber].answer = false;
	}

	if (host.playersAnswered === host.numofplayers) {
		let punish;
		host.playersAnswered = 0;
		playersAnswered = 0;
		if (host.playersPunished.length > 0) {
			punish = true;
		}
		io.in(host.gameid + 'host').emit('gamestats', host.players, numberOfHost, finalGame, punish);
	}
}