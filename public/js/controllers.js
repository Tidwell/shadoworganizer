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

function CurrentTournamentController($scope, $dialog) {
	// TODO move all these to a shared service so they can
	// be populated when returning from other pages
	$scope.tournament = {
		started: true,
		players: 8,
		round: 1
	};

	$scope.currentMatch = {
		opponentName: 'Alden the Brave',
		game: 1,
		ready: false,
		oppReady: false,
		winner: null //opponent or self
	};

	$scope.currentGame = {
		started: false,
		password: null,
		result: null, //win loss draw
		resultConfirmed: false,
		resultError: null, //winner or firstturn
		oppResult: null, //win loss draw (from their perspective)
		syncError: false,
		firstTurn: null, //self opponent forget
		forceFirstTurn: null, //opponent or self
		creator: null //opponent or self
	};

	//when the game starts, we want to reset the ready tracking
	//so the server doesn't have to tell us (maybe we do want the server to tell us???)
	$scope.$watch('currentGame.started', function() {
		if ($scope.currentGame.started === true) {
			$scope.currentMatch.ready = false;
			$scope.currentMatch.oppReady = false;
		}
	});

	//when a winner is declared, we want to reset the ready tracking
	//so the server doesn't have to tell us (maybe we do want the server to tell us???)
	$scope.$watch('currentMatch.winner', function() {
		if ($scope.currentGame.started === true) {
			$scope.currentMatch.ready = false;
			$scope.currentMatch.oppReady = false;
		}
	});

	$scope.gameResult = function(result) {
		$scope.currentGame.result = result;
		//send to server

		if ($scope.currentMatch.game === 1) {
			$scope.confirmFirstTurn();
		}
	};

	$scope.ready = function() {
		$scope.currentMatch.ready = true;
		//send to server

	};

	$scope.problem = function() {
		$scope.currentGame.syncError = true;
		//send to server

	};

	$scope.confirmFirstTurn = function() {
		var d = $dialog.dialog({
			backdrop: true,
			keyboard: true,
			backdropClick: true,
			templateUrl: 'partials/first-player-dialog',
			controller: 'FirstPlayerDialogController'
		});
		d.open().then(function(result) {
			if (result) {
				$scope.currentGame.firstTurn = result;
				//send to server

				//reset the error
				$scope.currentGame.resultError = null;
			}
		});
	};


	/* visual tests

	setTimeout(function() {
		console.log('Starting Game')
		$scope.currentGame.started = true;
		$scope.$digest();
	},2000);

	setTimeout(function() {
		console.log('Confirming Result')
		$scope.currentGame.resultConfirmed = true;
		$scope.$digest();
	},10000);

	setTimeout(function() {
		console.log('Setting match winner')
		$scope.currentMatch.winner = 'opponent';
		$scope.$digest();
	},2000);

	*/

}


function FirstPlayerDialogController($scope, dialog) {
	//TODO populate opponent name
	$scope.close = function(result) {
		dialog.close(result);
	};
}

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