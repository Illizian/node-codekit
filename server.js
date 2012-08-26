console.log('NodeJS CodeKit / Web Dev Toolkit');
console.log('Watching: ' + process.cwd());

// Require
var watchr = require('watchr')

// Watch a directory or file
watchr.watch({
    path: process.cwd(),
    listener: function(eventName,filePath,fileCurrentStat,filePreviousStat) {
        console.log('a watch event occured:',arguments);
    },
    next: function(err,watcher) {
        if (err)  throw err;
        console.log('watching setup successfully');
    }
});