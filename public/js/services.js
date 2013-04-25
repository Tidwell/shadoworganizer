'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('shadowOrganizer.services', []).value('version', '0.1');

angular.module('shadowOrganizer.services').factory('tournaments', function($http, $rootScope) {
	return {
		get: function() {
			var self = this;
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