'use strict';

/* Services */

var Services = angular.module('shadowOrganizer.services', []);

/* Misc value consts */
Services.value('version', '0.1 (alpha)');

/* Rule definitions */
Services.value('herolock', 'Your hero may not be changed. Your deck may be changed between rounds/games.');
Services.value('decklock', 'Your hero and deck may not be changed between rounds/games');
Services.value('sideboard', 'Your deck may be changed between games by making 1:1 substitutions from your 15-card sideboard.');


//unconverted
Services.service('currentGame', function($http, $rootScope) {
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