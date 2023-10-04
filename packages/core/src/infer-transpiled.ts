import type { ReferencedContract } from "./contract";

export function inferTranspiled(c: ReferencedContract): boolean {
  return c.transpiled !== undefined ? c.transpiled : c.name.match(/^I[A-Z]/) === null;
}