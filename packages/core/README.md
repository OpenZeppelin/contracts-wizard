# OpenZeppelin Contracts Wizard for Solidity

[![NPM Package](https://img.shields.io/npm/v/@openzeppelin/wizard?color=%234e5de4)](https://www.npmjs.com/package/@openzeppelin/wizard)

Interactively build a contract out of components from OpenZeppelin Contracts. Provide parameters and desired features for the kind of contract that you want, and the Wizard will generate all of the code necessary. The resulting code is ready to be compiled and deployed, or it can serve as a starting point and customized further with application specific logic.

This package provides a programmatic API. For a web interface, see https://wizard.openzeppelin.com

### Installation

`npm install @openzeppelin/wizard`

### Contract types

The following contract types are supported:
- `erc20`
- `erc721`
- `erc1155`
- `governor`
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
function print(opts?: GovernorOptions): string
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
const defaults: Required<GovernorOptions>
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
function isAccessControlRequired(opts: Partial<GovernorOptions>): boolean
```
```js
function isAccessControlRequired(opts: Partial<CustomOptions>): boolean
```
Whether any of the provided options require access control to be enabled. If this returns `true`, then calling `print` with the same options would cause the `access` option to default to `'ownable'` if it was `undefined` or `false`. 

### Examples

Import the contract type(s) that you want to use from the `@openzeppelin/wizard` package:

```js
import { erc20 } from '@openzeppelin/wizard';
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

To generate the source code for an ERC20 contract with all of the defaults but is upgradeable using the UUPS proxy pattern:
```js
const contract = erc20.print({
  ...erc20.defaults,
  upgradeable: 'uups',
});
```