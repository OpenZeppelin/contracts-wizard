import { contractsVersion } from "core-cairo/src";

export function injectHyperlinks(code: string) {
  const importRegex = /( )(openzeppelin|starkware)([^\s]*)( )/g
  let result = code;
  let match = importRegex.exec(code);
  while (match != null) {
    const [line, spaceBefore, libraryPrefix, libraryPath, spaceAfter] = match;
    if (line !== undefined && spaceBefore !== undefined && libraryPrefix !== undefined && libraryPath !== undefined && spaceAfter !== undefined) {
      const libraryRelativePath = libraryPath.replace(/\./g, '/');
      const githubPrefix = (libraryPrefix === 'openzeppelin') ? 
        `https://github.com/OpenZeppelin/cairo-contracts/blob/v${contractsVersion}/src/` :
        'https://github.com/starkware-libs/cairo-lang/blob/master/src/';
      const replacedImportLine = `${spaceBefore}<a class="import-link" href='${githubPrefix}${libraryPrefix}${libraryRelativePath}.cairo' target='_blank' rel='noopener noreferrer'>${libraryPrefix}${libraryPath}</a>${spaceAfter}`;
      result = result.replace(line, replacedImportLine);
    }
    match = importRegex.exec(code);
  }
  return result;
}