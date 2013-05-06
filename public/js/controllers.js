'use strict';

/* Dialog Controllers */

function DropDialogController($scope, dialog) {
	$scope.close = function(result) {
		dialog.close(result);
	};
}

function DroppedController($scope, dialog) {
	$scope.close = function(result) {
		dialog.close(result);
	};
}

function JoinTournamentDialogController($scope, dialog, currentTournament) {
	$scope.tournament = currentTournament.get();

	$scope.close = function(result) {
		dialog.close(result);
	};
}

function FirstPlayerDialogController($scope, dialog, currentMatch) {
	$scope.currentMatch = currentMatch.get();

	$scope.close = function(result) {
		dialog.close(result);
	};
}

function SetInGameNameDialogController($scope, dialog, user) {
	$scope.close = function(result) {
		dialog.close(result);
	};
}

/* for in-lining the game */
function GameController() {

}