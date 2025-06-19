import { OptionsError as OptionsErrorSolidity } from '@openzeppelin/wizard';
import { OptionsError as OptionsErrorCairo } from '@openzeppelin/wizard-cairo';
import { OptionsError as OptionsErrorStylus } from '@openzeppelin/wizard-stylus';
import { OptionsError as OptionsErrorStellar } from '@openzeppelin/wizard-stellar';

function safePrintCodeBlock(printFn: () => string, syntaxHighlightingLanguage: string): string {
  try {
    return `\
\`\`\`${syntaxHighlightingLanguage}
${printFn()}
\`\`\`
`;
  } catch (e) {
    if (
      e instanceof OptionsErrorSolidity ||
      e instanceof OptionsErrorCairo ||
      e instanceof OptionsErrorStylus ||
      e instanceof OptionsErrorStellar
    ) {
      return `${e.message}\n\n${JSON.stringify(e.messages, null, 2)}`;
    } else {
      return `Unexpected error: ${e}`;
    }
  }
}

/**
 * Prints the contract source code, wrapped in a Markdown code block with syntax highlighting as `solidity`.
 * Or prints the error message if an error occurs.
 */
export function safePrintSolidityCodeBlock(printFn: () => string): string {
  return safePrintCodeBlock(printFn, 'solidity');
}

/**
 * Prints the contract source code, wrapped in a Markdown code block with syntax highlighting as `cairo`.
 * Or prints the error message if an error occurs.
 */
export function safePrintCairoCodeBlock(printFn: () => string): string {
  return safePrintCodeBlock(printFn, 'cairo');
}

/**
 * Prints the contract source code, wrapped in a Markdown code block with syntax highlighting as `rust`.
 * Or prints the error message if an error occurs.
 */
export function safePrintRustCodeBlock(printFn: () => string): string {
  return safePrintCodeBlock(printFn, 'rust');
}

/**
 * Adds a description to the prompt that explains the return format of the tool.
 */
export function makeDetailedPrompt(origPrompt: string): string {
  return `\
${origPrompt}

Returns the source code of the generated contract, formatted in a Markdown code block. Does not write to disk.`;
}
