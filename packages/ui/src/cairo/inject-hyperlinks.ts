import { contractsVersionTag } from "@openzeppelin/wizard-cairo/src";

export function injectHyperlinks(code: string) {
  const importRegex = /use<\/span> (openzeppelin)::([^\s]*);/g
  let result = code;
  let match = importRegex.exec(code);
  while (match != null) {
    const [line, libraryPrefix, libraryPath] = match;
    if (line !== undefined && libraryPrefix !== undefined && libraryPath !== undefined) {
      const githubPrefix = `https://github.com/OpenZeppelin/cairo-contracts/blob/${contractsVersionTag}/src/`;

      let libraryPathSegments = libraryPath.split('::');

      // Remove the component name
      if (libraryPathSegments.length > 0 && libraryPathSegments[libraryPathSegments.length - 1] !== 'interface') {
        libraryPathSegments.pop();
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