import type { ReferencedContract } from './contract';

export function inferTranspiled(c: ReferencedContract & { path?: string }): boolean {
  if (c.transpiled !== undefined) {
    return c.transpiled;
  } else if (c.path !== undefined) {
    return !/\/(draft-)?I[A-Z]\w+.sol$/.test(c.path);
  } else {
    return !/^I[A-Z]/.test(c.name);
  }
}
