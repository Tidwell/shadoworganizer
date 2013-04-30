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