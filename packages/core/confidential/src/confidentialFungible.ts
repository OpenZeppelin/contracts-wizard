import { ContractBuilder } from '@openzeppelin/wizard/src/contract';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';
import type { CommonOptions } from './common-options';
import { withCommonDefaults, defaults as commonDefaults } from '@openzeppelin/wizard/src/common-options';
import { setInfo } from '@openzeppelin/wizard/src/set-info';
import { printContract } from './print';
import type { ClockMode } from '@openzeppelin/wizard/src/set-clock-mode';
import { clockModeDefault, setClockMode } from '@openzeppelin/wizard/src/set-clock-mode';
import { OptionsError } from '@openzeppelin/wizard/src/error';
import { toUint256, UINT256_MAX } from '@openzeppelin/wizard/src/utils/convert-strings';
import { requireAccessControl } from '@openzeppelin/wizard/src/set-access-control';

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
   * Setting `true` is equivalent to 'blocknumber'. Setting a clock mode implies voting is enabled.
   */
  votes?: boolean | ClockMode;
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
    const clockMode = allOpts.votes === true ? clockModeDefault : allOpts.votes;
    addVotes(c, allOpts.name, clockMode);
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
  if (network === 'zama-sepolia') {
    c.addParent({
      name: 'SepoliaConfig',
      path: '@fhevm/solidity/config/ZamaConfig.sol',
    });
  } else if (network === 'zama-ethereum') {
    c.addParent({
      name: 'EthereumConfig',
      path: '@fhevm/solidity/config/ZamaConfig.sol',
    });
  }
}

export const premintPattern = /^(\d*)(?:\.(\d+))?(?:e(\d+))?$/;

function scaleByPowerOfTen(base: bigint, exponent: number): bigint {
  if (exponent < 0) {
    return base / BigInt(10) ** BigInt(-exponent);
  } else {
    return base * BigInt(10) ** BigInt(exponent);
  }
}

function addPremint(c: ContractBuilder, amount: string) {
  const m = amount.match(premintPattern);
  if (m) {
    const integer = m[1]?.replace(/^0+/, '') ?? '';
    const decimals = m[2]?.replace(/0+$/, '') ?? '';
    const exponent = Number(m[3] ?? 0);

    if (Number(integer + decimals) > 0) {
      const decimalPlace = decimals.length - exponent;
      const zeroes = new Array(Math.max(0, -decimalPlace)).fill('0').join('');
      const units = integer + decimals + zeroes;
      const exp = decimalPlace <= 0 ? 'decimals()' : `(decimals() - ${decimalPlace})`;

      const validatedBaseUnits = toUint256(units, 'premint');
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
  } else {
    throw new OptionsError({
      premint: 'Not a valid number',
    });
  }
}

/**
 * Check for potential premint overflow assuming the user's contract has decimals() = 18
 *
 * @param baseUnits The base units of the token, before applying power of 10
 * @param decimalPlace If positive, the number of assumed decimal places in the least significant digits of `validatedBaseUnits`. Ignored if <= 0.
 * @throws OptionsError if the calculated value would overflow uint256
 */
function checkPotentialPremintOverflow(baseUnits: bigint, decimalPlace: number) {
  const assumedExp = decimalPlace <= 0 ? 18 : 18 - decimalPlace;
  const calculatedValue = scaleByPowerOfTen(baseUnits, assumedExp);

  if (calculatedValue > UINT256_MAX) {
    throw new OptionsError({
      premint: 'Amount would overflow uint256 after applying decimals',
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
