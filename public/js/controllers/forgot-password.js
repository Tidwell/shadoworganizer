'use strict';

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