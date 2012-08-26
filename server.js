console.log('--------------------------------------');
console.log('   NodeJS CodeKit / Web Dev Toolkit   ');
console.log('--------------------------------------');
console.log('Watching: ' + process.cwd());

// Require the watch module
var watchr  	= require('watchr')
  , fs 			= require('fs')
  , less 		= require('less')
  , io 			= require('socket.io').listen(8080)
  , compressor  = require('node-minify');

// In-Line Config - Soon to move to external json object, or argv
var config = {
	color 	  : true,
	minify 	  : true,
	less 	  : true,
	blacklist : new Array(
		'-min-yui.css',
		'-min-yui.js'
	)
};

// Socket.IO configuration
io.set('log level', 0);

// Watch the current working directory
watchr.watch({
    path: process.cwd(),
    listener: function(eventName,filePath,fileCurrentStat,filePreviousStat) {
        // Handle watch event
        pre_process(arguments);
    },
    next: function(err,watcher) {
        if (err)  throw err;
    }
});

io.sockets.on('connection', function (socket) {
	console.log(color('[New Display [' + socket.id + '] on Socket.IO]', 'bold'));
});


/* PROCESSING FUNCTIONS */

// Check whether file matches a "filter" - if not launches event processor
function pre_process (arg) {
	var filename = arg[1].substr(arg[1].lastIndexOf('\\') + 1);
	var directory = arg[1].slice(0,arg[1].lastIndexOf('\\'));
	var ext = filename.substr(filename.lastIndexOf(".") + 1);
	var parse_bool = true;

	for (var i = config.blacklist.length - 1; i >= 0; i--) {
		if (filename.indexOf(config.blacklist[i]) != '-1') {
			parse_bool = false;
		}
		if (i === 0 && parse_bool === true) {
			event_processor(arg, filename, directory, ext)
		}
		
	};
}

// MAIN 'SORTING' PROCESS - FIRES INDEPENDANT COMPILERS / COMPRESSORS
function event_processor(arg, filename, directory, ext) {
	switch(arg[0]) {
		case "new":
			//New File
			console.log(color('--------------------------------------', 'bold'))
			console.log(color('A file has been created:', 'green'));
			console.log(color('  DIRECTORY  : ', 'cyan') + directory);
			console.log(color('  FILE       : ', 'cyan') + filename);
			console.log(color('  EXTENSION  : ', 'cyan') + ext);
			console.log(color('  SIZE(bytes): ', 'cyan') + arg[2].size);
			switch(ext) {
				default:
					console.log(color('  * REFRESHING ALL PAGES *', 'bold'));
					io.sockets.emit('update', { type: 'refresh' });
				break;
				case 'css':
					if(!config.minify) {
						console.log(color('  * RELOADING CSS ENTRIES *', 'bold'));
						io.sockets.emit('update', { type: 'css' });
					} else {
						console.log(color('  * COMPRESSING CSS (with YUI) *', 'bold'));
						compress_css(directory, filename)
					}
				break;
				case 'less':
					if(!config.less) {
						console.log(color('  * RELOADING CSS ENTRIES *', 'bold'));
						io.sockets.emit('update', { type: 'css' });
					} else {
						console.log(color('  * COMPILING LESS *', 'bold'));
						compile_less(directory, filename, arg[1]);
					}
				break;
				case 'js':
				if(!config.minify) {
					console.log(color('  * REFRESHING ALL PAGES *', 'bold'));
					io.sockets.emit('update', { type: 'refresh' });
				} else {
					console.log(color('  * COMPRESSING JAVASCRIPT (with YUI) *', 'bold'));
					compress_js(directory, filename)
				}
			}
		break;
		case "unlink":
			//delete File
			console.log(color('--------------------------------------', 'bold'))
			console.log(color('A file has been deleted:', 'red'));
			console.log(color('  DIRECTORY  : ', 'cyan') + directory);
			console.log(color('  FILE       : ', 'cyan') + filename);
			console.log(color('  EXTENSION  : ', 'cyan') + ext);
			console.log(color('  * REFRESHING ALL PAGES *', 'bold'));
			io.sockets.emit('update', { type: 'refresh' });
		break;
		case "change":
			//change File
			console.log(color('--------------------------------------', 'bold'))
			console.log(color('A file has been changed:' , 'yellow'));
			console.log(color('  DIRECTORY  : ', 'cyan') + directory);
			console.log(color('  FILE       : ', 'cyan') + filename);
			console.log(color('  EXTENSION  : ', 'cyan') + ext);
			console.log(color('  SIZE(bytes): ', 'cyan') + arg[3].size);
			switch(ext) {
				default:
					console.log(color('  * REFRESHING ALL PAGES *', 'bold'));
					io.sockets.emit('update', { type: 'refresh' });
				break;
				case 'css':
					if(!config.minify) {
						console.log(color('  * RELOADING CSS ENTRIES *', 'bold'));
						io.sockets.emit('update', { type: 'css' });
					} else {
						console.log(color('  * COMPRESSING CSS (with YUI) *', 'bold'));
						compress_css(directory, filename)
					}
				break;
				case 'less':
					if(!config.less) {
						console.log(color('  * RELOADING CSS ENTRIES *', 'bold'));
						io.sockets.emit('update', { type: 'css' });
					} else {
						console.log(color('  * COMPILING LESS *', 'bold'));
						compile_less(directory, filename, arg[1]);
					}
				break;
				case 'js':
				if(!config.minify) {
					console.log(color('  * REFRESHING ALL PAGES *', 'bold'));
					io.sockets.emit('update', { type: 'refresh' });
				} else {
					console.log(color('  * COMPRESSING JAVASCRIPT (with YUI) *', 'bold'));
					compress_js(directory, filename)
				}
			}
	}
}

/* COMPILERS / COMPRESSORS */
// LESS COMPILER
function compile_less(directory, filename, longdir) {
	fs.readFile(longdir, 'ascii', function read(err, data) {
		if (err) {
			throw err;
		} else {

		}
		var parser = new(less.Parser)({
			paths: [directory],
			filename: filename
		});
		parser.parse(data, function (err, tree) {
			if (err) { return console.log(err) };
			// Write to file of same name with css extension.
			fs.writeFile(longdir + '.css', tree.toCSS({compress:false}), function (err) {
				if (err) throw err;
				console.log(color('  * COMPILED CSS WRITTEN TO: ' + filename + '.css *', 'bold'));
				console.log(color('  * RELOADING CSS ENTRIES *', 'bold'));
				io.sockets.emit('update', { type: 'css' });
			});
		});
	});
}

// YUI Compressor for CSS
function compress_css(directory, filename) {
	var file_in = directory + '\\' + filename;
	var file_out = directory + '\\' + file_in.slice(file_in.lastIndexOf('\\') + 1, file_in.lastIndexOf('.css')) + '-min-yui.css';
	new compressor.minify({
		type: 'yui-css',
		fileIn: file_in,
		fileOut: file_out,
		callback: function(err){
		    if(err) { 
		    	console.log('CSS Compile Error: ' + err); 
		    } else {
		    	console.log(color('  * CSS COMPILE SUCESSFULL *', 'bold'))
		    	console.log(color('  * RELOADING CSS ENTRIES *', 'bold'));
		    	io.sockets.emit('update', { type: 'css' });
		    }
		}
	});
}

// YUI Compressor for JS
function compress_js(directory, filename) {
	var file_in = directory + '\\' + filename;
	var file_out = directory + '\\' + file_in.slice(file_in.lastIndexOf('\\') + 1, file_in.lastIndexOf('.js')) + '-min-yui.js';
	new compressor.minify({
		type: 'yui-js',
		fileIn: file_in,
		fileOut: file_out,
		callback: function(err){
			if(err) { 
				console.log('JS Compile Error: ' +err); 
			} else {
				console.log(color('  * JS COMPILE SUCESSFULL *', 'bold'))
				console.log(color('  * REFRESHING ALL PAGES *', 'bold'));
				io.sockets.emit('update', { type: 'refresh' });
			}
		}
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