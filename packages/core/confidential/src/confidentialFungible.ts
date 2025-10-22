import {
  ContractBuilder,
  defineFunctions,
  withCommonDefaults,
  commonDefaults,
  setInfo,
  setClockMode,
  OptionsError,
  toBigInt,
  requireAccessControl,
  calculateERC20Premint,
  scaleByPowerOfTen,
  type ClockMode,
} from '@openzeppelin/wizard';
import type { CommonOptions } from './common-options';
import { printContract } from './print';

export const networkConfigOptions = ['zama-sepolia', 'zama-ethereum'] as const;
export type NetworkConfig = (typeof networkConfigOptions)[number];

export interface ConfidentialFungibleOptions extends CommonOptions {
  name: string;
  symbol: string;
  tokenURI: string;
  networkConfig: NetworkConfig;
  premint?: string;
  wrappable?: boolean;
  /**
   * Whether to keep track of historical balances for voting in on-chain governance, and optionally specify the clock mode.
   * Setting a clock mode implies voting is enabled.
   */
  votes?: false | ClockMode;
}

export const defaults: Required<ConfidentialFungibleOptions> = {
  name: 'MyToken',
  symbol: 'MTK',
  tokenURI: '',
  networkConfig: 'zama-sepolia',
  premint: '0',
  wrappable: false,
  votes: false,
  info: commonDefaults.info,
} as const;

export function withDefaults(opts: ConfidentialFungibleOptions): Required<ConfidentialFungibleOptions> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    premint: opts.premint || defaults.premint,
    wrappable: opts.wrappable ?? defaults.wrappable,
    votes: opts.votes ?? defaults.votes,
  };
}

export function printConfidentialFungible(opts: ConfidentialFungibleOptions = defaults): string {
  return printContract(buildConfidentialFungible(opts));
}

export function buildConfidentialFungible(opts: ConfidentialFungibleOptions): ContractBuilder {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  const { info } = allOpts;

  addBase(c, allOpts.name, allOpts.symbol, allOpts.tokenURI);
  addNetworkConfig(c, allOpts.networkConfig);

  if (allOpts.premint) {
    addPremint(c, allOpts.premint);
  }

  if (allOpts.wrappable) {
    addWrappable(c);
  }

  if (allOpts.votes) {
    addVotes(c, allOpts.name, allOpts.votes);
  }

  setInfo(c, info);

  return c;
}

function addBase(c: ContractBuilder, name: string, symbol: string, tokenURI: string) {
  const ConfidentialFungibleToken = {
    name: 'ConfidentialFungibleToken',
    path: '@openzeppelin/confidential-contracts/token/ConfidentialFungibleToken.sol',
  };
  c.addParent(ConfidentialFungibleToken, [name, symbol, tokenURI]);

  c.addImportOnly({
    name: 'euint64',
    path: '@fhevm/solidity/lib/FHE.sol',
  });
  c.addOverride(ConfidentialFungibleToken, functions._update);
  c.addOverride(ConfidentialFungibleToken, functions.confidentialTotalSupply);
  c.addOverride(ConfidentialFungibleToken, functions.decimals);
}

function addNetworkConfig(c: ContractBuilder, network: NetworkConfig) {
  switch (network) {
    case 'zama-sepolia':
      c.addParent({
        name: 'SepoliaConfig',
        path: '@fhevm/solidity/config/ZamaConfig.sol',
      });
      break;
    case 'zama-ethereum':
      c.addParent({
        name: 'EthereumConfig',
        path: '@fhevm/solidity/config/ZamaConfig.sol',
      });
      break;
    default:
      const _: never = network;
      throw new Error(`Unknown network config: ${network}`);
  }
}

export const premintPattern = /^(\d*)(?:\.(\d+))?(?:e(\d+))?$/;

const UINT64_MAX = BigInt(2) ** BigInt(64) - BigInt(1);

export function validateUint64(numValue: bigint, field: string): bigint {
  if (numValue > UINT64_MAX) {
    throw new OptionsError({
      [field]: 'Value is greater than uint64 max value',
    });
  }
  return numValue;
}

function addPremint(c: ContractBuilder, amount: string) {
  const premintCalculation = calculateERC20Premint(amount);
  if (premintCalculation === undefined) {
    return;
  }

  const { units, exp, decimalPlace } = premintCalculation;

  const validatedBaseUnits = validateUint64(toBigInt(units, 'premint'), 'premint');
  checkPotentialPremintOverflow(validatedBaseUnits, decimalPlace);

  c.addConstructorArgument({ type: 'address', name: 'recipient' });

  c.addImportOnly({
    name: 'SafeCast',
    path: '@openzeppelin/contracts/utils/math/SafeCast.sol',
  });
  c.addImportOnly({
    name: 'FHE',
    path: '@fhevm/solidity/lib/FHE.sol',
  });
  const mintLine = `_mint(recipient, FHE.asEuint64(SafeCast.toUint64(${units} * 10 ** ${exp})));`;

  c.addConstructorCode(mintLine);
}

/**
 * Check for potential premint overflow assuming the user's contract has decimals() = 6
 *
 * @param baseUnits The base units of the token, before applying power of 10
 * @param decimalPlace If positive, the number of assumed decimal places in the least significant digits of `validatedBaseUnits`. Ignored if <= 0.
 * @throws OptionsError if the calculated value would overflow uint64
 */
function checkPotentialPremintOverflow(baseUnits: bigint, decimalPlace: number) {
  const assumedExp = decimalPlace <= 0 ? 6 : 6 - decimalPlace;
  const calculatedValue = scaleByPowerOfTen(baseUnits, assumedExp);

  if (calculatedValue > UINT64_MAX) {
    throw new OptionsError({
      premint: 'Amount would overflow uint64 after applying decimals, assuming 6 decimals',
    });
  }
}

function addWrappable(c: ContractBuilder) {
  const underlyingArg = 'underlying';

  c.addImportOnly({
    name: 'IERC20',
    path: '@openzeppelin/contracts/interfaces/IERC20.sol',
  });
  c.addConstructorArgument({
    type: 'IERC20',
    name: underlyingArg,
  });

  const ConfidentialFungibleTokenERC20Wrapper = {
    name: 'ConfidentialFungibleTokenERC20Wrapper',
    path: '@openzeppelin/confidential-contracts/token/extensions/ConfidentialFungibleTokenERC20Wrapper.sol',
  };
  c.addParent(ConfidentialFungibleTokenERC20Wrapper, [{ lit: underlyingArg }]);
  c.addOverride(ConfidentialFungibleTokenERC20Wrapper, functions.decimals);
}

function addVotes(c: ContractBuilder, name: string, clockMode: ClockMode) {
  const EIP712 = {
    name: 'EIP712',
    path: '@openzeppelin/contracts/utils/cryptography/EIP712.sol',
  };
  c.addParent(EIP712, [name, '1']);

  const ConfidentialFungibleTokenVotes = {
    name: 'ConfidentialFungibleTokenVotes',
    path: '@openzeppelin/confidential-contracts/token/extensions/ConfidentialFungibleTokenVotes.sol',
  };
  c.addParent(ConfidentialFungibleTokenVotes);
  c.addOverride(ConfidentialFungibleTokenVotes, functions._update);
  c.addOverride(ConfidentialFungibleTokenVotes, functions.confidentialTotalSupply);

  c.addModifier('override', functions._validateHandleAllowance);
  requireAccessControl(c, functions._validateHandleAllowance, 'roles', 'HANDLE_VIEWER', 'handleViewer');

  setClockMode(c, ConfidentialFungibleTokenVotes, clockMode);
}

export const functions = defineFunctions({
  _update: {
    kind: 'internal' as const,
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'euint64' },
    ],
    returns: ['euint64 transferred'],
  },
  confidentialTotalSupply: {
    kind: 'public' as const,
    mutability: 'view',
    args: [],
    returns: ['euint64'],
  },
  _validateHandleAllowance: {
    kind: 'internal' as const,
    mutability: 'view' as const,
    args: [{ name: 'handle', type: 'bytes32' }],
  },
  decimals: {
    kind: 'public' as const,
    mutability: 'view',
    args: [],
    returns: ['uint8'],
  },
});
