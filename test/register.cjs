// Babel require-hook so `node --test` can load the project's .ts / .tsx / .js
// sources directly, reusing the existing .babelrc (preset-typescript etc.).
// Referenced via `node --require ./test/register.cjs` in the npm test script.
require('@babel/register')({
	extensions: ['.js', '.jsx', '.ts', '.tsx'],
	// Only transpile our own source; leave node_modules alone.
	ignore: [/node_modules/],
});
