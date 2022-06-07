# OpenZeppelin Contracts Wizard for Solidity

Interactively build a contract out of components from OpenZeppelin Contracts. Provide parameters and desired features for the kind of contract that you want, and the Wizard will generate all of the code necessary. The resulting code is ready to be compiled and deployed, or it can serve as a starting point and customized further with application specific logic.

This package provides a programmatic API. For a web interface, see https://wizard.openzeppelin.com

### Installation

`npm install @openzeppelin/wizard`

### Functions

#### `printERC20`
```js
function printERC20(opts?: ERC20Options): string
```
Returns a string representation of an ERC20 contract generated using the provided options. If `opts` is not provided, uses [`erc20defaults`](#erc20defaults).

#### `printERC721`
```js
function printERC721(opts?: ERC721Options): string
```
Returns a string representation of an ERC721 contract generated using the provided options. If `opts` is not provided, uses [`erc721defaults`](#erc721defaults).

#### `printERC1155`
```js
function printERC1155(opts?: ERC1155Options): string
```
Returns a string representation of an ERC1155 contract generated using the provided options. If `opts` is not provided, uses [`erc1155defaults`](#erc1155defaults).

#### `printGovernor`
```js
function printGovernor(opts?: GovernorOptions): string
```
Returns a string representation of a Governor contract generated using the provided options. If `opts` is not provided, uses [`governorDefaults`](#governorDefaults).

### Defaults

#### `erc20defaults`
```js
const erc20defaults: Required<ERC20Options>
```
The default options that are used for [`printERC20`](#printerc20).

#### `erc721defaults`
```js
const erc721defaults: Required<ERC721Options>
```
The default options that are used for [`printERC721`](#printerc721).

#### `erc1155defaults`
```js
const erc1155defaults: Required<ERC1155Options>
```
The default options that are used for [`printERC1155`](#printERC1155).

#### `governorDefaults`
```js
const governorDefaults: Required<GovernorOptions>
```
The default options that are used for [`printGovernor`](#printGovernor).