import type { GenericOptions } from './build-generic';

export type Kind = GenericOptions['kind'];

export function sanitizeKind(kind: unknown): Kind {
  if (typeof kind === 'string') {
    const sanitized = kind.replace(/^(ERC|.)/i, c => c.toUpperCase());
    if (isKind(sanitized)) {
      return sanitized;
    }
  }
  return 'ERC20';
}

export function parseKind(value: string | undefined): Kind {
  if (value === undefined) {
    throw new Error(`Failed to resolve contract kind from 'undefined' value.`);
  }
  switch (value.toLowerCase()) {
    case 'erc20':
      return 'ERC20';
    case 'erc721':
      return 'ERC721';
    case 'erc1155':
      return 'ERC1155';
    case 'account':
      return 'Account';
    case 'governor':
      return 'Governor';
    case 'vesting':
      return 'Vesting';
    case 'custom':
      return 'Custom';
    default:
      throw new Error(`Failed to resolve contract kind from '${value}' value.`);
  }
}

function isKind<T>(value: Kind | T): value is Kind {
  switch (value) {
    case 'ERC20':
    case 'ERC721':
    case 'ERC1155':
    case 'Account':
    case 'Governor':
    case 'Vesting':
    case 'Custom':
      return true;

    default: {
      // Static assert that we've checked all kinds.
      const _: T = value;
      return false;
    }
  }
}
