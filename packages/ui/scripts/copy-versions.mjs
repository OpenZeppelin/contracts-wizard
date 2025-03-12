import { writeFileSync } from 'fs';
import { resolve } from 'path';

import { contractsVersionTag as cairoVersion } from '@openzeppelin/wizard-cairo';
import { contractsVersionTag as cairoAlphaVersion } from '@openzeppelin/wizard-cairo-alpha';

const json = {
  cairo: cairoVersion,
  cairoAlpha: cairoAlphaVersion,
};
const content = `var contractsVersions = ${JSON.stringify(json, null, 2)};`;

const outputPath = resolve('public/build/versions.js');

writeFileSync(outputPath, content, 'utf8');
