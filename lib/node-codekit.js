// REQUIRED MODULES
var watchr  	= require('watchr') 		// Required for watching the working directory
  , fs 			= require('fs')				// Required for read & writing to files
  , less 		= require('less')			// Used for compiling LESS files
  , compressor  = require('node-minify')	// Library for using YUI Compressors
  , ascii 		= require('./ascii-color')	// Color CLI text
  , pkg			= require('../package.json')// Read's the packages JSON to detect version etc
  , g15composer	= require('g15composer')	// Notifier service for the Logitech G15 Keyboard
  , growl		= require('growl')			// Notifier service for the Desktop notification service
  , prompt		= require('prompt')			// Library for producing CLI Prompts (Configuring directory)
  , commander 	= require('commander')		// Used for parsing ARG Variables (--help, -i, -n etc)
  , config
  , io;

// Commander arg variables and help text
commander
  .version('v'+pkg.version)
  .option('-i, --init', 'Configure settings for current working directory')
  .option('-n, --notifier [type]', 'Use a notification service [growl]')
  .option('-p, --pipe [path]', 'Specify the output pipe for g15composer [/dev/g15fifo]')
  .parse(process.argv);

// Check environment and configure
function init() {
	if(commander.init) {
		// User has called with the -i or --init flag
		config();
	} else {
		if(commander.notifier === 'g15composer') {
			// User has specified the g15composer notifier service
			// Check if user has specified a g15composer pipe
			if(commander.pipe) {
				// Init g15composer library with pipe
				g15composer = g15composer.init(commander.pipe, 'notifications');
				readConfig();
			} else {
				// User has not specified a pipe! Exit!
				console.log(ascii.color('Error: ', 'red')+'Launched with -n g15composer but no pipe specified!\n       please specify a pipe with -p');
				// process.exit(1);
			}
		} else {
			readConfig();
		}
	}
	function readConfig() {
		// Read the configuration file in the local directory
		fs.readFile('node-codekit-config.json', encoding="ascii", function (err, data) {
			if (err) {
				console.log('\n  Error: No config file found');
				console.log('\n  please run node-codekit --init');
				notify('Error: No config file found', 'please run node-codekit --init')
			} else {
				config = JSON.parse(data);
				watchInit();
			}
		});
	}
}

// Configures the working directory
function config() {
	// Questions object
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
	// Specify a custom prompt
	prompt.message = "Configure: ".bold

	// Ask user questions
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
		}
	});
	function writeConfig() {
		fs.writeFile('node-codekit-config.json', JSON.stringify(config), function (err) {
			if (err) {
				console.log(ascii.color('Error writing node-codekit-config.json - is the current directory writeable?', 'red'))
				console.log(err)
			} else {
				watchInit();
			};
		});
	}
}

// Main App Init Function
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
	notify('NodeKit', 'Watching: ' + process.cwd());
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
	// Listen on socket channel
	io = require('socket.io').listen(8080)
	
	// Socket.IO configuration
	io.set('log level', 0);

	// Attach Socket.IO Events
	io.sockets.on('connection', function (socket) {
		console.log(ascii.color('[New Display [' + socket.id + '] on Socket.IO]', 'bold'));
		notify('New display on socket', socket.id);
	});
}

/*
 * PROCESSING FUNCTIONS
 */

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
					notify('Refreshing Displays!', filename+' has changed, refreshing connected displays')
					io.sockets.emit('update', { type: 'refresh' });
				break;
				case 'css':
					if(!config.minify) {
						console.log(ascii.color('  * RELOADING CSS ENTRIES *', 'bold'));
						notify('Refreshing Displays!', filename+' has changed, refreshing connected displays')
						if(!config.cssreload) {io.sockets.emit('update', { type: 'refresh' }) } else { io.sockets.emit('update', { type: 'css' }); }
					} else {
						compress_css(directory, filename)
					}
				break;
				case 'less':
					if(config.less) {
						compile_less(directory, filename, arg[1]);
					}
				break;
				case 'js':
					if(!config.minify) {
						console.log(ascii.color('  * REFRESHING ALL PAGES *', 'bold'));
						notify('Refreshing Displays!', filename+' has changed, refreshing connected displays')
						io.sockets.emit('update', { type: 'refresh' });
					} else {
						compress_js(directory, filename)
					}
				break;
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
					notify('Refreshing Displays!', filename+' has changed, refreshing connected displays')
					io.sockets.emit('update', { type: 'refresh' });
				break;
				case 'css':
					if(!config.minify) {
						console.log(ascii.color('  * RELOADING CSS ENTRIES *', 'bold'));
						notify('Refreshing Displays!', filename+' has changed, refreshing connected displays')
						if(!config.cssreload) {io.sockets.emit('update', { type: 'refresh' }) } else { io.sockets.emit('update', { type: 'css' }); }
					} else {
						compress_css(directory, filename)
					}
				break;
				case 'less':
					if(config.less) {
						compile_less(directory, filename, arg[1]);
					}
				break;
				case 'js':
					if(!config.minify) {
						console.log(ascii.color('  * REFRESHING ALL PAGES *', 'bold'));
						notify('Refreshing Displays!', filename+' has changed, refreshing connected displays')
						io.sockets.emit('update', { type: 'refresh' });
					} else {
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
					console.log(ascii.color('Error compiling less!', 'red'))
					console.log('Filename: '+err.filename)
					console.log('Line: '+err.line)
					console.log('Message: '+err.message)
					notify("Error compiling "+err.filename, err.message+" on line "+err.line);
				} else {
					// Write to file of same name with css extension.
					fs.writeFile(longdir + '.css', tree.toCSS({compress:false}), function (err) {
						if (err) throw err;
						console.log(ascii.color('  * COMPILED CSS WRITTEN TO: ' + filename + '.css *', 'bold'));
						console.log(ascii.color('  * RELOADING CSS ENTRIES *', 'bold'));
						notify('LESS Compile Suceeded', directory+config.os_dir_oblique+filename)
						if(!config.cssreload) {io.sockets.emit('update', { type: 'refresh' }) } else { io.sockets.emit('update', { type: 'css' }); }
					});
				}
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
				notify('Successfuly minified CSS', filename+' > '+file_out)
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
				notify('Successfuly minifed JS', filename+' > '+file_out)
				io.sockets.emit('update', { type: 'refresh' });
			}
		}
	});
}

function notify(title, message) {
	if(commander.notifier) {
		switch(commander.notifier) {
			case 'growl':
				growl(message, {title: title});
			break;
			case 'g15composer':
				g15composer.push(title, message);
			break;
		}
	}
}
init();