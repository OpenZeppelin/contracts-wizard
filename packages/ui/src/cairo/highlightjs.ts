import type {} from 'highlight.js';

import hljs from 'highlight.js/lib/core';
import cairo from './syntax/cairolang';

hljs.registerLanguage('cairo', cairo);

export default hljs;

