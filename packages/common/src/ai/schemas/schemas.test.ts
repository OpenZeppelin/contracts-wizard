import test from 'ava';
import { z } from 'zod';

import type { KindedOptions as SolidityKindedOptions } from '@openzeppelin/wizard';
import type { KindedOptions as CairoKindedOptions } from '@openzeppelin/wizard-cairo';
import type { KindedOptions as StellarKindedOptions } from '@openzeppelin/wizard-stellar';
import type { KindedOptions as StylusKindedOptions } from '@openzeppelin/wizard-stylus';
import type { KindedOptions as ConfidentialKindedOptions } from '@openzeppelin/wizard-confidential';
import type { KindedOptions as UniswapHooksKindedOptions } from '@openzeppelin/wizard-uniswap-hooks';

import {
  solidityERC20Schema,
  solidityERC721Schema,
  solidityERC1155Schema,
  solidityStablecoinSchema,
  solidityRWASchema,
  solidityAccountSchema,
  solidityGovernorSchema,
  solidityCustomSchema,
  cairoERC20Schema,
  cairoERC721Schema,
  cairoERC1155Schema,
  cairoAccountSchema,
  cairoMultisigSchema,
  cairoGovernorSchema,
  cairoVestingSchema,
  cairoCustomSchema,
  stellarFungibleSchema,
  stellarStablecoinSchema,
  stellarNonFungibleSchema,
  stylusERC20Schema,
  stylusERC721Schema,
  stylusERC1155Schema,
  confidentialERC7984Schema,
  uniswapHooksHooksSchema,
} from './index';

/**
 * Verifies that every field in a Zod schema shape has a .describe() string.
 * Guards against accidentally dropping descriptions when modifying schemas.
 */
function assertAllFieldsHaveDescriptions(
  t: { pass: () => void; fail: (msg: string) => void },
  shape: z.ZodRawShape,
  prefix = '',
) {
  for (const [key, schema] of Object.entries(shape)) {
    const zodSchema = schema as z.ZodTypeAny;
    const fullKey = prefix ? `${prefix}.${key}` : key;

    // Unwrap optional to check inner type
    let innerSchema = zodSchema;
    if (innerSchema._def.typeName === 'ZodOptional') {
      innerSchema = innerSchema._def.innerType as z.ZodTypeAny;
    }

    // For ZodObject fields, recurse into inner fields (the object itself may or may not have a description)
    if (innerSchema._def.typeName === 'ZodObject') {
      assertAllFieldsHaveDescriptions(t, (innerSchema as z.ZodObject<z.ZodRawShape>).shape, fullKey);
      continue;
    }

    const desc = zodSchema.description ?? zodSchema._def?.innerType?.description;
    if (!desc) {
      t.fail(`Field "${fullKey}" is missing a .describe() string`);
      return;
    }
  }
  t.pass();
}

// --- Description presence tests ---

const allSchemas: [string, z.ZodRawShape][] = [
  ['solidityERC20', solidityERC20Schema],
  ['solidityERC721', solidityERC721Schema],
  ['solidityERC1155', solidityERC1155Schema],
  ['solidityStablecoin', solidityStablecoinSchema],
  ['solidityRWA', solidityRWASchema],
  ['solidityAccount', solidityAccountSchema],
  ['solidityGovernor', solidityGovernorSchema],
  ['solidityCustom', solidityCustomSchema],
  ['cairoERC20', cairoERC20Schema],
  ['cairoERC721', cairoERC721Schema],
  ['cairoERC1155', cairoERC1155Schema],
  ['cairoAccount', cairoAccountSchema],
  ['cairoMultisig', cairoMultisigSchema],
  ['cairoGovernor', cairoGovernorSchema],
  ['cairoVesting', cairoVestingSchema],
  ['cairoCustom', cairoCustomSchema],
  ['stellarFungible', stellarFungibleSchema],
  ['stellarStablecoin', stellarStablecoinSchema],
  ['stellarNonFungible', stellarNonFungibleSchema],
  ['stylusERC20', stylusERC20Schema],
  ['stylusERC721', stylusERC721Schema],
  ['stylusERC1155', stylusERC1155Schema],
  ['confidentialERC7984', confidentialERC7984Schema],
  ['uniswapHooksHooks', uniswapHooksHooksSchema],
];

for (const [name, shape] of allSchemas) {
  test(`${name} schema: all fields have descriptions`, t => {
    assertAllFieldsHaveDescriptions(t, shape);
  });
}

// --- Type sync tests ---
// These are compile-time only. If a schema produces a type incompatible with
// the wizard options interface, TypeScript will error when compiling this file.
// The pattern mirrors _typeAssertions in the MCP schema files.

function _solidityTypeAssertions() {
  const _: {
    [K in keyof SolidityKindedOptions]: Omit<SolidityKindedOptions[K], 'kind'>;
  } = {
    ERC20: z.object(solidityERC20Schema).parse({}),
    ERC721: z.object(solidityERC721Schema).parse({}),
    ERC1155: z.object(solidityERC1155Schema).parse({}),
    Stablecoin: z.object(solidityStablecoinSchema).parse({}),
    RealWorldAsset: z.object(solidityRWASchema).parse({}),
    Account: z.object(solidityAccountSchema).parse({}),
    Governor: z.object(solidityGovernorSchema).parse({}),
    Custom: z.object(solidityCustomSchema).parse({}),
  };
}

function _cairoTypeAssertions() {
  const _: {
    [K in keyof CairoKindedOptions]: Omit<CairoKindedOptions[K], 'kind'>;
  } = {
    ERC20: z.object(cairoERC20Schema).parse({}),
    ERC721: z.object(cairoERC721Schema).parse({}),
    ERC1155: z.object(cairoERC1155Schema).parse({}),
    Account: z.object(cairoAccountSchema).parse({}),
    Multisig: z.object(cairoMultisigSchema).parse({}),
    Governor: z.object(cairoGovernorSchema).parse({}),
    Vesting: z.object(cairoVestingSchema).parse({}),
    Custom: z.object(cairoCustomSchema).parse({}),
  };
}

function _stellarTypeAssertions() {
  const _: {
    [K in keyof StellarKindedOptions]: Omit<StellarKindedOptions[K], 'kind'>;
  } = {
    Fungible: z.object(stellarFungibleSchema).parse({}),
    Stablecoin: z.object(stellarStablecoinSchema).parse({}),
    NonFungible: z.object(stellarNonFungibleSchema).parse({}),
  };
}

function _stylusTypeAssertions() {
  const _: {
    [K in keyof StylusKindedOptions]: Omit<StylusKindedOptions[K], 'kind'>;
  } = {
    ERC20: z.object(stylusERC20Schema).parse({}),
    ERC721: z.object(stylusERC721Schema).parse({}),
    ERC1155: z.object(stylusERC1155Schema).parse({}),
  };
}

function _confidentialTypeAssertions() {
  const _: {
    [K in keyof ConfidentialKindedOptions]: Omit<ConfidentialKindedOptions[K], 'kind'>;
  } = {
    ERC7984: z.object(confidentialERC7984Schema).parse({}),
  };
}

function _uniswapHooksTypeAssertions() {
  const _: {
    [K in keyof UniswapHooksKindedOptions]: Omit<UniswapHooksKindedOptions[K], 'kind'>;
  } = {
    Hooks: z.object(uniswapHooksHooksSchema).parse({}),
  };
}

test('type assertions compile (schema-to-options type sync)', t => {
  // These functions are never called — they only need to compile.
  // If a schema drifts from its wizard options interface, this file won't compile.
  void _solidityTypeAssertions;
  void _cairoTypeAssertions;
  void _stellarTypeAssertions;
  void _stylusTypeAssertions;
  void _confidentialTypeAssertions;
  void _uniswapHooksTypeAssertions;
  t.pass();
});
