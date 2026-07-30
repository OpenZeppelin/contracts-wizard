import type { Contract } from './contract';
import type { Lines } from './utils/format-lines';

/**
 * Whether any constructor argument cannot be given a default value in a generated project.
 *
 * Address arguments are filled in with a signer, so a contract with only address arguments can be
 * deployed as-is. Anything else must be supplied by the user, which means the generated deployment
 * is commented out and there is no deployed instance for the generated tests to assert against.
 */
export function hasNonAddressArgs(c: Contract): boolean {
  return c.constructorArgs.some(arg => arg.type !== 'address');
}

/**
 * Comments out a section of generated code behind a single TODO, so that the user can fill in the
 * missing constructor arguments and uncomment the whole section at once.
 */
export function addTodoAndCommentOut(c: Contract, lines: Lines[]): Lines[] {
  const values = hasNonAddressArgs(c) ? 'values' : 'addresses';
  return [
    `// TODO: Set ${values} for the variables below, then uncomment the following section:`,
    '/*',
    ...lines,
    '*/',
  ];
}
