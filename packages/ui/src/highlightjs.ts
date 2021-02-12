import type {} from 'highlight.js';
import hljs from 'highlight.js/lib/core';

// @ts-ignore
import hljsDefineSolidity from 'highlightjs-solidity';
hljsDefineSolidity(hljs);

export default hljs;
