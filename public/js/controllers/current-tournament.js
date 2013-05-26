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

	$scope.gameResult = function(result) {
		currentGame.result(result);

		if ($scope.currentMatch.match.game === 1 && !$scope.currentGame.game.firstTurn) {
			$scope.confirmFirstTurn();
		}
	};

	$scope.ready = function() {
		currentTournament.ready();
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
				currentGame.firstTurnResult(result);
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
				currentTournament.drop();
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