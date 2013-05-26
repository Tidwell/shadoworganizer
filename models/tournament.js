var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var condensedUser = require('./user').condensedUser;

var GameSchema = {
	started: Boolean,
	password: String,
	forceFirstTurn: String, //username
	creator: String,

	result: {player0: String, player1: String},
	firstTurn: {player0: String, player1: String},
	resultConfirmed: Boolean,

	resultError: String,
	syncError: Boolean
};

var TournamentSchema = new Schema({
	name: String,
	active: Boolean,
	started: Boolean,
	ended: Boolean,
	round: Number,
	rules: [String],
	payout: {
		1: Number,
		2: Number
	},
	startTime: Date,
	players: Number,
	minPlayers: Number,
	users: [condensedUser],
	bracket: {
		round1: {
					game1: {
						players: [condensedUser],
						game: Number,
						ready: {player0: false, player1: false},
						winner: String,
						error: Boolean,
						games: [GameSchema]
					},
					game2: {
						players: [condensedUser],
						game: Number,
						ready: {player0: false, player1: false},
						winner: String,
						error: Boolean,
						games: [GameSchema]
					},
					game3: {
						players: [condensedUser],
						game: Number,
						ready: {player0: false, player1: false},
						winner: String,
						error: Boolean,
						games: [GameSchema]
					},
					game4: {
						players: [condensedUser],
						game: Number,
						ready: {player0: false, player1: false},
						winner: String,
						error: Boolean,
						games: [GameSchema]
					}
				},
		round2: {
			game1: {
				players: [condensedUser],
				game: Number,
				ready: {player0: false, player1: false},
				winner: String,
				error: Boolean,
				games: [GameSchema]
			},
			game2: {
				players: [condensedUser],
				game: Number,
				ready: {player0: false, player1: false},
				winner: String,
				error: Boolean,
				games: [GameSchema]
			}
		},
		round3: {
			game1: {
				players: [condensedUser],
				game: Number,
				ready: {player0: false, player1: false},
				winner: String,
				error: Boolean,
				games: [GameSchema]
			}
		}
	},
	winner: [condensedUser]
});

var MatchObj = function() {
	return {
		players: [],
		game: 0,
		ready: {player0: false, player1: false},
		games: []
	};
};

var GameObj = function() {
	return {
		started: false
	};
};


//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o) { //v1.0
	for (var j, x, i = o.length; i; j = parseInt(Math.random() * i,10), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
}

TournamentSchema.methods.addUser = function(user) {
	if (this.players >= this.minPlayers) { return false; }
	this.players++;
	this.users.push({
		inGameName: user.inGameName || '',
		username: user.username || ''
	});
	this.checkStart();
	return this;
};

TournamentSchema.methods.removeUser = function(user) {
	var removed = false;
	var self = this;
	self.users.forEach(function(player, i) {
		if (player.username === user.username) {
			self.users.splice(i,1);
			self.players--;
			removed = true;
		}
	});
	return removed;
}

TournamentSchema.methods.checkStart = function() {
	if (this.players === this.minPlayers) {
		this.start();
	}
}

TournamentSchema.methods.start = function() {
	this.started = true;
	this.startTime = new Date();
	this.round = 1;
	var copy = shuffle(this.users);

	var match = new MatchObj();
	var matchIndex = 1;

	//copy all but the last one over
	for (var i=0; i<this.players; i++) {
		if (i!== 0 && i%2 === 0) {
			for (prop in match) {
				this.bracket.round1['game'+matchIndex][prop] = match[prop];
			}
			match = new MatchObj();
			matchIndex++;
		}
		match.players.push(copy[i]);
	}
	//copy the last one on
	for (prop in match) {
		this.bracket.round1['game'+matchIndex][prop] = match[prop];
	}
};

TournamentSchema.methods.addGame = function(data) {
	var round = this.bracket['round'+data.match.roundIndex];
	var match = round['game'+data.match.matchIndex];
	var newGame = new GameObj;
	//game1
	if (match.game === 0) {
		this.bracket['round'+data.match.roundIndex]['game'+data.match.matchIndex].game = 1;
		newGame.started = true;
		newGame.password = 'serox';
		newGame.creator = match.players[0].username;
	}
	match.games.push(newGame);
};

TournamentSchema.methods.ready = function(data) {
	var rnd = 'round'+data.match.roundIndex;
	var gm = 'game'+data.match.matchIndex;
	if (!this.bracket[rnd] || !this.bracket[rnd][gm]) {
		return false;
	}
	//set the players ready state
	this.bracket[rnd][gm].ready['player'+data.match.userIndex] = true;
	//check if we need to start the game
	if (this.bracket[rnd][gm].ready.player0 && this.bracket[rnd][gm].ready.player1) {
		console.log('starting game');
		this.addGame(data);
	}
	return true;
};

TournamentSchema.methods.result = function(data) {
	var rnd = 'round'+data.match.roundIndex;
	var gm = 'game'+data.match.matchIndex;
	var gameIndex = this.bracket[rnd][gm].game-1;

	if (!this.bracket[rnd] || !this.bracket[rnd][gm]) {
		return false;
	}
	//set the players result
	this.bracket[rnd][gm].games[gameIndex].result['player'+data.match.userIndex] = data.result;
	return true;
};

var TournamentModel = mongoose.model('Tournament', TournamentSchema);

module.exports = {
	Tournament: TournamentModel,
	Game: GameSchema
}