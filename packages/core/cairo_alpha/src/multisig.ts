import type { Contract } from './contract';
import { ContractBuilder } from './contract';
import type { CommonOptions } from './common-options';
import { contractDefaults as commonDefaults, withCommonDefaults } from './common-options';
import { setAccessControl } from './set-access-control';
import { setUpgradeableMultisig } from './set-upgradeable';
import { setInfo } from './set-info';
import { defineComponents } from './utils/define-components';
import { printContract } from './print';
import { OptionsError } from './error';
import { toUint, isNaturalNumber } from './utils/convert-strings';

export const defaults: Required<MultisigOptions> = {
  name: 'MyMultisig',
  quorum: '2',
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info,
  macros: commonDefaults.macros,
} as const;

export function printMultisig(opts: MultisigOptions = defaults): string {
  return printContract(buildMultisig(opts));
}

export interface MultisigOptions extends CommonOptions {
  name: string;
  quorum: string;
}

function withDefaults(opts: MultisigOptions): Required<MultisigOptions> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    quorum: opts.quorum ?? defaults.quorum,
  };
}

export function buildMultisig(opts: MultisigOptions): Contract {
  const allOpts = withDefaults(opts);
  const c = new ContractBuilder(allOpts.name, allOpts.macros);

  addBase(c, allOpts);
  setInfo(c, allOpts.info);
  setUpgradeableMultisig(c, allOpts.upgradeable);

  // A Multisig contract is exclusively governed by its own multisig process.
  // The collective approval of the designated signers determines all actions.
  // No other access-control mechanism should override or bypass this process.
  setAccessControl(c, false);

  return c;
}

function addBase(c: ContractBuilder, opts: MultisigOptions) {
  c.addUseClause('starknet', 'ContractAddress');
  const quorum = getQuorum(opts);
  c.addConstant({
    name: 'INITIAL_QUORUM',
    type: 'u32',
    value: quorum.toString(),
  });
  c.addConstructorArgument({
    name: 'signers',
    type: 'Span<ContractAddress>',
  });
  const initParams = [{ lit: 'INITIAL_QUORUM' }, { lit: 'signers' }];
  c.addComponent(components.MultisigComponent, initParams, true);
}

function getQuorum(opts: MultisigOptions): bigint {
  const quorumValue = opts.quorum;
  if (!isNaturalNumber(quorumValue)) {
    throw new OptionsError({
      quorum: 'Not a valid number',
    });
  }
  const quorum = toUint(quorumValue, 'quorum', 'u32');
  if (quorum === BigInt(0)) {
    throw new OptionsError({
      quorum: 'Quorum cannot be 0',
    });
  }
  return quorum;
}

const components = defineComponents({
  MultisigComponent: {
    path: 'openzeppelin_governance::multisig',
    substorage: {
      name: 'multisig',
      type: 'MultisigComponent::Storage',
    },
    event: {
      name: 'MultisigEvent',
      type: 'MultisigComponent::Event',
    },
    impls: [
      {
        name: 'MultisigImpl',
        embed: true,
        value: 'MultisigComponent::MultisigImpl<ContractState>',
      },
      {
        name: 'MultisigInternalImpl',
        embed: false,
        value: 'MultisigComponent::InternalImpl<ContractState>',
      },
    ],
  },
});
