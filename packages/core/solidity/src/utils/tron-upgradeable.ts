import type { Contract } from '../contract';

// Helpers for generating upgradeable TRON deployment scaffolding.
//
// OpenZeppelin's Hardhat and Foundry Upgrades plugins target EVM chains and do
// NOT deploy to the TRON network, so the upgradeable TRON projects can't reuse
// the mainline `upgrades.deployProxy` flow. Instead they deploy the proxy by
// hand, per the official guide:
// https://github.com/OpenZeppelin/tron-contracts-upgradeable -> "Using with Upgrades".
//
// UUPS contracts deploy behind a `TRC1967Proxy`; transparent contracts deploy
// behind a `TransparentUpgradeableProxy` (which additionally takes an admin
// owner). Both proxies live in the base `@openzeppelin/tron-contracts` package
// (the transpiler renames `ERC1967` -> `TRC1967`).

/** UUPS upgradeable contracts inherit `UUPSUpgradeable`; transparent ones don't. */
export function isUUPS(c: Contract): boolean {
  return c.parents.some(p => p.contract.name === 'UUPSUpgradeable');
}

export interface TronProxy {
  /** Solidity contract name, also the artifact name for getContractFactory / artifacts.require. */
  contractName: 'TRC1967Proxy' | 'TransparentUpgradeableProxy';
  /** Import path within `@openzeppelin/tron-contracts`. */
  importPath: string;
  /** Transparent proxies take an admin owner address before the init data. */
  isTransparent: boolean;
}

export function tronProxyFor(c: Contract): TronProxy {
  return isUUPS(c)
    ? {
        contractName: 'TRC1967Proxy',
        importPath: '@openzeppelin/tron-contracts/proxy/TRC1967/TRC1967Proxy.sol',
        isTransparent: false,
      }
    : {
        contractName: 'TransparentUpgradeableProxy',
        importPath: '@openzeppelin/tron-contracts/proxy/transparent/TransparentUpgradeableProxy.sol',
        isTransparent: true,
      };
}

/**
 * Source for a throwaway `Proxy.sol` whose only purpose is to pull the proxy
 * contract into the build, so the deploy script / migration can load its
 * artifact. The generated `${c.name}` contract never imports it.
 */
export function tronProxyHelperSource(c: Contract, pragmaVersion: string): string {
  const proxy = tronProxyFor(c);
  return `\
// SPDX-License-Identifier: MIT
pragma solidity ^${pragmaVersion};

// This file is NOT imported by ${c.name}. It exists only so the toolchain
// compiles the proxy contract that the deploy script puts ${c.name} behind.
// See https://github.com/OpenZeppelin/tron-contracts-upgradeable
import {${proxy.contractName}} from "${proxy.importPath}";
`;
}

/** Non-address initializer args have no auto-fillable placeholder. */
export function hasUnsetInitArgs(c: Contract): boolean {
  return c.constructorArgs.some(arg => arg.type !== 'address');
}
