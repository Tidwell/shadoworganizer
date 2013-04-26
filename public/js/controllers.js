'use strict';

/* Controllers */
//TODO
//LIST EVENTS THAT CAN BE RECIEVED

function TournamentsController($scope, $http, tournaments) {
	$scope.tournaments = tournaments.get();

	//when we get new tournaments we want to check to see if the player is
	//in the list of users and set a flag on the tournament if they are
	$scope.$watch('tournaments.tournaments', function() {
		$scope.tournaments.tournaments.forEach(function(tournament) {
			if (!tournament.started) {
				tournament.users.forEach(function(user){
					if (user.id === 'qwe') {
						tournament.userEntered = true;
					}
				});
			}
		});
	});

	$scope.leaveTournament = function() {
		//send to server

	};

	$scope.joinTournament = function() {
		//send to server

	};
}

function CurrentTournamentController($scope, $dialog, currentTournament, currentMatch, currentGame) {
	$scope.tournament = currentTournament.get();
	$scope.currentMatch = currentMatch.get();
	$scope.currentGame = currentGame.get();

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

	$scope.drop = function() {
		//send to server

	};

	$scope.concede = function() {
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


function FirstPlayerDialogController($scope, dialog, currentMatch) {
	$scope.currentMatch = currentMatch.get();

	$scope.close = function(result) {
		dialog.close(result);
	};
}

function GameController() {
}
GameController.$inject = [];


function AccountController($scope,user) {
	$scope.user = user.get();
}

function NavCtrl($scope,$location,user) {
	$scope.user = user.get();

	$scope.navClass = function (page) {
        var currentRoute = $location.path().substring(1) || 'home';
        return page === currentRoute ? 'active' : '';
    };
}