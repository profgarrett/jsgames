# JS Games

This project provides a set of Javascript games and tutorials.



## Getting Started

Requires a server with Node.js installed and a MySql server.



### Installing

Load code 
```
git clone http://github.com/profgarrett/jsgames
```


Create a secret.js file in the root folder. Update to your settings. You will need your own Bugsnag API.  If it's blank, then bugsnag will not handle any errors.  DEBUG can be set to true/false in order to enable debugging and local development.
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

You will also need to create your own tutorial files.  Place them in \server\tutorials.


### Configuration

Alias to the build folder in the root.  This contains the react deployed application and htaccess file.
```
mkdir public
ln -s jsgames/build/ public/
ln -s jsgames/server/app.js app.js
```

Make sure the build folder is up to date.
```
npm run build
```

### Dreamhost

If deploying to Dreamhost, then you may need to take some additional steps to configure node. See latest at https://help.dreamhost.com/hc/en-us/articles/217185397-Node-js-overview

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

## Developing

For local development, use the following commands.

```
npm run startnode
npm run startreact
```

You can update the server.js file to use debug settings.
```
const DEBUG = true;
```

Deploy to server by running
```
npm run deploy  
```


## Author

Nathan Garrett

## License

This project is licensed under the GPL v3.  Read the GPL license [online](https://www.gnu.org/licenses/gpl.txt).
