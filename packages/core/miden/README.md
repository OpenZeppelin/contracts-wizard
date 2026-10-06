# OpenZeppelin Contracts Wizard for Miden

Interactively build a token faucet account for [Miden](https://miden.xyz) out of the standard account components of the Miden protocol. Provide parameters and desired features for the kind of token that you want, and the Wizard will generate the Rust code that composes the components into an account. The resulting code is ready to be used in a Rust project depending on the `miden-protocol` and `miden-standards` crates, or it can serve as a starting point and customized further with application specific logic.

This package provides a programmatic API. For a web interface, see https://wizard.openzeppelin.com/miden

### Installation

`npm install @openzeppelin/wizard-miden`

### Contract types

The following contract types are supported:
- `fungible`
- `nonFungible`

Each contract type has functions/constants as defined below.

### Functions

#### `print`
```js
function print(opts?: FungibleOptions): string
```
```js
function print(opts?: NonFungibleOptions): string
```
Returns a string representation of a contract generated using the provided options. If `opts` is not provided, uses [`defaults`](#defaults).

#### `defaults`
```js
const defaults: Required<FungibleOptions>
```
```js
const defaults: Required<NonFungibleOptions>
```
The default options that are used for [`print`](#print).

#### `isAccessControlRequired`
```js
function isAccessControlRequired(opts: Partial<FungibleOptions>): boolean
```
```js
function isAccessControlRequired(opts: Partial<NonFungibleOptions>): boolean
```
Whether any of the provided options require an owner-based access control. If this returns `true`, then calling `print` with the same options would use `'ownable'` instead of `'singleKey'` for the `access` option.

### Examples

Import the contract type(s) (for example, `fungible`) that you want to use from the `@openzeppelin/wizard-miden` package:

```js
import { fungible } from '@openzeppelin/wizard-miden';
```

To generate the source code for a fungible faucet with all of the default settings:
```js
const contract = fungible.print();
```

To generate the source code for a fungible faucet with some custom settings:
```js
const contract = fungible.print({
  name: 'MyToken',
  symbol: 'MTK',
  pausable: true,
  access: 'roles',
});
```
or
```js
const contract = fungible.print({
  ...fungible.defaults,
  pausable: true,
  access: 'roles',
});
```
