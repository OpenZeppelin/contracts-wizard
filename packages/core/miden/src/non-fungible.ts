import type { CommonContractOptions, Restrictions } from './common-options';
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
import { paragraph } from './utils/doc';

export interface NonFungibleOptions extends CommonContractOptions {
  name: string;
  symbol: string;
  description?: string;
  logoUri?: string;
  contractUri?: string;
  updatableMetadata?: boolean;
  burnable?: boolean;
  pausable?: boolean;
  restrictions?: Restrictions;
  switchablePolicies?: boolean;
}

export const defaults: Required<NonFungibleOptions> = {
  name: 'MyToken',
  symbol: 'MTK',
  description: '',
  logoUri: '',
  contractUri: '',
  updatableMetadata: false,
  burnable: true,
  pausable: false,
  restrictions: false,
  switchablePolicies: false,
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
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    restrictions: opts.restrictions ?? defaults.restrictions,
    switchablePolicies: opts.switchablePolicies ?? defaults.switchablePolicies,
  };
}

/**
 * Restricting burning to the owner requires an owner, so access control is required when the NFTs are not
 * burnable by their holders.
 */
export function isAccessControlRequired(opts: Partial<NonFungibleOptions>): boolean {
  return opts.burnable === false;
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

  const access = allOpts.burnable ? allOpts.access : allOpts.access || DEFAULT_ACCESS_CONTROL;

  addFaucetComponent(c, allOpts);

  addFaucetAccount(c, access, {
    kind: 'NonFungible',
    burnable: allOpts.burnable,
    pausable: allOpts.pausable,
    restrictions: allOpts.restrictions,
    switchablePolicies: allOpts.switchablePolicies,
    updatableMetadata: allOpts.updatableMetadata,
  });

  setInfo(c, allOpts.info);

  return c;
}

function addFaucetComponent(c: ContractBuilder, opts: Required<NonFungibleOptions>) {
  c.addUseClause('miden_protocol::asset', 'TokenSymbol');
  c.addUseClause('miden_standards::account::faucets', 'NonFungibleFaucet');
  c.addUseClause('miden_standards::account::faucets', 'TokenName');

  addStringConstant(c, 'NAME', opts.name, 'Collection name.');
  addStringConstant(c, 'SYMBOL', opts.symbol, 'Collection symbol.');

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
        comment: 'URI of the collection-level metadata.',
        expect: 'contract URI is valid',
      },
      'Collection',
    ),
    '.build()',
  ];

  c.addFunction({
    name: 'faucet',
    comments: paragraph('Returns the non-fungible faucet component holding the collection metadata.', 1),
    args: [],
    returns: 'NonFungibleFaucet',
    code: ['NonFungibleFaucet::builder()', chain],
    pub: true,
  });
}
