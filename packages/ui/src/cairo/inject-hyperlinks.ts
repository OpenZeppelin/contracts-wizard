import { contractsVersionTag } from '@openzeppelin/wizard-cairo/src';

export function injectHyperlinks(code: string) {
  const importRegex = /use<\/span> (openzeppelin)::([^A-Z]*)(::[a-zA-Z0-9]+|::{)/g;
  let result = code;
  let match = importRegex.exec(code);
  while (match != null) {
    const [line, libraryPrefix, libraryPath, suffix] = match;
    if (line !== undefined && libraryPrefix !== undefined && libraryPath !== undefined && suffix !== undefined) {
      const githubPrefix = `https://github.com/OpenZeppelin/cairo-contracts/blob/${contractsVersionTag}/packages/`;

      const libraryPathSegments = libraryPath.split('::');
      libraryPathSegments.splice(1, 0, 'src');

      if (libraryPathSegments !== undefined && libraryPathSegments.length > 0) {
        let replacement;
        if (suffix === '::{') {
          // Multiple components are imported, so remove components and link to the parent .cairo file
          replacement = `use</span> <a class="import-link" href='${githubPrefix}${libraryPathSegments.join(
            '/',
          )}.cairo' target='_blank' rel='noopener noreferrer'>${libraryPrefix}::${libraryPath}</a>${suffix}`; // Exclude suffix from link
        } else {
          // Single component is imported
          // If a mapping exists, link to the mapped file, otherwise remove the component and link to the parent .cairo file
          const componentName = suffix.substring(2, suffix.length);
          const mapping = componentMappings[componentName];
          const urlSuffix = mapping ? `/${mapping}.cairo` : '.cairo';
          replacement = `use</span> <a class="import-link" href='${githubPrefix}${libraryPathSegments.join(
            '/',
          )}${urlSuffix}' target='_blank' rel='noopener noreferrer'>${libraryPrefix}::${libraryPath}${suffix}</a>`; // Include suffix (component) in link
        }

        result = result.replace(line, replacement);
      }
    }
    match = importRegex.exec(code);
  }
  return result;
}

const componentMappings: { [key: string]: string } = {
  AccountComponent: 'account',
  UpgradeableComponent: 'upgradeable',
} as const;
