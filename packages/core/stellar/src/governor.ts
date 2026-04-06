import type { CommonOptions } from './common-options';
import { defaults as commonDefaults, getSelfArg, withCommonDefaults } from './common-options';
import type { Contract } from './contract';
import { ContractBuilder } from './contract';
import { printContract } from './print';
import { setInfo } from './set-info';
import { toByteArray, toUint } from './utils/convert-strings';
import { defineFunctions } from './utils/define-functions';

export const defaults: Required<GovernorOptions> = {
  name: 'MyGovernor',
  version: '1.0.0',
  votingDelay: '1',
  votingPeriod: '17280',
  proposalThreshold: '1',
  quorum: '1',
  info: commonDefaults.info,
} as const;

export function printGovernor(opts: GovernorOptions = defaults): string {
  return printContract(buildGovernor(opts));
}

export interface GovernorOptions extends CommonOptions {
  name: string;
  version?: string;
  votingDelay?: string;
  votingPeriod?: string;
  proposalThreshold?: string;
  quorum?: string;
}

function withDefaults(opts: GovernorOptions): Required<GovernorOptions> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    version: opts.version ?? defaults.version,
    votingDelay: opts.votingDelay ?? defaults.votingDelay,
    votingPeriod: opts.votingPeriod ?? defaults.votingPeriod,
    proposalThreshold: opts.proposalThreshold ?? defaults.proposalThreshold,
    quorum: opts.quorum ?? defaults.quorum,
  };
}

export function buildGovernor(opts: GovernorOptions): Contract {
  const allOpts = withDefaults(opts);
  const c = new ContractBuilder(allOpts.name);

  addBase(
    c,
    toByteArray(allOpts.name),
    toByteArray(allOpts.version),
    toUint(allOpts.votingDelay, 'votingDelay', 'u32'),
    toUint(allOpts.votingPeriod, 'votingPeriod', 'u32'),
    toUint(allOpts.proposalThreshold, 'proposalThreshold', 'u128'),
    toUint(allOpts.quorum, 'quorum', 'u128'),
  );

  setInfo(c, allOpts.info);

  return c;
}

function addBase(
  c: ContractBuilder,
  name: string,
  version: string,
  votingDelay: bigint,
  votingPeriod: bigint,
  proposalThreshold: bigint,
  quorum: bigint,
) {
  c.addUseClause('stellar_governance::governor', 'Governor');
  c.addUseClause('stellar_governance::governor', 'ProposalState');
  c.addUseClause('stellar_governance::governor', 'storage');
  c.addUseClause('stellar_governance::governor::storage', 'set_token_contract');
  c.addUseClause('soroban_sdk', 'contract');
  c.addUseClause('soroban_sdk', 'contractimpl');
  c.addUseClause('soroban_sdk', 'Address');
  c.addUseClause('soroban_sdk', 'BytesN');
  c.addUseClause('soroban_sdk', 'Env');
  c.addUseClause('soroban_sdk', 'String');
  c.addUseClause('soroban_sdk', 'Symbol');
  c.addUseClause('soroban_sdk', 'Val');
  c.addUseClause('soroban_sdk', 'Vec');

  c.addConstructorArgument({ name: 'token_contract', type: 'Address' });
  c.addConstructorCode(`storage::set_name(e, String::from_str(e, "${name}"));`);
  c.addConstructorCode(`storage::set_version(e, String::from_str(e, "${version}"));`);
  c.addConstructorCode('set_token_contract(e, &token_contract);');
  c.addConstructorCode(`storage::set_voting_delay(e, ${votingDelay});`);
  c.addConstructorCode(`storage::set_voting_period(e, ${votingPeriod});`);
  c.addConstructorCode(`storage::set_proposal_threshold(e, ${proposalThreshold});`);
  c.addConstructorCode(`storage::set_quorum(e, ${quorum});`);

  const governorTrait = {
    traitName: 'Governor',
    structName: c.name,
    tags: ['contractimpl(contracttrait)'],
  };

  c.addTraitFunction(governorTrait, functions.execute);
  c.addTraitFunction(governorTrait, functions.cancel);
}

const functions = defineFunctions({
  execute: {
    args: [
      getSelfArg(),
      { name: 'targets', type: 'Vec<Address>' },
      { name: 'functions', type: 'Vec<Symbol>' },
      { name: 'args', type: 'Vec<Vec<Val>>' },
      { name: 'description_hash', type: 'BytesN<32>' },
      { name: 'executor', type: 'Address' },
    ],
    returns: 'BytesN<32>',
    code: [
      'executor.require_auth()',
      'let proposal_id = storage::hash_proposal(e, &targets, &functions, &args, &description_hash)',
      'let snapshot = storage::get_proposal_snapshot(e, &proposal_id)',
      'let quorum = Self::quorum(e, snapshot)',
      'storage::execute(e, targets, functions, args, &description_hash, Self::proposals_need_queuing(e), quorum)',
    ],
  },
  cancel: {
    args: [
      getSelfArg(),
      { name: 'targets', type: 'Vec<Address>' },
      { name: 'functions', type: 'Vec<Symbol>' },
      { name: 'args', type: 'Vec<Vec<Val>>' },
      { name: 'description_hash', type: 'BytesN<32>' },
      { name: 'operator', type: 'Address' },
    ],
    returns: 'BytesN<32>',
    code: [
      'let proposal_id = storage::hash_proposal(e, &targets, &functions, &args, &description_hash)',
      'let proposer = storage::get_proposal_proposer(e, &proposal_id)',
      'assert!(operator == proposer)',
      'operator.require_auth()',
      'storage::cancel(e, targets, functions, args, &description_hash)',
    ],
  },
});
