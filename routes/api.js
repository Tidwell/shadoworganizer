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
		users: [
			{
				id: '',
				inGameName: ''
			}
		]
	},{
		name: 'Auto-Generated 8-Man',
		id: '456',
		started: false,
		ended: false,
		round: 0,
		rules: ['Hero Lock', 'Deck Lock'],
		payout: {
			1: 200,
			2: 100
		},
		startTime: null,
		players: 6,
		users: [
			{
				id: '',
				inGameName: 'Tidwell'
			}
		]
	}]);
};

exports.tournament = function(req,res) {
	res.jsonp({
		name: 'Auto-Generated 8-Man',
		id: '123456',
		started: false,
		ended: false,
		round: 1,
		rules: ['Hero Lock', 'Deck Lock', 'Sideboard'],
		payout: {
			1: 200,
			2: 100
		},
		startTime: null,
		players: 6,
		users: [
			{
				id: '',
				inGameName: ''
			}
		],
		bracket: {
			round1: {
				game1: ['qwe','hhhhh'],
				game2: ['pppp','asdf'],
				game3: ['jjjjj','qweasdf'],
				game4: ['qwe2','ppppp']
			},
			round2: {
				game1: ['qwe','asdf'],
				game2: ['qweasdf','qwe2']
			},
			round3: ['qwe','qwe2']
		},
		winner: 'qwe'
	});
};

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

exports.user = function(req,res) {
	res.jsonp({
		inGameName: 'Tidwell',
		email: 'aaron.tidwell@gmail.com',
		authed: true,
		games: {
			wins: 1,
			losses: 5
		},
		tournaments: [{
			name: 'Auto-Generated 8-Man',
			id: '123456',
			startTime: new Date(),
			placing: '1st',
			payout: 200
		},
		{
			name: 'Auto-Generated 8-Man',
			id: '1234',
			startTime: new Date(),
			placing: '3rd (tied)',
			payout: 0
		}],
		rating: 1800,
		tournamentWins: 2,
		earnings: 1000
	});
}