import type { BaseImplementedTrait, ContractBuilder } from './contract';
import { defineComponents } from './utils/define-components';

export const tokenTypes = ['ERC20', 'ERC721'] as const;
export type Token = (typeof tokenTypes)[number];

const components = defineComponents({
  SRC5Component: {
    path: 'openzeppelin::introspection::src5',
    substorage: {
      name: 'src5',
      type: 'SRC5Component::Storage',
    },
    event: {
      name: 'SRC5Event',
      type: 'SRC5Component::Event',
    },
    impls: [],
  },

  VotesComponent: {
    path: 'openzeppelin::governance::votes',
    substorage: {
      name: 'votes',
      type: 'VotesComponent::Storage',
    },
    event: {
      name: 'VotesEvent',
      type: 'VotesComponent::Event',
    },
    impls: [
      {
        name: 'VotesInternalImpl',
        embed: false,
        value: 'VotesComponent::InternalImpl<ContractState>',
      },
    ],
  },

  NoncesComponent: {
    path: 'openzeppelin::utils::cryptography::nonces',
    substorage: {
      name: 'nonces',
      type: 'NoncesComponent::Storage',
    },
    event: {
      name: 'NoncesEvent',
      type: 'NoncesComponent::Event',
    },
    impls: [
      {
        name: 'NoncesImpl',
        value: 'NoncesComponent::NoncesImpl<ContractState>',
      },
    ],
  },
});

export function addSRC5Component(c: ContractBuilder, section?: string) {
  c.addComponent(components.SRC5Component, [], false);

  if (!c.interfaceFlags.has('ISRC5')) {
    c.addImplToComponent(components.SRC5Component, {
      name: 'SRC5Impl',
      value: 'SRC5Component::SRC5Impl<ContractState>',
      section,
    });
    c.addInterfaceFlag('ISRC5');
  }
}

export function addVotesComponent(c: ContractBuilder, name: string, version: string, section?: string) {
  addSNIP12Metadata(c, name, version, section);
  c.addComponent(components.NoncesComponent, [], false);
  c.addComponent(components.VotesComponent, [], false);
  c.addImplToComponent(components.VotesComponent, {
    name: 'VotesImpl',
    value: `VotesComponent::VotesImpl<ContractState>`,
  });
}

export function addSNIP12Metadata(c: ContractBuilder, name: string, version: string, section?: string) {
  c.addUseClause('openzeppelin::utils::cryptography::snip12', 'SNIP12Metadata');

  const SNIP12Metadata: BaseImplementedTrait = {
    name: 'SNIP12MetadataImpl',
    of: 'SNIP12Metadata',
    tags: [],
    priority: 0,
    section,
  };
  c.addImplementedTrait(SNIP12Metadata);

  c.addFunction(SNIP12Metadata, {
    name: 'name',
    args: [],
    returns: 'felt252',
    code: [`'${name}'`],
  });

  c.addFunction(SNIP12Metadata, {
    name: 'version',
    args: [],
    returns: 'felt252',
    code: [`'${version}'`],
  });
}
