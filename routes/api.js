/*
 * Serve JSON
 */

exports.match = function(req,res) {
	res.jsonp({
		opponentName: 'Alden the Brave',
		game: 1,
		ready: false,
		oppReady: false,
		winner: null //opponent or self
	});
};

exports.game = function(req,res) {
	res.jsonp({
		started: true,
		password: null,
		forceFirstTurn: null, //opponent or self
		creator: null, //opponent or self

		result: null, //win loss draw
		firstTurn: null, //self opponent forget
		resultConfirmed: false,

		resultError: null, //winner or firstturn
		oppResult: null, //win loss draw (from their perspective)
		syncError: false
	});
};