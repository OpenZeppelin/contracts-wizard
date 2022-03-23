export function toIdentifier(str: string, capitalize = false): string {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/^[^a-zA-Z$_]+/, '')
    .replace(/^(.)/, c => capitalize ? c.toUpperCase() : c)
    .replace(/[^\w$]+(.?)/g, (_, c) => c.toUpperCase());
}
