import type { ContractBuilder, ReferencedContract } from './contract';
import { defineFunctions } from './utils/define-functions';

export const clockModeOptions = ['blocknumber', 'timestamp'] as const;
export const clockModeDefault = 'blocknumber' as const;
export type ClockMode = (typeof clockModeOptions)[number];

const functions = defineFunctions({
  clock: {
    kind: 'public' as const,
    args: [],
    returns: ['uint48'],
    mutability: 'view' as const,
    comments: ['/// @dev Returns the current timestamp as a uint48', '/// @return The current timestamp'],
  },

  CLOCK_MODE: {
    kind: 'public' as const,
    args: [],
    returns: ['string memory'],
    mutability: 'pure' as const,
    comments: ['/// @dev Returns the clock mode as a string', '/// @return The clock mode string'],
  },
});

export function setClockMode(c: ContractBuilder, parent: ReferencedContract, votes: ClockMode) {
  if (votes === 'timestamp') {
    c.addOverride(parent, functions.clock);
    c.setFunctionBody(['return uint48(block.timestamp);'], functions.clock);

    c.addOverride(parent, functions.CLOCK_MODE);
    c.setFunctionBody(['return "mode=timestamp";'], functions.CLOCK_MODE);
  }
}
