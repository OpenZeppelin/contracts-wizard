# OpenZeppelin Contracts Wizard for Solidity

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
- `general`

Each contract type has a `print` function and a `defaults` constant as defined below.

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
function print(opts?: GeneralOptions): string
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
const defaults: Required<GeneralOptions>
```
The default options that are used for [`print`](#print).

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