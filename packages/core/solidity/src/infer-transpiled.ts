import type { ReferencedContract } from "./contract";

export function inferTranspiled(c: ReferencedContract): boolean {
  return c.transpiled ?? !/^I[A-Z]/.test(c.name);
}