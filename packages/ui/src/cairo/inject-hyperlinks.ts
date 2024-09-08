import { contractsVersionTag } from "@openzeppelin/wizard-cairo/src";

export function injectHyperlinks(code: string) {
  const importRegex = /use<\/span> (openzeppelin)::([^\s]*);/g
  let result = code;
  let match = importRegex.exec(code);
  while (match != null) {
    const [line, libraryPrefix, libraryPath] = match;
    if (line !== undefined && libraryPrefix !== undefined && libraryPath !== undefined) {
      const githubPrefix = `https://github.com/OpenZeppelin/cairo-contracts/blob/${contractsVersionTag}/packages/`;

      let libraryPathSegments = libraryPath.split('::');
      libraryPathSegments.splice(1, 0, 'src');

      // Remove the component name
      let lastItem = libraryPathSegments[libraryPathSegments.length - 1];
      if (libraryPathSegments.length > 0 && lastItem !== 'interface') {
        // Replace component name with 'upgradeable'
        if (lastItem === 'UpgradeableComponent') {
          libraryPathSegments.splice(-1, 1, 'upgradeable');
        } else {
          libraryPathSegments.pop();
        }
      }

      // Rebind variable after component name is removed
      lastItem = libraryPathSegments[libraryPathSegments.length - 1];

      // Duplicate file name as preceding directory in path
      // unless coming from `notNestedPackages`
      const notNestedPackages = ['security', 'introspection', 'upgrades'];
      const packageName = libraryPathSegments[0];
      if (lastItem !== undefined && packageName !== undefined && !notNestedPackages.includes(packageName) ) {
        libraryPathSegments.splice(-1, 0, lastItem);
      }

      if (libraryPathSegments !== undefined && libraryPathSegments.length > 0) {
        const replacedImportLine = `use<\/span> <a class="import-link" href='${githubPrefix}${libraryPathSegments.join('/')}.cairo' target='_blank' rel='noopener noreferrer'>${libraryPrefix}::${libraryPath}</a>;`;
        result = result.replace(line, replacedImportLine);
      }
    }
    match = importRegex.exec(code);
  }
  return result;
}
