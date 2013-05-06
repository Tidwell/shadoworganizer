/*
 * Serve JSON
 */

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