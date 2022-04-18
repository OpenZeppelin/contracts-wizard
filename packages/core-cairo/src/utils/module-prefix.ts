import type { BaseFunction, Module } from "../contract";

function getPrefix(module: Module | undefined): string {
  if (module === undefined) {
    return '';
  }
  return module.usePrefix ? `${module.name}_` : '';
}

export function getFunctionName(fn: BaseFunction): string {
  return `${getPrefix(fn.module)}${fn.parentFunctionName ?? fn.name}`;
}