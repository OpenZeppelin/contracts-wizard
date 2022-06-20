import type { ContractBuilder } from "../contract";
import { defineModules } from "./define-modules";

const modules = defineModules( {
  cairo_builtins: {
    path: 'starkware.cairo.common.cairo_builtins',
    usePrefix: false
  },
})

export function importHashBuiltin(c: ContractBuilder) {
  c.addModule(modules.cairo_builtins, [], [], false);
  c.addModuleFunction(modules.cairo_builtins, 'HashBuiltin');
}