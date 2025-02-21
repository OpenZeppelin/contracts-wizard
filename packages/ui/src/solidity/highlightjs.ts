import hljs from "highlight.js/lib/core";

// @ts-expect-error missing type declaration file
import hljsDefineSolidity from "highlightjs-solidity";
hljsDefineSolidity(hljs);

export default hljs;
