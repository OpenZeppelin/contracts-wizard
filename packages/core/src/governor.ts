import { supportsInterface } from "./common-functions";
import { CommonOptions, withCommonDefaults } from "./common-options";
import { ContractBuilder, Contract } from "./contract";
import { OptionsError } from "./error";
import { printValue } from "./print";
import { setUpgradeable } from "./set-upgradeable";
import { defineFunctions } from './utils/define-functions';
import { durationToBlocks } from "./utils/duration";

export const defaults = {
  blockTime: 13.2,
  decimals: 18,
  quorumPercent: 4,
};

export const votesOptions = ['erc20votes', 'comp'] as const;
export type VotesOptions = typeof votesOptions[number];

export const timelockOptions = [false, 'openzeppelin', 'compound'] as const;
export type TimelockOptions = typeof timelockOptions[number];

export interface GovernorOptions extends CommonOptions {
  name: string;
  delay: string;
  period: string;
  blockTime?: number;
  proposalThreshold: string;
  decimals?: number;
  quorumMode: 'percent' | 'absolute';
  quorumPercent?: number;
  quorumAbsolute: string;
  votes: VotesOptions;
  timelock: TimelockOptions;
  bravo: boolean;
}

function withDefaults(opts: GovernorOptions): Required<GovernorOptions> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    decimals: opts.decimals || defaults.decimals,
    blockTime: opts.blockTime || defaults.blockTime,
    quorumPercent: opts.quorumPercent ?? defaults.quorumPercent,
  };
}

export function buildGovernor(opts: GovernorOptions): Contract {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  addBase(c, allOpts);
  setVotingParameters(c, allOpts);
  setProposalThreshold(c, allOpts);
  addCounting(c, allOpts);
  addBravo(c, allOpts);
  addVotes(c, allOpts);
  addQuorum(c, allOpts);
  addTimelock(c, allOpts);

  setUpgradeable(c, allOpts.upgradeable, allOpts.access);

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
  c.addOverride('IGovernor', functions.quorum);
  c.addOverride('IGovernor', functions.getVotes);
  c.addOverride('Governor', functions.state);
  c.addOverride('Governor', functions.propose);
  c.addOverride('Governor', functions._execute);
  c.addOverride('Governor', functions._cancel);
  c.addOverride('Governor', functions._executor);
  c.addOverride('Governor', supportsInterface);
}

function setVotingParameters(c: ContractBuilder, opts: Required<GovernorOptions>) {
  try {
    const delayBlocks = durationToBlocks(opts.delay, opts.blockTime);
    c.setFunctionBody([`return ${delayBlocks}; // ${opts.delay}`], functions.votingDelay);
  } catch (e) {
    if (e instanceof Error) {
      throw new OptionsError({
        delay: e.message,
      });
    } else {
      throw e;
    }
  }

  try {
    const periodBlocks = durationToBlocks(opts.period, opts.blockTime);
    c.setFunctionBody([`return ${periodBlocks}; // ${opts.period}`], functions.votingPeriod);
  } catch (e) {
    if (e instanceof Error) {
      throw new OptionsError({
        period: e.message,
      });
    } else {
      throw e;
    }
  }
}

function setProposalThreshold(c: ContractBuilder, opts: GovernorOptions) {
  const threshold = opts.proposalThreshold || '0';

  if (!/^\d+$/.test(threshold)) {
    throw new OptionsError({
      proposalThreshold: 'Not a valid number',
    });
  }

  const nonZeroThreshold = parseInt(threshold) !== 0;

  if (nonZeroThreshold && !opts.bravo) {
    c.addParent({
      name: 'GovernorProposalThreshold',
      path: '@openzeppelin/contracts/governance/extensions/GovernorProposalThreshold.sol',
    });
    c.addOverride('GovernorProposalThreshold', functions.proposalThreshold);
    c.addOverride('GovernorProposalThreshold', functions.propose);
  }

  if (nonZeroThreshold || opts.bravo) {
    c.setFunctionBody([`return ${threshold}e${opts.decimals};`], functions.proposalThreshold);
  }
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

export const numberPattern = /^(?!$)(\d*)(?:\.(\d+))?(?:e(\d+))?$/;

function addQuorum(c: ContractBuilder, opts: Required<GovernorOptions>) {
  if (opts.quorumMode === 'percent') {
    if (opts.votes !== 'erc20votes') {
      throw new OptionsError({
        quorumPercent: 'Percent-based quorum is only available for ERC20Votes',
      });
    }

    if (opts.quorumPercent > 100) {
      throw new OptionsError({
        quorumPercent: 'Invalid percentage',
      });
    }

    c.addParent({
      name: 'GovernorVotesQuorumFraction',
      path: '@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol',
    }, [opts.quorumPercent]);
    c.addOverride('GovernorVotesQuorumFraction', functions.quorum);
  }

  else if (opts.quorumMode === 'absolute') {
    if (!numberPattern.test(opts.quorumAbsolute)) {
      throw new OptionsError({
        quorumAbsolute: 'Not a valid number',
      });
    }

    c.setFunctionBody([
      `return ${opts.quorumAbsolute}e${opts.decimals};`,
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
      throw new OptionsError({
        timelock: 'GovernorBravo compatibility requires a timelock',
      });
    }

    c.addParent({
      name: 'GovernorCompatibilityBravo',
      path: '@openzeppelin/contracts/governance/compatibility/GovernorCompatibilityBravo.sol',
    });
    c.addOverride('IGovernor', functions.state);
    c.addOverride('GovernorCompatibilityBravo', functions.propose);
    c.addOverride('GovernorCompatibilityBravo', functions.proposalThreshold);
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
