/**
 * Semantic version string representing of the minimum compatible version of Contracts to display in output.
 */
export const compatibleContractsSemver = '^5.5.0';

export function getRawCompatibleContractsSemver() {
  return compatibleContractsSemver.startsWith('^') ? compatibleContractsSemver.slice(1) : compatibleContractsSemver;
}
