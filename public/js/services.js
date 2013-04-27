'use strict';

/* Services */

var Services = angular.module('shadowOrganizer.services', []);

Services.value('version', '0.1 (alpha)');

/*Rule definitions*/
Services.value('herolock', 'Your hero may not be changed. Your deck may be changed between rounds/games.');
Services.value('decklock', 'Your hero and deck may not be changed between rounds/games');
Services.value('sideboard', 'Your deck may be changed between games by making 1:1 substitutions from your 15-card sideboard.');

Services.factory('tournaments', function($http, $rootScope, socket) {

	// socket.on('send:test',function(data) {
	// 	console.log(data);
	// });

	return {
		get: function() {
			var tournaments = {
				tournaments: [],
				errror: false
			};
			// Asynchronous call that executes a callback. Simulation of ajax/db request
			$http({
				method: 'GET',
				url: '/REST/tournaments'
			})
				.success(function(data, status, headers, config) {
				tournaments.tournaments = data;
			})
				.error(function(data, status, headers, config) {
				tournaments.error = 'Error getting tournament list';
			});

			return tournaments;
		}
	};
});

Services.factory('currentTournament', function($http, $rootScope) {
	var tournament = {
		active: false,
		error: null
	};
	return {
		get: function() {
			return tournament;
		},
		join: function(id, cb) {
			$http({
				method: 'GET',
				url: '/REST/tournament'
			})
				.success(function(data, status, headers, config) {
				for (var property in data) {
					tournament[property] = data[property];
					tournament.active = true;
				}
				//todo switch this to be deferred
				if (cb) {
					cb();
				}

			})
				.error(function(data, status, headers, config) {
				tournament.error = 'Error getting tournament';
			});

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