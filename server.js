console.log('--------------------------------');
console.log('NodeJS CodeKit / Web Dev Toolkit');
console.log('--------------------------------');
console.log('Watching: ' + process.cwd());

// Require the watch module
var watchr  = require('watchr')
  , fs 		= require('fs')
  , less 	= require('less')
  , io 		= require('socket.io').listen(8080);

// In-Line Config - Soon to move to external json object, or argv
var config = {
	color : true
};
io.set('log level', 0);


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

io.sockets.on('connection', function (socket) {
	console.log(color('[New Display [' + socket.id + '] on Socket.IO]', 'bold'));
});


/* PROCESSING FUNCTIONS */

// MAIN 'SORTING' PROCESS
function event_processor(arg) {
	/*var filename = arg[1].replace(process.cwd(), "");
	var directory = arg[1].replace(filename, "");*/

	var filename = arg[1].substr(arg[1].lastIndexOf('\\') + 1);
	var directory = arg[1].slice(0,arg[1].lastIndexOf('\\'));
	var ext = filename.substr(filename.lastIndexOf(".") + 1);

	switch(arg[0]) {
		case "new":
			//New File
			console.log(color('  A file has been created:', 'green'));
			console.log(color('    DIRECTORY  : ', 'cyan') + directory);
			console.log(color('    FILE       : ', 'cyan') + filename);
			console.log(color('    EXTENSION  : ', 'cyan') + ext);
			console.log(color('    SIZE(bytes): ', 'cyan') + arg[2].size);
			io.sockets.emit('update', { type: 'refresh' });
		break;
		case "unlink":
			//delete File
			console.log(color('  A file has been deleted:', 'red'));
			console.log(color('    DIRECTORY  : ', 'cyan') + directory);
			console.log(color('    FILE       : ', 'cyan') + filename);
			console.log(color('    EXTENSION  : ', 'cyan') + ext);
			io.sockets.emit('update', { type: 'refresh' });
		break;
		case "change":
			//change File
			console.log(color('  A file has been changed:' , 'magenta'));
			console.log(color('    DIRECTORY  : ', 'cyan') + directory);
			console.log(color('    FILE       : ', 'cyan') + filename);
			console.log(color('    EXTENSION  : ', 'cyan') + ext);
			console.log(color('    SIZE(bytes): ', 'cyan') + arg[3].size);
			switch(ext) {
				default:
					io.sockets.emit('update', { type: 'refresh' });	
				break;
				case 'css':
					io.sockets.emit('update', { type: 'css' });
				break;
				case 'less':
					fs.readFile(arg[1], 'ascii', function read(err, data) {
						if (err) {
							throw err;
						}
						compile_less(directory, filename, data);
					});
			}
	}
}

// LESS COMPILER
function compile_less(directory, filename, file) {
	console.log('dir:' + directory);
	console.log('filename:' + filename);
	console.log('extracted less:' + file);

	/*less.render(file, function (e, css) {
		console.log(css);
	});*/
	var parser = new(less.Parser)({
		paths: [directory],
		filename: filename
	});
	parser.parse(file, function (err, tree) {
		if (err) { return console.log(err) }
		console.log('[OUTPUT CSS]');
		console.log(tree.toCSS({compress:false})); // CSS output
	});
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