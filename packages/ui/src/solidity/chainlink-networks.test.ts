import test from 'ava';
import { OptionsError } from '@openzeppelin/wizard';
import * as tron from '../tron/handle-unsupported-features';
import * as polkadot from '../polkadot/handle-unsupported-features';

for (const [name, network] of Object.entries({ tron, polkadot })) {
  for (const kind of ['ERC20', 'Stablecoin', 'RealWorldAsset'] as const) {
    test(`${name} hides Chainlink choices for ${kind}`, t => {
      const omitted = network.defineOmitFeatures().get(kind) ?? [];
      t.true(omitted.includes('ccip'));
      t.true(omitted.includes('chainlinkAce'));
    });
    for (const feature of [{ crossChainBridging: 'chainlink-ccip' as const }, { chainlinkAce: true as const }]) {
      test(`${name} rejects imported ${kind} ${JSON.stringify(feature)} without changing intent`, t => {
        const opts = { kind, name: 'Token', symbol: 'TKN', ...feature };
        const before = JSON.stringify(opts);
        const error = t.throws(() => network.sanitizeOmittedFeatures(opts), { instanceOf: OptionsError });
        t.regex(JSON.stringify(error?.messages), /not supported/i);
        t.is(JSON.stringify(opts), before);
      });
    }
  }
}
