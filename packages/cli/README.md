# OpenZeppelin Contracts CLI

[![NPM Package](https://img.shields.io/npm/v/@openzeppelin/contracts-cli)](https://www.npmjs.com/package/@openzeppelin/contracts-cli)

CLI to generate secure, ready-to-compile smart contracts using OpenZeppelin Contracts libraries for various languages and contract kinds.

## Usage

```sh
npx @openzeppelin/contracts-cli <command> [options]
```

Run `--help` to see available languages, contracts and options:

```sh
npx @openzeppelin/contracts-cli --help
npx @openzeppelin/contracts-cli solidity-erc20 --help
```

### Examples

```sh
npx @openzeppelin/contracts-cli solidity-erc20 --name MyToken --symbol MTK --mintable --burnable --access ownable
```

```sh
npx @openzeppelin/contracts-cli cairo-erc20 --name MyToken --symbol MTK --mintable --pausable --upgradeable
```
