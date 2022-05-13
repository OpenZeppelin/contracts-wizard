# API

The following describes how to use the Contracts Wizard programmatic API in your own applications.

## Cairo

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

## Solidity

Contracts Wizard API for Solidity is not available yet. Please reach out to us on [issue #129](https://github.com/OpenZeppelin/contracts-wizard/issues/129) if you would be interested in it.
