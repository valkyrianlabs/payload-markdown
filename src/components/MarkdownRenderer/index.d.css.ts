// Declaration for the side-effect stylesheet import in Component.tsx.
// Shipped next to index.css so TypeScript (node16/bundler resolution) and
// type checkers such as arethetypeswrong can resolve `import './index.css'`
// from the published Component.d.ts. The stylesheet has no exports.
export {}
