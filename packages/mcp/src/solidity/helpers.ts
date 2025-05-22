import { OptionsError } from '@openzeppelin/wizard';

export function safePrint(printFn: () => string): string {
  try {
    return printFn();
  } catch (e) {
    if (e instanceof OptionsError) {
      return `${e.message}\n\n${JSON.stringify(e.messages, null, 2)}`;
    } else {
      return `Unexpected error: ${e}`;
    }
  }
}
