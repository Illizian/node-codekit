// REQUIRED MODULES
var watchr  	= require('watchr')
  , fs 			= require('fs')
  , less 		= require('less')
  , compressor  = require('node-minify')
  , ascii 		= require('./ascii-color')
  , pkg			= require('../package.json')
  , prompt		= require('prompt')
  , commander 	= require('commander')

commander
  .version('v'+pkg.version)
  .option('-i, --init', 'Configure settings for current working directory')
  .parse(process.argv);

var config, io;

function init() {
	if(commander.init) {
		config();
	} else {
		fs.readFile('node-codekit-config.json', encoding="ascii", function (err, data) {
			if (err) {
				console.log('\n  Error: No config file found');
				console.log('\n  please run node-codekit --init');
			} else {
				config = JSON.parse(data);
				watchInit();
			}
		});
	}
}

function config() {
	var configQuestions = {
		properties: {
			color: {
				description: 'Use colors in CLI Output?',
				pattern: /y|n/,
				message: 'Answer y or n',
				required: true,
				default: 'y',  
			},
			less: {
				description: 'Compile LESS?',
				pattern: /y|n/,
				message: 'Answer y or n',
				required: true,
				default: 'y',  
			},
			minify: {
				description: 'Minify CSS & JS output?',
				pattern: /y|n/,
				message: 'Answer y or n',
				required: true,
				default: 'n',  
			},
			cssreload: {
				description: 'Livereload: Reload CSS without refresh?',
				pattern: /y|n/,
				message: 'Answer y or n',
				required: true,
				default: 'n',  
			},
		}
	};
	prompt.message = "Configure: ".bold
	prompt.get(configQuestions, function (err, result) {
		if(err) {
			console.log('** Cancelled! **')
		} else {
			config = {
				color 	  : false,
				minify 	  : false,
				cssreload : false,
				less 	  : false,
				blacklist : new Array(),
				os_dir_oblique : '/',
			};
			if(result.color === "y") config.color = true;
			if(result.minify === "y") config.minify = true;
			if(result.cssreload === "y") config.cssreload = true;
			if(result.less === "y") config.less = true;
			writeConfig();
			watchInit();
		}
	});
	function writeConfig() {
		fs.writeFile('node-codekit-config.json', JSON.stringify(config), function (err) {
			if (err) {
				console.log(ascii.color('Error writing node-codekit-config.json - is the current directory writeable?', 'red'))
				console.log(err)
			};
		});
	}
}

function watchInit() {
	console.log(ascii.color('\n    )     )  (               )  (            ', 'yellow'));
	console.log(ascii.color(' ( /(  ( /(  )\\ )         ( /(  )\\ )  *   )  ', 'red'));
	console.log(ascii.color(' )\\()) )\\())(()/(   (     )\\())(()/(` )  /(  ', 'red'));
	console.log(ascii.color('((_)\\ ((_)\\  /(_))  )\\  |((_)\\  /(_))( )(_)) ', 'red'));
	console.log(ascii.color(' _((_)  ((_)(_))_  ((_) |_ ((_)(_)) (_(_())  ', 'blue'));
	console.log(ascii.color('| \\| | / _ \\ |   \\ | __|| |/ / |_ _||_   _|  ', 'cyan'));
	console.log(ascii.color('| .` || (_) || |) || _|   \' <   | |   | |    ', 'cyan'));
	console.log(ascii.color('|_|\\_| \\___/ |___/ |___| _|\\_\\ |___|  |_|    ', 'cyan'));
	console.log(ascii.color('\n A Web Developer\'s Best Friend! \n', 'bold'))
	
	console.log('Watching: ' + process.cwd());
	// Watch the current working directory
	watchr.watch({
	    path: process.cwd(),
	    listener: function(eventName,filePath,fileCurrentStat,filePreviousStat) {
	        // Handle watch event
	        pre_process([eventName,filePath,fileCurrentStat,filePreviousStat]);
	    },
	    next: function(err,watcher) {
	        if (err)  throw err;
	    }
	});
	
	io = require('socket.io').listen(8080)
	
	// Socket.IO configuration
	io.set('log level', 0);

	io.sockets.on('connection', function (socket) {
		console.log(ascii.color('[New Display [' + socket.id + '] on Socket.IO]', 'bold'));
	});
}

/* PROCESSING FUNCTIONS */

// Check whether file matches a "filter" - if not launches event processor
function pre_process (arg) {
	var filename = arg[1].substr(arg[1].lastIndexOf(config.os_dir_oblique) + 1);
	var directory = arg[1].slice(0,arg[1].lastIndexOf(config.os_dir_oblique));
	var ext = filename.substr(filename.lastIndexOf(".") + 1);

	if(config.blacklist.indexOf(ext) 		=== -1 && 
	   config.blacklist.indexOf(filename) 	=== -1 &&
	   filename.indexOf('-min-yui')			=== -1 )
	{
		event_processor(arg, filename, directory, ext)
	}
}


// MAIN 'SORTING' PROCESS - FIRES INDEPENDANT COMPILERS / COMPRESSORS
function event_processor(arg, filename, directory, ext) {
	switch(arg[0]) {
		case "create":
			//New File
			console.log(ascii.color('--------------------------------------', 'bold'))
			console.log(ascii.color('A file has been created:', 'green'));
			console.log(ascii.color('  DIRECTORY  : ', 'cyan') + directory);
			console.log(ascii.color('  FILE       : ', 'cyan') + filename);
			console.log(ascii.color('  EXTENSION  : ', 'cyan') + ext);
			console.log(ascii.color('  SIZE(bytes): ', 'cyan') + arg[2].size);
			switch(ext) {
				default:
					console.log(ascii.color('  * REFRESHING ALL PAGES *', 'bold'));
					io.sockets.emit('update', { type: 'refresh' });
				break;
				case 'css':
					if(!config.minify) {
						console.log(ascii.color('  * RELOADING CSS ENTRIES *', 'bold'));
						if(!config.cssreload) {io.sockets.emit('update', { type: 'refresh' }) } else { io.sockets.emit('update', { type: 'css' }); }
					} else {
						console.log(ascii.color('  * COMPRESSING CSS (with YUI) *', 'bold'));
						compress_css(directory, filename)
					}
				break;
				case 'less':
					if(config.less) {
						console.log(ascii.color('  * COMPILING LESS *', 'bold'));
						compile_less(directory, filename, arg[1]);
					}
				break;
				case 'js':
				if(!config.minify) {
					console.log(ascii.color('  * REFRESHING ALL PAGES *', 'bold'));
					io.sockets.emit('update', { type: 'refresh' });
				} else {
					console.log(ascii.color('  * COMPRESSING JAVASCRIPT (with YUI) *', 'bold'));
					compress_js(directory, filename)
				}
			}
		break;
		case "unlink":
			//delete File
			console.log(ascii.color('--------------------------------------', 'bold'))
			console.log(ascii.color('A file has been deleted:', 'red'));
			console.log(ascii.color('  DIRECTORY  : ', 'cyan') + directory);
			console.log(ascii.color('  FILE       : ', 'cyan') + filename);
			console.log(ascii.color('  EXTENSION  : ', 'cyan') + ext);
			console.log(ascii.color('  * REFRESHING ALL PAGES *', 'bold'));
			io.sockets.emit('update', { type: 'refresh' });
		break;
		case "update":
			//change File
			console.log(ascii.color('--------------------------------------', 'bold'))
			console.log(ascii.color('A file has been changed:' , 'yellow'));
			console.log(ascii.color('  DIRECTORY  : ', 'cyan') + directory);
			console.log(ascii.color('  FILE       : ', 'cyan') + filename);
			console.log(ascii.color('  EXTENSION  : ', 'cyan') + ext);
			console.log(ascii.color('  SIZE(bytes): ', 'cyan') + arg[3].size);
			switch(ext) {
				default:
					console.log(ascii.color('  * REFRESHING ALL PAGES *', 'bold'));
					io.sockets.emit('update', { type: 'refresh' });
				break;
				case 'css':
					if(!config.minify) {
						console.log(ascii.color('  * RELOADING CSS ENTRIES *', 'bold'));
						if(!config.cssreload) {io.sockets.emit('update', { type: 'refresh' }) } else { io.sockets.emit('update', { type: 'css' }); }
					} else {
						console.log(ascii.color('  * COMPRESSING CSS (with YUI) *', 'bold'));
						compress_css(directory, filename)
					}
				break;
				case 'less':
					if(config.less) {
						console.log(ascii.color('  * COMPILING LESS *', 'bold'));
						compile_less(directory, filename, arg[1]);
					}
				break;
				case 'js':
				if(!config.minify) {
					console.log(ascii.color('  * REFRESHING ALL PAGES *', 'bold'));
					io.sockets.emit('update', { type: 'refresh' });
				} else {
					console.log(ascii.color('  * COMPRESSING JAVASCRIPT (with YUI) *', 'bold'));
					compress_js(directory, filename)
				}
			}
		break;
	}
}

/* COMPILERS / COMPRESSORS */
// LESS COMPILER
function compile_less(directory, filename, longdir) {
	fs.readFile(longdir, 'ascii', function read(err, data) {
		if (err) {
			throw err;
		} else {
			var parser = new(less.Parser)({
				paths: [directory],
				filename: filename
			});
			parser.parse(data, function (err, tree) {
				if (err) {
					return console.log(err) 
				};
				// Write to file of same name with css extension.
				fs.writeFile(longdir + '.css', tree.toCSS({compress:false}), function (err) {
					if (err) throw err;
					console.log(ascii.color('  * COMPILED CSS WRITTEN TO: ' + filename + '.css *', 'bold'));
					console.log(ascii.color('  * RELOADING CSS ENTRIES *', 'bold'));
					if(!config.cssreload) {io.sockets.emit('update', { type: 'refresh' }) } else { io.sockets.emit('update', { type: 'css' }); }
				});
			});
		}
	});
}

// YUI Compressor for CSS
function compress_css(directory, filename) {
	var file_in = directory + config.os_dir_oblique + filename;
	var file_out = directory + config.os_dir_oblique + file_in.slice(file_in.lastIndexOf(config.os_dir_oblique) + 1, file_in.lastIndexOf('.css')) + '-min-yui.css';
	new compressor.minify({
		type: 'yui-css',
		fileIn: file_in,
		fileOut: file_out,
		callback: function(err){
		    if(err) { 
		    	console.log('CSS Compile Error: ' + err); 
		    } else {
		    	console.log(ascii.color('  * CSS COMPILE SUCESSFULL *', 'bold'))
		    	console.log(ascii.color('  * RELOADING CSS ENTRIES *', 'bold'));
		    	if(!config.cssreload) {io.sockets.emit('update', { type: 'refresh' }) } else { io.sockets.emit('update', { type: 'css' }); }
		    }
		}
	});
}

// YUI Compressor for JS
function compress_js(directory, filename) {
	var file_in = directory + config.os_dir_oblique + filename;
	var file_out = directory + config.os_dir_oblique + file_in.slice(file_in.lastIndexOf(config.os_dir_oblique) + 1, file_in.lastIndexOf('.js')) + '-min-yui.js';
	new compressor.minify({
		type: 'yui-js',
		fileIn: file_in,
		fileOut: file_out,
		callback: function(err){
			if(err) { 
				console.log('JS Compile Error: ' +err); 
			} else {
				console.log(ascii.color('  * JS COMPILE SUCESSFULL *', 'bold'))
				console.log(ascii.color('  * REFRESHING ALL PAGES *', 'bold'));
				io.sockets.emit('update', { type: 'refresh' });
			}
		}
	});
}

init();	