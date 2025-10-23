import type { GenericOptions } from './build-generic';

export type Kind = GenericOptions['kind'];

export function capitalize(str: string): string {
  const lowered = str.trim().toLowerCase();
  return lowered.charAt(0).toUpperCase() + lowered.slice(1);
}
export function sanitizeKind(kind: unknown): Kind {
  if (typeof kind === 'string') {
    const sanitized = capitalize(kind);
    if (isKind(sanitized)) {
      return sanitized;
    }
  }
  return 'Hooks';
}

function isKind<T>(value: Kind | T): value is Kind {
  switch (value) {
    case 'Hooks':
      return true;

    default: {
      // Static assert that we've checked all kinds.
      const _: T = value;
      return false;
    }
  }
}
