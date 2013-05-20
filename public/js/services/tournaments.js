/*
tournaments service, which tracks
active tournaments (currently running)

listens
tournaments:update
tournament:update

sends
tournament:list
*/
Services.service('tournaments', function($http, $rootScope, socket, user) {
	var userObj = user.get();
	var tournaments = {
		tournaments: [],
		errror: false
	};

	socket.on('tournaments:update', function(data) {
		tournaments.tournaments = data.tournaments;
	});

	//when we get an upate to a tournament, copy over the changes
	socket.on('tournament:update', function(data){
		var updatedTournament = data.tournament;
		tournaments.tournaments.forEach(function(tournament){
			if (tournament._id === updatedTournament._id) {
				for (var property in updatedTournament) {
					tournament[property] = updatedTournament[property];
				}
			}
		});
	});

	return {
		get: function() {
			socket.emit('tournaments:list');
			return tournaments;
		}
	};
});