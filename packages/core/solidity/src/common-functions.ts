import type { BaseFunction } from './contract';

export const supportsInterface: BaseFunction = {
  name: 'supportsInterface',
  kind: 'public',
  args: [{ name: 'interfaceId', type: 'bytes4' }],
  returns: ['bool'],
  mutability: 'view',
  comments: [
    '/// @dev Checks if the contract implements a specific interface',
    '/// @param interfaceId The interface identifier to check',
    '/// @return True if the contract implements the interface, false otherwise',
  ],
};
