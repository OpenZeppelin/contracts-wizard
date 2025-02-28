import type { GenericOptions } from './build-generic';

export type Kind = GenericOptions['kind'];

export function sanitizeKind(kind: unknown): Kind {
  if (typeof kind === 'string') {
    const sanitized = kind.replace(/^(ERC|.)/i, c => c.toUpperCase());
    if (isKind(sanitized)) {
      return sanitized;
    }
  }
  return 'Fungible';
}

function isKind<T>(value: Kind | T): value is Kind {
  switch (value) {
    case 'Fungible':
      return true;

    default: {
      // Static assert that we've checked all kinds.
      const _: T = value;
      return false;
    }
  }
}
