var express = require('express');
var extend = require('extend');
var jade = require('jade');
var uaParser = require('ua-parser-js');
var mongoose = require('mongoose');
var prettify = require('json-pretty');
var util = require('util');
var config = require('./src/trntxtconfig.js');
var iconGenerator = require('./src/iconGenerator.js');
var schema = require('./src/mongoSchemas.js')(mongoose);
var nr = require('./src/nationalrail.js');
var trntxtstats = require('./src/trntxtstats.js');

var app = express();
mongoose.connect(config.dbString);
var db = mongoose.connection;
var connected = false;
var Hit = null;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
	Hit = mongoose.model('trntxt_hits', schema.hit);
	connected = true;
	console.log('Database models initialised');
});

var jadeOptions = {doctype:'html'};
var jadeGlobals = {pageTitle:'trntxt'};

function compile(locals) {
	var fn = jade.compileFile('resources/template.jade', jadeOptions);
	return fn(extend({}, jadeGlobals, locals));
}

function statsPage(locals) {
	var fn = jade.compileFile('resources/stats.jade', jadeOptions);
	return fn(extend({}, jadeGlobals, locals));
}

function getStationsFromRequest(request) {
	var output = {};
	var errors = [];
	output.didYouMean = {
		from: [],
		to: []
	};
	if (request.params.from !== undefined) {
		var results = nr.findStation(request.params.from);
		if (results.length > 0) {
			output.fromStation = results[0];
			output.didYouMean.from = results.slice(1).filter(function(otherMatch) {
				return results[0].biggestChunk === otherMatch.biggestChunk;
			});
		} else {
			errors.push(request.params.from);
		}
	}
	if (request.params.to !== undefined) {
		var results = nr.findStation(request.params.to);
		if (results.length > 0) {
			output.toStation = results[0];
			output.didYouMean.to = results.slice(1).filter(function(otherMatch) {
				return results[0].biggestChunk === otherMatch.biggestChunk;
			});
		} else {
			errors.push(request.params.to);
		}
	}
	if (errors.length === 0) return output;
	else {
		output = "Invalid station name";
		if (errors.length > 1) output += "s: ";
		else output += ": ";
		errors.forEach(function(name) {
			output += name + ", ";
		});
		output = output.replace(/, $/,"");
		throw output;
	}
}

app.get('/defaultsite', function(request, response) {
	response.sendFile('index.html', {root:'./public'});
});

app.get('/stats', function(request, response) {
	console.log('getting stats')
	if (!connected) response.send('Not connected to the database yet');
	console.log('connected')
	trntxtstats(Hit, function(err, data) {
		if (err) return response.send('Some error happened', err);
		// response.send(prettify(data));
		data.hitsTodayFormatted = prettify(data.hitsToday)
		var locals = {
			stats: data
		}
		response.send(statsPage(locals));
	})
})

// Regex matches letters (no dots), ? means 'to' is optional
app.get('/:from(\\w+)/:to(\\w+)?', function (request, response) {
	var stations = {};
	var locals = {};
	var uaString = request.headers['user-agent'];
	locals.agent = uaParser(uaString);
	locals.url = request.originalUrl;
	try {
		stations = getStationsFromRequest(request);
	} catch (e) {
		locals.errorMessage = e;
		return response.send(compile(locals));
	}
	
	locals.stationCodePath = '/' + stations.fromStation.stationCode + '/';
	if (stations.toStation) locals.stationCodePath += stations.toStation.stationCode + '/';
	locals.didYouMean = stations.didYouMean;
	
	if (connected && uaString !== 'AlwaysOn') {
		// Hit object may not have been loaded yet. Let's not make a fuss if it isn't.
		// Also Azure pings with 'AlwaysOn'. We don't need to save that.
		var hit = new Hit({
			agent: locals.agent,
			url: request.originalUrl,
			fromStation: stations.fromStation
		});
		if (stations.toStation) {
			hit.toStation = stations.toStation;
		}
		hit.save(function(err) {
			if (err) console.error("It didn't save. Meh");
			else console.log("Hit saved :)");
		});
	}
	
	nr.getDepartures(stations, function(output) {
		response.send(compile(extend({}, locals, output)));
	});
});

app.get('/details/:serviceId', function (request, response) {
	nr.getServiceDetails(request.params.serviceId, function(data) {
		console.log(data);
		response.send(data);
	});
});

app.get('/:from(\\w+)/:to(\\w+)?/:image(*.png)', function (request, response) {
	var image = iconGenerator.getIcon(request.params.from, request.params.to, request.params.image);
	response.sendFile(image, {root:'./'});
});

app.get('/favicon-16x16.png', function (request, response) {
	response.sendFile('favicon-16x16.png', {root:'./public'});
});

app.get('*/manifest.json', function (request, response) {
	var manifest = {};
	var path = request.originalUrl.split('manifest.json')[0];

	manifest.lang = 'en';
	manifest.name = 'trntxt';
	manifest.short_name = 'trntxt';
	manifest.start_url = path;
	manifest.display = 'browser';
	manifest.icons = [];
	var resolutions = ['36','48','72','96','144','192'];
	var densities = ['0.75','1.0','1.5','2.0','3.0','4.0'];
	for (var i = 0; i < 6; i++) {
		var icon = {};
		icon.src = path + 'android-chrome-' + resolutions[i] + 'x' + resolutions[i] + '.png';
		icon.sizes = resolutions[i] + 'x' + resolutions[i];
		icon.type = 'image/png';
		icon.density = densities[i];
		manifest.icons.push(icon);
	}

	response.format({
		json: function() {
			response.send(manifest);
		}
	});
});

app.get('/:image(*.png)', function (request, response) {
	var image = iconGenerator.getIcon('TRN', 'TXT', request.params.image);
	response.sendFile(image, {root:'./'});
});

app.get('*/browserconfig.xml', function (request, response) {
	var jadeOptions = {pretty: true};
	var fn = jade.compileFile('resources/browserconfig.jade', jadeOptions);
	var locals = { path: '/' };
	var urlElements = request.originalUrl.split('/');
	urlElements.forEach(function(element) {
		if (element !== 'browserconfig.xml' && element !== '') {
			var results = nr.findStation(element);
			if (results.length > 0) {
				locals.path += results[0].stationCode + '/';
			}
		}
	});
	response.format({
		'application/xml': function() {
			response.send(fn(locals));
		}
	});
});

app.use(express.static('public'));

var server = app.listen(config.port, function () {
	console.log('listening on port %s', config.port);
});
