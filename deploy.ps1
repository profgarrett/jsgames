# Deploy to excel.fun
# Must be done through PowerShell to have access to scp


# Setup build folder structure
Remove-Item build -Recurse
mkdir build
mkdir build\public
#mkdir build\server

# Build webpack client-side
# webpack --config webpack.production.config.js
npm run deployA

# Build the server-side, stripping out typescript
# node_modules/.bin/babel.cmd  src/server/*.ts --outDir ./build/server --allowJs --esModuleInterop TRUE
npx babel src --out-dir build --presets @babel/preset-typescript  --extensions ".ts"
npx babel src --out-dir build --presets @babel/preset-typescript  --extensions ".js"

# Copy normal js files
# xcopy src\*.js build\src /s /y /q

# Build server-side w/o ts
# this just copies it - don't use... xcopy src build\server\ /s /y /q

# Copy the wasm for sql to both the local run, as well as the public 
copy node_modules\sql.js\dist\sql-wasm.* static\


# Copy extra files
copy secret.distribution.js build\server\secret.js
xcopy static\ build\public\static\ /s /y /q
copy static\favicon.ico build\public\favicon.ico 

# Copy the wasm for sql to both the local run, as well as the public 
copy node_modules\sql.js\dist\sql-wasm.* build\public\static
copy node_modules\sql.js\dist\sql-wasm.* static\

# not needed?
# copy .htaccess build\public\.htaccess 

# Used to detect if a stale cache is present.
node build_metajson.js

# Log into server and clean out old files
ssh profgarrett@excel.fun "cd excel.fun; rm -rf jsgames; mkdir jsgames; mkdir jsgames/sql; mkdir jsgames/build"

# Copy build files
scp -r -C -q sql profgarrett@excel.fun:excel.fun/jsgames/
scp -r -C -q build profgarrett@excel.fun:excel.fun/jsgames/
scp -C -q .htaccess profgarrett@excel.fun:excel.fun/.htaccess

# Copy package file for updating server node-modules
scp -C -q package.json profgarrett@excel.fun:excel.fun/package.json

# Reset symbolic links
ssh profgarrett@excel.fun "cd excel.fun; rm public; ln -s jsgames/build/public/ public "
ssh profgarrett@excel.fun "cd excel.fun; rm app.js; ln -s jsgames/build/server/app.js app.js "

# Clean logs
ssh profgarrett@excel.fun "cd excel.fun; rm -f log.txt"

# Restart server 
ssh profgarrett@excel.fun "cd excel.fun; touch tmp/restart.txt"
