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
	console.log('adding game');
	var round = this.bracket['round'+data.match.roundIndex];
	var match = round['game'+data.match.matchIndex];
	var newGame = new GameObj;
	//game1
	if (match.game === 0) {
		match.game = 1;
		newGame.started = true;
		newGame.password = 'serox';
		newGame.creator = match.players[0].username; //todo make random
	}
	else if (match.game >= 1) {
		match.game++;
		newGame.started = true;
		newGame.password = 'game'+match.game;
		newGame.creator = match.players[0].username; //todo reflect previous game
	}
	match.games.push(newGame);
	console.log('added', match.games)
};

//Starts the match
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
		this.addGame(data);
	}
	return true;
};

TournamentSchema.methods.result = function(data) {
	console.log('result', data)
	var rnd = 'round'+data.match.roundIndex;
	var gm = 'game'+data.match.matchIndex;
	var gameIndex = this.bracket[rnd][gm].game-1;

	if (!this.bracket[rnd] || !this.bracket[rnd][gm]) {
		return false;
	}
	//set the players result
	this.bracket[rnd][gm].games[gameIndex].result['player'+data.match.userIndex] = data.result;
	this.resolve(data);
	return true;
};

TournamentSchema.methods.firstTurnResult = function(data) {
	console.log('first turn', data)
	var rnd = 'round'+data.match.roundIndex;
	var gm = 'game'+data.match.matchIndex;
	var gameIndex = this.bracket[rnd][gm].game-1;

	if (!this.bracket[rnd] || !this.bracket[rnd][gm]) {
		return false;
	}
	//set the players first turn result
	this.bracket[rnd][gm].games[gameIndex].firstTurn['player'+data.match.userIndex] = data.result;
	this.resolve(data);
	return true;
};

TournamentSchema.methods.resolve = function(data) {
	var rnd = 'round'+data.match.roundIndex;
	var gm = 'game'+data.match.matchIndex;
	var gameIndex = this.bracket[rnd][gm].game-1;

	this.bracket[rnd][gm].games[gameIndex].resultError = null;

	this.checkResultError(data);

	if (this.bracket[rnd][gm].game === 1) {
		this.checkFirstTurnError(data);
	}

	if (!this.bracket[rnd][gm].games[gameIndex].resultError) {
		this.checkResultConfirmed(data);
		this.checkWinner(data);
		//if there isnt a winner of the round and the last game was confirmed
		if (!this.bracket[rnd][gm].winner && this.bracket[rnd][gm].games[gameIndex].resultConfirmed) {
			this.addGame(data);
		}
		if (this.bracket[rnd][gm].winner) {
			this.checkAdvanceRound();
		}
	} else {
		console.log('error', this.bracket[rnd][gm].games[gameIndex].resultError)
	}

	console.log('resolved')
}

TournamentSchema.methods.checkResultConfirmed = function(data) {
	var rnd = 'round'+data.match.roundIndex;
	var gm = 'game'+data.match.matchIndex;
	var gameIndex = this.bracket[rnd][gm].game-1;

	if (this.bracket[rnd][gm].winner) { return; }

	//if either not filled in abort
	if (!this.bracket[rnd][gm].games[gameIndex].result.player0 || !this.bracket[rnd][gm].games[gameIndex].result.player1) {
		return;
	}

	if (this.bracket[rnd][gm].game === 1) {
		if (!this.bracket[rnd][gm].games[gameIndex].firstTurn.player0 || !this.bracket[rnd][gm].games[gameIndex].firstTurn.player1) { return; }
	}

	//if they match
	if (this.bracket[rnd][gm].games[gameIndex].result.player0 === this.bracket[rnd][gm].games[gameIndex].result.player1) {
		this.bracket[rnd][gm].games[gameIndex].resultConfirmed = true;
	}
};

TournamentSchema.methods.checkAdvanceRound = function() {
	if (this.round === 3) { return; }
	var round = this.bracket['round'+this.round];
	var allgamesComplete = true;
	var winners = [];
	for (match in round) {
		if (match.indexOf('game') !== -1) {
			if (!round[match].winner) {
				allgamesComplete = false;
			} else {
				var winnerIndex = round[match].players[0].username===round[match].winner?0:1;
				winners.push(round[match].players[winnerIndex]);
			}
		}
	}
	if (!allgamesComplete) { return; }

	this.round++;

	var match = new MatchObj();
	var matchIndex = 1;
	winners.reverse();
	//copy all but the last one over
	for (var i=0; i<winners.length; i++) {
		if (i!== 0 && i%2 === 0) {
			for (prop in match) {
				this.bracket['round'+this.round]['game'+matchIndex][prop] = match[prop];
			}
			match = new MatchObj();
			matchIndex++;
		}
		match.players.push(winners[i]);
	}
	//copy the last one on
	for (prop in match) {
		this.bracket['round'+this.round]['game'+matchIndex][prop] = match[prop];
	}
}

TournamentSchema.methods.checkWinner = function(data) {
	var self = this;
	var rnd = 'round'+data.match.roundIndex;
	var gm = 'game'+data.match.matchIndex;
	var gameIndex = this.bracket[rnd][gm].game-1;
	if (this.bracket[rnd][gm].games.length < 2 || !this.bracket[rnd][gm].games[this.bracket[rnd][gm].games.length-1].resultConfirmed) {
		return false;
	}

	var state = [0,0];
	this.bracket[rnd][gm].games.forEach(function(game){
		state[game.result.player0===self.bracket[rnd][gm].players[0].username?0:1]++;
	});
	console.log('state is ',state)
	if (state.indexOf(2) !== -1) {
		this.bracket[rnd][gm].winner = this.bracket[rnd][gm].players[state.indexOf(2)].username;
	}
}

TournamentSchema.methods.checkFirstTurnError = function(data) {
	var rnd = 'round'+data.match.roundIndex;
	var gm = 'game'+data.match.matchIndex;
	var gameIndex = this.bracket[rnd][gm].game-1;

	//if either not filled in abort
	if (!this.bracket[rnd][gm].games[gameIndex].firstTurn.player0 || !this.bracket[rnd][gm].games[gameIndex].firstTurn.player1) { return; }

	//if both players forgot, thats a problem
	if (this.bracket[rnd][gm].games[gameIndex].firstTurn.player0 === 'forgot' &&
		this.bracket[rnd][gm].games[gameIndex].firstTurn.player1 === 'forgot') {
		this.bracket[rnd][gm].games[gameIndex].resultError = 'firstturn';
		return;
	}

	//if one player forgot, no problem (we do this first so we know all forgetting has been taken care of)
	if (this.bracket[rnd][gm].games[gameIndex].firstTurn.player0 === 'forgot' ||
		this.bracket[rnd][gm].games[gameIndex].firstTurn.player1 === 'forgot') {
		return;
	}

	//if they both dont match, thats a problem
	if (this.bracket[rnd][gm].games[gameIndex].firstTurn.player0 !== this.bracket[rnd][gm].games[gameIndex].firstTurn.player1) {
		this.bracket[rnd][gm].games[gameIndex].resultError = 'firstturn';
		return;
	}
};

TournamentSchema.methods.checkResultError = function(data) {
	var rnd = 'round'+data.match.roundIndex;
	var gm = 'game'+data.match.matchIndex;
	var gameIndex = this.bracket[rnd][gm].game-1;

	//if either not filled in, abort
	if (!this.bracket[rnd][gm].games[gameIndex].result.player0 || !this.bracket[rnd][gm].games[gameIndex].result.player1) { return; }

	//if they dont match
	if (this.bracket[rnd][gm].games[gameIndex].result.player0 !== this.bracket[rnd][gm].games[gameIndex].result.player1) {
		this.bracket[rnd][gm].games[gameIndex].resultError = 'winner';
		return;
	}
}

var TournamentModel = mongoose.model('Tournament', TournamentSchema);

module.exports = {
	Tournament: TournamentModel,
	Game: GameSchema
}