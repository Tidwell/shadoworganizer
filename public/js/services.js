'use strict';

/* Services */

var Services = angular.module('shadowOrganizer.services', []);

Services.value('version', '0.1 (alpha)');

/*Rule definitions*/
Services.value('herolock', 'Your hero may not be changed. Your deck may be changed between rounds/games.');
Services.value('decklock', 'Your hero and deck may not be changed between rounds/games');
Services.value('sideboard', 'Your deck may be changed between games by making 1:1 substitutions from your 15-card sideboard.');

Services.factory('tournaments', function($http, $rootScope) {
	return {
		get: function() {
			var tournaments = {
				tournaments: [],
				errror: false
			};
			// Asynchronous call that executes a callback. Simulation of ajax/db request
			$http({method: 'GET', url: '/REST/tournaments'})
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
		join: function(id,cb) {
			$http({method: 'GET', url: '/REST/tournament'})
				.success(function(data, status, headers, config) {
					for (var property in data) {
						tournament[property] = data[property];
						tournament.active = true;
					}
					//todo switch this to be deferred
					if (cb) { cb(); }

				})
				.error(function(data, status, headers, config) {
					tournament.error = 'Error getting tournament';
				});

			return tournament;
		},
		drop: function(cb) {
			tournament.active = false;
			//send to server

			if (cb) { cb(); }
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

			$http({method: 'GET', url: '/REST/match'})
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

			$http({method: 'GET', url: '/REST/game'})
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

Services.factory('user', function($http, $rootScope) {
	var userTemplate = {
		error: false,
		authed: false
	};

	var user = angular.copy(userTemplate);

	return {
		get: function() {
			return user;
		},
		login: function(username,password) {
			$http({method: 'GET', url: '/REST/user'})
				.success(function(data, status, headers, config) {
					for (var property in data) {
						user[property] = data[property];
					}
				})
				.error(function(data, status, headers, config) {
					user.error = data;
				});

			return user;
		},
		register: function() {
			//send to server

			return this.login();
		},
		forgotPassword: function(email) {
			//send to server

			return user;
		},
		logout: function() {
			//send to server

			user.authed = false;
			return user;
		}
	};
});