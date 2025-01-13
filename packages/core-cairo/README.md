# OpenZeppelin Contracts Wizard for Cairo

[![NPM Package](https://img.shields.io/npm/v/@openzeppelin/wizard-cairo?color=%23e55233)](https://www.npmjs.com/package/@openzeppelin/wizard-cairo)

Interactively build a contract out of components from OpenZeppelin Contracts for Cairo. Provide parameters and desired features for the kind of contract that you want, and the Wizard will generate all of the code necessary. The resulting code is ready to be compiled and deployed, or it can serve as a starting point and customized further with application specific logic.

This package provides a programmatic API. For a web interface, see https://wizard.openzeppelin.com/cairo

### Installation

`npm install @openzeppelin/wizard-cairo`

### Contract types

The following contract types are supported:
- `erc20`
- `erc721`
- `erc1155`
- `account`
- `governor`
- `vesting`
- `custom`

Each contract type has functions/constants as defined below.

### Functions

#### `print`
```js
function print(opts?: ERC20Options): string
```
```js
function print(opts?: ERC721Options): string
```
```js
function print(opts?: ERC1155Options): string
```
```js
function print(opts?: AccountOptions): string
```
```js
function print(opts?: GovernorOptions): string
```
```js
function print(opts?: VestingOptions): string
```
```js
function print(opts?: CustomOptions): string
```
Returns a string representation of a contract generated using the provided options. If `opts` is not provided, uses [`defaults`](#defaults).

#### `defaults`
```js
const defaults: Required<ERC20Options>
```
```js
const defaults: Required<ERC721Options>
```
```js
const defaults: Required<ERC1155Options>
```
```js
const defaults: Required<AccountOptions>
```
```js
const defaults: Required<GovernorOptions>
```
```js
const defaults: Required<VestingOptions>
```
```js
const defaults: Required<CustomOptions>
```
The default options that are used for [`print`](#print).

#### `isAccessControlRequired`
```js
function isAccessControlRequired(opts: Partial<ERC20Options>): boolean
```
```js
function isAccessControlRequired(opts: Partial<ERC721Options>): boolean
```
```js
function isAccessControlRequired(opts: Partial<ERC1155Options>): boolean
```
```js
function isAccessControlRequired(opts: Partial<CustomOptions>): boolean
```
Whether any of the provided options require access control to be enabled. If this returns `true`, then calling `print` with the same options would cause the `access` option to default to `'ownable'` if it was `undefined` or `false`. 

> Note that contracts such as `account`, `governor`, and `vesting` have their own ways of handling permissions and do not support the `access` option.
Thus, those types do not include `isAccessControlRequired`.

### Contract specific functions

#### `erc20.getInitialSupply`

Calculates the initial supply that would be used in an ERC20 contract based on a given premint amount and number of decimals.

- `premint` Premint amount in token units, may be fractional
- `decimals` The number of decimals in the token

Returns `premint` with zeros padded or removed based on `decimals`.
Throws an error if `premint` has more than one decimal character or is more precise than allowed by the `decimals` argument.

### Examples

Import the contract type(s) or function categories (for example, `erc20` or `utils`) that you want to use from the `@openzeppelin/wizard-cairo` package:

```js
import { erc20 } from '@openzeppelin/wizard-cairo';
```

To generate the source code for an ERC20 contract with all of the default settings:
```js
const contract = erc20.print();
```

To generate the source code for an ERC20 contract with a custom name and symbol, along with some custom settings:
```js
const contract = erc20.print({
  name: 'ExampleToken',
  symbol: 'ETK',
  burnable: true,
  premint: '1000000',
});
```

To generate the source code for an ERC20 contract with all of the defaults but is upgradeable:
```js
const contract = erc20.print({
  ...erc20.defaults,
  upgradeable: true,
});
```
