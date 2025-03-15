import hljs from 'highlight.js/lib/core';

// @ts-expect-error missing type declaration
import hljsDefineCairo from 'highlightjs-cairo';
hljsDefineCairo(hljs);

export default hljs;
