import { supportsInterface } from "./common-functions";
import type { CommonOptions } from "./common-options";
import { ContractBuilder, Contract } from "./contract";
import { OptionsValidationError } from "./error";
import { printValue } from "./print";
import { defineFunctions } from './utils/define-functions';
import { durationToBlocks } from "./utils/duration";

export const defaults = {
  blockTime: 13.14,
};

export const votesOptions = ['erc20votes', 'comp'] as const;
export type VotesOptions = typeof votesOptions[number];

export const timelockOptions = [false, 'openzeppelin', 'compound'] as const;
export type TimelockOptions = typeof timelockOptions[number];

export interface GovernorOptions extends Omit<CommonOptions, 'access'> {
  name: string;
  delay: string;
  period: string;
  blockTime: number;
  proposalThreshold: string;
  quorum: {
    mode: 'percent';
    percent: number;
  } | {
    mode: 'absolute';
    votes: string;
  };
  votes: VotesOptions;
  timelock: TimelockOptions;
  bravo: boolean;
}

export function buildGovernor(opts: GovernorOptions): Contract {
  const c = new ContractBuilder(opts.name);

  addBase(c, opts);
  setParameters(c, opts);
  addCounting(c, opts);
  addVotes(c, opts);
  addQuorum(c, opts);
  addTimelock(c, opts);
  addBravo(c, opts);

  return c;
}

function addBase(c: ContractBuilder, { name }: GovernorOptions) {
  c.addParent(
    {
      name: 'Governor',
      path: '@openzeppelin/contracts/governance/Governor.sol',
    },
    [name],
  );
  c.addOverride('IGovernor', functions.votingDelay);
  c.addOverride('IGovernor', functions.votingPeriod);
  c.addOverride('IGovernor', functions.proposalThreshold);
  c.addOverride('IGovernor', functions.quorum);
  c.addOverride('IGovernor', functions.getVotes);
  c.addOverride('Governor', functions.state);
  c.addOverride('Governor', functions.propose);
  c.addOverride('Governor', functions._execute);
  c.addOverride('Governor', functions._cancel);
  c.addOverride('Governor', functions._executor);
  c.addOverride('Governor', supportsInterface);
}

function setParameters(c: ContractBuilder, opts: GovernorOptions) {
  const delayBlocks = durationToBlocks(opts.delay, opts.blockTime);
  c.setFunctionBody([`return ${delayBlocks}; // ${opts.delay}`], functions.votingDelay);

  const periodBlocks = durationToBlocks(opts.period, opts.blockTime);
  c.setFunctionBody([`return ${periodBlocks}; // ${opts.period}`], functions.votingPeriod);

  c.setFunctionBody([`return ${opts.proposalThreshold};`], functions.proposalThreshold);
}

function addCounting(c: ContractBuilder, { bravo }: GovernorOptions) {
  if (!bravo) {
    c.addParent({
      name: 'GovernorCountingSimple',
      path: '@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol',
    });
  }
}

const votesModules = {
  erc20votes: {
    tokenType: 'ERC20Votes',
    parentName: 'GovernorVotes',
  },
  comp: {
    tokenType: 'ERC20VotesComp',
    parentName: 'GovernorVotesComp',
  },
} as const;

function addVotes(c: ContractBuilder, { votes }: GovernorOptions) {
  const tokenArg = '_token';
  const { tokenType, parentName } = votesModules[votes];

  c.addConstructorArgument({
    type: tokenType,
    name: tokenArg,
  });

  c.addParent({
    name: parentName,
    path: `@openzeppelin/contracts/governance/extensions/${parentName}.sol`,
  }, [{ ref: tokenArg }]);
  c.addOverride(parentName, functions.getVotes);
}

export const numberPattern = /(\d*)(?:\.(\d+))?(?:e(\d+))?/;

function addQuorum(c: ContractBuilder, opts: GovernorOptions) {
  if (opts.quorum.mode === 'percent') {
    if (opts.votes !== 'erc20votes') {
      throw new OptionsValidationError({
        quorum: 'Percent-based quorum is only available for ERC20Votes',
      });
    }

    c.addParent({
      name: 'GovernorVotesQuorumFraction',
      path: '@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol',
    }, [opts.quorum.percent]);
    c.addOverride('GovernorVotesQuorumFraction', functions.quorum);
  }

  else if (opts.quorum.mode === 'absolute') {
    if (!numberPattern.test(opts.quorum.votes)) {
      throw new OptionsValidationError({
        quorum: 'Quorum is not a valid number',
      });
    }

    c.setFunctionBody([
      `return ${opts.quorum.votes};`,
    ], functions.quorum, 'pure');
  }
}

const timelockModules = {
  openzeppelin: {
    timelockType: 'TimelockController',
    parentName: 'GovernorTimelockControl',
  },
  compound: {
    timelockType: 'ICompoundTimelock',
    parentName: 'GovernorTimelockCompound',
  },
} as const;

function addTimelock(c: ContractBuilder, { timelock }: GovernorOptions) {
  if (timelock === false) {
    return;
  }

  const timelockArg = '_timelock';
  const { timelockType, parentName } = timelockModules[timelock];

  c.addConstructorArgument({
    type: timelockType,
    name: timelockArg,
  });

  c.addParent({
    name: parentName,
    path: `@openzeppelin/contracts/governance/extensions/${parentName}.sol`,
  }, [{ ref: timelockArg }]);
  c.addOverride('IGovernor', functions.state);
  c.addOverride('IGovernor', functions.propose);
  c.addOverride(parentName, functions._execute);
  c.addOverride(parentName, functions._cancel);
  c.addOverride(parentName, functions._executor);
  c.addOverride(parentName, functions.state);
  c.addOverride(parentName, supportsInterface);
}

function addBravo(c: ContractBuilder, { bravo, timelock }: GovernorOptions) {
  if (bravo) {
    if (timelock === false) {
      throw new OptionsValidationError({
        timelokc: 'GovernorBravo compatibility requires a timelock',
      });
    }

    c.addParent({
      name: 'GovernorCompatibilityBravo',
      path: '@openzeppelin/contracts/governance/compatibility/GovernorCompatibilityBravo.sol',
    });
    c.addOverride('GovernorCompatibilityBravo', functions.propose);
    c.addOverride('IERC165', supportsInterface);
  }
}

const functions = defineFunctions({
  votingDelay: {
    args: [],
    returns: ['uint256'],
    kind: 'public',
    mutability: 'pure',
  },
  votingPeriod: {
    args: [],
    returns: ['uint256'],
    kind: 'public',
    mutability: 'pure',
  },
  proposalThreshold: {
    args: [],
    returns: ['uint256'],
    kind: 'public',
    mutability: 'pure',
  },
  quorum: {
    args: [
      { name: 'blockNumber', type: 'uint256' },
    ],
    returns: ['uint256'],
    kind: 'public',
    mutability: 'view',
  },
  getVotes: {
    args: [
      { name: 'account', type: 'address' },
      { name: 'blockNumber', type: 'uint256' },
    ],
    returns: ['uint256'],
    kind: 'public',
    mutability: 'view',
  },
  propose: {
    args: [
      { name: 'targets', type: 'address[] memory' },
      { name: 'values', type: 'uint256[] memory' },
      { name: 'calldatas', type: 'bytes[] memory' },
      { name: 'description', type: 'string memory' },
    ],
    returns: ['uint256'],
    kind: 'public',
  },
  _execute: {
    args: [
      { name: 'proposalId', type: 'uint256' },
      { name: 'targets', type: 'address[] memory' },
      { name: 'values', type: 'uint256[] memory' },
      { name: 'calldatas', type: 'bytes[] memory' },
      { name: 'descriptionHash', type: 'bytes32' },
    ],
    kind: 'internal',
  },
  _cancel: {
    args: [
      { name: 'targets', type: 'address[] memory' },
      { name: 'values', type: 'uint256[] memory' },
      { name: 'calldatas', type: 'bytes[] memory' },
      { name: 'descriptionHash', type: 'bytes32' },
    ],
    returns: ['uint256'],
    kind: 'internal',
  },
  state: {
    args: [
      { name: 'proposalId', type: 'uint256' },
    ],
    returns: ['ProposalState'],
    kind: 'public',
    mutability: 'view',
  },
  _executor: {
    args: [],
    returns: ['address'],
    kind: 'internal',
    mutability: 'view',
  },
});
