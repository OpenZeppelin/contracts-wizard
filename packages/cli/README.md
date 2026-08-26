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

## Supported languages

Commands are named in the format `<language>-<contract>`.

| Language | Contracts |
| --- | --- |
| solidity | erc20, erc721, erc1155, stablecoin, rwa, account, governor, custom |
| cairo | erc20, erc721, erc1155, account, multisig, governor, vesting, custom |
| stellar | fungible, stablecoin, non-fungible, governor, vault, account |
| stylus | erc20, erc721, erc1155 |
| confidential | erc7984 |
| uniswap-hooks | hooks (command is just `uniswap-hooks`) |
| tron | trc20, trc721, trc1155, governor, custom |

## Examples

One example per language. These examples are not exhaustive — run `npx @openzeppelin/contracts-cli --help` for all commands, and `npx @openzeppelin/contracts-cli <command> --help` for all options of a command.

```sh
npx @openzeppelin/contracts-cli solidity-erc20 --name MyToken --symbol MTK --mintable --burnable --access ownable
```

```sh
npx @openzeppelin/contracts-cli cairo-erc20 --name MyToken --symbol MTK --mintable --pausable --upgradeable
```

```sh
npx @openzeppelin/contracts-cli stellar-fungible --name MyToken --symbol MTK --premint 1000 --mintable
```

```sh
npx @openzeppelin/contracts-cli stylus-erc721 --name MyNFT --burnable --enumerable
```

```sh
npx @openzeppelin/contracts-cli confidential-erc7984 --name MyToken --symbol MTK --contractURI https://example.com/token.json --networkConfig zama-ethereum --wrappable
```

Uniswap hook callbacks and utilities are configured explicitly:

```sh
npx @openzeppelin/contracts-cli uniswap-hooks --hook BaseHook --name MyHook \
  --pausable false --currencySettler false --safeCast false --transientStorage false \
  --shares.options false --inputs.blockNumberOffset 0 --inputs.maxAbsTickDelta 0 \
  --permissions.beforeInitialize false --permissions.afterInitialize false \
  --permissions.beforeAddLiquidity false --permissions.afterAddLiquidity false \
  --permissions.beforeRemoveLiquidity false --permissions.afterRemoveLiquidity false \
  --permissions.beforeSwap --permissions.afterSwap \
  --permissions.beforeDonate false --permissions.afterDonate false \
  --permissions.beforeSwapReturnDelta false --permissions.afterSwapReturnDelta false \
  --permissions.afterAddLiquidityReturnDelta false --permissions.afterRemoveLiquidityReturnDelta false
```

```sh
npx @openzeppelin/contracts-cli tron-trc20 --name MyToken --symbol MTK --mintable --upgradeable uups
```
