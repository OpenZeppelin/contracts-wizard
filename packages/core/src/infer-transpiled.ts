import type { ReferencedContract } from "./contract";

export function inferTranspiled(c: ReferencedContract): boolean {
  return c.transpiled ?? inferTranspiledName(c.name);
}

export function inferTranspiledName(name: string): boolean {
  return !/^I[A-Z]/.test(name);
}