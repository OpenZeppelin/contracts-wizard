/** Maximum line width used by `rustfmt` with its default configuration. */
export const MAX_LINE_WIDTH = 100;

/** Width available for the text of a doc comment printed at the given indentation level. */
export function docWidth(indentLevel: number): number {
  return MAX_LINE_WIDTH - 4 * indentLevel - '/// '.length;
}

/**
 * Greedily wraps `text` into lines of at most `width` characters, breaking at spaces.
 */
export function wrap(text: string, width: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of text.split(/\s+/).filter(w => w.length > 0)) {
    if (current.length === 0) {
      current = word;
    } else if (current.length + 1 + word.length <= width) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current.length > 0) {
    lines.push(current);
  }
  return lines;
}

/**
 * Wraps a paragraph of documentation for an item printed at the given indentation level.
 */
export function paragraph(text: string, indentLevel: number): string[] {
  return wrap(text, docWidth(indentLevel));
}

/**
 * Wraps a Markdown bullet point for an item printed at the given indentation level. Continuation lines are
 * indented to align with the text of the bullet.
 */
export function bullet(text: string, indentLevel: number): string[] {
  const [first = '', ...rest] = wrap(text, docWidth(indentLevel) - 2);
  return [`- ${first}`, ...rest.map(line => `  ${line}`)];
}
