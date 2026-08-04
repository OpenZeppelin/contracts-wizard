import { OptionsError as OptionsErrorSolidity } from '@openzeppelin/wizard';
import { OptionsError as OptionsErrorCairo } from '@openzeppelin/wizard-cairo';
import { OptionsError as OptionsErrorStylus } from '@openzeppelin/wizard-stylus';
import { OptionsError as OptionsErrorStellar } from '@openzeppelin/wizard-stellar';

/** Wraps contract source code in a Markdown code block with the given syntax highlighting. */
export function codeBlock(code: string, syntaxHighlightingLanguage: string): string {
  return `\
\`\`\`${syntaxHighlightingLanguage}
${code}
\`\`\`
`;
}

/** Renders a failed contract print as Markdown, detailing per-field messages for Wizard options errors. */
export function formatPrintError(e: unknown): string {
  if (
    e instanceof OptionsErrorSolidity ||
    e instanceof OptionsErrorCairo ||
    e instanceof OptionsErrorStylus ||
    e instanceof OptionsErrorStellar
  ) {
    return `${e.message}\n\n${JSON.stringify(e.messages, null, 2)}`;
  }
  return `Unexpected error: ${e}`;
}

/**
 * Adds a description to the prompt that explains the return format of the tool.
 */
export function makeDetailedPrompt(origPrompt: string): string {
  return `\
${origPrompt}

Returns the source code of the generated contract, formatted in a Markdown code block. Does not write to disk.`;
}
