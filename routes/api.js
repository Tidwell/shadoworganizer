/*
 * Serve JSON
 */

exports.tournaments = function(req, res) {
	res.jsonp([{
		name: 'Auto-Generated 8-Man',
		id: '123456',
		started: false,
		ended: false,
		round: 0,
		rules: ['Hero Lock', 'Deck Lock'],
		payout: {
			1: 200,
			2: 100
		},
		startTime: null,
		players: 4,
		userEntered: true
	}]);
};