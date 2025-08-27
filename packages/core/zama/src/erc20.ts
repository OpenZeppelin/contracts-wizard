import { ContractBuilder } from './contract';
import { defineFunctions } from './utils/define-functions';
import type { CommonOptions } from './common-options';
import { withCommonDefaults, defaults as commonDefaults } from './common-options';
import { setInfo } from './set-info';
import { printContract } from './print';
import type { ClockMode } from './set-clock-mode';
import { clockModeDefault, setClockMode } from './set-clock-mode';
import { OptionsError } from './error';
import { toUint256, UINT256_MAX } from './utils/convert-strings';

export const crossChainBridgingOptions = [false, 'custom', 'superchain'] as const;
export type CrossChainBridging = (typeof crossChainBridgingOptions)[number];

export interface ERC20Options extends CommonOptions {
  name: string;
  symbol: string;
  premint?: string;
  mintable?: boolean;
  /**
   * Whether to keep track of historical balances for voting in on-chain governance, and optionally specify the clock mode.
   * Setting `true` is equivalent to 'blocknumber'. Setting a clock mode implies voting is enabled.
   */
  votes?: boolean | ClockMode;
}

export const defaults: Required<ERC20Options> = {
  name: 'MyToken',
  symbol: 'MTK',
  premint: '0',
  mintable: false,
  votes: false,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info,
} as const;

export function withDefaults(opts: ERC20Options): Required<ERC20Options> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    premint: opts.premint || defaults.premint,
    mintable: opts.mintable ?? defaults.mintable,
    votes: opts.votes ?? defaults.votes,
  };
}

export function printERC20(opts: ERC20Options = defaults): string {
  return printContract(buildERC20(opts));
}

export function buildERC20(opts: ERC20Options): ContractBuilder {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  const { info } = allOpts;

  addBase(c, allOpts.name, allOpts.symbol);

  if (allOpts.premint) {
    addPremint(c, allOpts.premint);
  }

  // if (allOpts.mintable) {
  //   addMintable(c);
  // }

  if (allOpts.votes) {
    const clockMode = allOpts.votes === true ? clockModeDefault : allOpts.votes;
    addVotes(c, clockMode);
  }

  setInfo(c, info);

  return c;
}

function addBase(c: ContractBuilder, name: string, symbol: string) {
  const ERC20 = {
    name: 'ERC20',
    path: '@openzeppelin/contracts/token/ERC20/ERC20.sol',
  };
  c.addParent(ERC20, [name, symbol]);

  c.addOverride(ERC20, functions._update);
}

export const premintPattern = /^(\d*)(?:\.(\d+))?(?:e(\d+))?$/;

function scaleByPowerOfTen(base: bigint, exponent: number): bigint {
  if (exponent < 0) {
    return base / BigInt(10) ** BigInt(-exponent);
  } else {
    return base * BigInt(10) ** BigInt(exponent);
  }
}

function addPremint(
  c: ContractBuilder,
  amount: string,
) {
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

      const mintLine = `_mint(recipient, ${units} * 10 ** ${exp});`;

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

// function addMintable(c: ContractBuilder) { // TODO change to wrappable
//   c.addFunctionCode('_mint(to, amount);', functions.mint);
// }

function addVotes(c: ContractBuilder, clockMode: ClockMode) {
  const ConfidentialFungibleTokenVotes = {
    name: 'ConfidentialFungibleTokenVotes',
    path: '@openzeppelin/confidential-contracts/token/extensions/ConfidentialFungibleTokenVotes.sol',
  };
  c.addParent(ConfidentialFungibleTokenVotes);
  c.addOverride(ConfidentialFungibleTokenVotes, functions._update);

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
  },

});
