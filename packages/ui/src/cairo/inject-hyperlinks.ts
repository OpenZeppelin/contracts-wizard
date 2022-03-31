export function injectHyperlinks(code: string) {
  const importRegex = /( )(openzeppelin)([^\s]*)( )/g // we are modifying HTML, so use HTML escaped chars
  let result = code;
  let match = importRegex.exec(code);
  while (match != null) {
    const [line, spaceBefore, ozPrefix, contractsLibrary, spaceAfter] = match;
    if (line !== undefined && spaceBefore !== undefined && ozPrefix !== undefined && contractsLibrary !== undefined && spaceAfter !== undefined) {
      const libraryRelativePath = contractsLibrary.replace(/\./g, '/');
      const replacedImportLine = `${spaceBefore}<a href='https://github.com/OpenZeppelin/cairo-contracts/blob/main/src/${ozPrefix}${libraryRelativePath}.cairo' target='_blank' rel='noopener noreferrer'>${ozPrefix}${contractsLibrary}</a>${spaceAfter}`;
      result = result.replace(line, replacedImportLine);
    }
    match = importRegex.exec(code);
  }
  return result;
}