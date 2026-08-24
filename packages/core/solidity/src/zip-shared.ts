import type { Contract, FunctionArgument } from './contract';
import type { Lines } from './utils/format-lines';

/**
 * Whether a constructor argument can be given a default value in a generated project.
 *
 * The generators fill these in with a signer, so this must agree everywhere it is used: an argument
 * that is treated as an address in one place but not another would leave an unset placeholder in
 * code that is not commented out.
 */
export function isAddressType(arg: FunctionArgument): boolean {
  return arg.type === 'address';
}

/**
 * Whether any constructor argument cannot be given a default value in a generated project.
 *
 * Address arguments are filled in with a signer, so a contract with only address arguments can be
 * deployed as-is. Anything else must be supplied by the user, which means the generated deployment
 * is commented out and there is no deployed instance for the generated tests to assert against.
 */
export function hasNonAddressArgs(c: Contract): boolean {
  return !c.constructorArgs.every(isAddressType);
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
