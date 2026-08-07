import type { AccountOptions } from '../account';
import { policyOptions } from '../account';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyAccount'],
  delegatedSigners: booleans,
  ed25519Signers: booleans,
  webauthnSigners: booleans,
  policy: policyOptions,
  executionEntryPoint: booleans,
  upgradeable: booleans,
  info: infoOptions,
};

export function* generateAccountOptions(): Generator<Required<AccountOptions>> {
  yield* generateAlternatives(blueprint);
}
