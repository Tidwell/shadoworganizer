'use strict';

/* Filters */

angular.module('shadowOrganizer.filters', []);

angular.module('shadowOrganizer.filters')
.filter('implode', function() {
    return function(input, delimiter) {
		delimiter = delimiter ? delimiter : ', ';
        return input ? input.join(delimiter) : '';
    };
});