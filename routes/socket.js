/*
 * Serve content over a socket
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/shadoworganizer');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var loggedInUsers = [];

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

var User = mongoose.model('User', UserModel);

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
};