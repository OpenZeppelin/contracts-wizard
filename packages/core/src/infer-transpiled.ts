export function inferTranspiled(name: string): boolean {
  return !/^I[A-Z]/.test(name);
}