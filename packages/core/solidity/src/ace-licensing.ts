import type { Contract } from './contract';

/** Effective SPDX identifier for contracts that import Chainlink ACE (pinned to the installed 1.2.0 release). */
export const ACE_LICENSE = 'BUSL-1.1';
export const ACE_LICENSE_URL = 'https://github.com/smartcontractkit/chainlink-ace/blob/v1.2.0/LICENSE';
export const ACE_GRANTS_URL =
  'https://github.com/smartcontractkit/chainlink-ace/blob/v1.2.0/chainlink-ace-License-grants';

const ACE_IMPORT_PREFIX = '@chainlink/ace/';

export function isACEImportPath(path: string): boolean {
  return path.startsWith(ACE_IMPORT_PREFIX);
}

/** ACE engines are contracts, and must never receive a generated signer address. */
export function hasACE(c: Contract): boolean {
  return c.imports.some(i => isACEImportPath(i.path));
}

export const aceImportNotice = [
  `// Imports Chainlink ACE components licensed under ${ACE_LICENSE}.`,
  `// License: ${ACE_LICENSE_URL}`,
];
