/*
 * Serve content over a socket
 */
var tournamentPlayers = 8;

var loggedInUsers = [];
var currentTournaments = [];

//require models
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/shadoworganizer');

var User = require('../models/user').UserModel;
var Tournament = require('../models/tournament').Tournament;

function loadFromDB(cb) {
	Tournament.find({active: true}, function(err,tournaments){
		if (tournaments.length) {
			currentTournaments = tournaments;
		}
		checkCreate();
	});
}

//check if we need to create a tournament (none currently running)
function checkCreate(io) {
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
		minPlayers: 8,
		users: []
	});

	t.save(function(err,tournament){
		currentTournaments.push(tournament);
		if (io) { io.sockets.emit('tournaments:update', { tournaments: currentTournaments }); }
	});
}

loadFromDB();


//maybe this should just listen for events and route to the api with a .jsonp mock?
module.exports = function(socket, io) {
	socket.on('user:register', register);
	socket.on('user:login', login);
	socket.on('user:logout', logout);
	socket.on('disconnect', logout);
	socket.on('user:update', updateUser);
	socket.on('user:forgot-password', forgotPassword);
	socket.on('users:count',sendCountUser);

	socket.on('tournaments:list', listTournaments);
	socket.on('tournament:join', joinTournament);
	socket.on('tournament:drop', dropTournament);

	socket.on('tournament:ready', readyTournament);
	socket.on('tournament:result', resultTournament);


	function register(userData) {
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
	}

	function updateUser(userData) {
		if (!socket.user) { authError(); return; }
		socket.user.inGameName = userData.inGameName;
		socket.user.email = userData.email;
		if (userData.newPassword) {
			socket.user.password = userData.newPassword;
		}
		socket.user.save(function(err,user){
			delete user.password;
			socket.emit('user:updated', user);
		});
	}

	function logout() {
		if (!socket.user) { authError(); return; }
		loggedInUsers.forEach(function(user,index){
			if (user.username === socket.user.username) {
				loggedInUsers.splice(index,1);
				socket.emit('user:logged-out', {});
				sendCount();
			}
		});
	}

	function sendCount() {
		io.sockets.emit('users:count', {count: loggedInUsers.length});
	}
	function sendCountUser() {
		socket.emit('users:count', {count: loggedInUsers.length});
	}

	function login(data) {
		//otherwise make sure they passed params
		if (!data || typeof data.username !== 'string' || typeof data.password !== 'string' ) {
			authError();
			return;
		}
		//check the db
		User.find({ username: data.username, password: data.password }, function(err,userData){
			if (!userData.length) {
				authError();
				return;
			}
			sendLogin(userData[0]);
		});
	}

	function sendLogin(data) {
		loggedInUsers.push(data);
		socket.user = data;
		delete data.password;
		socket.emit('user:login', data);
		sendCount();
	}

	function forgotPassword(email){
		//reset password to random
		//send email with new password
	}

	function listTournaments() {
		socket.emit('tournaments:update', { tournaments: currentTournaments });
	}

	function joinTournament(data) {
		if (!socket.user) { authError(); return; }
		Tournament.find({_id: data.tournamentId}, function(err,tournaments) {
			var tournament = tournaments[0];
			var added = tournament.addUser({
				inGameName: socket.user.inGameName,
				username: socket.user.username
			});
			if (added) {
				console.log('tournament should be go', tournament);
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

					checkCreate(io);
				});
			} else {
				socket.emit('tournament:error', 'Tournament is Full.');
			}
		});
	}

	function dropTournament(data) {
		if (!socket.user) { authError(); return; }
		Tournament.find({_id: data.id}, function(err,tournaments){
			if (!tournaments.length || err) {
				socket.emit('tournament:error', {error: 'Faild to find tournament.'});
				return;
			}
			var tournamentObj = tournaments[0];
			var removed = tournamentObj.removeUser(socket.user);
			if (!removed) { return; }

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
		});
	}

	function readyTournament(data) {
		if (!socket.user) { authError(); return; }
		Tournament.findOne({_id: data.id}, function(err,tournament){
			if (err) {
				socket.emit('tournament:error', {error: 'Faild to find tournament.'});
				return;
			}
			tournament.ready({match: getMatch(tournament)});

			tournament.save(function(err,newTournamentObj) {
				if (err) { console.log(err); }
				//check and see if it is stored in cache and update it if it is
				currentTournaments.forEach(function(t,i){
					if (t.id === newTournamentObj.id) {
						currentTournaments[i] = newTournamentObj;
					}
				});
				//notify everyone
				io.sockets.emit('tournament:update', {tournament: newTournamentObj});
			});
		});
	}

	function resultTournament(data) {
		if (!socket.user) { authError(); return; }
		Tournament.findOne({_id: data.id}, function(err,tournament){
			if (err) {
				socket.emit('tournament:error', {error: 'Faild to find tournament.'});
				return;
			}
			var match = getMatch(tournament);
			var rnd = 'round'+match.roundIndex;
			var gm = 'game'+match.matchIndex;

			//normalize the players result from their perspective into just the username of the winner
			data.result = data.result === 'win' ? socket.user.username : tournament.bracket[rnd][gm].players[Number(!match.userIndex)].username;

			tournament.result({match: match, result: data.result});

			tournament.save(function(err,newTournamentObj) {
				if (err) { console.log(err); }
				//check and see if it is stored in cache and update it if it is
				currentTournaments.forEach(function(t,i){
					if (t.id === newTournamentObj.id) {
						currentTournaments[i] = newTournamentObj;
					}
				});
				//notify everyone
				io.sockets.emit('tournament:update', {tournament: newTournamentObj});
			});
		});
	}

	/*
		Return {
			userIndex: userIndex,
			roundIndex: returnRoundIndex,
			matchIndex: returnMatchIndex
		}

		For the current tournament/round/match for the current user

		TODO update to make sure round is active
	*/
	function getMatch(tournamentObj) {
		var returnMatchIndex;
		var userIndex;

		var round = 'round'+tournamentObj.round;
		var matchesInRound = tournamentObj.round === 1 ? 4 : tournamentObj.round === 2 ? 2 : 1;

		for (var i = 1; i <= matchesInRound; i++) {
			var rndMatch = tournamentObj.bracket[round]['game'+i];
			if (rndMatch.players[0].username === socket.user.username) {
				userIndex = 0;
				returnMatchIndex = i;
			} else if (rndMatch.players[1].username === socket.user.username) {
				userIndex = 1;
				returnMatchIndex = i;
			}
		}
		return {
			userIndex: userIndex,
			roundIndex: tournamentObj.round,
			matchIndex: returnMatchIndex
		}
	}


	function authError() {
			socket.emit('user:error', {
			error: 'Error authenticating, please login again.'
		});
	}

	//+ Jonas Raoni Soares Silva
	//@ http://jsfromhell.com/array/shuffle [v1.0]
	function shuffle(o) { //v1.0
		for (var j, x, i = o.length; i; j = parseInt(Math.random() * i,10), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	}
};