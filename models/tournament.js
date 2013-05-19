var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var condensedUser = require('./user').condensedUser;

var GameSchema = new Schema({
	started: Boolean,
	password: String,
	forceFirstTurn: String,
	creator: String,

	result: [String],
	firstTurn: [String],
	resultConfirmed: Boolean,

	resultError: String,
	syncError: Boolean
});

var MatchSchema = new Schema({
	players: [condensedUser],
	game: Number,
	ready: [Boolean],
	winner: String,
	error: Boolean,
	games: [GameSchema]
});

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
					game1: [MatchSchema],
					game2: [MatchSchema],
					game3: [MatchSchema],
					game4: [MatchSchema]
				},
		round2: {
			game1: [MatchSchema],
			game2: [MatchSchema]
		},
		round3: [MatchSchema]
	},
	winner: [condensedUser]
});

var MatchObj = function() {
	return {
		players: [],
		game: 0,
		ready: [false,false],
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

	//this will not push the last one on since we are pushing on the next itteration
	for (var i=0; i<this.players; i++) {
		if (i!== 0 && i%2 === 0) {
			this.bracket.round1['game'+matchIndex].push(match);
			match = new MatchObj();
			matchIndex++;
		}
		match.players.push(copy[i]);
	}
	//push the last one on
	this.bracket.round1.game4.push(match);
};

TournamentSchema.methods.addGame = function() {
};


var TournamentModel = mongoose.model('Tournament', TournamentSchema);

module.exports = {
	Tournament: TournamentModel,
	Game: GameSchema,
	Match: MatchSchema
}