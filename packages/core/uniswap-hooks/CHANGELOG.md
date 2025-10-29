# OpenZeppelin Contracts Wizard for Uniswap Hooks

[![NPM Package](https://img.shields.io/npm/v/@openzeppelin/wizard-uniswap-hooks?color=%234e5de4)](https://www.npmjs.com/package/@openzeppelin/wizard-uniswap-hooks)

Interactively build a [Uniswap v4 Hook](https://docs.uniswap.org/contracts/v4/concepts/hooks) contract out of components from [OpenZeppelin Uniswap Hooks](https://github.com/OpenZeppelin/uniswap-hooks) and [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts). Provide parameters and desired features for the hook template that you want, and the Wizard will generate all of the necessary code. The resulting code is ready to be compiled and deployed, or it can serve as a starting point and customized further with application specific logic.

This package provides a programmatic API. For a web interface, see https://wizard.openzeppelin.com

### Installation

`npm install @openzeppelin/wizard-uniswap-hooks`

### Hook templates

The following hook templates are supported:
- `BaseHook` - Provides standard entry points, permission checks, and validation utilities for building hooks
- `BaseAsyncSwap` - Enables asynchronous swap execution with separate fulfillment
- `BaseCustomAccounting` - Allows custom liquidity accounting and shares management
- `BaseCustomCurve` - Enables custom pricing curves and swap calculations
- `BaseDynamicFee` - Provides dynamic fee calculation based on pool conditions
- `BaseOverrideFee` - Allows overriding the pool's swap fee
- `BaseDynamicAfterFee` - Implements dynamic fees with post-swap adjustments
- `BaseHookFee` - Enables hooks to collect fees on swaps
- `AntiSandwichHook` - Protects against sandwich attacks with penalty fees
- `LimitOrderHook` - Implements limit order functionality
- `LiquidityPenaltyHook` - Applies penalties to early liquidity removals
- `ReHypothecationHook` - Enables yield generation from deposited liquidity

### Examples

Import the hooks API from the `@openzeppelin/wizard-uniswap-hooks` package:

```js
import { hooks } from '@openzeppelin/wizard-uniswap-hooks';
```

To generate the source code for a basic hook with all of the default settings:
```js
const contract = hooks.print();
```

To generate the source code for a hook with a custom name and specific hook type:
```js
const contract = hooks.print({
  name: 'MyDynamicFeeHook',
  hook: 'BaseDynamicFee',
});
```

To generate the source code for a hook with pausability and access control:
```js
const contract = hooks.print({
  name: 'MyPausableHook',
  hook: 'BaseHook',
  pausable: true,
  access: 'ownable',
});
```

To generate the source code for a custom accounting hook with ERC20 shares:
```js
const contract = hooks.print({
  name: 'MyLiquidityHook',
  hook: 'BaseCustomAccounting',
  shares: {
    options: 'ERC20',
    name: 'My Liquidity Shares',
    symbol: 'MLS',
  },
});
```

To generate the source code for a hook with specific permissions:
```js
const contract = hooks.print({
  name: 'MySwapHook',
  hook: 'BaseHook',
  permissions: {
    beforeSwap: true,
    afterSwap: true,
    beforeInitialize: false,
    afterInitialize: false,
    beforeAddLiquidity: false,
    beforeRemoveLiquidity: false,
    afterAddLiquidity: false,
    afterRemoveLiquidity: false,
    beforeDonate: false,
    afterDonate: false,
    beforeSwapReturnDelta: false,
    afterSwapReturnDelta: false,
    afterAddLiquidityReturnDelta: false,
    afterRemoveLiquidityReturnDelta: false,
  },
});
```

To generate the source code for a hook with utility libraries:
```js
const contract = hooks.print({
  name: 'MyAdvancedHook',
  hook: 'BaseHook',
  currencySettler: true,  // Includes CurrencySettler library
  safeCast: true,         // Includes SafeCast library
  transientStorage: true, // Includes TransientSlot and SlotDerivation libraries
});
```

### Options Reference

The `HooksOptions` interface supports the following properties:

- **`hook`** (`HookName`): The base hook template to extend. Default: `'BaseHook'`
- **`name`** (`string`): The name of the hook contract. Default: `'MyHook'`
- **`pausable`** (`boolean`): Whether to include emergency pause functionality. Default: `false`
- **`access`** (`'ownable' | 'roles' | 'managed' | false`): Access control mechanism. Default: `false`
- **`currencySettler`** (`boolean`): Include CurrencySettler library for currency operations. Default: `false`
- **`safeCast`** (`boolean`): Include SafeCast library for safe type casting. Default: `false`
- **`transientStorage`** (`boolean`): Include transient storage utilities. Default: `false`
- **`shares`** (`Shares`): Configuration for token shares. Default: `{ options: false }`
  - **`options`** (`false | 'ERC20' | 'ERC6909' | 'ERC1155'`): The token standard to use for shares
  - **`name`** (`string`, optional): Token name (for ERC20)
  - **`symbol`** (`string`, optional): Token symbol (for ERC20)
  - **`uri`** (`string`, optional): Token URI (for ERC1155)
- **`permissions`** (`Permissions`): Hook lifecycle permissions bitmap with 14 different permissions. Default: all `false`
- **`inputs`** (`object`): Hook-specific configuration inputs. Default: `{ blockNumberOffset: 10 }`
- **`info`** (`Info`, optional): Contract metadata (license, security contact)

> Note: Upgradeability is not yet available for Uniswap v4 Hooks.
