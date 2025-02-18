import type { CommonContractOptions } from './common-options';
import {
  printERC20,
  defaults as erc20defaults,
  isAccessControlRequired as erc20IsAccessControlRequired,
  ERC20Options,
} from './erc20';
import {
  printERC1155,
  defaults as erc1155defaults,
  isAccessControlRequired as erc1155IsAccessControlRequired,
  ERC1155Options,
} from './erc1155';

export interface WizardContractAPI<Options extends CommonContractOptions> {
  /**
   * Returns a string representation of a contract generated using the provided options. If opts is not provided, uses `defaults`.
   */
  print: (opts?: Options) => string;

  /**
   * The default options that are used for `print`.
   */
  defaults: Required<Options>;
}

export interface AccessControlAPI<Options extends CommonContractOptions> {
  /**
   * Whether any of the provided options require access control to be enabled. If this returns `true`, then calling `print` with the
   * same options would cause the `access` option to default to `'ownable'` if it was `undefined` or `false`.
   */
  isAccessControlRequired: (opts: Partial<Options>) => boolean;
}

export type ERC20 = WizardContractAPI<ERC20Options> & AccessControlAPI<ERC20Options>;
export type ERC1155 = WizardContractAPI<ERC1155Options> & AccessControlAPI<ERC1155Options>;

export const erc20: ERC20 = {
  print: printERC20,
  defaults: erc20defaults,
  isAccessControlRequired: erc20IsAccessControlRequired,
};

export const erc1155: ERC1155 = {
  print: printERC1155,
  defaults: erc1155defaults,
  isAccessControlRequired: erc1155IsAccessControlRequired,
};
