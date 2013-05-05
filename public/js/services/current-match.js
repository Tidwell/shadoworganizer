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
		console.log(tournament);
		if (tournament.tournament._id) {
			var round = 'round'+tournament.tournament.round;
			var gamesInRound = tournament.tournament.round === 1 ? 4 : tournament.tournament.round === 2 ? 2 : 1;
			console.log(round,gamesInRound);
			for (var i = 1; i < gamesInRound; i++) {
				var rnd = tournament.tournament.bracket[round]['game'+i];
				if (rnd[0].username === u.username || rnd[1].username === u.username) {
					console.log('rnd found', rnd);
					match.match.opponentName = rnd[0].username === u.username ? (rnd[1].inGameName || rnd[1].username) : (rnd[0].inGameName || rnd[0].username);
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
