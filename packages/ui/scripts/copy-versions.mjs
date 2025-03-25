import { mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import { contractsVersionTag as cairoVersion } from '@openzeppelin/wizard-cairo';
import { contractsVersionTag as cairoAlphaVersion } from '@openzeppelin/wizard-cairo-alpha';

const json = {
  cairo: cairoVersion,
  cairoAlpha: cairoAlphaVersion,
};
const content = `var contractsVersions = ${JSON.stringify(json, null, 2)};`;

const dir = 'public/build';
mkdirSync(dir, { recursive: true });
writeFileSync(resolve(dir, 'versions.js'), content, 'utf8');
