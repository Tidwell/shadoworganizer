'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('shadowOrganizer.services', []).value('version', '0.1');

angular.module('shadowOrganizer.services').factory('tournaments', function($http, $rootScope) {
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

angular.module('shadowOrganizer.services').factory('currentTournament', function($http, $rootScope) {
	return {
		get: function() {
			var tournament = {
				error: false
			};

			$http({method: 'GET', url: '/REST/tournament'})
				.success(function(data, status, headers, config) {
					for (var property in data) {
						tournament[property] = data[property];
					}
				})
				.error(function(data, status, headers, config) {
					tournament.error = 'Error getting tournament list';
				});

			return tournament;
		}
	};
});

angular.module('shadowOrganizer.services').factory('currentMatch', function($http, $rootScope) {
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

angular.module('shadowOrganizer.services').factory('currentGame', function($http, $rootScope) {
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