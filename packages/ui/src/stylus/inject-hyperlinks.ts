import { contractsVersionTag } from "@openzeppelin/wizard-stylus/src";

export function injectHyperlinks(code: string) {
  const importRegex = /use<\/span> (openzeppelin_stylus)::([^{A-Z]*)(::[a-zA-Z0-9]+|::{)/g
  let result = code;
  let match = importRegex.exec(code);
  while (match != null) {
    const [line, libraryPrefix, libraryPath, suffix] = match;
    if (line !== undefined && libraryPrefix !== undefined && libraryPath !== undefined && suffix !== undefined) {
      const githubPrefix = `https://github.com/OpenZeppelin/rust-contracts-stylus/blob/${contractsVersionTag}/contracts/src/`;

      let libraryPathSegments = libraryPath.split('::');

      if (libraryPathSegments !== undefined && libraryPathSegments.length > 0) {
        let replacement;
        if (suffix === '::{') {
          // Multiple modules are imported, so remove components and link to the parent directory's mod.rs file
          replacement = `use</span> <a class="import-link" href='${githubPrefix}${libraryPathSegments.join('/')}/mod.rs' target='_blank' rel='noopener noreferrer'>${libraryPrefix}::${libraryPath}</a>${suffix}`; // Exclude suffix from link
        } else {
          // Single module is imported
          // If a mapping exists, link to the mapped file, otherwise remove the module and link to the parent directory's mod.rs file
          const moduleName = suffix.substring(2, suffix.length);
          const mapping = moduleMappings[moduleName];

          let libraryPathReplacement: string;
          if (mapping !== undefined) {
            libraryPathReplacement = mapping;
          } else {
            libraryPathReplacement = [...libraryPathSegments, 'mod.rs'].join('/');
          }
          replacement = `use</span> <a class="import-link" href='${githubPrefix}${libraryPathReplacement}' target='_blank' rel='noopener noreferrer'>${libraryPrefix}::${libraryPath}${suffix}</a>`; // Include suffix (component) in link
        }

        result = result.replace(line, replacement);
      }
    }
    match = importRegex.exec(code);
  }
  return result;
}

const moduleMappings: { [key: string]: string } = {
  'Erc20Metadata': 'token/erc20/extensions/metadata.rs',
  'Ownable': 'access/ownable.rs',
  'AccessControl': 'access/control.rs',
  'IErc165': 'utils/introspection/erc165.rs',
} as const;
