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
- `stablecoin`
- `realWorldAsset`
- `account`
- `governor`
- `custom`

Note that `stablecoin` and `realWorldAsset` are experimental and may be subject to change.

### Functions

Each contract type implements a common API with methods that take contract-specific options (e.g., `ERC20Options` for `erc20`, `ERC721Options` for `erc721`, etc.). This ensures type safety and allows for contract-specific features.

#### `print`
```js
function print(opts?: Options): string
```
Returns a string representation of a contract generated using the provided options. If `opts` is not provided, uses [`defaults`](#defaults).

#### `getVersionedRemappings`
```js
function getVersionedRemappings(opts?: Options): string[]
```
Returns an array of remappings that map unversioned import prefixes to versioned import prefixes. For example:
```js
[
  "@openzeppelin/contracts/=@openzeppelin/contracts@5.5.0/",
  "@openzeppelin/contracts-upgradeable/=@openzeppelin/contracts-upgradeable@5.5.0/"
]
```
If the contract options include upgradeability, the upgradeable remapping is included. If `opts` is not provided, uses [`defaults`](#defaults).

#### `defaults`
```js
const defaults: Required<Options>
```
The default options that are used for [`print`](#print) and [`getVersionedRemappings`](#getVersionedRemappings).

#### `isAccessControlRequired`
```js
function isAccessControlRequired(opts: Partial<Options>): boolean
```
Whether any of the provided options require access control to be enabled. If this returns `true`, then calling `print` with the same options would cause the `access` option to default to `'ownable'` if it was `undefined` or `false`.

> Note that contracts such as `account` have their own way of handling permissions and do not support the `access` option. Thus, that type does not include `isAccessControlRequired`.

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
