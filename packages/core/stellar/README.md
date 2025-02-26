# OpenZeppelin Contracts Wizard for Stellar

Interactively build a contract out of components from OpenZeppelin Stellar Soroban Contracts. Provide parameters and desired features for the kind of contract that you want, and the Wizard will generate all of the code necessary. The resulting code is ready to be compiled and deployed, or it can serve as a starting point and customized further with application specific logic.

This package provides a programmatic API. For a web interface, see https://wizard.openzeppelin.com/stellar

### Installation

`npm install @openzeppelin/wizard-stellar`

### Contract types

The following contract types are supported:
- `fungible`

Each contract type has functions/constants as defined below.

### Functions

#### `print`
```js
function print(opts?: FungibleOptions): string
```
Returns a string representation of a contract generated using the provided options. If `opts` is not provided, uses [`defaults`](#defaults).

#### `defaults`
```js
const defaults: Required<FungibleOptions>
```
The default options that are used for [`print`](#print).

### Examples

Import the contract type(s) (for example, `fungible`) that you want to use from the `@openzeppelin/wizard-stellar` package:

```js
import { fungible } from '@openzeppelin/wizard-stellar';
```

To generate the source code for an Fungible contract with all of the default settings:
```js
const contract = fungible.print();
```

To generate the source code for an Fungible contract with some custom settings:
```js
const contract = fungible.print({
  pausable: true,
});
```
or
```js
const contract = fungible.print({
  ...fungible.defaults,
  pausable: true,
});
```
