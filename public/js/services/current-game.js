Services.service('currentGame', function($http, $rootScope, user, currentTournament, currentMatch, socket) {
	var tournament = currentTournament.get();
	var match = currentMatch.get();
	var u = user.get();

	var game = {
		game: {
			started: false,
			password: null,
			forceFirstTurn: null, //opponent or self
			creator: null, //opponent or self

			result: null, //win loss draw
			firstTurn: null, //self opponent forget
			resultConfirmed: false,

			resultError: null, //winner or firstturn
			oppResult: null, //win loss draw (from their perspective)
			syncError: false
		}
	};
	//when stuff updates
	socket.on('user:login', checkForActive);
	socket.on('user:registered', checkForActive);
	socket.on('user:updated', checkForActive);
	socket.on('user:logged-out', checkForActive);
	socket.on('tournaments:update', checkForActive);
	socket.on('tournament:update', checkForActive);

	function checkForActive() {
		if (!tournament.active || !match.match.game) { return; }

		var playerIndex = match.match.players[0].username === u.username ? 0 : 1;
		var newGame = match.match.games[match.match.game-1];

		//set required props
		if (!newGame) { return; }
		game.game.started = newGame.started;
		game.game.password = newGame.password;
		game.game.creator = newGame.creator === u.username ? 'self' : 'opponent';

		//set optional props
		if (newGame.result) {
			if (newGame.result['player'+playerIndex]) {
				//convert from username to a relative value
				game.game.result = newGame.result['player'+playerIndex] === u.username ? 'win' : 'loss';
			}
			if (newGame.result['player'+Number(!playerIndex)]) {
				//convert from username to a relative value
				game.game.oppResult = newGame.result['player'+Number(!playerIndex)] === u.username ? 'loss' : 'win';
			}
		} else {
			game.game.result = null;
			game.game.oppResult = null;
		}
		if (newGame.FirstTurn && typeof newGame.firstTurn['player'+playerIndex] !== 'undefined') {
			//convert from username to a relative value
			game.game.firstTurn = newGame.firstTurn['player'+playerIndex] === 'forgot' ? 'forgot' : newGame.firstTurn['player'+playerIndex] === u.username ? 'self' : 'opponent';
		} else {
			game.game.firstTurn = null;
		}

		if (typeof newGame.resultError !== 'undefined') {
			console.log('errror')
			game.game.resultError = newGame.resultError;
		} else {
			game.game.resultError = null;
		}
	}

	checkForActive();

	return {
		get: function() {
			return game;
		},
		result: function(result){
			socket.emit('tournament:result', {id: tournament.tournament._id, result: result});
		},
		firstTurnResult: function(result) {
			socket.emit('tournament:first-turn', {id: tournament.tournament._id, result: result});
		}
	};
});