export interface OpenZeppelinContracts {
  version: string;
  sources: Record<string, string>;
  dependencies: Record<string, string[]>;
}

declare const contracts: OpenZeppelinContracts;

export default contracts;
