/**
 * Module dependencies.
 */

var express = require('express');
var cons = require('consolidate');

var routes = require('./routes');
var api = require('./routes/api');
var socket = require('./routes/socket');

var app = module.exports = express();
var server = require('http').createServer(app);

// Hook Socket.io into Express
var io = require('socket.io').listen(server);

// Configuration
app.configure(function() {
	// assign the swig engine to .html files
	app.engine('html', cons.underscore);
	app.set('view engine', 'html');
	app.set('views', __dirname + '/views');

	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.static(__dirname + '/public'));
	app.use(app.router);
});

app.configure('production', function() {
	app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API
app.get('/REST/match', api.match);
app.get('/REST/game', api.game);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

io.sockets.on('connection', function(s) {socket(s,io)});

// Start server
server.listen(8081, function() {
	console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});