import { OptionsError as OptionsErrorSolidity } from '@openzeppelin/wizard';
import { OptionsError as OptionsErrorCairo } from '@openzeppelin/wizard-cairo';
import { OptionsError as OptionsErrorStylus } from '@openzeppelin/wizard-stylus';
import { OptionsError as OptionsErrorStellar } from '@openzeppelin/wizard-stellar';

export function safePrint(printFn: () => string): string {
  try {
    return printFn();
  } catch (e) {
    if (e instanceof OptionsErrorSolidity || e instanceof OptionsErrorCairo || e instanceof OptionsErrorStylus || e instanceof OptionsErrorStellar) {
      return `${e.message}\n\n${JSON.stringify(e.messages, null, 2)}`;
    } else {
      return `Unexpected error: ${e}`;
    }
  }
}

export function makeDetailedPrompt(origPrompt: string): string {
  return `\
${origPrompt}

Returns the source code of the generated contract. Does not write to disk.`;
}
