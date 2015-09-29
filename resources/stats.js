// Get context with jQuery - using jQuery's .get() method.
var ctx = $("#myChart").get(0).getContext("2d");
// This will get the first returned node in the jQuery collection.
var data = {
	labels: ["Yesterday", "Today"],
	datasets: [
		{
			data:[stats.hitCountYesterday, stats.hitCountToday]
		}
	]
}
var myNewChart = new Chart(ctx).Bar(data);

