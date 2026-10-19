import type JSZip from 'jszip';
import type { Contract, FunctionArgument } from './contract';
import type { Lines } from './utils/format-lines';
import { hasACE } from './ace-licensing';

export { hasACE };

/**
 * Whether a constructor argument can be given a default value in a generated project.
 *
 * The generators fill these in with a signer, so this must agree everywhere it is used: an argument
 * that is treated as an address in one place but not another would leave an unset placeholder in
 * code that is not commented out.
 */
export function isAddressType(arg: FunctionArgument): boolean {
  return arg.type === 'address';
}

/**
 * Whether any constructor argument cannot be given a default value in a generated project.
 *
 * Address arguments are filled in with a signer, so a contract with only address arguments can be
 * deployed as-is. Anything else must be supplied by the user, which means the generated deployment
 * is commented out and there is no deployed instance for the generated tests to assert against.
 */
export function hasNonAddressArgs(c: Contract): boolean {
  return !c.constructorArgs.every(isAddressType);
}

/**
 * Comments out a section of generated code behind a single TODO, so that the user can fill in the
 * missing constructor arguments and uncomment the whole section at once.
 */
export function addTodoAndCommentOut(c: Contract, lines: Lines[]): Lines[] {
  const values = hasNonAddressArgs(c) ? 'values' : 'addresses';
  return [
    `// TODO: Set ${values} for the variables below, then uncomment the following section:`,
    '/*',
    ...lines,
    '*/',
  ];
}

export const ACE_LEGAL_DIR = 'third-party-licenses/chainlink-ace';
const ACE_LEGAL_FILES = ['LICENSE', 'chainlink-ace-License-grants'];

/** Maps archive paths to ACE's original legal texts, as bundled by prepare.ts from the pinned package. */
export function getACELegalFiles(sources: Record<string, string>): Record<string, string> {
  const files: Record<string, string> = {};
  for (const file of ACE_LEGAL_FILES) {
    const text = sources[`@chainlink/ace/${file}`];
    if (text === undefined) {
      throw new Error(
        `Bundled ACE legal resource @chainlink/ace/${file} is missing; rebuild openzeppelin-contracts.json`,
      );
    }
    files[`${ACE_LEGAL_DIR}/${file}`] = text;
  }
  return files;
}

export async function addACELegalFiles(zip: JSZip, c: Contract): Promise<void> {
  if (!hasACE(c)) return;
  const { default: contracts } = await import('../openzeppelin-contracts');
  for (const [file, text] of Object.entries(getACELegalFiles(contracts.sources))) {
    zip.file(file, text);
  }
}

export function isPolicyEngine(c: Contract, arg: FunctionArgument): boolean {
  return hasACE(c) && arg.name === 'policyEngine';
}

export const acePrerequisites = `## ACE policy engine prerequisite

The token requires an initialized ACE 1.2.0 PolicyEngine proxy on the same network.
Deploy and initialize the engine with your chosen owner and default policy result, then
register the token's transfer and transferFrom selectors, extractors, and policies.
Set POLICY_ENGINE to that proxy address before running tests or deploying this token.
The generated code checks that this address contains deployed bytecode; this check does
not validate ownership or policy configuration. Use a local fork containing the engine
for the sample tests, or deploy a real engine in your local test fixture first.
Never use a signer account as the engine. Consult the installed
@chainlink/ace/packages/policy-management/README.md for engine configuration.

`;

export const aceLicensing = `## ACE licensing

This project was generated with Chainlink ACE enabled. The generated token is labeled BUSL-1.1 and imports ACE components licensed under BUSL-1.1. Its source starts with \`// SPDX-License-Identifier: BUSL-1.1\`.

The original [ACE license](third-party-licenses/chainlink-ace/LICENSE) and [additional use grants](third-party-licenses/chainlink-ace/chainlink-ace-License-grants) from [@chainlink/ace 1.2.0](https://github.com/smartcontractkit/chainlink-ace/tree/v1.2.0) are included in \`third-party-licenses/chainlink-ace/\`. Review those terms before production use. OpenZeppelin and other dependencies retain their own licenses and notices.

`;
