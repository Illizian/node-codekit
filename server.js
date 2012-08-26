console.log('NodeJS CodeKit / Web Dev Toolkit');
console.log('Watching: ' + process.cwd());

// Require the watch module
var watchr = require('watchr')
var config = {
	color : true
};

// Watch the current working directory
watchr.watch({
    path: process.cwd(),
    listener: function(eventName,filePath,fileCurrentStat,filePreviousStat) {
        // Handle watch event
        console.log(color('[DIRECTORY CHANGED!]', 'bold'))
        event_processor(arguments);
    },
    next: function(err,watcher) {
        if (err)  throw err;
    }
});

function event_processor(arg) {
	switch(arg[0]) {
		case "new":
			//New File
			console.log(color('  A file has been created:', 'green'));
			console.log(color('    FILE       : ', 'cyan') + arg[1]);
			console.log(color('    SIZE(bytes): ', 'cyan') + arg[2].size);
		break;
		case "unlink":
			//delete File
			console.log(color('  A file has been deleted:', 'red'));
			console.log(color('    FILE       : ', 'cyan') + arg[1]);
		break;
		case "change":
			//change File
			console.log(color('  A file has been changed:' , 'magenta'));
			console.log(color('    FILE       : ', 'cyan') + arg[1]);
			console.log(color('    SIZE(bytes): ', 'cyan') + arg[3].size);
		break;
	}
}

/* CONSOLE LOG TERMINAL ANSI COLORS */
function color(str, color) {
  if(!color) return str;
  if(!config.color) return str; //Colors are disabled

  var color_attrs = color.split("+");
  var ansi_str = "";
  for(var i=0, attr; attr = color_attrs[i]; i++) {
    ansi_str += "\033[" + ANSI_CODES[attr] + "m";
  }
  ansi_str += str + "\033[" + ANSI_CODES["off"] + "m";
  return ansi_str;
};

var ANSI_CODES = {
  "off": 0,
  "bold": 1,
  "italic": 3,
  "underline": 4,
  "blink": 5,
  "inverse": 7,
  "hidden": 8,
  "black": 30,
  "red": 31,
  "green": 32,
  "yellow": 33,
  "blue": 34,
  "magenta": 35,
  "cyan": 36,
  "white": 37,
  "black_bg": 40,
  "red_bg": 41,
  "green_bg": 42,
  "yellow_bg": 43,
  "blue_bg": 44,
  "magenta_bg": 45,
  "cyan_bg": 46,
  "white_bg": 47
};