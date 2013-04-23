'use strict';

/* Controllers */

function TournamentsController($scope, $http) {
	function getTournaments(cb) {
		$http({method: 'GET', url: '/REST/tournaments'})
			.success(function(data, status, headers, config) {
				cb(data);
				// this callback will be called asynchronously
				// when the response is available
			})
			.error(function(data, status, headers, config) {
				cb(data);
				// called asynchronously if an error occurs
				// or server returns response with an error status.
			});
	}

	$scope.refresh = function() {
		getTournaments(function(data) {
			$scope.data = data;
		});
	};

	$scope.refresh();
}

function CurrentTournamentController() {
}
CurrentTournamentController.$inject = [];

function GameController() {
}
GameController.$inject = [];


function AccountController() {
}
AccountController.$inject = [];

function NavCtrl($scope,$location) {
	$scope.navClass = function (page) {
        var currentRoute = $location.path().substring(1) || 'home';
        return page === currentRoute ? 'active' : '';
    };
}