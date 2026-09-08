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
Whether any of the provided options require access control to be enabled. If this returns `true`, then calling `print` with the same options would cause the `access` option to default to `'ownable'` if it was `undefined` or `false`.

### Options

#### Access control

The `access` option selects how the privileged procedures of the faucet account are authorized:
- `false` (default): the faucet is a user account authenticated by a single signature. The generated `create` function takes the public key of the key holder, who is the sole authority over the faucet.
- `'ownable'`: the faucet is a network account whose privileged procedures are gated by an owner account, with two-step ownership transfer. The network consumes the MINT, BURN and config notes sent to the faucet.
- `'roles'`: the faucet is a network account with role-based access control.

#### Features

- `burnable`: whether any holder can burn the asset by sending it back to the faucet in a BURN note. Otherwise only the owner can burn, which requires access control.
- `pausable`: whether privileged accounts can pause minting, burning and transfers.
- `restrictions`: transfer restrictions enforced through the send and receive policies of the faucet, either `'allowlist'`, `'blocklist'` or `false`.
- `switchablePolicies`: whether the other standard mint, burn, send and receive policies are registered as allowed alternatives, so that privileged accounts can switch the active policies after deployment. Installs the allowlist and blocklist managers and enables asset callbacks.
- `minBurnAmount` (fungible only): the minimum amount of tokens that must be burned at once, in whole tokens. Requires `burnable`. Privileged accounts can update the minimum after deployment.

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
  access: 'ownable',
});
```
or
```js
const contract = fungible.print({
  ...fungible.defaults,
  pausable: true,
  access: 'ownable',
});
```
