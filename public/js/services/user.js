/*
User Service

also stores password once authenticated, getter: .getPassword()

listens
user:registered
user:update
user:login

sends
user:login
user:register
user:forgot-password
user:logout
user:update

*/
Services.factory('user', function($http, $rootScope, socket) {
	var userTemplate = {
		error: false,
		authed: false
	};

	var userPassword = '';

	var user = angular.copy(userTemplate);

	socket.on('user:error', function(data){
		user.error = data.error;
	});

	socket.on('user:registered', updateUser);
	socket.on('user:updated', updateUser);
	socket.on('user:login', updateUser);

	function updateUser(data){
		console.log(data);
		for (var property in data) {
			user[property] = data[property];
		}
	}

	return {
		get: function() {
			return user;
		},
		login: function(data) {
			user.error = false;
			socket.emit('user:login', data);
			userPassword = data.password; //store the password for actions
			return user;
		},
		register: function(data) {
			user.error = false;
			socket.emit('user:register', data);
			userPassword = data.password; //store the password for actions
			return user;
		},
		forgotPassword: function(email) {
			socket.emit('user:forgot-password', {
				email: email
			});
			return user;
		},
		logout: function() {
			socket.emit('user:logout', {
				username: user.username,
				password: userPassword
			});
			user.username = '';
			user.authed = false;
			userPassword = '';
			return user;
		},
		update: function() {
			socket.emit('user:update', {
				inGameName: user.inGameName,
				email: user.email,
				username: user.username,
				password: userPassword,
				newPassword: user.password
			});
			if (user.password) {
				userPassword = user.password;
			}
		},
		getPassword: function() {
			return userPassword;
		}
	};
});