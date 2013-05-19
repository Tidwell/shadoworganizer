var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/shadoworganizer');

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

tournament.addUser({username:'a', inGameName: 'a-ign'});
tournament.addUser({username:'b', inGameName: 'b-ign'});
tournament.addUser({username:'c', inGameName: 'c-ign'});
tournament.addUser({username:'d', inGameName: 'd-ign'});
tournament.addUser({username:'e', inGameName: 'e-ign'});
tournament.addUser({username:'f', inGameName: 'f-ign'});
tournament.addUser({username:'g', inGameName: 'g-ign'});
//tournament.addUser({username:'h'})


tournament.save(function(err,t){
	console.log(t,t.bracket);
});