import hljs from 'highlight.js/lib/core';
import rust from 'highlight.js/lib/languages/rust';

// @ts-ignore
//import hljsDefineCairo from 'highlightjs-cairo';
//hljsDefineCairo(hljs);

hljs.registerLanguage('cairo', rust);

export default hljs;
