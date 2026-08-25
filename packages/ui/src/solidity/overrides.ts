import type { Contract, GenericOptions, Kind, Options as PrintOptions } from '@openzeppelin/wizard';
import type { ComponentType } from 'svelte';
import type { SupportedLanguage } from '../../api/ai-assistant/types/languages';
import type { Language } from '../common/languages-types';
import type { DownloadAction } from '../common/post-config';
import type JSZip from 'jszip';

/**
 * For ecosystem Wizard apps that inherit the Solidity Wizard, they can override specific features in the UI.
 */
export interface Overrides {
  /**
   * Contract kinds to omit
   */
  omitTabs: Kind[];

  /**
   * Display-only labels for the kind tabs. Internal kind values stay the same
   * (ERC20/ERC721/ERC1155/...) — only what users see changes. Used for
   * ecosystems whose contract library renames the token standards
   * (e.g. TRON uses TRC20/TRC721/TRC1155).
   */
  tabLabels?: Partial<Record<Kind, string>>;

  /**
   * Map from contract kind to features to omit
   */
  omitFeatures: Map<Kind, string[]>;

  /**
   * Whether to omit the Download Hardhat package feature
   */
  omitZipHardhat: (opts?: GenericOptions) => boolean;

  /**
   * Override for Download Hardhat package function
   */
  overrideZipHardhat: ((c: Contract, opts?: GenericOptions) => Promise<JSZip>) | undefined;

  /**
   * Whether to omit the Download Foundry package feature.
   * Accepts the current generic options so ecosystems can gate on, for example,
   * `opts.upgradeable` when their downstream toolchain doesn't support it
   * (matches the shape of `omitZipHardhat`).
   */
  omitZipFoundry: (opts?: GenericOptions) => boolean;

  /**
   * Override for the second download tab (originally "Foundry"). When set,
   * this function is called instead of the default `zipFoundry`; the tab
   * label can be customized via `secondaryDownloadLabel`.
   */
  overrideZipFoundry?: (c: Contract, opts?: GenericOptions) => Promise<JSZip>;

  /**
   * Label overrides for the secondary (originally "Foundry") download tab.
   * Set when an ecosystem replaces Foundry with a different toolchain
   * (e.g. TronBox).
   */
  secondaryDownloadLabel?: {
    title: string;
    description: string;
  };

  /**
   * Analytics action emitted when the secondary download tab is used.
   * Defaults to `'download-foundry'` to preserve the existing telemetry.
   */
  secondaryDownloadAction?: DownloadAction;

  /**
   * Whether to omit the "Open in Remix" action. Useful for ecosystems whose
   * import paths or contracts library Remix cannot resolve.
   */
  omitOpenInRemix?: boolean;

  /**
   * Override the remappings passed to Remix when "Open in Remix" is used.
   * Defaults to `@openzeppelin/wizard`'s `getVersionedRemappings(opts)`.
   * Set this when the generated source uses a non-default contracts
   * library (e.g. `@openzeppelin/tron-contracts`).
   */
  overrideVersionedRemappings?: (opts?: GenericOptions) => string[];

  /**
   * Print options passed to `printContract` when the UI renders the source for
   * display, copy, and single-file download. Ecosystems use this to apply a
   * structured library profile (e.g. TRON's TRC* names + import paths) instead
   * of post-processing rendered text. Each ecosystem zip generator applies the
   * same profile internally; this hook only affects the UI-side rendering.
   */
  printOptions?: PrintOptions;

  /**
   * A function to sanitize omitted features from the Solidity Wizard options.
   * Removes or modifies the options as appropriate by mutating the input object.
   */
  sanitizeOmittedFeatures: (opts: GenericOptions) => void;

  /**
   * Language identifier when posting the configuration
   */
  postConfigLanguage?: Language;

  /**
   * AI Assistant overrides
   */
  aiAssistant?: {
    svelteComponent: ComponentType;
    language: SupportedLanguage;
  };

  /**
   * Override the default `blockTime` (seconds per block) that the Governor
   * controls display and use for block-number-based voting durations. When
   * unset, the Solidity default (12) is used. TRON sets this to 3.
   */
  defaultBlockTime?: number;
}

export const defaultOverrides: Overrides = {
  omitTabs: [],
  tabLabels: undefined,
  omitFeatures: new Map(),
  omitZipHardhat: () => false,
  overrideZipHardhat: undefined,
  omitZipFoundry: () => false,
  overrideZipFoundry: undefined,
  secondaryDownloadLabel: undefined,
  secondaryDownloadAction: undefined,
  omitOpenInRemix: false,
  overrideVersionedRemappings: undefined,
  printOptions: undefined,
  sanitizeOmittedFeatures: (_: GenericOptions) => {},
  postConfigLanguage: undefined,
  aiAssistant: undefined,
  defaultBlockTime: undefined,
};
