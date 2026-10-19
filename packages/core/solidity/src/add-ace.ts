import type { ContractBuilder } from './contract';
import { supportsInterface } from './common-functions';
import type { Access } from './set-access-control';
import { setAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';
import { ccipBurn } from './add-ccip';

/** Protect external token operations so ACE sees their actual selector and calldata. */
export function addACE(c: ContractBuilder, access: Access, mintable: boolean, burnable: boolean, ccip: boolean) {
  setAccessControl(c, access);
  const PolicyProtectedBase = {
    name: 'PolicyProtectedBase',
    path: '@chainlink/ace/packages/policy-management/src/core/PolicyProtectedBase.sol',
    transpiled: true,
  };
  c.addParent(PolicyProtectedBase, [{ lit: 'policyEngine' }]);
  c.addConstructorArgument({ type: 'address', name: 'policyEngine' });
  c.addOverride(PolicyProtectedBase, supportsInterface);
  c.addOverride(PolicyProtectedBase, functions._authorizeAttachPolicyEngine);
  c.addModifier(
    access === 'roles' ? 'onlyRole(DEFAULT_ADMIN_ROLE)' : 'onlyOwner',
    functions._authorizeAttachPolicyEngine,
  );
  c.setFunctionBody([], functions._authorizeAttachPolicyEngine);

  // Policies run where value moves. approve and permit only set an allowance;
  // spending it goes through transferFrom, or burnFrom when Burnable, and both
  // are guarded below. Permit2 also spends through transferFrom, with Permit2 as
  // the caller. approve and permit are left unguarded together on purpose:
  // guarding approve alone would leave permit as a bypass. Policies on permit
  // that read the owner, spender or amount would need an extractor ACE does not
  // ship (ERC20ApproveExtractor accepts approve only), taking the owner from the
  // arguments because msg.sender is whoever submits the signature.
  for (const fn of [functions.transfer, functions.transferFrom]) {
    c.addOverride({ name: 'ERC20' }, fn);
    c.addModifier('runPolicy', fn);
  }
  // Token authorization was added first; policy execution cannot grant token powers.
  if (mintable || ccip) c.addModifier('runPolicy', functions.mint);
  // Guard inherited public burning too, including when CCIP uses that path.
  if (burnable) {
    c.addOverride({ name: 'ERC20Burnable' }, ccipBurn);
    c.addOverride({ name: 'ERC20Burnable' }, functions.burnFrom);
    c.addModifier('runPolicy', functions.burnFrom);
  }
  if (burnable || ccip) c.addModifier('runPolicy', ccipBurn);

  c.addTopLevelComment(
    'ACE checks transfer, transferFrom, and exposed mint/burn entry points; approve and permit only manage allowances.',
  );
}

const functions = defineFunctions({
  _authorizeAttachPolicyEngine: {
    kind: 'internal',
    args: [{ name: 'policyEngine', type: 'address' }],
  },
  transfer: {
    kind: 'public',
    args: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    returns: ['bool'],
  },
  transferFrom: {
    kind: 'public',
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    returns: ['bool'],
  },
  mint: {
    kind: 'public',
    args: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },
  burnFrom: {
    kind: 'public',
    args: [
      { name: 'account', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },
});
