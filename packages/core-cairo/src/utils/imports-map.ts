import type { Contract } from "../contract";
import { getFunctionName } from "./module-prefix";

export function getImportsMap(contract: Contract) {
  const modulesToParentFunctions = getModulesToParentFunctions(contract);
  const modulesToLibraryFunctions = getModulesToLibraryFunctions(contract);
  mergeToLibraryFunctions(modulesToParentFunctions, modulesToLibraryFunctions);
  return modulesToLibraryFunctions;
}

function mergeToLibraryFunctions(modulesToParentFunctions: Map<string, Set<string>>, modulesToLibraryFunctions: Map<string, Set<string>>) {
  modulesToParentFunctions.forEach((value, key) => {
    const functionsToMerge = modulesToLibraryFunctions.get(key);
    if (functionsToMerge !== undefined) {
      functionsToMerge.forEach(fn => { value.add(fn) });
      modulesToLibraryFunctions.set(key, value);
    }
  });
}

function getModulesToLibraryFunctions(contract: Contract) {
  const modulesToLibraryFunctions: Map<string, Set<string>> = new Map();
  for (const parent of contract.libraries) {
    if (parent.functions !== undefined) {
      modulesToLibraryFunctions.set(convertPathToImport(parent.module.path), new Set(parent.functions));
    }
  }
  return modulesToLibraryFunctions;
}

function getModulesToParentFunctions(contract: Contract) {
  const functionsToModules: Map<string, string> = new Map();
  for (const fn of contract.functions) {
    if (fn.module !== undefined) {
      functionsToModules.set(getFunctionName(fn), convertPathToImport(fn.module.path));
    }
  }
  const modulesToFunctions = invertMapToSet(functionsToModules);
  return modulesToFunctions;
}

function convertPathToImport(relativePath: any): string {
  return relativePath.split('/').join('.');
}

function invertMapToSet(functionsToModules: Map<string, string>): Map<string, Set<string>> {
  const modulesToFunctions: Map<string, Set<string>> = new Map();
  for (const [functionName, moduleName] of functionsToModules.entries()) {
    const moduleFunctions = modulesToFunctions.get(moduleName);
    if (moduleFunctions === undefined) {
      modulesToFunctions.set(moduleName, new Set<string>().add(functionName));
    } else {
      moduleFunctions.add(functionName);
    }
  }
  return modulesToFunctions;
}