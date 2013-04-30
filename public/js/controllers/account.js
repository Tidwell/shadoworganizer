'use strict';

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