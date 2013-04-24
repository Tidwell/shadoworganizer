'use strict';

/* Directives */

var versionDirective = angular.module('shadowOrganizer.directives', []);
versionDirective.directive('appVersion', function(version) {
	return function(scope, elm, attrs) {
		elm.text(version);
	};
});

var showTabDirective = angular.module('shadowOrganizer.directives', []);
showTabDirective.directive('showtab', function () {
    return {
        link: function (scope, element, attrs) {
            element.click(function(e) {
				$(element).tab('show');
                return false;
            });
        }
    };
});