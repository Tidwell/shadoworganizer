var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var UserModel = new Schema({
	username: String,
	password: String,
	inGameName: String,
	email: String,
	authed: Boolean,
	games: {
		wins: Number,
		losses: Number
	},
	tournaments: [{
		name: String,
		id: ObjectId,
		startTime: Date,
		placing: Number,
		payout: Number
	}],
	rating: Number,
	tournamentWins: Number,
	earnings: Number
});

UserModel = mongoose.model('User', UserModel);

var condensedUser = new Schema({
	username: String,
	inGameName: String,
	id: ObjectId
});

module.exports = {
	UserModel: UserModel, //model
	condensedUser: condensedUser //schema
};