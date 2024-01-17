# JS Games

This is a research project from Nathan Garrett. It provide a set of software tutorials.

## Todo for Summer 2024

> Fix quote marks for SQL
> Expand SEARCH/FIND section for text2, focusing on mid + search
> Hint engine for SQL

### Installing

Install Node.js, MySql, npm, ts-node, and nodemon globally.

Load code 
```
git clone http://github.com/profgarrett/jsgames
```

Install NPM packages
```
npm install
```

Create a secret.js file in the \build\server folder. The Bugsnag API is optional, or use DEBUG. Local bugs are pushed to a log.txt file by default.
```
export {
	ADMIN_USERNAME: '',
	USER_CREATION_SECRET: '',
	JWT_AUTH_SECRET: '',
	MYSQL_USER: '',
	MYSQL_PASSWORD: '',
	MYSQL_HOST: '',
	MYSQL_DATABASE: '',
	BUGSNAG_API: '',
	DEBUG: false,
	VERSION: 3,
	GOOGLEID: '',

	EMAIL_ADDRESS: '',
	EMAIL_PASSWORD: '',
	EMAIL_HOST: '',
	EMAIL_REPLYTO: '',
	EMAIL_PORT: 1,
	
	ADMIN_OVER_PASSWORD: '',

	DEMO_MODE: false, // demo mode blanks out usernames.

	VISLIT_MIN_TIME_PER_SLIDE: 3,
	VISLIT_TIME_PER_SLIDE: 60,
	DISTORTION_MEDIUM: 0.6, 
	DISTORTION_SMALL: 0.3,
}
```

After updating, visit this page to update SQL schema.
```
http://hosthame/api/sql
```

Tun tests. Replace x with the code used to create users on your system. Note that this requires the test tutorial file to be uploaded.
```
http://hostname/ifgame/test/?USER_CREATION_SECRET=x
```

After installing, add a section with 'anonymous' as its code. New users w/o a username will
be added to this group.


## Architecture

The react application is contained the build folder.  The backend is handled by the node application in the server/app.js file.  

I find it easiest to create an alias to the build folder and the app.js file.
```
ln -s jsgames/build/public/ public
ln -s jsgames/build/server/app.js app.js
```

If you're having trouble getting npm packages to update, npm-install-missing is very useful.

### Useful Typescript Hints


Initialize an array to be a specific type:
```
x = new Array<IfLevelSchema>()
```
Initialize an object that is access with strings.
```
interface IStringIndexJsonObject {
	[key: string]: any
}
```



### Dreamhost

Depending on the server, you may need to take further actions.  If deploying to Dreamhost, then you may need to take some additional steps to configure node. See latest at https://help.dreamhost.com/hc/en-us/articles/217185397-Node-js-overview

Install NVM
```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
```

Switch to correct version of NVM
```
nvm use 9.4.0
nvm alias default v9.4.0
```

Check for local installed npm packages.
```
https://help.dreamhost.com/hc/en-us/articles/115004415628-Node-js-installing-packages
```

Make sure that the .htaccess file points to the correct version of node. You can check this by ssh into the server, and running which node.

After updating on Dreamhost, be sure to reload passenger.  SSH into the server, and then run the following.
```
npm update
git pull
touch tmp/restart
```

I use a custom .htaccess file on the server. Look in the build folder.  This file forces https, as well as helps passenger use the correct node version.

## Developing

For local development, use the following commands.

```
npm run startnode
npm run startreact
```

After updating, and before submitting, be sure the build folder is up to date. Use deploy.sh and build.sh files to automate as needed.
```
npm run build
```



## Authoring Tutorials.


Tutorials are written as code.  They should be placed into the src/server/tutorials folder, and 
then references in the src/client/ifgame.js constant below
IfLevelModelFactory.levels

### Levels
```
tutorial_seed_based_on_username: // Sets if people should get a consistent tutorial choice based off of their username, or if it should be random each time.  Defaults to false.
```

### Gen Functions

Pages are created by gen functions.  The first two are simple, linear and shuffe.

```
const example = {
	gen: LinearGen,
	pages: [

	]
const example1 = {
	gen: ShuffleGen,
	pages: [

	]
}
```

The until function has a single page that repeated generates until the until function returns true.  Normally, you will want to have versions in the single page return multiple versions of itself.  The versions function also uses a random seed for the level. See the following example.

```
const x = {
	gen: UntilGen
	until: ( page => boolean),
	pages: [
		{}
	]
}
```


### Pages

There are several kinds of pages.

```
Common fields
	code
		Used to help initialize common patterns.  E.g.,
		test or tutorial.
	helpblock
	history
		Array of objcts with changes.
	correct
		True/false.
	correct_required
		Do we need correct===true to continue?  False for
		tutorial pages, true for test pages.
	completed
		Is this q done?  If so, allow no updates.
	solution_feedback: [ { 'has': 'no_values', args: [ 'a' ] } ]
		Exists only on server side. Used by .updatecorrect to
		populate client_feedback.
```

IfPageTextSchema display information without any user input. They 
only have two fields. Note that we use <br/><br/> for line breaks,
as it is automatically converted into <div>.
```
{	type: 'IfPageTextSchema',
	description: `Words!
			<br/><br/>
			More words!`
```


IfPageFormulaSchema shows an Excel grid. There are a variety 
of optional fields.

```
Required fields:
	description: ''
	instruction: ''
	solution_f: ''
	code: 'tutorial' or 'test'

Optional fields:
	client_f_format: '0'
	client_feedback: null or ['asdf', ...]  
		Updated by .updateCorrect on server side.
	column_titles: ['title']
	column_formats: [ '' ]
		$  dollar format with no decimals.
	 	$. Dollar format with two decimals.
	 	0  Number without any decimal points.
	 	,  Decimal style
	 	shortdate Date styled as 1/1/11
	 	text Text
	 	c  Text
	 	%  Percent.
	tests: [ { a: 1 } ],
	solution_f: '=1'
	feedback: [ { 'has': 'no_values', args: [ 'a' ] } ]
		Exists only on server side. Used by .updatecorrect to
		populate client_feedback.
	versions: [ ... ]
		Versions can contain options to override default options.
		For example, 
		[ { solution_f: '123' }, { solution_f: 2 }]

		Or, you can have it be a function that is run upon initial creation.
		[ { solution_f: ( page ) => 123 } ]

```

IfPageParsonsSchema give a list of options for the user to place in order.

```
Required fields:
	description: ''
	instruction: ''
	solution_items = [ 'a', 'b' ]
	code: tutorial or test.

Optional fields:
	versions
	client_feedback: null or ['asdf', ...]  
		Updated by .updateCorrect on server side.
	solution_feedback: [ { 'has': 'no_values', args: [ 'a' ] } ]
		Exists only on server side. Used by .updatecorrect to
		populate client_feedback.
```

IfPageChoiceSchema allows a user to select from a list of options.
Can be either true or false.

```
Required fields:
	description: ''
	instruction: ''
	client_items = [ 'a', 'b' ]
	code: tutorial or test.
	solution: ? or * for any, or a specific value.
	client_feedback: null or ['asdf', ...]  
		Updated by .updateCorrect on server side.
	solution_feedback: [ { 'has': 'no_values', args: [ 'a' ] } ]
		Exists only on server side. Used by .updatecorrect to
		populate client_feedback.

Optional fields:
	versions
		solution: (l: level, p: page): string
```


### Has functions, solution_feedback

Called with { has: 'references', args: [ 'a1' ]}

	no_values: No literals
	values: [0, *, ?, 'x']  <= * is text, ? is number.
	references(args): Make sure that references are in answer
	symbols(args): Make sure that the symbosl are included.  Use ? to include dropdown.
	functions

## Test Plan

Authorization
	New user (anon and join class)
	Forgot password
	Reset password
	Logout
	Ensure that only current user has access to its own page (and no others)
	Ensure that logged in status is required for any subfolder access
Website introduction
	Run through all pages as normal user (not admin)
	Each tutorial


## Author

Nathan Garrett, profgarrett@gmail.com

Thanks to EW for use of the formula parser.
```
	E. W. Bachtal, Inc.
	http://ewbi.blogs.com/develops/2004/12/excel_formula_p.html
```

Thanks for Font Awesome for free Glyphs
https://fontawesome.com/start

Thanks for Visualization Literacy 101
	Source: http://peopleviz.gforge.inria.fr/trunk/vLiteracy/home/tests/bc/


Other credits found in NPM packages.


## License

This project is licensed under the GPL v3.  Read the GPL license [online](https://www.gnu.org/licenses/gpl.txt).
