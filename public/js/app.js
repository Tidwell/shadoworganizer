'use strict';


// Declare app level module which depends on filters, and services
angular.module('shadowOrganizer', [
	'shadowOrganizer.filters',
	'shadowOrganizer.services',
	'shadowOrganizer.directives',
	'ui.bootstrap'
])
	.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
		$routeProvider.when('/tournaments', {
			templateUrl: 'partials/tournaments',
			controller: TournamentsController
		});
		$routeProvider.when('/current-tournament', {
			templateUrl: 'partials/current-tournament',
			controller: CurrentTournamentController
		});
		$routeProvider.when('/account', {
			templateUrl: 'partials/account',
			controller: AccountController
		});
		$routeProvider.when('/forgot-password', {
			templateUrl: 'partials/forgot-password',
			controller: ForgotPasswordController
		});


		$routeProvider.when('/game', {
			templateUrl: 'partials/game',
			controller: GameController
		});
		$routeProvider.otherwise({
			redirectTo: '/tournaments'
		});
		$locationProvider.html5Mode(true);
	}]);

