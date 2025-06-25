# JS Games

This is a research project from Nathan Garrett. It provide a set of software tutorials.

## Installing

Install Node.js, MySql, npm, ts-node, and nodemon globally.

Load code and install 

```bash
git clone http://github.com/profgarrett/jsgames
npm install
npm install ts-node nodemon
```

Create a secret.js file in the root/src/server folder. Create a secret.distribution.js file in the root folder. It is used by the deploy script (which you'll need to adjust to your own deployment).

The Bugsnag API is optional, or use DEBUG. Local bugs are pushed to a log.txt file by default.

The garrettn role is a super administration by default.

```javascript
export const ADMIN_USERNAME = '';
export const USER_CREATION_SECRET = '';
export const JWT_AUTH_SECRET = '';
export const MYSQL_USER = '';
export const MYSQL_PASSWORD = '';
export const MYSQL_HOST = 'localhost';
export const MYSQL_DATABASE = 'jsgames_excel_fun';
export conast MYSQL_DEBUG_QUERIES = false;
export const BUGSNAG_API = '';
export const DEBUG = true;
export const VERSION = 4;

export const EMAIL_ADDRESS = 'nathan@excel.fun';
export const EMAIL_PASSWORD = '';
export const EMAIL_HOST = 'mail.excel.fun';
export const EMAIL_REPLYTO = 'profgarrett@gmail.com';
export const EMAIL_PORT = 465;

export const ADMIN_OVER_PASSWORD = '';
```

You can modify other settings in /configuration.js

Develop locallly using the following commands (in 2 windows). 

```bash
npm run startnode
npm run startreact
```

Verify:

- Server (node) works: http://localhost:9000/api/version
- Server (db) works:  http://localhost:9000/api/sql
- Client (react) works: http://localhost:8080

Next, run a deploy. This is required for any static files, even when in development mode. This will create a build folder in the root directory.  Note, you probably need to chmod +x deploy.sh to run the script. You'll to update the specifics of the deploy script to your own server.

```bash
./deploy.sh
```

Tun tests. Replace x with the code used to create users on your system. Note that this requires the test tutorial file to be uploaded.
```
http://hostname/ifgame/test/?USER_CREATION_SECRET=x
```

After installing, add a section with 'anonymous' as its code. New users w/o a username will
be added to this group.


## Deploying

The react application is contained the build folder.  The backend is handled by the node application in the server/app.js file.  

I find it easiest to create an alias to the build folder and the app.js file.
```
ln -s jsgames/build/public/ public
ln -s jsgames/build/server/app.js app.js
```

If you're having trouble getting npm packages to update, npm-install-missing is very useful.

### Dreamhost

Depending on the server, you may need to take further actions.  If deploying to Dreamhost, then you may need to take some additional steps to configure node. See latest at https://help.dreamhost.com/hc/en-us/articles/217185397-Node-js-overview

Install NVM and Node: https://help.dreamhost.com/hc/en-us/articles/360029083351-Installing-a-custom-version-of-NVM-and-Node-js

Switch to correct version of NVM (note, all version numbers need to be incremented)

```bash
nvm use 9.4.0
nvm alias default v20.whatever.1
```

After loading the files, be sure to npm install to get all local packages.

Check node by running *which node*.

Install pm2 (https://pm2.keymetrics.io/docs/usage/quick-start/)
Add the app file to auto-run.
You can also get the status by -list or -status.

```bash
pm2 start app.js --name jsgames --watch
```

I use a custom .htaccess file on the server. Look in the build folder.  This file forces https.

Test the server by going to excel.fun:9000/api/version

You now need to add a proxy server. Bind /api and /sql to port 9000.
This is generally done through the Dreamhost interface.

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