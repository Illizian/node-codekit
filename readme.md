NodeKit
==============
1. **Intro**
2. **Features**
3. **How to Use**
4. **Credits**

## CodeKit Alternative built on Node.JS

An attempt at replicating some of the awesome power in [CodeKit](http://incident57.com/codekit/).

Thank you, incident57 for providing the inspiration!

>PLEASE NOTE: This has not been thoroughly tested! This is a prototype!
>
> I do not take responsibility for ruining your working directory, use with caution...
>
> Make sure to backup any directory before starting the Node Server!

Features
--------

1. **Live Reload**
	
	Place a small snippet of code into your "views":

		<script src="./jquery.js"></script>
		<script src="./node-codekit-display.js"></script>

    ... and everytime you create or change a file in your project directory, NodeKit 
    will instruct every instance of your page to refresh, ensuring every device is
    in sync. (it's compatible with:- Chrome, Safari, Firefox on Mac, Windows or Unix and
    Android and iOS devices)

2. **CSS Wizardry**

    We've all been there, you just can't get the site to look quite right, you're
    playing with rules, and sometimes it's not convenient to do it in Debugging
    Tools, or maybe you're designing for a tablet or mobile device and don't have such luxuries.

    Well with NodeKit, Everytime a Stylesheet changes, it instructs all your
    browsers/displays (inc. Mobiles/Tablets) to reload the stylesheets, no refresh of the page needed!

3.  **LESS Compiler**
	
	Working with LESS? These will be compiled automatically for you!

		example: style.less => style.less.css

4.	**CSS & JS Minifier/Compressor**
	
	Using a YUI library, it compresses all of your CSS and Javascript files, to ensure
	peak performance on your webpage.

		example: style.less.css => style.less-min-yui.css
		example: jquery.js => jquery-min-yui.js

5.  **Notifications**

	Support for the desktop notifications via [Growl](https://github.com/visionmedia/node-growl)

	Please refer to their installation how to, for OS specific dependancies.

		node-codekit -n growl

5.	**Cross-Platform**
	
	Using only NodeJS and Node libraries (npm modules); it is truely cross platform; 
	all you need is NodeJS and you're ready to go!

How to Use
--------

1. **INSTALL**
	
	Install from NPM

		npm install -g node-codekit
	> [https://npmjs.org/package/node-codekit](https://npmjs.org/package/node-codekit)

2. **CONFIGURE YOUR WORKING DIRECTORY**
	
	Navigate to the directory you want to watch and start node-codekit with the -i flag to setup your directory
 		
 		cd myProject/
 		node-codekit -i

 	Follow the on-screen prompts.

3. **RUN SERVER**

		node-codekit

--------
| email: [alex@alexscotton.com](mailto:alex@alexscotton.com) | www: [www.alexscotton.com](http://www.alexscotton.com) |