import { codeBlock, formatPrintError } from '../utils';

/** Print TRON contract source as a Markdown code block, or an options-error result. */
export function tronPrintResult(print: () => string) {
  try {
    return {
      content: [{ type: 'text' as const, text: codeBlock(print(), 'solidity') }],
    };
  } catch (e) {
    return {
      content: [{ type: 'text' as const, text: formatPrintError(e) }],
      isError: true,
    };
  }
}
