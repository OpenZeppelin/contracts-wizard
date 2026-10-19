import type { ContractBuilder } from './contract';
import { OptionsError } from './error';
import type { Access } from './set-access-control';
import { requireAccessControl, setAccessControl } from './set-access-control';
import { setNamespacedStorage, toStorageStructInstantiation } from './set-namespaced-storage';
import type { Upgradeable } from './set-upgradeable';
import { defineFunctions } from './utils/define-functions';

/** Adds the token-side interface used by a CCIP BurnMintTokenPool. */
export function addCCIP(
  c: ContractBuilder,
  access: Access,
  upgradeable: Upgradeable,
  namespacePrefix: string,
  burnable: boolean,
) {
  // CCIP itself only needs the pool to be able to call mint and burn. Roles is a
  // scope choice of this integration: Ownable would make the pool the owner of
  // the token, and AccessManaged is not implemented here.
  if (access !== 'roles') {
    // Keyed on both options, each with its own sentence, like the ACE conflicts.
    // The suggested alternative goes only on the option the user would switch.
    throw access === 'ownable'
      ? new OptionsError({
          crossChainBridging: 'This Wizard integration does not support Chainlink CCIP with Ownable access.',
          access:
            "This Wizard integration does not support Ownable access with Chainlink CCIP, because the pool would have to be the token's owner to mint. Use Roles.",
        })
      : new OptionsError({
          crossChainBridging: 'This Wizard integration does not support Chainlink CCIP with Managed access.',
          access: 'This Wizard integration does not support Managed access with Chainlink CCIP. Use Roles.',
        });
  }

  setAccessControl(c, access);
  c.addConstructorArgument({ type: 'address', name: 'ccipAdmin' });
  // Same event as Chainlink's BurnMintERC20, so registry tooling and monitoring
  // observe admin rotation identically on both tokens.
  c.addConstantOrImmutableOrErrorDefinition(
    'event CCIPAdminTransferred(address indexed previousAdmin, address indexed newAdmin);',
  );

  // Registration administration is separate from mint/burn authorization. Pool
  // roles are assigned and rotated explicitly with AccessControl grant/revokeRole.
  if (upgradeable) {
    setNamespacedStorage(c, ['address ccipAdmin;'], namespacePrefix);
    c.addConstructorCode(toStorageStructInstantiation(c.name));
    c.addConstructorCode('$.ccipAdmin = ccipAdmin;');
    c.setFunctionBody([toStorageStructInstantiation(c.name), 'return $.ccipAdmin;'], functions.getCCIPAdmin);
    c.setFunctionBody(
      [
        toStorageStructInstantiation(c.name),
        'address previousCCIPAdmin = $.ccipAdmin;',
        '$.ccipAdmin = newCCIPAdmin;',
        'emit CCIPAdminTransferred(previousCCIPAdmin, newCCIPAdmin);',
      ],
      functions.setCCIPAdmin,
    );
  } else {
    c.addStateVariable('address private _ccipAdmin;', false);
    c.addConstructorCode('_ccipAdmin = ccipAdmin;');
    c.setFunctionBody(['return _ccipAdmin;'], functions.getCCIPAdmin);
    c.setFunctionBody(
      [
        'address previousCCIPAdmin = _ccipAdmin;',
        '_ccipAdmin = newCCIPAdmin;',
        'emit CCIPAdminTransferred(previousCCIPAdmin, newCCIPAdmin);',
      ],
      functions.setCCIPAdmin,
    );
  }
  c.setFunctionComments(
    [
      '// Read by RegistryModuleOwnerCustom.registerAdminViaGetCCIPAdmin. Needed for',
      '// registry modules that do not offer the AccessControl registration path.',
    ],
    functions.getCCIPAdmin,
  );
  c.setFunctionComments(
    [
      '// Setting this address to zero disables registration via getCCIPAdmin. It does',
      '// not revoke an administrator already registered in the TokenAdminRegistry and',
      '// does not disable the AccessControl path where the registry module supports it.',
    ],
    functions.setCCIPAdmin,
  );
  c.addModifier('onlyRole(DEFAULT_ADMIN_ROLE)', functions.setCCIPAdmin);

  requireAccessControl(c, functions.mint, access, 'MINTER', undefined);
  c.setFunctionBody(['_mint(to, amount);'], functions.mint);
  // ERC20Burnable lets any holder, including the pool, burn its own balance.
  // Without Burnable, only accounts granted BURNER_ROLE can burn.
  if (!burnable) {
    requireAccessControl(c, ccipBurn, access, 'BURNER', undefined);
    c.setFunctionBody(['_burn(_msgSender(), amount);'], ccipBurn);
  }
}

const functions = defineFunctions({
  mint: {
    kind: 'public',
    args: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },
  burn: {
    kind: 'public',
    args: [{ name: 'amount', type: 'uint256' }],
  },
  getCCIPAdmin: {
    kind: 'public',
    args: [],
    returns: ['address'],
    mutability: 'view',
  },
  setCCIPAdmin: {
    kind: 'public',
    args: [{ name: 'newCCIPAdmin', type: 'address' }],
  },
});

export const ccipBurn = functions.burn;
