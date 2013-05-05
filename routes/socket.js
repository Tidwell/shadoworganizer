/*
 * Serve content over a socket
 */
var tournamentPlayers = 8;

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

var condensedUser = {
	username: String,
	inGameName: String,
	id: ObjectId
};

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

var User = mongoose.model('User', UserModel);
var Tournament = mongoose.model('Tournament', TournamentModel);

//maybe this should just listen for events and route to the api with a .jsonp mock?
module.exports = function(socket, io) {

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
	socket.on('user:logout', logout);

	socket.on('user:forgot-password', function(email){
		//reset password to random

		//send email with new password
	});

	socket.on('users:count',sendCount);

	function logout(userData) {
		auth(userData, function(data){
			loggedInUsers.forEach(function(user,index){
				if (user.username === userData.username) {
					loggedInUsers.splice(index,1);
					socket.emit('user:logged-out', {});
					sendCount();
				}
			});
		});
	}

	function sendCount(all) {
		if (!all) {
			socket.emit('users:count', {count: loggedInUsers.length});
			return;
		}
		io.sockets.emit('users:count', {count: loggedInUsers.length});
	}

	function sendLogin(data){
		loggedInUsers.push(data);
		socket.user = data;
		delete data.password;
		socket.emit('user:login', data);
		sendCount();
	}

	function auth(data, success) {
		//if we already have their user obj on the scoket
		if (socket.user) {
			success(socket.user);
		}
		//otherwise make sure they passed params
		if (!data || typeof data.username !== 'string' || typeof data.password !== 'string' ) {
			error();
			return;
		}
		//check the db
		User.find({ username: data.username, password: data.password }, function(err,userData){
			if (!userData.length) {
				error();
				return;
			}
			success(userData[0]);
		});

		function error() {
			socket.emit('user:error', {
				error: 'Error authenticating, please login again.'
			});
		}
	}

	function loadFromDB(cb) {
		Tournament.find({active: true}, function(err,tournaments){
			if (tournaments.length) {
				currentTournaments = tournaments;
				if (cb) { cb(); }
			}
		});
	}

	function checkCreate() {
		//on load populate unstarted tournaments from the DB
		var createNew = true;
		currentTournaments.forEach(function(t){
			if (t.started === false) {
				createNew = false;
			}
		});
		//if we cant find any, create a new tournament
		if (!createNew) { return; }

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
			io.sockets.emit('tournaments:update', { tournaments: currentTournaments });
		});
	}

	loadFromDB(checkCreate);

	//tournaments list
	socket.on('tournaments:list', function(){
		socket.emit('tournaments:update', { tournaments: currentTournaments });
	});

	//+ Jonas Raoni Soares Silva
	//@ http://jsfromhell.com/array/shuffle [v1.0]
	function shuffle(o) { //v1.0
		for (var j, x, i = o.length; i; j = parseInt(Math.random() * i,10), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	}

	function checkStart(tournament) {
		if (tournament.players === tournamentPlayers) {
			tournament.started = true;
			tournament.startTime = new Date();
			tournament.round = 1;

			var copy = shuffle(tournament.users);
			tournament.bracket.round1.game1.push(copy[0]);
			tournament.bracket.round1.game1.push(copy[1]);

			tournament.bracket.round1.game2.push(copy[2]);
			tournament.bracket.round1.game2.push(copy[3]);

			tournament.bracket.round1.game3.push(copy[4]);
			tournament.bracket.round1.game3.push(copy[5]);

			tournament.bracket.round1.game4.push(copy[6]);
			tournament.bracket.round1.game4.push(copy[7]);
		}
		return tournament;
	}

	//tournament join
	socket.on('tournament:join', function(data) {
		auth(data,function(userObj){
			Tournament.find({_id: data.tournamentId}, function(err,tournaments) {
				var tournament = tournaments[0];
				if (tournament.players < tournamentPlayers) {
					//add to tournament
					tournament.players++;
					tournament.users.push({
						inGameName: userObj.inGameName,
						username: userObj.username
					});

					tournament = checkStart(tournament);

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
						io.sockets.emit('tournament:update', {tournament: tournamentObj});
						socket.emit('tournament:joined', {tournament: tournamentObj});

						checkCreate();
					});
				} else {
					socket.emit('tournament:error', 'Tournament is Full.');
				}
			});
		});
	});

	socket.on('tournament:drop', function(data) {
		auth(data, function(userObj){
			Tournament.find({_id: data.id}, function(err,tournaments){
				if (!tournaments.length || err) {
					socket.emit('tournament:error', {error: 'Faild to find tournament.'});
					return;
				}
				var tournamentObj = tournaments[0];
				//remove the player
				tournamentObj.players--;
				tournamentObj.users.forEach(function(player, i) {
					if (player.username === userObj.username) {
						tournamentObj.users.splice(i,1);
						tournamentObj.save(function(err,tournamentObj) {
							//check and see if it is stored in cache and update it if it is
							currentTournaments.forEach(function(t,i){
								if (t.id === tournamentObj.id) {
									currentTournaments[i] = tournamentObj;
								}
							});
							//notify everyone
							io.sockets.emit('tournament:update', {tournament: tournamentObj});
							socket.emit('tournament:dropped', {tournament: tournamentObj});
						});
					}
				});
			});
		});
	});

	socket.on('disconnect', function() {
		logout(socket.user);
	});
};