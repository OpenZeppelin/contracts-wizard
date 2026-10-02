import type { CommonContractOptions, TransferPolicy } from './common-options';
import {
  contractDefaults as commonDefaults,
  DEFAULT_ACCESS_CONTROL,
  withCommonContractDefaults,
} from './common-options';
import type { Contract } from './contract';
import { ContractBuilder } from './contract';
import type { OptionsErrorMessages } from './error';
import { OptionsError } from './error';
import { addFaucetAccount } from './faucet-account';
import { printContract } from './print';
import { setInfo } from './set-info';
import {
  addOptionalMetadata,
  addStringConstant,
  validateMetadataField,
  validateName,
  validateSymbol,
} from './token-metadata';

export const nonFungibleBurnPolicyOptions = ['anyHolder', 'ownerOnly'] as const;

/**
 * Who can burn NFTs, named after the standard burn policies of `miden-standards`.
 *
 * - `'anyHolder'`: any holder can burn their NFTs (`BurnPolicy::allow_all`).
 * - `'ownerOnly'`: only the faucet owner can burn the NFTs it holds (`BurnPolicy::owner_only`).
 */
export type NonFungibleBurnPolicy = (typeof nonFungibleBurnPolicyOptions)[number];

export interface NonFungibleOptions extends CommonContractOptions {
  name: string;
  symbol: string;
  description?: string;
  logoUri?: string;
  contractUri?: string;
  updatableMetadata?: boolean;
  burnPolicy?: NonFungibleBurnPolicy;
  pausable?: boolean;
  /** Whether pausing also stops transfers. Only applies when `pausable` is set; implied by a transfer policy. */
  pausableTransfers?: boolean;
  transferPolicy?: TransferPolicy;
  switchableTransferPolicy?: boolean;
}

export const defaults: Required<NonFungibleOptions> = {
  name: 'MyToken',
  symbol: 'MTK',
  description: '',
  logoUri: '',
  contractUri: '',
  updatableMetadata: false,
  burnPolicy: 'anyHolder',
  pausable: false,
  pausableTransfers: false,
  transferPolicy: false,
  switchableTransferPolicy: false,
  access: commonDefaults.access,
  info: commonDefaults.info,
} as const;

export function printNonFungible(opts: NonFungibleOptions = defaults): string {
  return printContract(buildNonFungible(opts));
}

function withDefaults(opts: NonFungibleOptions): Required<NonFungibleOptions> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    description: opts.description ?? defaults.description,
    logoUri: opts.logoUri ?? defaults.logoUri,
    contractUri: opts.contractUri ?? defaults.contractUri,
    updatableMetadata: opts.updatableMetadata ?? defaults.updatableMetadata,
    burnPolicy: opts.burnPolicy ?? defaults.burnPolicy,
    pausable: opts.pausable ?? defaults.pausable,
    pausableTransfers: opts.pausableTransfers ?? defaults.pausableTransfers,
    transferPolicy: opts.transferPolicy ?? defaults.transferPolicy,
    switchableTransferPolicy: opts.switchableTransferPolicy ?? defaults.switchableTransferPolicy,
  };
}

/**
 * The owner-only burn policy checks the faucet owner, which a Single Key faucet does not have, so it requires
 * an owner-based access control.
 */
export function isAccessControlRequired(opts: Partial<NonFungibleOptions>): boolean {
  return opts.burnPolicy === 'ownerOnly';
}

export function buildNonFungible(opts: NonFungibleOptions): Contract {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  const errors: OptionsErrorMessages = {};
  validateName(allOpts.name, errors);
  validateSymbol(allOpts.symbol, errors);
  validateMetadataField(allOpts.description, 'description', errors);
  validateMetadataField(allOpts.logoUri, 'logoUri', errors);
  validateMetadataField(allOpts.contractUri, 'contractUri', errors);
  if (Object.keys(errors).length > 0) {
    throw new OptionsError(errors);
  }

  const access =
    isAccessControlRequired(allOpts) && allOpts.access === 'singleKey' ? DEFAULT_ACCESS_CONTROL : allOpts.access;

  addFaucetComponent(c, allOpts);

  addFaucetAccount(c, access, {
    kind: 'NonFungible',
    burnPolicy: allOpts.burnPolicy,
    pausable: allOpts.pausable,
    pausableTransfers: allOpts.pausable && allOpts.pausableTransfers,
    transferPolicy: allOpts.transferPolicy,
    switchableTransferPolicy: allOpts.switchableTransferPolicy,
    updatableMetadata: allOpts.updatableMetadata,
  });

  setInfo(c, allOpts.info);

  return c;
}

function addFaucetComponent(c: ContractBuilder, opts: Required<NonFungibleOptions>) {
  c.addUseClause('miden_protocol::asset', 'TokenSymbol');
  c.addUseClause('miden_standards::account::faucets', 'NonFungibleFaucet');
  c.addUseClause('miden_standards::account::faucets', 'TokenName');

  addStringConstant(c, 'NAME', opts.name);
  addStringConstant(c, 'SYMBOL', opts.symbol);

  const chain: string[] = [
    '.name(TokenName::new(Self::NAME).expect("token name is valid"))',
    '.symbol(TokenSymbol::new(Self::SYMBOL).expect("token symbol is valid"))',
    ...addOptionalMetadata(
      c,
      {
        description: opts.description,
        logoUri: opts.logoUri,
        link: opts.contractUri,
        updatable: opts.updatableMetadata,
      },
      {
        constant: 'CONTRACT_URI',
        method: 'contract_uri',
        mutabilityMethod: 'is_contract_uri_mutable',
        expect: 'contract URI is valid',
      },
    ),
    '.build()',
  ];

  c.addFunction({
    name: 'faucet',
    comments: [],
    args: [],
    returns: 'NonFungibleFaucet',
    code: ['NonFungibleFaucet::builder()', chain],
    pub: true,
  });
}
