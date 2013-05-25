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
G = game;
	//when stuff updates
	socket.on('user:login', checkForActive);
	socket.on('user:registered', checkForActive);
	socket.on('user:updated', checkForActive);
	socket.on('user:logged-out', checkForActive);
	socket.on('tournaments:update', checkForActive);
	socket.on('tournament:update', checkForActive);

	function checkForActive() {
		if (!tournament.active || !match.match.game) { return; }
		game.game.started = match.match.games[match.match.game-1].started;
		game.game.password = match.match.games[match.match.game-1].password;
		game.game.creator = match.match.games[match.match.game-1].creator === u.username ? 'self' : 'opponent';
	}

	checkForActive();

	return {
		get: function() {
			return game;
		}
	};
});