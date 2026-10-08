/**
 * Prints the `ContractType` associated type of a token trait, composed from the
 * listed contract types with the library's `Compose` (e.g. `Compose<(AllowList, TotalSupply)>`).
 */
export function printComposedContractType(contractTypes: string[]): string {
  const list = contractTypes.length === 1 ? `${contractTypes[0]},` : contractTypes.join(', ');
  return `type ContractType = Compose<(${list})>;`;
}
