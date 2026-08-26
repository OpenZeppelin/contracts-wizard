import type { Contract } from '../contract';

// Helpers shared by the TRON upgrades-plugin project generators.

/** UUPS upgradeable contracts inherit `UUPSUpgradeable`; transparent ones don't. */
export function isUUPS(c: Contract): boolean {
  return c.parents.some(p => p.contract.name === 'UUPSUpgradeable');
}

/** Non-address initializer args have no auto-fillable placeholder. */
export function hasUnsetInitArgs(c: Contract): boolean {
  return c.constructorArgs.some(arg => arg.type !== 'address');
}
