// Ambient module declarations for non-code assets imported by components.
//
// Files like PageView.tsx do `import './pageview_toc_style.css'` for their
// side effect (webpack's css/style-loader injects the styles at build time).
// TypeScript has no type information for these, so without these declarations
// it reports: "Cannot find module or type declarations for side-effect import
// ... ts(2882)". Declaring the modules gives them an empty type and silences
// the error without affecting the runtime behavior.

declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.less';

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';
declare module '*.webp';

declare module '*.woff';
declare module '*.woff2';
declare module '*.ttf';
declare module '*.eot';
