NodeJS CodeKit
==============
1. **Intro**
2. **Features**
3. **How to Use**
4. **Credits**

## CodeKit Alternative built Node.JS

An attempt at replicating some of the awesome power in [CodeKit](http://incident57.com/codekit/).

Thank you, incident57 for providing the inspiration!

>PLEASE NOTE: This has not been thoroughly tested! This is a prototype!
>
> I do not take responsibility for ruining your working directory, use with caution...
>
> Make sure to backup any directory before starting the Node Server!

Features
--------

1. **Live Browser Reloads**
	
	Place a small snippet of code into your "views":

		<script src="./jquery.js"></script>
		<script src="./node-codekit-display.js"></script>

    ... and everytime you create or change a file in your project directory, NodeJS CodeKit 
    will instruct every instance of your page to refresh, ensuring every device is
    in sync. (it's compatible with:- Chrome, Safari, Firefox on Mac, Windows or Unix and
    Android and iOS devices)

2. **CSS Wizardry**

    We've all been there, you just can't get the site to look quite right, you're
    playing with rules, and sometimes it's not convenient to do it in Debugging
    Tools, or maybe you're designing for a tablet or mobile device and don't have such luxuries.

    Well with NodeJS CodeKit, everytime a Stylesheet changes, it instructs all your
    browsers/displays (inc. Mobiles/Tablets) to reload the stylesheets, no refresh of the page needed!

3.  **LESS Compiler**
	
	Working with LESS? These will be compiled automatically for you!

		example: style.less => style.less.css

4.	**CSS & JS Minifier/Compressor**
	
	Using a YUI library, it compresses all of your CSS and Javascript files, to ensure
	peak performance on your webpage.

		example: style.less.css => style.less-min-yui.css
		example: jquery.js => jquery-min-yui.js

5.	**Cross-Platform**
	
	Using only NodeJS and Node libraries (npm modules); it is truely cross platform; 
	all you need is NodeJS and you're ready to go!

	(coming soon as a NPM Module, you can install globally)

How to Use
--------

> (for testing purposes - this is not ready for a development environment - once in beta you will use as a global npm module)

1. **Clone the Repo**
2. **Install dependancies**
 	
	NodeJS Codekit requires a few modules available via NPM:
	- [watchr](https://github.com/mynyml/watchr)
 	- [socket.io](https://github.com/LearnBoost/socket.io)
  	- [less](http://lesscss.org/#-server-side-usage)
 	- [node-minify](https://github.com/srod/node-minify)

 	Run the following command in the directory you cloned the repo to:
 	 	
 	 	npm install watchr socket.io less node-minify

2. **START THE SERVER**

 	Run the following command in the directory you cloned the repo to:
 		
 		node server.js

3. **LAUNCH EXAMPLE PAGE**

 	Open up client/example.html on your browser

 	Make some changes to the file

--------
| email: [alex@alexscotton.com](mailto:alex@alexscotton.com) | www: [www.alexscotton.com](www.alexscotton.com) |