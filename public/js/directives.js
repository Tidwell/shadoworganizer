'use strict';

/* Directives */

var Directives = angular.module('shadowOrganizer.directives', []);

Directives.directive('appVersion', function(version) {
    return function(scope, elm, attrs) {
        elm.text(version);
    };
});
Directives.directive('heroLock', function(herolock) {
    return function(scope, elm, attrs) {
        elm.text(herolock);
    };
});
Directives.directive('deckLock', function(decklock) {
    return function(scope, elm, attrs) {
        elm.text(decklock);
    };
});
Directives.directive('sideboard', function(sideboard) {
    return function(scope, elm, attrs) {
        elm.text(sideboard);
    };
});

//for bootstrap tabs
//todo switch whatever is using this to use angular-ui properly
Directives.directive('showtab', function() {
    return {
        link: function(scope, element, attrs) {
            element.click(function(e) {
                $(element).tab('show');
                return false;
            });
        }
    };
});

//to apply colors to badges based on the number of players in a tournament
Directives.directive('gamePlayersClass', function() {
    return {
        link: function(scope, element, attrs) {
            scope.$watch(attrs.gamePlayersClass, function(numPlayers) {
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