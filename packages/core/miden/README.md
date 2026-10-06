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

### Options

#### Access control

The `access` option selects who controls the faucet:
- `'singleKey'`: the faucet is a user account run by one key holder, who signs every transaction of the faucet itself, including minting and processing burn requests. Token transfers don't need the faucet's key. The generated `create` function takes the public key of the key holder. The key can never be changed, so control can never be handed over or renounced. It can't be combined with the `'ownerOnly'` burn policy, in which case `'ownable'` is used.
- `'ownable'` (default): the faucet is a network account managed by an owner account authorized for all privileged actions, including minting. Ownership can be transferred in two steps. The network consumes the notes sent to the faucet, and the owner manages it by sending config notes.
- `'roles'`: the faucet is a network account with role-based access control. Minting is done by the faucet owner, initially the admin. The generated `create` function takes the initial member of each role the options use.

#### Features

- `burnPolicy`: who can burn the asset:
  - `'anyHolder'` (default): holders can burn their tokens by sending them back to the faucet in a BURN note.
  - `'minimumAmount'` (fungible only): holders can burn at least `minBurnAmount` tokens at a time. Privileged accounts can change the minimum after deployment. Tokens in a smaller burn request stay locked until the faucet accepts the request, which requires lowering the minimum first.
  - `'ownerOnly'`: only the faucet owner can burn the tokens it holds. A burn request from any other holder is rejected, and the tokens in it stay locked, since BURN notes cannot be reclaimed.
- `minBurnAmount` (fungible only): the minimum number of tokens per burn. Required by, and only allowed with, the `'minimumAmount'` burn policy.
- `pausable`: whether privileged accounts can pause minting, burning, and updates to the metadata and, for fungible faucets, the max supply, and also transfers when `pausableTransfers` is `true` or a transfer policy is active.
- `pausableTransfers`: whether pausing also stops transfers. Every transfer then consults the faucet, so transfers cost more to prove and must reach the chain within about a minute. This extra cost is permanent. Requires `pausable`, and is implied by a transfer policy.
- `transferPolicy`: who can send and receive the asset, either `'allowlist'`, `'blocklist'` or `false` (default). The lists start empty and are managed by privileged accounts. Every transfer then consults the faucet, with the same permanent extra cost.
- `switchableTransferPolicy`: whether privileged accounts can turn on an allowlist or blocklist after deployment, and switch between them. Every transfer then consults the faucet, so transfers cost more to prove. This extra cost is permanent.

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
