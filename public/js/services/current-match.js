Services.factory('currentMatch', function($http, $rootScope, user, currentTournament, socket) {
	var tournament = currentTournament.get();
	var u = user.get();

	var match = {
		match: {
			opponentName: '',
			game: 0,
			ready: false,
			oppReady: false,
			winner: null, //opponent or self
			error: false
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
		console.log('checking', tournament)
		if (tournament.tournament._id && tournament.tournament.round) {
			var round = 'round'+tournament.tournament.round;
			//determine how many matches there are
			var matchesInRound = tournament.tournament.round === 1 ? 4 : tournament.tournament.round === 2 ? 2 : 1;

			for (var i = 1; i <= matchesInRound; i++) {
				var rndMatch = tournament.tournament.bracket[round]['game'+i][0];
				console.log(rndMatch, 'match');
				if (rndMatch.players[0].username === u.username || rndMatch.players[1].username === u.username) {
					if (rndMatch.players[0].username === u.username) {
						match.match.opponentName = rndMatch.players[1].inGameName || rndMatch.players[1].username;
					} else {
						match.match.opponentName = rndMatch.players[0].inGameName || rndMatch.players[0].username;
					}
				}
			}
		}
	}

	return {
		get: function() {
			return match;
		}
	};
});
