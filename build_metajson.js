/* 
    Used to avoid cache issues. Before building and deploying, use to find the most recent build
 */
const build_path = './build/public/';
const fs = require('fs');
const packageJson = require('./package.json');

// Get list of files matching pattern main.?.js
function matching_builds(path) {
    const reg = /^main.*js$/;
    const matches = [];
    const files = fs.readdirSync(path);
    
    return files.filter( f => {
        if( reg.test(f) ) return f;
    });
}

let matches = matching_builds(build_path);

if(matches.length !== 1) throw new Error('Invalid main found, not the right length');

const json_content = { build: matches[0], dt: (new Date()).toISOString() };
const s_content = JSON.stringify(json_content);

fs.writeFile('./build/public/meta.json', s_content, 'utf8', function(err) {
  if (err) throw err;
  console.log('meta.json file updated to build ' + matches[0]);
});