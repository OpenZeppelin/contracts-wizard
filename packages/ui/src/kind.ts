import type { GenericOptions } from '@openzeppelin/wizard';

export type Kind = GenericOptions['kind'];

export function sanitizeKind(kind: unknown): Kind {
  const uppercase = typeof kind === 'string' ? kind.toUpperCase() : kind;

  if (isKind(uppercase)) {
    return uppercase;
  } else {
    return 'ERC20';
  }
}

function isKind<T>(value: Kind | T): value is Kind {
  switch (value) {
    case 'ERC20':
    case 'ERC1155':
    case 'ERC721':
      return true;

    default: {
      // Static assert that we've checked all kinds.
      const _: T = value;
      return false;
    }
  }
}
