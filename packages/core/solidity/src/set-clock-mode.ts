import type { ContractBuilder, ReferencedContract } from "./contract";
import { defineFunctions } from "./utils/define-functions";

export const clockModeOptions = ['blocknumber', 'timestamp'] as const;
export const clockModeDefault = 'blocknumber' as const;
export type ClockMode = typeof clockModeOptions[number];

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

export function setClockMode(c: ContractBuilder, parent: ReferencedContract, votes: ClockMode) {
  if (votes === 'timestamp') {
    c.addOverride(parent, functions.clock);
    c.setFunctionBody(['return uint48(block.timestamp);'], functions.clock);

    c.setFunctionComments(['// solhint-disable-next-line func-name-mixedcase'], functions.CLOCK_MODE);
    c.addOverride(parent, functions.CLOCK_MODE);
    c.setFunctionBody(['return "mode=timestamp";'], functions.CLOCK_MODE);
  }
}