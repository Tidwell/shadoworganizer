function TournamentsController($scope, $http, $location, tournaments, user, currentTournament, $dialog, socket) {
	$scope.tournament = currentTournament.get();
	$scope.tournaments = tournaments.get();
	$scope.user = user.get();

	//todo remove socket dependancy
	$scope.totalUsers = { count: 0 };
	socket.on('users:count', function(data) {
		$scope.totalUsers.count = data.count;
	});
	//get the count on load
	socket.emit('users:count');

	$scope.leaveTournament = function(id) {
		$scope.tournament = currentTournament.drop(id);
	};

	var awaitingJoinId;

	$scope.$watch('user.inGameName', function(val){
		if (val && awaitingJoinId) {
			$scope.joinTournament(awaitingJoinId);
		}
	});

	$scope.joinTournament = function(id) {
		if (!$scope.user.inGameName) {
			//prompt for ingamename
			var d = $dialog.dialog({
				backdrop: true,
				keyboard: true,
				backdropClick: true,
				templateUrl: 'partials/set-in-game-name-dialog',
				controller: 'SetInGameNameDialogController'
			});
			d.open().then(function(result) {
				if (result) {
					$scope.user.inGameName = result;
					user.update();
					awaitingJoinId = id;
					return;
				}
				awaitingJoinId = false;
			});
			return;
		}
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