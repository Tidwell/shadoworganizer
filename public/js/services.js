'use strict';

/* Services */

var Services = angular.module('shadowOrganizer.services', []);

Services.value('version', '0.1 (alpha)');

/*Rule definitions*/
Services.value('herolock', 'Your hero may not be changed. Your deck may be changed between rounds/games.');
Services.value('decklock', 'Your hero and deck may not be changed between rounds/games');
Services.value('sideboard', 'Your deck may be changed between games by making 1:1 substitutions from your 15-card sideboard.');

/*

All services rely on tournaments service, which tracks
active tournaments (currently running)
it handles tournament:update
and login/register/etc to update userEntered flag


currentTournament, $watch for tournaments.tournaments
and set currentTournament only if it finds one where
the username is in the user list

active flag ON CURRENT TOURNAMENT to be used if currentTournament should be used
(active flag on actual tournament object is just for the server)

currentMatch and currentGame work the same?

*/


Services.factory('tournaments', function($http, $rootScope, socket, user) {
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
			if (tournament.id === updatedTournament.id) {
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

Services.factory('currentTournament', function($http, $rootScope, socket, user, tournaments) {
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

	function checkForActive() {
		var activeFound;
		tournaments.tournaments.forEach(function(t) {
			t.users.forEach(function(user){
				if (u.username === user.username) {
					tournament.tournament = t;
					activeFound = true;
				}
			});
		});
		if (activeFound) { tournament.active = true; }
		else { tournament.active = false; }
	}

	socket.on('tournament:dropped', function(data){
		tournament.dropped = true;
	});
	socket.on('tournament:joined', function(data){
		tournament.joined = true;
	});

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

Services.factory('currentMatch', function($http, $rootScope) {
	return {
		get: function() {
			var match = {
				error: false
			};

			$http({
				method: 'GET',
				url: '/REST/match'
			})
				.success(function(data, status, headers, config) {
				for (var property in data) {
					match[property] = data[property];
				}
			})
				.error(function(data, status, headers, config) {
				match.error = 'Error getting tournament list';
			});

			return match;
		}
	};
});

Services.factory('currentGame', function($http, $rootScope) {
	return {
		get: function() {
			var game = {
				error: false
			};

			$http({
				method: 'GET',
				url: '/REST/game'
			})
				.success(function(data, status, headers, config) {
				for (var property in data) {
					game[property] = data[property];
				}
			})
				.error(function(data, status, headers, config) {
				game.error = 'Error getting tournament list';
			});

			return game;
		}
	};
});

Services.factory('user', function($http, $rootScope, socket) {
	var userTemplate = {
		error: false,
		authed: false
	};

	var userPassword = '';

	var user = angular.copy(userTemplate);

	socket.on('user:error', function(data){
		user.error = data.error;
	});

	socket.on('user:registered', updateUser);
	socket.on('user:updated', updateUser);
	socket.on('user:login', updateUser);

	function updateUser(data){
		for (var property in data) {
			user[property] = data[property];
		}
	}

	return {
		get: function() {
			return user;
		},
		login: function(data) {
			user.error = false;
			socket.emit('user:login', data);
			userPassword = data.password; //store the password for actions
			return user;
		},
		register: function(data) {
			user.error = false;
			socket.emit('user:register', data);
			userPassword = data.password; //store the password for actions
			return user;
		},
		forgotPassword: function(email) {
			socket.emit('user:forgot-password', {
				email: email
			});
			return user;
		},
		logout: function() {
			socket.emit('user:logout', {
				username: user.username,
				password: userPassword
			});
			user.username = '';
			user.authed = false;
			userPassword = '';
			return user;
		},
		update: function() {
			socket.emit('user:update', {
				inGameName: user.inGameName,
				email: user.email,
				username: user.username,
				password: userPassword,
				newPassword: user.password
			});
			if (user.password) {
				userPassword = user.password;
			}
		},
		getPassword: function() {
			return userPassword;
		}
	};
});

Services.factory('socket', function($rootScope) {
	var socket = io.connect();
	return {
		on: function(eventName, callback) {
			socket.on(eventName, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socket, args);
				});
			});
		},
		emit: function(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			});
		}
	};
});