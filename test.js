var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/shadoworganizer');

var User = require('./models/user').UserModel;
var users = [
	{u: 'a', p: 'p'},
	{u: 'b', p: 'p'},
	{u: 'c', p: 'p'},
	{u: 'd', p: 'p'},
	{u: 'e', p: 'p'},
	{u: 'f', p: 'p'},
	{u: 'g', p: 'p'},
	{u: 'h', p: 'p'}
];

users.forEach(function (user){
	var u = new User({
		username: user.u,
		password: user.p,
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
		//tournament.addUser({username:'h', inGameName: 'h-ign'});

		//tournament.ready({match: {roundIndex: 1, matchIndex: 3, userIndex: 0}})
		//tournament.ready({match: {roundIndex: 1, matchIndex: 1, userIndex: 1}})


		tournament.save(function(err,t){
			console.log(err);
			console.log(t,t.bracket);
		});
	})
})