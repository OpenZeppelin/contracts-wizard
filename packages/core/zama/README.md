# OpenZeppelin Contracts Wizard for Zama

[![NPM Package](https://img.shields.io/npm/v/@openzeppelin/wizard-zama?color=%234e5de4)](https://www.npmjs.com/package/@openzeppelin/wizard-zama)

Interactively build a contract out of components from OpenZeppelin Confidential Contracts. Provide parameters and desired features for the kind of contract that you want, and the Wizard will generate all of the code necessary. The resulting code is ready to be compiled and deployed, or it can serve as a starting point and customized further with application specific logic.

This package provides a programmatic API. For a web interface, see https://wizard.openzeppelin.com

### Installation

`npm install @openzeppelin/wizard-zama`

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

### Examples

Import the contract type(s) that you want to use from the `@openzeppelin/wizard-zama` package:

```js
import { erc20 } from '@openzeppelin/wizard-zama';
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
