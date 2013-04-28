/*
 * Serve content over a socket
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/shadoworganizer');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var loggedInUsers = [];
var currentTournaments = [];

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
	users: [{id: ObjectId, inGameName: String, username: String}],
	bracket: {
		round1: {
			game1: [String],
			game2: [String],
			game3: [String],
			game4: [String]
		},
		round2: {
			game1: [String],
			game2: [String]
		},
		round3: [String]
	},
	winner: String
});

var User = mongoose.model('User', UserModel);
var Tournament = mongoose.model('Tournament', TournamentModel);

//maybe this should just listen for events and route to the api with a .jsonp mock?
module.exports = function(socket) {

	//registration
	socket.on('user:register', function(userData) {
		//make sure they sent a username & password
		if (!userData.username || !userData.password) {
			socket.emit('user:error', {
				error: 'No username or password'
			});
			return;
		}
		//see if it is in use
		User.find({
			username: userData.username
		}, function(err, data) {
			if (data.length) {
				socket.emit('user:error', {
					error: 'Username in use'
				});
				return;
			}
			//see if it is too short
			if (userData.username.length < 4) {
				socket.emit('user:error', {
					error: 'Username too short'
				});
				return;
			}
			//register
			var u = new User({
				username: userData.username,
				password: userData.password,
				authed: true,
				games: {
					wins: 0,
					losses: 0
				},
				rating: 1500,
				tournamentWins: 0,
				earnings: 0
			});
			u.save(function(err, user) {
				if (err) {
					socket.emit('user:error', {
						error: 'Error during registration'
					});
					return;
				}
				sendLogin(user);
			});
		});
	});

	//update
	socket.on('user:update', function(userData) {
		auth(userData, function(data) {
			data.inGameName = userData.inGameName;
			data.email = userData.email;
			if (userData.newPassword) {
				data.password = userData.newPassword;
			}
			data.save(function(err,user){
				delete user.password;
				socket.emit('user:updated', user);
			});
		});
	});

	//login
	socket.on('user:login', function(userData){
		auth(userData, sendLogin);
	});

	//logout
	socket.on('user:logout', function(userData){
		auth(userData, function(data){
			loggedInUsers.forEach(function(user,index){
				if (user.username === userData.username) {
					loggedInUsers.splice(index,1);
					socket.emit('user:logged-out', {});
				}
			});
		});
	});

	socket.on('user:forgot-password', function(email){
		//reset password to random

		//send email with new password
	});

	function sendLogin(data){
		loggedInUsers.push(data);
		delete data.password;
		socket.emit('user:login', data);
	}

	function auth(data, success) {
		User.find({ username: data.username, password: data.password }, function(err,userData){
			if (!userData.length) {
				socket.emit('user:error', {
					error: 'Error authenticating, please login again.'
				});
				return;
			}
			success(userData[0]);
		});
	}


	//on load populate unstarted tournaments from the DB
	Tournament.find({started: false}, function(err,tournaments){
		if (tournaments.length) {
			currentTournaments = tournaments;
		}
		//if we cant find any, create a new tournament
		if (!currentTournaments.length) {
			var t = new Tournament({
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
				users: []
			});

			t.save(function(err,tournament){
				currentTournaments.push(tournament);
				socket.emit('tournaments:update', { tournaments: currentTournaments });
			});
		}
	});

	//tournaments list
	socket.on('tournaments:list', function(){
		socket.emit('tournaments:update', { tournaments: currentTournaments });
	});

	//tournament join
	socket.on('tournament:join', function(data) {
		auth(data,function(userObj){
			Tournament.find({_id: data.tournamentId}, function(err,tournaments) {
				var tournament = tournaments[0];
				if (tournament.players < 8) {
					//add to tournament
					tournament.players++;
					tournament.users.push({
						id: userObj.id,
						inGameName: userObj.inGameName,
						username: userObj.username
					});
					//save to the db
					tournament.save(function(err,tournamentObj) {
						if (err) {
							socket.emit('tournament:error', 'Error joining tournament.');
						}
						//check and see if it is stored in cache and update it if it is
						currentTournaments.forEach(function(t,i){
							if (t.id === tournamentObj.id) {
								currentTournaments[i] = tournamentObj;
							}
						});
						//notify everyone
						socket.emit('tournament:update', {tournament: tournamentObj});
					});
				} else {
					socket.emit('tournament:error', 'Tournament is Full.');
				}
			});
		});
	});

	function getTournament(id, cb) {
		Tournaments.find({id: id}, function(err,activeTournament){
			activeTournaments.forEach(function(tournament) {
				if (id === tournament.id) {
					cb(tournament);
				}
			});
		});
	}
};