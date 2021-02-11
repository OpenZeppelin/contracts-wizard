export type Lines = string | typeof newline | Lines[];

export const newline = Symbol('newline');

export function formatLines(...lines: Lines[]): string {
  return [...materializeNewlines(indentEach(0, lines))].join('\n') + '\n';
}

function* indentEach(indent: number, lines: Lines[]): Generator<string | typeof newline> {
  for (const line of lines) {
    if (line === newline) {
      yield line;
    } else if (Array.isArray(line)) {
      yield* indentEach(indent + 1, line);
    } else {
      yield '    '.repeat(indent) + line;
    }
  }
}

function* materializeNewlines(lines: Generator<string | typeof newline>): Generator<string> {
  let wasNewline = false;
  for (const line of lines) {
    if (line !== newline) {
      yield line;
      wasNewline = false;
    } else if (!wasNewline) {
      yield '';
      wasNewline = true;
    }
  }
}
