import type { ContractBuilder, ParentContract, ReferencedContract } from "./contract";
import { defineFunctions } from "./utils/define-functions";

const functions = defineFunctions({
  clock: {
    kind: 'public' as const,
    args: [],
    returns: ['uint48'],
    mutability: 'view' as const,
  },

  CLOCK_MODE: {
    kind: 'public' as const,
    args: [],
    returns: ['string memory'],
    mutability: 'pure' as const,
  }
});

export function setClockMode(c: ContractBuilder, parent: ReferencedContract, timestamp: boolean) {
  if (timestamp) {
    c.addOverride(parent, functions.clock);
    c.setFunctionBody(['return uint48(block.timestamp);'], functions.clock);

    c.setFunctionComments(['// solhint-disable-next-line func-name-mixedcase'], functions.CLOCK_MODE);
    c.addOverride(parent, functions.CLOCK_MODE);
    c.setFunctionBody(['return "mode=timestamp";'], functions.CLOCK_MODE);
  }
}