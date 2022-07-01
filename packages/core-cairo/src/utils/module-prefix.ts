import type { BaseFunction } from "../contract";

/**
 * If the function's module has a namespace, returns the namespace.
 * Otherwise returns the function name itself.
 */
export function getImportName(fn: BaseFunction): string {
  if (fn.module?.useNamespace) {
    return fn.module.name;
  } else {
    return getFunctionName(fn);
  }
}

/**
 * Returns the function name with either namespace or module prefix based on extensibility pattern. 
 */
export function getFunctionName(fn: BaseFunction): string {
  const suffix = fn.parentFunctionName ?? fn.name;
  let prefix: string;
  if (fn.module !== undefined && fn.module.useNamespace) {
    prefix = `${fn.module.name}.`
  } else {
    prefix = '';
  }
  return `${prefix}${suffix}`;
}