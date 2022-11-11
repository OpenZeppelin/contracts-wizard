import 'array.prototype.flatmap/auto';

export type Lines = string | typeof whitespace | Lines[];

const whitespace = Symbol('whitespace');

export function formatLines(...lines: Lines[]): string {
  return formatLinesWithSpaces(4, ...lines);
}

export function formatLinesWithSpaces(spacesPerIndent: number, ...lines: Lines[]): string {
  return [...indentEach(0, lines, spacesPerIndent)].join('\n') + '\n';
}

function* indentEach(
  indent: number,
  lines: Lines[],
  spacesPerIndent: number,
): Generator<string | typeof whitespace> {
  for (const line of lines) {
    if (line === whitespace) {
      yield '';
    } else if (Array.isArray(line)) {
      yield* indentEach(indent + 1, line, spacesPerIndent);
    } else {
      yield ' '.repeat(indent * spacesPerIndent) + line;
    }
  }
}

export function spaceBetween(...lines: Lines[][]): Lines[] {
  return lines
    .filter(l => l.length > 0)
    .flatMap<Lines>(l => [whitespace, ...l])
    .slice(1);
}
