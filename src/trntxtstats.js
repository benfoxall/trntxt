module.exports = function(Hit, callback) {
	if (!Hit) return {};
	// var output = {};
	var queries = [
		// allHits(Hit),
		// iosHits(Hit)
		hitsToday(Hit),
		hitsYesterday(Hit)
	];
	Promise.all(queries).then(function(results) {
		var output = {
			// allHits: results[0],
			// iosHits: results[1]
			hitCountToday: results[0].length,
			hitCountYesterday: results[1].length,
			hitsToday: results[0]
		}
		return callback(null, output);
	}, function(error) {
		return callback(error);
	})
}

function allHits(Hit) {
	return Hit.find().exec();
}

function iosHits(Hit) {
	return Hit.find({
		"agent.os.name": "iOS"
	}).exec();
}

function hitsToday(Hit) {
	var yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	return Hit.find({
		date: {$gt: yesterday}
	}).exec();
}

function hitsYesterday(Hit) {
	var yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	var twoDaysAgo = new Date();
	twoDaysAgo.setDate(yesterday.getDate() - 2);
	return Hit.find({
		date: {$lt: yesterday, $gt: twoDaysAgo}
	}).exec();
}
