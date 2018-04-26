# JS Games

This project provides a set of Javascript games and tutorials.



## Getting Started

Requires a server with Node.js installed and a MySql server.



### Installing

Load code 
```
git clone http://github.com/profgarrett/jsgames
```

Create a secret.js file in the root folder. Update to your settings. You will need your own Bugsnag API.  If it's blank, then bugsnag will not handle any errors.  DEBUG can be set to true/false in order to enable debugging and local development. All local bugs are pushed to a log.txt file by default.
```
module.exports = {
	ADMIN_USERNAME: '',
	USER_CREATION_SECRET: '',
	JWT_AUTH_SECRET: '',
	MYSQL_USER: '',
	MYSQL_PASSWORD: '',
	MYSQL_HOST: '',
	MYSQL_DATABASE: '',
	BUGSNAG_API: '',
	DEBUG: false
};
```

You will also need to create your own tutorial files.  Place them in \server\tutorials. You can also get them by emailing Nathan.

The react application is contained the build folder.  The backend is handled by the node application in the server/app.js file.  

I find it easiest to create an alias to the build folder and the app.js file.
```
ln -s jsgames/build/ public/
ln -s jsgames/server/app.js app.js
```

If you're having trouble getting npm packages to update, npm-install-missing is very useful.

### Updating

After updating, visit page to update SQL schema.
```
http://hosthame/api/sql
```

Then, run tests. Replace x with the code used to create users on your system.
```
http://hostname/ifgame/test/?USER_CREATION_SECRET=x
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


If installing new library through npm or yarn, use flow-typed to install the type defs.
```
flow-typed install
```


## Authoring Tutorials.


Tutorials are written as code.  They should be placed into the src/server/tutorials folder, and 
then references in the src/client/ifgame.js constant below
IfLevelModelFactory.levels

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
	solution_feedback: [ { 'has': 'no_values', args: [ 'a' ] } ]
		Exists only on server side. Used by .updatecorrect to
		populate client_feedback.
	versions: [ ... ]
		Verions can contain options to override default options.


IfPageParsonsSchema give a list of options for the user to place in order.

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


IfPageChoiceSchema allows a user to select from a list of options.
Can be either true or false.

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


### Has functions, solution_feedback

Called with { has: 'references', args: [ 'a1' ]}

	no_values: No literals
	references(args): Make sure that references are in answer
	symbols(args): Make sure that the symbosl are included

### DataFactory

DataFactory is used to generate random data.
	randDate(plus_or_minus_dats, seed)
	randPercent(from, to, seed)
	randB(from, to, seed)
	randOf([], seed)
	randNumbers(rows, cols, max_n, seed)
	randDates(rows, columns, { a_range, b_range, c_range })
	randName(seed)
	randPeople(rows)
	randNumbersAndColors( rows)
	randomizeList([], seed)





## Author

Nathan Garrett, profgarrett@gmail.com



## License

This project is licensed under the GPL v3.  Read the GPL license [online](https://www.gnu.org/licenses/gpl.txt).
