'use strict';

/* Directives */

var versionDirective = angular.module('shadowOrganizer.directives', []);
versionDirective.directive('appVersion', function(version) {
    return function(scope, elm, attrs) {
        elm.text(version);
    };
});

var showTabDirective = angular.module('shadowOrganizer.directives', []);
showTabDirective.directive('showtab', function() {
    return {
        link: function(scope, element, attrs) {
            element.click(function(e) {
                $(element).tab('show');
                return false;
            });
        }
    };
});

var gamePlayersClass = angular.module('shadowOrganizer.directives', []);
gamePlayersClass.directive('gameplayersclass', function() {
    return {
        link: function(scope, element, attrs) {
            scope.$watch(attrs.gameplayersclass, function(numPlayers) {
                $(element).removeClass('badge-info badge-success');

                if (numPlayers >= 4 && numPlayers < 6) {
                    $(element).addClass('badge-info');
                } else if (numPlayers >= 6) {
                    $(element).addClass('badge-success')
                }
            });
        }
    };
});