console.log('NodeJS CodeKit / Web Dev Toolkit');
console.log('Watching: ' + process.cwd());

var watch = require('watch');

watch.createMonitor(process.cwd(), function (monitor) {
	//monitor.files[process.cwd() + '/.zshrc'] // Stat object for my zshrc.
	monitor.on("created", function (f, stat) {
		// Handle file changes
		console.log('New File Created: ' + f);
		console.log(stat);
	});
	monitor.on("changed", function (f, curr, prev) {
		// Handle new files
		console.log('File Changed: ' + f);
		console.log(curr);
		console.log(prev);
	});
	monitor.on("removed", function (f, stat) {
		// Handle removed files
		console.log('File Deleted: ' + f);
		console.log(stat);
	});
});

testing