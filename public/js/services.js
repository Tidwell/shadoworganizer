'use strict';

/* Services */

var Services = angular.module('shadowOrganizer.services', []);

Services.value('version', '0.1 (alpha)');

/*Rule definitions*/
Services.value('herolock', 'Your hero may not be changed. Your deck may be changed between rounds/games.');
Services.value('decklock', 'Your hero and deck may not be changed between rounds/games');
Services.value('sideboard', 'Your deck may be changed between games by making 1:1 substitutions from your 15-card sideboard.');

Services.factory('tournaments', function($http, $rootScope, socket, user) {
	var userObj = user.get();
	var tournaments = {
		tournaments: [],
		errror: false
	};

	/*
		when we get new tournaments or if the user's in game name changes
		we want to check to see if the player is in the list of users and
		set a flag on the tournament if they are entered
	*/
	socket.on('user:login', updateFlags);
	socket.on('user:registered', updateFlags);
	socket.on('user:updated', updateFlags);
	socket.on('user:logged-out', updateFlags);

	socket.on('tournaments:update', function(data) {
		tournaments.tournaments = data.tournaments;
		updateFlags();
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
			updateFlags();
		});
	});


	function updateFlags() {
		tournaments.tournaments.forEach(function(tournament,i) {
			tournament.users.forEach(function(user){
				if (user.username === userObj.username) {
					tournaments.tournaments[i].userEntered = true;
				} else {
					tournaments.tournaments[i].userEntered = false;
				}
			});
		});
	}

	return {
		get: function() {
			socket.emit('tournaments:list');
			return tournaments;
		}
	};
});

Services.factory('currentTournament', function($http, $rootScope, socket, user, tournaments) {
	var tournament = {
		active: false,
		error: null
	};
	var u = user.get();
	tournaments = tournaments.get();

	//when the tournaments list is updated, we want to see if we are in any of the tournaments
	socket.on('user:login', checkForActive);
	socket.on('user:registered', checkForActive);
	socket.on('user:updated', checkForActive);
	socket.on('user:update', checkForActive);
	socket.on('user:logout', checkForActive);

	function checkForActive() {
		tournaments.tournaments.forEach(function(t) {
			t.users.forEach(function(user){
				if (u.username === user.username) {
					for (var property in t) {
						tournament[property] = t[property];
					}
				}
			});
		});
	}

	//when we get an upate to a tournament, check if the id matches and copy over the changes
	socket.on('tournament:update', function(data){
		var updatedTournament = data.tournament;
		if (tournament.id === updatedTournament.id) {
			for (var property in updatedTournament) {
				tournament[property] = updatedTournament[property];
			}
		}
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
			socket.emit('tournament:join', data);
			return tournament;
		},
		drop: function(cb) {
			tournament.active = false;
			//send to server

			if (cb) {
				cb();
			}
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