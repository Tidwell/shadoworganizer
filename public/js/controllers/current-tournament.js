'use strict';

function CurrentTournamentController($scope, $location, $dialog, currentTournament, currentMatch, currentGame, user) {
	$scope.tournament = currentTournament.get();
	$scope.currentMatch = currentMatch.get();
	$scope.currentGame = currentGame.get();
	$scope.user = user.get();

	$scope.$watch('user.authed', function(){
		if (!$scope.user.authed) {
			$location.path('/tournaments');
		}
	});
	$scope.$watch('user', function() {
		if (!$scope.user.authed) {
			$location.path('/tournaments');
		}
	});

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

	$scope.drop = function() {
		var d = $dialog.dialog({
			backdrop: true,
			keyboard: true,
			backdropClick: true,
			templateUrl: 'partials/confirm-drop-dialog',
			controller: 'DropDialogController'
		});
		d.open().then(function(result) {
			if (result) {
				$location.path('/tournaments');
				currentTournament.drop($scope.tournament.tournament._id);
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