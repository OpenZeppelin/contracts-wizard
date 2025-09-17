# OpenZeppelin Contracts Wizard for Confidential Contracts

[![NPM Package](https://img.shields.io/npm/v/@openzeppelin/wizard-confidential?color=%234e5de4)](https://www.npmjs.com/package/@openzeppelin/wizard-confidential)

Interactively build a contract out of components from OpenZeppelin Confidential Contracts. Provide parameters and desired features for the kind of contract that you want, and the Wizard will generate all of the code necessary. The resulting code is ready to be compiled and deployed, or it can serve as a starting point and customized further with application specific logic.

This package provides a programmatic API. For a web interface, see https://wizard.openzeppelin.com

### Installation

`npm install @openzeppelin/wizard-confidential`

### Contract types

The following contract types are supported:
- `confidentialFungible`

Each contract type has functions/constants as defined below.

### Functions

#### `print`
```js
function print(opts?: ConfidentialFungibleOptions): string
```

Returns a string representation of a contract generated using the provided options. If `opts` is not provided, uses [`defaults`](#defaults).

#### `defaults`
```js
const defaults: Required<ConfidentialFungibleOptions>
```

The default options that are used for [`print`](#print).

### Examples

Import the contract type(s) that you want to use from the `@openzeppelin/wizard-confidential` package:

```js
import { confidentialFungible } from '@openzeppelin/wizard-confidential';
```

To generate the source code for a confidential fungible contract with all of the default settings:
```js
const contract = confidentialFungible.print();
```

To generate the source code for a confidential fungible contract with a custom name, symbol, URI, and network configuration, along with some custom settings:
```js
const contract = confidentialFungible.print({
  name: 'ExampleToken',
  symbol: 'ETK',
  tokenURI: 'https://example.com',
  networkConfig: 'zama-sepolia',
  premint: '1000000',
  wrappable: true,
});
```
