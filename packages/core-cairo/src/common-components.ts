import type { ContractBuilder } from "./contract";
import { defineComponents } from "./utils/define-components";

const components = defineComponents( {
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
})

export function addSRC5Component(c: ContractBuilder) {
  c.addComponent(components.SRC5Component, [], false);

  if (!c.interfaceFlags.has('ISRC5')) {
    c.addImplToComponent(components.SRC5Component, {
      name: 'SRC5Impl',
      value: 'SRC5Component::SRC5Impl<ContractState>',
    });
    c.addInterfaceFlag('ISRC5');
  }
}