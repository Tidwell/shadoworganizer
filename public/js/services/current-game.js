Services.service('currentGame', function($http, $rootScope, user, currentTournament, currentMatch, socket) {
	var tournament = currentTournament.get();
	var match = currentMatch.get();
	var u = user.get();

	var playerIndex;

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
		playerIndex = match.match.players[0].username === u.username ? 0 : 1;

		game.game.started = match.match.games[match.match.game-1].started;
		game.game.password = match.match.games[match.match.game-1].password;
		game.game.creator = match.match.games[match.match.game-1].creator === u.username ? 'self' : 'opponent';

		if (match.match.games[match.match.game-1].result) {
			if (match.match.games[match.match.game-1].result['player'+playerIndex]) {
				game.game.result = match.match.games[match.match.game-1].result['player'+playerIndex] === u.username ? 'win' : 'loss';
			}
			if (match.match.games[match.match.game-1].result['player'+Number(!playerIndex)]) {
				game.game.oppResult = match.match.games[match.match.game-1].result['player'+Number(!playerIndex)] === u.username ? 'loss' : 'win';
			}
		}
	}

	checkForActive();

	return {
		get: function() {
			return game;
		},
		result: function(result){
			socket.emit('tournament:result', {id: tournament.tournament._id, result: result});
		}
	};
});