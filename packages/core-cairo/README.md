# OpenZeppelin Contracts Wizard for Cairo

Interactively build a contract out of components from OpenZeppelin Contracts for Cairo. Provide parameters and desired features for the kind of contract that you want, and the Wizard will generate all of the code necessary. The resulting code is ready to be compiled and deployed, or it can serve as a starting point and customized further with application specific logic.

This package provides a programmatic API. For a web interface, see https://wizard.openzeppelin.com/cairo

### Installation

`npm install @openzeppelin/wizard-cairo`

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
