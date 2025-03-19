import { ContractBuilder } from './contract';
import type { Contract } from './contract';
import { defineFunctions } from './utils/define-functions';
import { printContract } from './print';
import { defaults as commonDefaults, withCommonDefaults, type CommonOptions } from './common-options';
import { setInfo } from './set-info';
import { requireAccessControl, setAccessControl } from './set-access-control';
import { addSigner } from './signer';
import type { SignerOptions } from './signer';

export const defaults: Required<PaymasterOptions> = {
  ...commonDefaults,
  name: 'MyPaymaster',
  signer: false,
} as const;

export interface PaymasterOptions extends CommonOptions {
  name: string;
  signer?: SignerOptions;
}

function withDefaults(opts: PaymasterOptions): Required<PaymasterOptions> {
  return {
    ...withCommonDefaults(opts),
    name: opts.name ?? defaults.name,
    signer: opts.signer ?? defaults.signer,
  };
}

export function printPaymaster(opts: PaymasterOptions = defaults): string {
  return printContract(buildPaymaster(opts));
}

export function isAccessControlRequired(opts: Partial<PaymasterOptions>): boolean {
  return true;
}

export function buildPaymaster(opts: PaymasterOptions): Contract {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  if (!allOpts.signer) {
    c.addImportOnly({
      name: 'PackedUserOperation',
      path: '@openzeppelin/contracts/interfaces/draft-IERC4337.sol',
    });
  }
  addParents(c, allOpts);
  setAccessControl(c, allOpts.access);
  c.addOverride({ name: 'PaymasterCore' }, functions._authorizeWithdraw);
  requireAccessControl(c, functions._authorizeWithdraw, opts.access ?? false, 'WITHDRAWER', 'withdrawer');
  c.setFunctionBody([], functions._authorizeWithdraw);
  setInfo(c, allOpts.info);

  return c;
}

function addParents(c: ContractBuilder, opts: PaymasterOptions): void {
  if (opts.signer) {
    c.addParent(
      {
        name: 'EIP712',
        path: `@openzeppelin/contracts/utils/cryptography/EIP712.sol`,
      },
      [opts.name, '1'],
    );
  }
  c.addParent({
    name: 'PaymasterCore',
    path: `@openzeppelin/community-contracts/contracts/account/paymaster/PaymasterCore.sol`,
  });
  if (opts.signer) {
    c.addParent({
      name: 'PaymasterSigner',
      path: `@openzeppelin/community-contracts/contracts/account/paymaster/PaymasterSigner.sol`,
    });
  } else {
    c.addOverride({ name: 'PaymasterCore' }, functions._validatePaymasterUserOp);
    c.setFunctionBody(['// Custom validation logic here'], functions._validatePaymasterUserOp);
  }
  addSigner(c, opts.signer ?? false);
}

const functions = {
  ...defineFunctions({
    _signableUserOpHash: {
      kind: 'internal' as const,
      args: [
        { name: 'userOp', type: 'PackedUserOperation calldata' },
        { name: 'userOpHash', type: 'bytes32' },
      ],
      returns: ['bytes32'],
      mutability: 'view' as const,
    },
    _validatePaymasterUserOp: {
      kind: 'internal' as const,
      args: [
        { name: 'userOp', type: 'PackedUserOperation calldata' },
        { name: 'userOpHash', type: 'bytes32' },
        { name: 'requiredPrefix', type: 'uint256' },
      ],
      returns: ['bytes memory context', 'uint256 validationData'],
    },
    _authorizeWithdraw: {
      kind: 'internal' as const,
      args: [],
    },
  }),
};
