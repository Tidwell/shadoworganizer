/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var api = require('./routes/api');
var cons = require('consolidate');
var app = module.exports = express();
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
app.get('/REST/tournaments', api.tournaments);
app.get('/REST/tournament', api.tournament);
app.get('/REST/match', api.match);
app.get('/REST/game', api.game);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Start server
app.listen(8081, function() {
	console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});