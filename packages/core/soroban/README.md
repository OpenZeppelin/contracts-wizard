# OpenZeppelin Contracts Wizard for Soroban

Interactively build a contract out of components from OpenZeppelin Soroban Contracts. Provide parameters and desired features for the kind of contract that you want, and the Wizard will generate all of the code necessary. The resulting code is ready to be compiled and deployed, or it can serve as a starting point and customized further with application specific logic.

This package provides a programmatic API. For a web interface, see https://wizard.openzeppelin.com/soroban

### Installation

`npm install @openzeppelin/wizard-soroban`

### Contract types

The following contract types are supported:
- `erc20`

Each contract type has functions/constants as defined below.

### Functions

#### `print`
```js
function print(opts?: ERC20Options): string
```
Returns a string representation of a contract generated using the provided options. If `opts` is not provided, uses [`defaults`](#defaults).

#### `defaults`
```js
const defaults: Required<ERC20Options>
```
The default options that are used for [`print`](#print).

#### `isAccessControlRequired`
```js
function isAccessControlRequired(opts: Partial<ERC20Options>): boolean
```
Whether any of the provided options require access control to be enabled. If this returns `true`, then calling `print` with the same options would cause the `access` option to default to `'ownable'` if it was `undefined` or `false`.

### Examples

Import the contract type(s) (for example, `erc20`) that you want to use from the `@openzeppelin/wizard-soroban` package:

```js
import { erc20 } from '@openzeppelin/wizard-soroban';
```

To generate the source code for an ERC20 contract with all of the default settings:
```js
const contract = erc20.print();
```

To generate the source code for an ERC20 contract with some custom settings:
```js
const contract = erc20.print({
  pausable: true,
});
```
or
```js
const contract = erc20.print({
  ...erc20.defaults,
  pausable: true,
});
```
