var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/shadoworganizer');

var User = require('./models/user').UserModel;
var users = [
	{u: 'a', p: 'p', inGameName:'a-ign'},
	{u: 'b', p: 'p', inGameName:'b-ign'},
	{u: 'c', p: 'p', inGameName:'c-ign'},
	{u: 'd', p: 'p', inGameName:'d-ign'},
	{u: 'e', p: 'p', inGameName:'e-ign'},
	{u: 'f', p: 'p', inGameName:'f-ign'},
	{u: 'g', p: 'p', inGameName:'g-ign'},
	{u: 'h', p: 'p', inGameName:'h-ign'}
];

users.forEach(function (user){
	var u = new User({
		username: user.u,
		password: user.p,
		inGameName: user.inGameName || null,
		authed: true,
		games: {
			wins: 0,
			losses: 0
		},
		rating: 1500,
		tournamentWins: 0,
		earnings: 0
	});
	u.save();
});

var Tournament = require('./models/tournament').Tournament;
var tournament = new Tournament({
	name: 'Auto Generated 8-Man',
	active: true,
	started: false,
	ended: false,
	round: 0,
	rules: ['Deck Lock'],
	payout: {
		1: 0,
		2: 0
	},
	startTime: new Date(),
	players: 0,
	minPlayers: 8,
	users: []
});

tournament.save(function(err){
	Tournament.find({_id: tournament.id}, function(e,t){
		var tournament = t[0];
		tournament.addUser({username:'a', inGameName: 'a-ign'});
		tournament.addUser({username:'b', inGameName: 'b-ign'});
		tournament.addUser({username:'c', inGameName: 'c-ign'});
		tournament.addUser({username:'d', inGameName: 'd-ign'});
		tournament.addUser({username:'e', inGameName: 'e-ign'});
		tournament.addUser({username:'f', inGameName: 'f-ign'});
		tournament.addUser({username:'g', inGameName: 'g-ign'});
		tournament.addUser({username:'h', inGameName: 'h-ign'});

		//match1
		tournament.ready({match: {roundIndex: 1, matchIndex: 1, userIndex: 0}})
		tournament.ready({match: {roundIndex: 1, matchIndex: 1, userIndex: 1}})

		tournament.result({match: {roundIndex: 1, matchIndex: 1, userIndex: 0}, result: tournament.bracket.round1.game1.players[0].username})
		tournament.result({match: {roundIndex: 1, matchIndex: 1, userIndex: 1}, result: tournament.bracket.round1.game1.players[0].username})

		tournament.firstTurnResult({match: {roundIndex: 1, matchIndex: 1, userIndex: 0}, result: tournament.bracket.round1.game1.players[0].username})
		tournament.firstTurnResult({match: {roundIndex: 1, matchIndex: 1, userIndex: 1}, result: tournament.bracket.round1.game1.players[0].username})

		tournament.result({match: {roundIndex: 1, matchIndex: 1, userIndex: 0}, result: tournament.bracket.round1.game1.players[0].username})
		tournament.result({match: {roundIndex: 1, matchIndex: 1, userIndex: 1}, result: tournament.bracket.round1.game1.players[0].username})

		//match2
		tournament.ready({match: {roundIndex: 1, matchIndex: 2, userIndex: 0}})
		tournament.ready({match: {roundIndex: 1, matchIndex: 2, userIndex: 1}})

		tournament.result({match: {roundIndex: 1, matchIndex: 2, userIndex: 0}, result: tournament.bracket.round1.game2.players[0].username})
		tournament.result({match: {roundIndex: 1, matchIndex: 2, userIndex: 1}, result: tournament.bracket.round1.game2.players[0].username})

		tournament.firstTurnResult({match: {roundIndex: 1, matchIndex: 2, userIndex: 0}, result: tournament.bracket.round1.game2.players[0].username})
		tournament.firstTurnResult({match: {roundIndex: 1, matchIndex: 2, userIndex: 1}, result: tournament.bracket.round1.game2.players[0].username})

		tournament.result({match: {roundIndex: 1, matchIndex: 2, userIndex: 0}, result: tournament.bracket.round1.game2.players[0].username})
		tournament.result({match: {roundIndex: 1, matchIndex: 2, userIndex: 1}, result: tournament.bracket.round1.game2.players[0].username})

		//match3
		tournament.ready({match: {roundIndex: 1, matchIndex: 3, userIndex: 0}})
		tournament.ready({match: {roundIndex: 1, matchIndex: 3, userIndex: 1}})

		tournament.result({match: {roundIndex: 1, matchIndex: 3, userIndex: 0}, result: tournament.bracket.round1.game3.players[0].username})
		tournament.result({match: {roundIndex: 1, matchIndex: 3, userIndex: 1}, result: tournament.bracket.round1.game3.players[0].username})

		tournament.firstTurnResult({match: {roundIndex: 1, matchIndex: 3, userIndex: 0}, result: tournament.bracket.round1.game3.players[0].username})
		tournament.firstTurnResult({match: {roundIndex: 1, matchIndex: 3, userIndex: 1}, result: tournament.bracket.round1.game3.players[0].username})

		tournament.result({match: {roundIndex: 1, matchIndex: 3, userIndex: 0}, result: tournament.bracket.round1.game3.players[0].username})
		tournament.result({match: {roundIndex: 1, matchIndex: 3, userIndex: 1}, result: tournament.bracket.round1.game3.players[0].username})


		//match4
		tournament.ready({match: {roundIndex: 1, matchIndex: 4, userIndex: 0}})
		tournament.ready({match: {roundIndex: 1, matchIndex: 4, userIndex: 1}})

		tournament.result({match: {roundIndex: 1, matchIndex: 4, userIndex: 0}, result: tournament.bracket.round1.game4.players[0].username})
		tournament.result({match: {roundIndex: 1, matchIndex: 4, userIndex: 1}, result: tournament.bracket.round1.game4.players[0].username})

		tournament.firstTurnResult({match: {roundIndex: 1, matchIndex: 4, userIndex: 0}, result: tournament.bracket.round1.game4.players[0].username})
		tournament.firstTurnResult({match: {roundIndex: 1, matchIndex: 4, userIndex: 1}, result: tournament.bracket.round1.game4.players[0].username})

		tournament.result({match: {roundIndex: 1, matchIndex: 4, userIndex: 0}, result: tournament.bracket.round1.game4.players[0].username})
		tournament.result({match: {roundIndex: 1, matchIndex: 4, userIndex: 1}, result: tournament.bracket.round1.game4.players[0].username})


		tournament.save(function(err,t){
			console.log(t.bracket.round1);
			console.log(t.bracket.round2);
		});
	})
})