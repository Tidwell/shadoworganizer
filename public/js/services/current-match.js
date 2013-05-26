Services.service('currentMatch', function($http, $rootScope, user, currentTournament, socket) {
	var tournament = currentTournament.get();
	var u = user.get();

	var match = {
		match: {
			opponentName: '',
			game: 0,
			ready: false,
			oppReady: false,
			winner: null, //opponent or self
			error: false,
			games: []
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
		if (tournament.tournament._id && tournament.tournament.round) {
			var round = 'round'+tournament.tournament.round;
			//determine how many matches there are
			var matchesInRound = tournament.tournament.round === 1 ? 4 : tournament.tournament.round === 2 ? 2 : 1;

			for (var i = 1; i <= matchesInRound; i++) {
				var rndMatch = tournament.tournament.bracket[round]['game'+i];
				if (rndMatch.players[0].username === u.username) {
					userIndex = 0;
					updateData(rndMatch, userIndex);
				} else if (rndMatch.players[1].username === u.username) {
					userIndex = 1;
					updateData(rndMatch, userIndex);
				}
			}
		}
	}

	function updateData(rndMatch, userIndex) {
		var oppIndex = Number(!userIndex);

		console.log(rndMatch, 'match');
		match.match.players = rndMatch.players;
		match.match.opponentName = rndMatch.players[oppIndex].inGameName || rndMatch.players[oppIndex].username;
		match.match.ready = rndMatch.ready['player'+userIndex];
		match.match.oppReady = rndMatch.ready['player'+oppIndex];
		match.match.games = rndMatch.games;
		match.match.game = rndMatch.game;
	}

	checkForActive();

	return {
		get: function() {
			return match;
		}
	};
});
