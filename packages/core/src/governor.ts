import { supportsInterface } from "./common-functions";
import { CommonOptions, withCommonDefaults } from "./common-options";
import { ContractBuilder, Contract } from "./contract";
import { OptionsError } from "./error";
import { printValue } from "./print";
import { setInfo } from "./set-info";
import { setUpgradeable } from "./set-upgradeable";
import { defineFunctions } from './utils/define-functions';
import { durationToBlocks } from "./utils/duration";

export const defaults = {
  votes: 'erc20votes',
  timelock: 'openzeppelin',
  blockTime: 13.2,
  decimals: 18,
  quorumMode: 'percent',
  quorumPercent: 4,
  bravo: false,
  settings: true,
} as const;

export const votesOptions = ['erc20votes', 'erc721votes', 'comp'] as const;
export type VotesOptions = typeof votesOptions[number];

export const timelockOptions = [false, 'openzeppelin', 'compound'] as const;
export type TimelockOptions = typeof timelockOptions[number];

export interface GovernorOptions extends CommonOptions {
  name: string;
  delay: string;
  period: string;
  blockTime?: number;
  proposalThreshold?: string;
  decimals?: number;
  quorumMode: 'percent' | 'absolute';
  quorumPercent?: number;
  quorumAbsolute?: string;
  votes: VotesOptions;
  timelock: TimelockOptions;
  bravo?: boolean;
  settings?: boolean;
}

function withDefaults(opts: GovernorOptions): Required<GovernorOptions> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    decimals: opts.decimals ?? defaults.decimals,
    blockTime: opts.blockTime || defaults.blockTime,
    quorumPercent: opts.quorumPercent ?? defaults.quorumPercent,
    quorumAbsolute: opts.quorumAbsolute ?? '',
    proposalThreshold: opts.proposalThreshold || '0',
    settings: opts.settings ?? defaults.settings,
    bravo: opts.bravo ?? defaults.bravo,
  };
}

export function buildGovernor(opts: GovernorOptions): Contract {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  validateDecimals(allOpts.decimals);

  addBase(c, allOpts);
  addSettings(c, allOpts);
  addCounting(c, allOpts);
  addBravo(c, allOpts);
  addVotes(c, allOpts);
  addQuorum(c, allOpts);
  addTimelock(c, allOpts);

  setUpgradeable(c, allOpts.upgradeable, allOpts.access);

  setInfo(c, allOpts.info);

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
  c.addOverride('Governor', functions.state);
  c.addOverride('Governor', functions.propose);
  c.addOverride('Governor', functions.proposalThreshold);
  c.addOverride('Governor', functions._execute);
  c.addOverride('Governor', functions._cancel);
  c.addOverride('Governor', functions._executor);
  c.addOverride('Governor', supportsInterface);
}

function addSettings(c: ContractBuilder, allOpts: Required<GovernorOptions>) {
  if (allOpts.settings) {
    c.addParent(
      {
        name: 'GovernorSettings',
        path: '@openzeppelin/contracts/governance/extensions/GovernorSettings.sol',
      },
      [
        { value: getVotingDelay(allOpts), note: allOpts.delay },
        { value: getVotingPeriod(allOpts), note: allOpts.period },
        { lit: getProposalThreshold(allOpts) },
      ],
    );
    c.addOverride('GovernorSettings', functions.votingDelay, 'view');
    c.addOverride('GovernorSettings', functions.votingPeriod, 'view');
    c.addOverride('GovernorSettings', functions.proposalThreshold, 'view');
  } else {
    setVotingParameters(c, allOpts);
    setProposalThreshold(c, allOpts);
  }
}

function getVotingDelay(opts: Required<GovernorOptions>): number {
  try {
    return durationToBlocks(opts.delay, opts.blockTime);
  } catch (e) {
    if (e instanceof Error) {
      throw new OptionsError({
        delay: e.message,
      });
    } else {
      throw e;
    }
  }
}

function getVotingPeriod(opts: Required<GovernorOptions>): number {
  try {
    return durationToBlocks(opts.period, opts.blockTime);
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

function validateDecimals(decimals: number) {
  if (!/^\d+$/.test(decimals.toString())) {
    throw new OptionsError({
      decimals: 'Not a valid number',
    });
  }
}

function getProposalThreshold({ proposalThreshold, decimals, votes }: Required<GovernorOptions>): string {
  if (!/^\d+$/.test(proposalThreshold)) {
    throw new OptionsError({
      proposalThreshold: 'Not a valid number',
    });
  }

  if (/^0+$/.test(proposalThreshold) || decimals === 0 || votes === 'erc721votes') {
    return proposalThreshold;
  } else {
    return `${proposalThreshold}e${decimals}`;
  }
}

function setVotingParameters(c: ContractBuilder, opts: Required<GovernorOptions>) {
  const delayBlocks = getVotingDelay(opts);
  c.setFunctionBody([`return ${delayBlocks}; // ${opts.delay}`], functions.votingDelay);

  const periodBlocks = getVotingPeriod(opts);
  c.setFunctionBody([`return ${periodBlocks}; // ${opts.period}`], functions.votingPeriod);
}

function setProposalThreshold(c: ContractBuilder, opts: Required<GovernorOptions>) {
  const threshold = getProposalThreshold(opts);
  const nonZeroThreshold = parseInt(threshold) !== 0;

  if (nonZeroThreshold) {
    c.setFunctionBody([`return ${threshold};`], functions.proposalThreshold);
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
    tokenType: 'IVotes',
    parentName: 'GovernorVotes',
  },
  erc721votes: {
    tokenType: 'IVotes',
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
  }, [{ lit: tokenArg }]);
}

export const numberPattern = /^(?!$)(\d*)(?:\.(\d+))?(?:e(\d+))?$/;

function addQuorum(c: ContractBuilder, opts: Required<GovernorOptions>) {
  if (opts.quorumMode === 'percent') {
    if (opts.votes !== 'erc20votes' && opts.votes !== 'erc721votes') {
      throw new OptionsError({
        quorumPercent: 'Percent-based quorum is only available for ERC20Votes or ERC721Votes',
      });
    }

    if (opts.quorumPercent > 100) {
      throw new OptionsError({
        quorumPercent: 'Invalid percentage',
      });
    }

    let { quorumFractionNumerator, quorumFractionDenominator } = getQuorumFractionComponents(opts.quorumPercent);

    if (quorumFractionDenominator !== undefined) {
      c.addOverride('GovernorVotesQuorumFraction', functions.quorumDenominator);
      c.setFunctionBody([
        `return ${quorumFractionDenominator};`
      ], functions.quorumDenominator, 'pure');
    }

    c.addParent({
      name: 'GovernorVotesQuorumFraction',
      path: '@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol',
    }, [quorumFractionNumerator]);
    c.addOverride('GovernorVotesQuorumFraction', functions.quorum);
  }

  else if (opts.quorumMode === 'absolute') {
    if (!numberPattern.test(opts.quorumAbsolute)) {
      throw new OptionsError({
        quorumAbsolute: 'Not a valid number',
      });
    }

    let returnStatement = (opts.decimals === 0 || opts.votes === 'erc721votes') ? 
      `return ${opts.quorumAbsolute};` :
      `return ${opts.quorumAbsolute}e${opts.decimals};`;

    c.setFunctionBody([
      returnStatement,
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

function getQuorumFractionComponents(quorumPercent: number): {quorumFractionNumerator: number, quorumFractionDenominator: string | undefined} {
  let quorumFractionNumerator = quorumPercent;
  let quorumFractionDenominator = undefined;

  const quorumPercentSegments = quorumPercent.toString().split(".");
  if (quorumPercentSegments.length > 2) {
    throw new OptionsError({
      quorumPercent: 'Invalid percentage',
    });
  } else if (quorumPercentSegments.length == 2 && quorumPercentSegments[0] !== undefined && quorumPercentSegments[1] !== undefined) {
    quorumFractionNumerator = parseInt(quorumPercentSegments[0].concat(quorumPercentSegments[1]));
    const decimals = quorumPercentSegments[1].length;
    quorumFractionDenominator = '100';
    while (quorumFractionDenominator.length < decimals + 3) {
      quorumFractionDenominator += '0';
    }
  }
  return { quorumFractionNumerator, quorumFractionDenominator };
}

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
  }, [{ lit: timelockArg }]);
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
  quorumDenominator: {
    args: [],
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
