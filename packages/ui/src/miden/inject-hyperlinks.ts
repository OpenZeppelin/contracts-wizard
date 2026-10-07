import { contractsVersionTag } from '@openzeppelin/wizard-miden/src';

/**
 * Turns the `miden_protocol` and `miden_standards` crate paths of the generated `use` declarations into links to
 * the corresponding modules in the Miden protocol repository.
 */
export function injectHyperlinks(code: string) {
  const importRegex = /use<\/span> (miden_protocol|miden_standards)::([a-zA-Z0-9_]+(?:::[a-z][a-zA-Z0-9_]*)*)/g;
  let result = code;
  let match = importRegex.exec(code);
  while (match != null) {
    const [line, crate, modulePath] = match;
    if (line !== undefined && crate !== undefined && modulePath !== undefined) {
      const githubPrefix = `https://github.com/0xMiden/protocol/blob/${contractsVersionTag}/crates/${crate.replace('_', '-')}/src/`;

      const mapping = moduleMappings[`${crate}::${modulePath}`];
      const filePath = mapping !== undefined ? mapping : `${modulePath.split('::').join('/')}/mod.rs`;

      const replacement = `use</span> <a class="import-link" href='${githubPrefix}${filePath}' target='_blank' rel='noopener noreferrer'>${crate}::${modulePath}</a>`;
      result = result.replace(line, replacement);
    }
    match = importRegex.exec(code);
  }
  return result;
}

/**
 * Module paths whose source file does not follow the `<path>/mod.rs` convention, keyed by crate and module path.
 */
const moduleMappings: { [key: string]: string } = {
  'miden_protocol::account::auth': 'account/auth.rs',
} as const;
