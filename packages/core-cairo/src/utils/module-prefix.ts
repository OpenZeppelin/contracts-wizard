import type { BaseFunction, Module, Namespace } from "../contract";

/**
 * Get prefix with module name (without namespace)
 */
function getModulePrefix(module: Module): string {
  return module.usePrefix ? `${module.name}_` : '';
}

/**
 * Get prefix with namespace
 */
 function getNamespacePrefix(namespace: Namespace): string {
  return `${namespace.name}.`;
}

/**
 * If the fn has a namespace, returns the namespace.
 * Otherwise returns the module (if any) prefixed to the function name. 
 */
export function getImportName(fn: BaseFunction): string {
  if (fn.namespace !== undefined) {
    return fn.namespace.name;
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
  if (fn.namespace !== undefined) {
    prefix = getNamespacePrefix(fn.namespace);
  } else if (fn.module !== undefined && fn.module.usePrefix) {
    prefix = getModulePrefix(fn.module);
  } else {
    prefix = '';
  }
  return `${prefix}${suffix}`;
}