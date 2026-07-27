// Babel require-hook so `node --test` can load the project's .ts / .tsx / .js
// sources directly, reusing the existing .babelrc (preset-typescript etc.).
// Referenced via `node --require ./test/register.cjs` in the npm test script.
require('@babel/register')({
	extensions: ['.js', '.jsx', '.ts', '.tsx'],
	// Only transpile our own source; leave node_modules alone.
	ignore: [/node_modules/],
});

// Stub out non-JS asset imports (CSS, images, fonts). Components like
// PageView.tsx do `import './pageview_toc_style.css'`, which Node's require
// would otherwise try to parse as JavaScript and choke on (e.g. `.toc { ... }`
// => "Unexpected token '.'"). In the browser these are handled by webpack
// loaders; under `node --test` we just make them no-op empty modules so the
// component can be required and its exported functions unit-tested.
for (const ext of ['.css', '.scss', '.sass', '.less', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.woff', '.woff2', '.ttf', '.eot']) {
	require.extensions[ext] = () => {};
}
