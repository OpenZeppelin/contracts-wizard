import type { HLJSApi } from 'highlight.js';
import python from 'highlight.js/lib/languages/python';

/** @type LanguageFn */
export default function(hljs: HLJSApi) {
  const cairoLanguage = python(hljs);

  const RESERVED_WORDS = [
    // control
    'if',
    'with',
    'with_attr',
    'else',

    // opcode
    'call',
    'jmp',
    'ret',
    'abs',
    'rel',

    // register
    'ap',
    'fp',

    // other
    'const',
    'let',
    'local',
    'tempvar',
    'felt',
    'as',
    'from',
    'import',
    'static_assert',
    'return',
    'assert',
    'member',
    'cast',
    'alloc_locals',
    'with',
    'with_attr',
    'nondet',
    'dw',
    'codeoffset',
    'new',
    'using',

    // sizeof
    'SIZEOF_LOCALS',
    'SIZE',

    // function
    'func',
    'end',
    'struct',
    'namespace',

    // directives
    'builtins',
    'lang',
  ];

  const BUILT_INS = [
    'HashBuiltin',
    'SignatureBuiltin',
    'BitwiseBuiltin',
    'EcOpBuiltin',
    'Uint256',
    'TRUE',
  ];

  const LITERALS: string[] = [];

  const TYPES = [
    'felt',
  ];

  const KEYWORDS = {
    $pattern: /[A-Za-z]\w+|\w+_/,
    keyword: RESERVED_WORDS,
    built_in: BUILT_INS,
    literal: LITERALS,
    type: TYPES
  };

  if (typeof cairoLanguage.keywords !== 'object') {
    throw Error('Expected object');
  }

  Object.assign(cairoLanguage.keywords, KEYWORDS);

  Object.assign(cairoLanguage, {
    name: 'Cairo',
    aliases: [
      'cairo'
    ]
  });

  return cairoLanguage;
}
