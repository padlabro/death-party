const modalStart = document.querySelector('.modal__start');
const joinGame = document.querySelector('.join-game');
const newGame = document.querySelector('.new-game');
const button = document.querySelector('button');
const messages = document.querySelector('#messages');
const message = document.querySelector('input');
const mainScreen = document.querySelector('.main__screen');
const socket = io();
joinGame.addEventListener('click', () => {
	event.preventDefault();
	joinGameCreated();
	linksAdd('.join-game-id', insertId);
});

newGame.addEventListener('click', () => {
	event.preventDefault();
	const gameID = Math.floor(Math.random() * (99999 - 10000)) + 10000;
	socket.emit('HostCreatedGame', gameID, socket.id);
	newGameCreate(gameID);
});

function addTrueClass(elem) {
	const choisesTrue = document.querySelectorAll('.choise');
	choisesTrue[elem - 1].classList.add('truechoise');
}

socket.on('hostQuestion', data => {
	modalStart.classList.add('hide');
	newQuestion(data);
});

socket.on('questions', (data, numberOfHost) => {
	newQuestionPlayer(data, numberOfHost);
});

function newQuestion(data) {
	mainScreen.innerHTML = `
	<div class="delete__question">
	<p>${data[0]}</p>
	<div class="choises">
		<div class="choise">
			${data[1]}
		</div>
		<div class="choise">
			${data[2]}
		</div>
		<div class="choise">
			${data[3]}
		</div>
		<div class="choise">
			${data[4]}
		</div>
	</div>
	</div>`;
	// addTrueClass(data[5]);
	// j++;
	// linksQuestion('.choise',data);
}

function newQuestionPlayer(data, numberOfHost) {
	mainScreen.innerHTML = `
	<div class="delete__question">
	<div class="choises-player">
		<div class="choise-player">
			${data[1]}
		</div>
		<div class="choise-player">
			${data[2]}
		</div>
		<div class="choise-player">
			${data[3]}
		</div>
		<div class="choise-player">
			${data[4]}
		</div>
	</div>
	</div>`;
	linksQuestion('.choise-player', numberOfHost);
}


function linksAdd(selector, func, data) {
	document.querySelectorAll(selector).forEach((i) => {
		i.addEventListener('click', func);
	});
}

function linksQuestion(selector, numberOfHost) {
	let playerSelect = document.querySelectorAll(selector);
	playerSelect.forEach((item, i) => {
		item.addEventListener('click', () => {
			classAdd(i, playerSelect, numberOfHost);
		}, {
			once: true
		});
	});
}

function classAdd(i, playerSelect, numberOfHost) {
	const chosenAnswer = playerSelect[i];
	chosenAnswer.classList.add('right-answer', 'choise-playerr');
	chosenAnswer.classList.remove('choise-player');
	i++;
	const choisesPlayer = document.querySelector('.choises-player');
	choisesPlayer.innerHTML = `
	<p>WAIT FOR THE OTHER PLAYERS</p>
	<p>YOUR CHOISE WAS</p>
	`;
	choisesPlayer.appendChild(chosenAnswer);
	socket.emit('playerAnswered', i, numberOfHost);
}

function newGameCreate(gameID) {
	modalStart.innerHTML = `
	<div class="modal__form">
			<p>GAME ID = </p>
			<p>${gameID}</p>
			<button type="submit" class="start-game">START</button>
		</div>
		<div class='new-players'>
		</div>`;
	// mainScreen.innerHTML = `<audio src="sound/skripka.mp3" autoplay></audio>`;
	const startGame = document.querySelector('.start-game');
	startGame.addEventListener('click', () => {
		socket.emit('startGame', gameID);
	});
}

function joinGameCreated() {
	modalStart.innerHTML = `
	<div class="modal__form">
			<p>Введите GAME ID</p>
			<input type="text" class="input-id">
			<p>Ваше имя?</p>
			<input type="text" class="input-name">
			<button type="submit" class="join-game-id">Жмяк</button>
		</div>
		`;
}

function insertId() {
	const inputID = document.querySelector('.input-id');
	const inputName = document.querySelector('.input-name');
	socket.emit('addInRoom', Number(inputID.value), inputName.value);
}

socket.on('getReady', () => {
	modalStart.classList.add('hide');
	mainScreen.innerHTML = `
	<div class="delete__question">
	<p>GET READY</p>
	`;
});

socket.on('joinedServer', name => {
	const Players = document.querySelector('.new-players');
	let p = document.createElement('div');
	p.innerHTML = `<div class='new-player'>
		<p>${name}</p>
		<audio src="sound/in.mp3" autoplay></audio>
	</div>`;
	Players.appendChild(p);
});

socket.on('deletefromplayers', () => {

});

socket.on('gamestats', (players, numberOfHost, finalGame, punish) => {
	let deleteQuestion = document.querySelector('.delete__question');
	deleteQuestion.innerHTML = ``;
	players.forEach(item => {
		let playerResult = document.createElement('div');
		if (item.answer === false) {
			playerResult.innerHTML = `<p class="yellow">${item.playerName}</p>
			<p class='green'>${item.score}</p>`;
		}
		if(item.alive==false){
			playerResult.innerHTML = `<p class="red">${item.playerName}</p>
			<p class='green'>${item.score}</p>`;
		} if((item.alive)&&(item.answer)) {
			playerResult.innerHTML = `<p>${item.playerName}</p>
			<p class='green'>${item.score}</p>`;
		}
		deleteQuestion.appendChild(playerResult);
	});
	setTimeout(() => {
		if (punish) {
			socket.emit('punishment', numberOfHost);
		} else {
			socket.emit('newRound', numberOfHost, players);
		}
	}, 5000);
});

socket.on('punishmentMath', (numberOfHost, playerName) => {
	function mathGame() {
		let i = Math.floor(Math.random() * 2);
		let x = Math.floor(Math.random() * 15);
		let y = Math.floor(Math.random() * 15);
		let options = [];
		let trueMath;
		let choisesPlayer = document.querySelector('.choises-player');
		let optionOfMath = document.createElement('div');
		switch (i) {
			case 0:
				for (i = 0; i < 3; i++) {
					options.push(Math.floor(Math.random() * 10));
				}
				trueMath = x - y;
				options.push(x - y);
				options.sort(() => {
					return 0.5 - Math.random();
				});
				choisesPlayer.innerHTML = `
				<p>${x} - ${y}</p>
				<div class="choise-player" data-value="${options[0]}">
				${options[0]}
			</div>
			<div class="choise-player" data-value="${options[1]}">
				${options[1]}
			</div>
			<div class="choise-player" data-value="${options[2]}">
				${options[2]}
			</div>
			<div class="choise-player" data-value="${options[3]}">
				${options[3]}
			</div>`;
				linksAdd('.choise-player', gameMath);
				break;
			case 1:
				for (i = 0; i < 3; i++) {
					options.push(Math.floor(Math.random() * 10));
				}
				options.push(x + y);
				trueMath = x + y;
				options.sort(() => {
					return 0.5 - Math.random();
				});
				choisesPlayer.innerHTML = `
				<p>${x} + ${y}</p>
				<div class="choise-player" data-value="${options[0]}">
				${options[0]}
			</div>
			<div class="choise-player" data-value="${options[1]}">
				${options[1]}
			</div>
			<div class="choise-player" data-value="${options[2]}">
				${options[2]}
			</div>
			<div class="choise-player" data-value="${options[3]}">
				${options[3]}
			</div>`;
				linksAdd('.choise-player', gameMath);
		}

		function gameMath() {
			let booleanAnswer = false;
			if (this.getAttribute("data-value") == trueMath) {
				booleanAnswer = true;
				socket.emit('mathRight', numberOfHost, booleanAnswer, playerName);
				mathGame();
			} else {
				choisesPlayer.innerHTML = ``;
				socket.emit('mathRight', numberOfHost, booleanAnswer, playerName);
				setTimeout(() => {
					mathGame();
				}, 2000);
			}
		}
	}
	mathGame();
});

socket.on('punishmentMathHost', (numberOfHost, playersDie) => {
	let deleteQuestion = document.querySelector('.delete__question');
	deleteQuestion.innerHTML = ``;
	playersDie.forEach(item => {
		let playerResult = document.createElement('div');
		playerResult.innerHTML = `<p class="player">${item.playerName}</p>
			<p id="${item.i}" class="playerscore">0</p>`;
		deleteQuestion.appendChild(playerResult);
	});
});

socket.on('punishmentMath2Host', (numberOfHost, playersDie) => {
	let deleteQuestion = document.querySelector('.delete__question');
	deleteQuestion.innerHTML = ``;
	playersDie.forEach(item => {
		let playerResult = document.createElement('div');
		playerResult.innerHTML = `<p class="player">${item.playerName}</p>
			<p id="${item.i}" class="playerscore">0</p>`;
		deleteQuestion.appendChild(playerResult);
	});
});

socket.on('mathRoundAnswer', (numberOfHost, playerName, booleanAnswer) => {
	let p = document.createElement('p');
	if (booleanAnswer) {
		const trueAnswer = document.getElementById(playerName);
		trueAnswer.innerHTML++;
		p.innerHTML = `<audio src="sound/Right.mp3" autoplay></audio>`;
		document.querySelector('.delete__question').appendChild(p);
	} else {
		const wrongAnswer = document.getElementById(playerName);
		wrongAnswer.classList.add('red');
		p.innerHTML = `<audio src="sound/wrong.mp3" autoplay></audio>`;
		document.querySelector('.delete__question').appendChild(p);
		setTimeout(() => {
			wrongAnswer.classList.remove('red');
		}, 2000);
	}
});

socket.on('punishmentMath2', (numberOfHost, playerName) => {
	function mathGame() {
		let i = Math.floor(Math.random() * 2);
		let x = Math.floor(Math.random() * 6);
		let y = Math.floor(Math.random() * 6);
		let options = [];
		let trueMath;
		let choisesPlayer = document.querySelector('.choises-player');
		let optionOfMath = document.createElement('div');
		switch (i) {
			case 0:
				for (i = 0; i < 3; i++) {
					options.push(Math.floor(Math.random() * 10));
				}
				trueMath = x - y;
				options.push(x - y);
				options.sort(() => {
					return 0.5 - Math.random();
				});
				choisesPlayer.innerHTML = `
				<p>${x} - ${y}</p>
				<div class="choise-player" data-value="${options[0]}">
				${options[0]}
			</div>
			<div class="choise-player" data-value="${options[1]}">
				${options[1]}
			</div>
			<div class="choise-player" data-value="${options[2]}">
				${options[2]}
			</div>
			<div class="choise-player" data-value="${options[3]}">
				${options[3]}
			</div>`;
				linksAdd('.choise-player', gameMath);
				break;
			case 1:
				for (i = 0; i < 3; i++) {
					options.push(Math.floor(Math.random() * 10));
				}
				options.push(x + y);
				trueMath = x + y;
				options.sort(() => {
					return 0.5 - Math.random();
				});
				choisesPlayer.innerHTML = `
				<p>${x} + ${y}</p>
				<div class="choise-player" data-value="${options[0]}">
				${options[0]}
			</div>
			<div class="choise-player" data-value="${options[1]}">
				${options[1]}
			</div>
			<div class="choise-player" data-value="${options[2]}">
				${options[2]}
			</div>
			<div class="choise-player" data-value="${options[3]}">
				${options[3]}
			</div>`;
				linksAdd('.choise-player', gameMath);
		}

		function gameMath() {
			let booleanAnswer = false;
			if (this.getAttribute("data-value") == trueMath) {
				booleanAnswer = true;
				socket.emit('math2Right', numberOfHost, booleanAnswer, playerName);
				mathGame();
			} else {
				choisesPlayer.innerHTML = ``;
				socket.emit('math2Right', numberOfHost, booleanAnswer, playerName);
				setTimeout(() => {
					mathGame();
				}, 2000);
			}
		}
	}
	mathGame();
});

// socket.on('punishmentMath2Host', (numberOfHost, playersDie) => {
// 	let deleteQuestion = document.querySelector('.delete__question');
// 	deleteQuestion.innerHTML = ``;
// 	playersDie.forEach(item => {
// 		let playerResult = document.createElement('div');
// 		playerResult.innerHTML = `<p class="player">${item.playerName}</p>
// 			<p id="${item.playerName}" class="playerscore">0</p>`;
// 		deleteQuestion.appendChild(playerResult);
// 	});
// });

socket.on('math2RoundAnswer', (numberOfHost, playerName, booleanAnswer) => {
	let p = document.createElement('p');
	if (booleanAnswer) {
		const wrongAsnwe = document.getElementById(playerName);
		wrongAsnwe.innerHTML++;
		p.innerHTML = `<audio src="sound/Right.mp3" autoplay></audio>`;
		document.querySelector('.delete__question').appendChild(p);
	} else {
		const wrongAnswer = document.getElementById(playerName);
		wrongAnswer.classList.add('red');
		p.innerHTML = `<audio src="sound/wrong.mp3" autoplay></audio>`;
		document.querySelector('.delete__question').appendChild(p);
		setTimeout(() => {
			wrongAnswer.classList.remove('red');
		}, 2000);
	}
});
socket.on('endMath', () => {
	document.querySelector('.choises-player').innerHTML = `
	<p>TIME IS OUT</p>
	`;
});
socket.on('endMathHost', (numberOfHost, playersDie) => {
	const playersPunished = document.querySelectorAll('.playerscore');
	let mathArray = [];
	let playersWin = [];
	let playersLost = [];
	playersPunished.forEach(item => {
		mathArray.push(
			item.innerHTML
			// playerName: item.getAttribute('id')
		);
	});
	let arrayHelp=0;
	let numberOfWinners = [];
	let numberOfLoosers = [];
	let max = 0;
	mathArray.forEach((item, i) => {
		if (item > max) {
			max = item;
			arrayHelp=i;
		}
	});
	mathArray.forEach((item, i) => {
		if (item == max) {
			numberOfWinners.push(i);
		}
		else{
			numberOfLoosers.push(i);
		}
	});
	numberOfWinners.forEach(item => {
		playersWin.push(playersPunished[item].getAttribute('id'));
	});
	numberOfLoosers.forEach(item=>{
		playersLost.push(playersPunished[item].getAttribute('id'));
	});
	socket.emit('finalMath', numberOfHost, playersWin,playersLost);
});