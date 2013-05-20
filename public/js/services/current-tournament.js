/*
currentTournament, set currentTournament only if it finds one where
the username is in the user list

active flag ON CURRENT TOURNAMENT to be used if currentTournament should be used
(active flag on actual tournament object is just for the server)

listens
user:login
user:registered
user:updated
user:logged
tournaments:update
tournament:update

sends
tournament:join
tournament:drop

*/
Services.service('currentTournament', function($http, $rootScope, socket, user, tournaments) {
	var tournament = {
		dropped: false,
		joined: false,
		active: false,
		error: null,
		tournament: {}
	};
	var u = user.get();
	tournaments = tournaments.get();

	//when the tournaments list is updated, we want to see if we are in any of the tournaments
	socket.on('user:login', checkForActive);
	socket.on('user:registered', checkForActive);
	socket.on('user:updated', checkForActive);
	socket.on('user:logged-out', checkForActive);
	socket.on('tournaments:update', checkForActive);
	socket.on('tournament:update', checkForActive);
	socket.on('tournament:joined',checkForActive);

	function checkForActive() {
		var activeFound;
		tournaments.tournaments.forEach(function(t) {
			t.users.forEach(function(user){
				if (u.username === user.username) {
					tournament.tournament = t;
					activeFound = true;
				}
			});
			if (activeFound) { tournament.active = true; }
			else { tournament.active = false; }
		});
	}

	socket.on('tournament:dropped', function(data){
		tournament.dropped = true;
	});
	socket.on('tournament:joined', function(data){
		tournament.joined = true;
	});

	checkForActive();

	return {
		get: function() {
			return tournament;
		},
		join: function(id) {
			var data = {
				tournamentId: id,
				username: u.username,
				password: user.getPassword()
			};
			tournament.dropped = false;
			socket.emit('tournament:join', data);
			return tournament;
		},
		drop: function(id) {
			tournament.userEntered = false;
			socket.emit('tournament:drop', {
				id: id,
				username: u.username,
				password: user.getPassword()
			});
			return tournament;
		}
	};
});