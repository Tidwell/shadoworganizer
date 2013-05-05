var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var condensedUser = require('./user').condensedUser;

var TournamentModel = new Schema({
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
	users: [condensedUser],
	bracket: {
		round1: {
			game1: [condensedUser],
			game2: [condensedUser],
			game3: [condensedUser],
			game4: [condensedUser]
		},
		round2: {
			game1: [condensedUser],
			game2: [condensedUser]
		},
		round3: [condensedUser]
	},
	winner: condensedUser
});

module.exports = TournamentModel;