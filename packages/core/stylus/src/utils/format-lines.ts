export type Lines = string | typeof whitespace | Lines[];

const whitespace = Symbol('whitespace');

export function formatLines(...lines: Lines[]): string {
  return [...indentEach(0, lines)].join('\n') + '\n';
}

function* indentEach(
  tabs: number,
  lines: Lines[],
): Generator<string | typeof whitespace> {
  for (const line of lines) {
    if (line === whitespace) {
      yield '';
    } else if (Array.isArray(line)) {
      yield* indentEach(tabs + 1, line);
    } else {
      yield indent(line, tabs);
    }
  }
}

export function indent(line: string, tabs: number): string {
  return '    '.repeat(tabs) + line;
}

export function spaceBetween(...lines: Lines[][]): Lines[] {
  return lines
    .filter(l => l.length > 0)
    .flatMap<Lines>(l => [whitespace, ...l])
    .slice(1);
}
