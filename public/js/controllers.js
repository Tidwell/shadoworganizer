'use strict';

/* Controllers */
//TODO
//LIST EVENTS THAT CAN BE RECIEVED

function TournamentsController($scope, $http, $location, tournaments, user, currentTournament, $dialog) {
	$scope.tournament = currentTournament.get();
	$scope.tournaments = tournaments.get();
	$scope.user = user.get();

	$scope.leaveTournament = function(id) {
		$scope.tournament = currentTournament.drop(id);
	};

	$scope.joinTournament = function(id) {
		$scope.tournament = currentTournament.join(id);
	};

	$scope.$watch('tournament.joined', function(){
		if ($scope.tournament.active && $scope.tournament.joined) {
			var d = $dialog.dialog({
				backdrop: true,
				keyboard: true,
				backdropClick: true,
				templateUrl: 'partials/join-tournament-dialog',
				controller: 'JoinTournamentDialogController'
			});
			d.open().then(function(result) {
				if (result) {
					$location.path('current-tournament');
				}
				$scope.tournament.joined = false;
			});
		}
	});

	//when they drop, notify them
	$scope.$watch('tournament.dropped', function() {
		if (!$scope.tournament.active && $scope.tournament.dropped) {
			var d = $dialog.dialog({
				backdrop: true,
				keyboard: true,
				backdropClick: true,
				templateUrl: 'partials/dropped-dialog',
				controller: 'DroppedController'
			});
			d.open().then(function(result) {
				//set the flag to note
				$scope.tournament.dropped = false;
			});
		}
	});

}

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

	$scope.$watch('user', function() {
		if (!$scope.user.authed) {
			$location.path('/tournaments');
		}
	});


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

function GameController() {
}
GameController.$inject = [];


function AccountController($scope, $location, user) {
	$scope.user = user.get();

	$scope.$watch('user.authed', function(){
		if (!$scope.user.authed) {
			$location.path('/tournaments');
		}
	});

	//copy over the email/ingame whenever it changes
	$scope.$watch('user.email',function() {
		$scope.emailEdited = $scope.user.email;
	});
	$scope.$watch('user.inGameName',function() {
		$scope.inGameNameEdited = $scope.user.inGameName;
	});

	$scope.edit = function(property) {
		$scope[property+'Editing'] = true;
	};

	$scope.close = function(property) {
		$scope[property+'Editing'] = false;
		$scope[property+'Edited'] = $scope.user[property];
	};

	$scope.save = function(property) {
		//we use the convention that the inputs have an ng-model of propertyEdited (eg. emailEdited)
		$scope.user[property] = $scope[property+'Edited'];
		user.update();
		$scope.close(property);
	};
}

function ForgotPasswordController($scope, $location, user) {
	$scope.user = user.get();

	$scope.$watch('user.authed', function(){
		if ($scope.user.authed) {
			$location.path('/account');
		}
	});

	$scope.email = '';

	$scope.resetPassword = function() {
		$scope.user = user.forgotPassword($scope.email);
	};
}

function NavCtrl($scope, $location, user, currentTournament, socket) {
	$scope.tournament = currentTournament.get();
	$scope.user = user.get();

	$scope.username = '';
	$scope.password = '';

	socket.on('user:login', clearForm);
	socket.on('user:register', clearForm);
	socket.on('user:updated', function() {
		$scope.userUpdated = true;
	});

	$scope.clearUpdated = function() {
		$scope.userUpdated = false;
	};

	function clearForm() {
		$scope.username = '';
		$scope.password = '';
	}

	$scope.login = function() {
		$scope.user = user.login({
			username: $scope.username,
			password: $scope.password
		});
	};

	$scope.register = function() {
		$scope.user = user.register({
			username: $scope.username,
			password: $scope.password
		});
	};

	$scope.logout = function() {
		$scope.user = user.logout();
	};

	$scope.navClass = function (page) {
        var currentRoute = $location.path().substring(1) || 'home';
        return page === currentRoute ? 'active' : '';
    };
}