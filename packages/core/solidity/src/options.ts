import path from 'path';

import type { Contract, ReferencedContract, ImportContract } from './contract';
import { inferTranspiled } from './infer-transpiled';

export function upgradeableName(n: string) {
  if (n === 'Initializable') {
    return n;
  } else {
    return n.replace(/(Upgradeable)?(?=\.|$)/, 'Upgradeable');
  }
}

export function upgradeableImport(p: ImportContract): ImportContract {
  const { dir, ext, name } = path.parse(p.path);
  // Use path.posix to get forward slashes
  return {
    ...p,
    name: upgradeableName(p.name), // Contract name
    path: path.posix.format({
      ext,
      dir: dir.replace(/^@openzeppelin\/contracts/, '@openzeppelin/contracts-upgradeable'),
      name: upgradeableName(name), // Solidity file name
    }),
  };
}

export interface Options {
  transformImport?: (parent: ImportContract) => ImportContract;
  /**
   * Rename a referenced library symbol (e.g. an inherited base, an override
   * target, or an argument type). Receives the symbol as it would otherwise be
   * printed (after any upgradeable `*Upgradeable` rename) and returns the final
   * name. Use this to remap OpenZeppelin library symbols — it never sees
   * user-supplied data (names, symbols, NatSpec) so those can't be corrupted.
   */
  transformName?: (name: string) => string;
  /**
   * Override the `pragma solidity` version (defaults to the Wizard's mainline
   * version). Useful for ecosystems whose compiler lags mainline.
   */
  solidityVersion?: string;
  /**
   * ERC-7201 `<FORMULA_ID>` written in the `@custom:storage-location` annotation
   * of namespaced storage structs (defaults to `erc7201`). This only sets the
   * annotation label, not the slot derivation — see `computeNamespacedStorageSlot`.
   */
  formulaId?: string;
  /**
   * Add additional libraries to the compatibility banner printed at the top of the contract.
   *
   * If `alwaysKeepOzPrefix` is true, the library name will always keep the "OpenZeppelin " prefix, even if there are multiple libraries from OpenZeppelin being imported.
   */
  additionalCompatibleLibraries?: { name: string; path: string; version: string; alwaysKeepOzPrefix?: boolean }[];
}

export interface Helpers {
  upgradeable: boolean;
  /** Final printed name of a referenced symbol (upgradeable rename, then `Options.transformName`). */
  transformName: (name: ReferencedContract) => string;
  /**
   * Name used for an upgradeable parent's `__{Name}_init` initializer call.
   * This is the base name with `Options.transformName` applied but WITHOUT the
   * `Upgradeable` suffix (the initializer keeps the base name, e.g. `__ERC20_init`).
   */
  transformInitName: (name: ReferencedContract) => string;
  transformImport: (name: ImportContract) => ImportContract;
  /** ERC-7201 `<FORMULA_ID>` for namespaced storage annotations (`Options.formulaId`, default `erc7201`). */
  formulaId: string;
  additionalCompatibleLibraries: NonNullable<Options['additionalCompatibleLibraries']>;
}

export function withHelpers(contract: Contract, opts: Options = {}): Helpers {
  const contractUpgradeable = contract.upgradeable;
  const renameSymbol = opts.transformName ?? ((name: string) => name);
  return {
    upgradeable: contractUpgradeable,
    transformName: (n: ReferencedContract) => {
      const afterUpgradeable = contractUpgradeable && inferTranspiled(n) ? upgradeableName(n.name) : n.name;
      return renameSymbol(afterUpgradeable);
    },
    transformInitName: (n: ReferencedContract) => renameSymbol(n.name),
    transformImport: (p1: ImportContract) => {
      const p2 = contractUpgradeable && inferTranspiled(p1) ? upgradeableImport(p1) : p1;
      return opts.transformImport?.(p2) ?? p2;
    },
    formulaId: opts.formulaId ?? 'erc7201',
    additionalCompatibleLibraries: opts.additionalCompatibleLibraries ?? [],
  };
}
