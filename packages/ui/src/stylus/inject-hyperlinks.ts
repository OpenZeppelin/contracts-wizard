import { contractsVersionTag } from "@openzeppelin/wizard-stylus/src";

export function injectHyperlinks(code: string) {
  const importRegex = /use<\/span> (openzeppelin_[a-zA-Z0-9_]*)/g
  let result = code;
  let match = importRegex.exec(code);
  while (match != null) {
    const [line, libraryPrefix] = match;
    if (line !== undefined && libraryPrefix !== undefined) {
      const githubPrefix = `https://github.com/OpenZeppelin/stylus-contracts/blob/${contractsVersionTag}/contracts/`;

      const mapping = importSourceMappings[libraryPrefix];
      if (mapping !== undefined) {
        let replacement = `use<\/span> <a class="import-link" href='${githubPrefix}${mapping}' target='_blank' rel='noopener noreferrer'>${libraryPrefix}</a>`;
        result = result.replace(line, replacement);
      }
    }
    match = importRegex.exec(code);
  }
  return result;
}

const importSourceMappings: { [key: string]: string } = {
  'openzeppelin_erc20_token': 'token/erc20/src',
  'openzeppelin_pausable': 'utils/pausable/src',
  'openzeppelin_pausable_macros': 'utils/pausable-macros/src',
} as const;
