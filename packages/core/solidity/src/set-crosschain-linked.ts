import type { BaseFunction, ContractBuilder, ImportContract } from './contract';
import type { Access } from './set-access-control';
import { requireAccessControl } from './set-access-control';

export const setLink: BaseFunction = {
  name: 'setLink',
  kind: 'public',
  args: [
    { name: 'gateway', type: 'address' },
    { name: 'counterpart', type: 'bytes memory' },
  ],
};

/**
 * Adds a `CrosschainLinked` based bridging extension, along with the `setLink` function used to register
 * the counterparts it can bridge with. `parent` is the token-specific extension, e.g. `ERC721Crosschain`.
 */
export function addCrosschainLinked(
  c: ContractBuilder,
  parent: ImportContract,
  crossChainLinkAllowOverride: boolean,
  access: Access,
) {
  c.addParent(parent);

  c.addConstructionOnly(
    {
      name: 'CrosschainLinked',
      path: '@openzeppelin/contracts/crosschain/CrosschainLinked.sol',
    },
    [{ lit: 'links' }],
  );
  c.addConstructorArgument({ type: { name: 'CrosschainLinked.Link[] memory' }, name: 'links' });

  requireAccessControl(c, setLink, access, 'CROSSCHAIN_LINKER', 'crosschainLinker');
  c.addFunctionCode(`_setLink(gateway, counterpart, ${crossChainLinkAllowOverride});`, setLink);
}
