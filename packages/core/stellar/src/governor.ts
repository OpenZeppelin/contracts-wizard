import type { CommonContractOptions } from './common-options';
import { contractDefaults as commonDefaults, getSelfArg, withCommonContractDefaults } from './common-options';
import { ContractBuilder } from './contract';
import { printContract } from './print';
import { setAccessControl } from './set-access-control';
import { addUpgradeable } from './add-upgradeable';
import { setInfo } from './set-info';
import { toByteArray, toUint } from './utils/convert-strings';
import { defineFunctions } from './utils/define-functions';

export const defaults: Required<GovernorOptions> = {
  name: 'MyGovernor',
  version: '1.0.0',
  votingDelay: '17000',
  votingPeriod: '120000',
  proposalThreshold: '100',
  quorum: '500',
  upgradeable: false,
  timelock: false,
  access: commonDefaults.access,
  info: commonDefaults.info,
  explicitImplementations: commonDefaults.explicitImplementations,
} as const;

export function printGovernor(opts: GovernorOptions = defaults): string {
  return printContract(buildGovernor(opts));
}

export interface GovernorOptions extends CommonContractOptions {
  name: string;
  version?: string;
  votingDelay?: string;
  votingPeriod?: string;
  proposalThreshold?: string;
  quorum?: string;
  upgradeable?: boolean;
  timelock?: boolean;
}

export function isAccessControlRequired(opts: Partial<GovernorOptions>): boolean {
  return opts.upgradeable === true;
}

function withDefaults(opts: GovernorOptions): Required<GovernorOptions> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    version: opts.version ?? defaults.version,
    votingDelay: opts.votingDelay ?? defaults.votingDelay,
    votingPeriod: opts.votingPeriod ?? defaults.votingPeriod,
    proposalThreshold: opts.proposalThreshold ?? defaults.proposalThreshold,
    quorum: opts.quorum ?? defaults.quorum,
    upgradeable: opts.upgradeable ?? defaults.upgradeable,
    timelock: opts.timelock ?? defaults.timelock,
  };
}

export function buildGovernor(opts: GovernorOptions): ContractBuilder {
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
    allOpts.timelock,
  );

  if (allOpts.upgradeable) {
    addUpgradeable(c, allOpts.access, allOpts.explicitImplementations);
  }

  setAccessControl(c, allOpts.access, allOpts.explicitImplementations);
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
  timelock: boolean,
) {
  c.addUseClause('stellar_governance::governor', 'Governor');
  c.addUseClause('stellar_governance::governor', 'ProposalState');
  c.addUseClause('stellar_governance::governor', 'self', { alias: 'governor' });
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
  c.addConstructorCode(`governor::set_name(e, String::from_str(e, "${name}"));`);
  c.addConstructorCode(`governor::set_version(e, String::from_str(e, "${version}"));`);
  c.addConstructorCode(`governor::set_voting_delay(e, ${votingDelay});`);
  c.addConstructorCode(`governor::set_voting_period(e, ${votingPeriod});`);
  c.addConstructorCode(`governor::set_proposal_threshold(e, ${proposalThreshold});`);
  c.addConstructorCode(`governor::set_quorum(e, ${quorum});`);
  c.addConstructorCode('governor::set_token_contract(e, &token_contract);');

  const governorTrait = {
    traitName: 'Governor',
    structName: c.name,
    tags: ['contractimpl(contracttrait)'],
  };

  if (timelock) {
    addTimelock(c, governorTrait);
  } else {
    c.addTraitFunction(governorTrait, functions.execute);
    c.addTraitFunction(governorTrait, functions.cancel);
  }
}

function addTimelock(c: ContractBuilder, governorTrait: { traitName: string; structName: string; tags: string[] }) {
  c.addUseClause('soroban_sdk', 'contracttype');
  c.addUseClause('soroban_sdk', 'IntoVal');
  c.addUseClause('stellar_governance::timelock', 'TimelockClient');

  c.addTopLevelDeclaration([
    '#[contracttype]',
    'enum GovernorTimelockKey {',
    '    Timelock,',
    '    OperationID(BytesN<32>),',
    '}',
  ]);

  c.addConstructorArgument({ name: 'timelock_contract', type: 'Address' });
  c.addConstructorCode('e.storage().instance().set(&GovernorTimelockKey::Timelock, &timelock_contract);');

  c.addFreeFunction(timelockFreeFunctions.timelock);

  c.addTraitFunction(governorTrait, timelockFunctions.proposals_need_queuing);
  c.addTraitFunction(governorTrait, timelockFunctions.queue);
  c.addTraitFunction(governorTrait, timelockFunctions.execute);
  c.addTraitFunction(governorTrait, timelockFunctions.cancel);
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
      'let proposal_id = governor::hash_proposal(e, &targets, &functions, &args, &description_hash)',
      'let snapshot = governor::get_proposal_snapshot(e, &proposal_id)',
      'let quorum = Self::quorum(e, snapshot)',
      'governor::execute(e, targets, functions, args, &description_hash, Self::proposals_need_queuing(e), quorum)',
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
      'let proposal_id = governor::hash_proposal(e, &targets, &functions, &args, &description_hash)',
      'let proposer = governor::get_proposal_proposer(e, &proposal_id)',
      'assert!(operator == proposer)',
      'operator.require_auth()',
      'governor::cancel(e, targets, functions, args, &description_hash)',
    ],
  },
});

const timelockFreeFunctions = defineFunctions({
  timelock: {
    args: [getSelfArg()],
    returns: 'Address',
    code: ['e.storage().instance().get(&GovernorTimelockKey::Timelock).expect("timelock not set")'],
  },
});

const timelockFunctions = defineFunctions({
  proposals_need_queuing: {
    args: [{ name: '_e', type: '&Env' }],
    returns: 'bool',
    code: ['true'],
  },
  queue: {
    args: [
      getSelfArg(),
      { name: 'targets', type: 'Vec<Address>' },
      { name: 'functions', type: 'Vec<Symbol>' },
      { name: 'args', type: 'Vec<Vec<Val>>' },
      { name: 'description_hash', type: 'BytesN<32>' },
      { name: 'eta', type: 'u32' },
      { name: '_operator', type: 'Address' },
    ],
    returns: 'BytesN<32>',
    code: [
      'let proposal_id = governor::hash_proposal(e, &targets, &functions, &args, &description_hash)',
      'let snapshot = governor::get_proposal_snapshot(e, &proposal_id)',
      'let quorum = Self::quorum(e, snapshot)',
      'let proposal_id = governor::queue(e, targets.clone(), functions.clone(), args.clone(), &description_hash, eta, quorum)',
      'let timelock = Self::timelock(e)',
      'let delay = eta.saturating_sub(e.ledger().sequence())',
      'let execute_args: Vec<Val> = (targets, functions, args, description_hash.clone(), timelock.clone()).into_val(e)',
      'let timelock_client = TimelockClient::new(e, &timelock)',
      'let zero_predecessor = BytesN::from_array(e, &[0u8; 32])',
      'let op_id = timelock_client.schedule(&e.current_contract_address(), &Symbol::new(e, "execute"), &execute_args, &zero_predecessor, &description_hash, &delay, &e.current_contract_address())',
      'e.storage().persistent().set(&GovernorTimelockKey::OperationID(proposal_id.clone()), &op_id);',
      'proposal_id',
    ],
  },
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
      'let timelock = Self::timelock(e)',
      'assert!(executor == timelock)',
      'executor.require_auth()',
      'let proposal_id = governor::hash_proposal(e, &targets, &functions, &args, &description_hash)',
      'let snapshot = governor::get_proposal_snapshot(e, &proposal_id)',
      'let quorum = Self::quorum(e, snapshot)',
      'governor::execute(e, targets, functions, args, &description_hash, Self::proposals_need_queuing(e), quorum)',
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
      'let proposal_id = governor::hash_proposal(e, &targets, &functions, &args, &description_hash)',
      'let proposer = governor::get_proposal_proposer(e, &proposal_id)',
      'assert!(operator == proposer)',
      'operator.require_auth()',
      'if let Some(op_id) = e.storage().persistent().get::<_, BytesN<32>>(&GovernorTimelockKey::OperationID(proposal_id)) {',
      '    let timelock = Self::timelock(e);',
      '    let timelock_client = TimelockClient::new(e, &timelock);',
      '    timelock_client.cancel(&op_id, &e.current_contract_address());',
      '}',
      'governor::cancel(e, targets, functions, args, &description_hash)',
    ],
  },
});
