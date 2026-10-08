import { getSelfArg } from './common-options';
import type { ContractBuilder } from './contract';
import { defineFunctions } from './utils/define-functions';

export function addVotes(c: ContractBuilder, explicitImplementations: boolean) {
  c.addUseClause('stellar_governance::votes', 'Votes');

  const votesTrait = {
    traitName: 'Votes',
    structName: c.name,
    tags: explicitImplementations ? ['contractimpl'] : ['contractimpl(contracttrait)'],
    section: 'Extensions',
  };

  if (explicitImplementations) {
    c.addUseClause('stellar_governance::votes', 'self', { alias: 'votes' });
    c.addTraitForEachFunctions(votesTrait, functions);
  } else {
    c.addTraitImplBlock(votesTrait);
  }
}

const functions = defineFunctions({
  get_votes: {
    args: [getSelfArg(), { name: 'account', type: 'Address' }],
    returns: 'u128',
    code: ['votes::get_votes(e, &account)'],
  },
  get_votes_at_checkpoint: {
    args: [getSelfArg(), { name: 'account', type: 'Address' }, { name: 'ledger', type: 'u32' }],
    returns: 'u128',
    code: ['votes::get_votes_at_checkpoint(e, &account, ledger)'],
  },
  get_total_supply: {
    args: [getSelfArg()],
    returns: 'u128',
    code: ['votes::get_total_supply(e)'],
  },
  get_total_supply_at_checkpoint: {
    args: [getSelfArg(), { name: 'ledger', type: 'u32' }],
    returns: 'u128',
    code: ['votes::get_total_supply_at_checkpoint(e, ledger)'],
  },
  get_delegate: {
    args: [getSelfArg(), { name: 'account', type: 'Address' }],
    returns: 'Option<Address>',
    code: ['votes::get_delegate(e, &account)'],
  },
  delegate: {
    args: [getSelfArg(), { name: 'account', type: 'Address' }, { name: 'delegatee', type: 'Address' }],
    code: ['votes::delegate(e, &account, &delegatee);'],
  },
});
