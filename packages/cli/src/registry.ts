import type { z } from 'zod';
import { parseArgsFromSchema } from './cli-adapter';

import { erc20, erc721, erc1155, stablecoin, realWorldAsset, account, governor, custom } from '@openzeppelin/wizard';
import { solidityPrompts } from '@openzeppelin/wizard-common';
import {
  solidityERC20Schema,
  solidityERC721Schema,
  solidityERC1155Schema,
  solidityStablecoinSchema,
  solidityRWASchema,
  solidityAccountSchema,
  solidityGovernorSchema,
  solidityCustomSchema,
} from '@openzeppelin/wizard-common/schemas';

import {
  erc20 as cairoErc20,
  erc721 as cairoErc721,
  erc1155 as cairoErc1155,
  account as cairoAccount,
  multisig as cairoMultisig,
  governor as cairoGovernor,
  vesting as cairoVesting,
  custom as cairoCustom,
} from '@openzeppelin/wizard-cairo';
import { cairoPrompts } from '@openzeppelin/wizard-common';
import {
  cairoERC20Schema,
  cairoERC721Schema,
  cairoERC1155Schema,
  cairoAccountSchema,
  cairoMultisigSchema,
  cairoGovernorSchema,
  cairoVestingSchema,
  cairoCustomSchema,
} from '@openzeppelin/wizard-common/schemas';

import {
  fungible,
  governor as stellarGovernor,
  stablecoin as stellarStablecoin,
  nonFungible,
  vault as stellarVault,
} from '@openzeppelin/wizard-stellar';
import { stellarPrompts } from '@openzeppelin/wizard-common';
import {
  stellarFungibleSchema,
  stellarGovernorSchema,
  stellarStablecoinSchema,
  stellarNonFungibleSchema,
  stellarVaultSchema,
} from '@openzeppelin/wizard-common/schemas';

import { erc20 as stylusErc20, erc721 as stylusErc721, erc1155 as stylusErc1155 } from '@openzeppelin/wizard-stylus';
import { stylusPrompts } from '@openzeppelin/wizard-common';
import { stylusERC20Schema, stylusERC721Schema, stylusERC1155Schema } from '@openzeppelin/wizard-common/schemas';

import { erc7984 } from '@openzeppelin/wizard-confidential';
import { confidentialPrompts } from '@openzeppelin/wizard-common';
import { confidentialERC7984Schema } from '@openzeppelin/wizard-common/schemas';

import { hooks } from '@openzeppelin/wizard-uniswap-hooks';
import { uniswapHooksPrompts } from '@openzeppelin/wizard-common';
import { uniswapHooksHooksSchema } from '@openzeppelin/wizard-common/schemas';

export interface RegistryEntry<T extends z.ZodRawShape = z.ZodRawShape> {
  schema: T;
  print(opts: z.infer<z.ZodObject<T>>): string;
  run(argv: string[]): string;
  description: string;
}

function createRegistryEntry<T extends z.ZodRawShape>(
  schema: T,
  print: (opts: z.infer<z.ZodObject<T>>) => string,
  description: string,
): RegistryEntry<T> {
  return {
    schema,
    print(opts) {
      return print(opts);
    },
    run(argv) {
      const opts = parseArgsFromSchema(schema, argv);
      return print(opts);
    },
    description,
  };
}

export const registry = {
  // Solidity
  'solidity-erc20': createRegistryEntry(solidityERC20Schema, opts => erc20.print(opts), solidityPrompts.ERC20),
  'solidity-erc721': createRegistryEntry(solidityERC721Schema, opts => erc721.print(opts), solidityPrompts.ERC721),
  'solidity-erc1155': createRegistryEntry(solidityERC1155Schema, opts => erc1155.print(opts), solidityPrompts.ERC1155),
  'solidity-stablecoin': createRegistryEntry(
    solidityStablecoinSchema,
    opts => stablecoin.print(opts),
    solidityPrompts.Stablecoin,
  ),
  'solidity-rwa': createRegistryEntry(solidityRWASchema, opts => realWorldAsset.print(opts), solidityPrompts.RWA),
  'solidity-account': createRegistryEntry(solidityAccountSchema, opts => account.print(opts), solidityPrompts.Account),
  'solidity-governor': createRegistryEntry(
    solidityGovernorSchema,
    opts => governor.print(opts),
    solidityPrompts.Governor,
  ),
  'solidity-custom': createRegistryEntry(solidityCustomSchema, opts => custom.print(opts), solidityPrompts.Custom),

  // Cairo
  'cairo-erc20': createRegistryEntry(cairoERC20Schema, opts => cairoErc20.print(opts), cairoPrompts.ERC20),
  'cairo-erc721': createRegistryEntry(cairoERC721Schema, opts => cairoErc721.print(opts), cairoPrompts.ERC721),
  'cairo-erc1155': createRegistryEntry(cairoERC1155Schema, opts => cairoErc1155.print(opts), cairoPrompts.ERC1155),
  'cairo-account': createRegistryEntry(cairoAccountSchema, opts => cairoAccount.print(opts), cairoPrompts.Account),
  'cairo-multisig': createRegistryEntry(cairoMultisigSchema, opts => cairoMultisig.print(opts), cairoPrompts.Multisig),
  'cairo-governor': createRegistryEntry(cairoGovernorSchema, opts => cairoGovernor.print(opts), cairoPrompts.Governor),
  'cairo-vesting': createRegistryEntry(cairoVestingSchema, opts => cairoVesting.print(opts), cairoPrompts.Vesting),
  'cairo-custom': createRegistryEntry(cairoCustomSchema, opts => cairoCustom.print(opts), cairoPrompts.Custom),

  // Stellar
  'stellar-fungible': createRegistryEntry(stellarFungibleSchema, opts => fungible.print(opts), stellarPrompts.Fungible),
  'stellar-governor': createRegistryEntry(
    stellarGovernorSchema,
    opts => stellarGovernor.print(opts),
    stellarPrompts.Governor,
  ),
  'stellar-stablecoin': createRegistryEntry(
    stellarStablecoinSchema,
    opts => stellarStablecoin.print(opts),
    stellarPrompts.Stablecoin,
  ),
  'stellar-non-fungible': createRegistryEntry(
    stellarNonFungibleSchema,
    opts => nonFungible.print(opts),
    stellarPrompts.NonFungible,
  ),
  'stellar-vault': createRegistryEntry(stellarVaultSchema, opts => stellarVault.print(opts), stellarPrompts.Vault),

  // Stylus
  'stylus-erc20': createRegistryEntry(stylusERC20Schema, opts => stylusErc20.print(opts), stylusPrompts.ERC20),
  'stylus-erc721': createRegistryEntry(stylusERC721Schema, opts => stylusErc721.print(opts), stylusPrompts.ERC721),
  'stylus-erc1155': createRegistryEntry(stylusERC1155Schema, opts => stylusErc1155.print(opts), stylusPrompts.ERC1155),

  // Confidential
  'confidential-erc7984': createRegistryEntry(
    confidentialERC7984Schema,
    opts => erc7984.print(opts),
    confidentialPrompts.ERC7984,
  ),

  // Uniswap Hooks
  'uniswap-hooks': createRegistryEntry(uniswapHooksHooksSchema, opts => hooks.print(opts), uniswapHooksPrompts.Hooks),
} satisfies Record<string, RegistryEntry>;
