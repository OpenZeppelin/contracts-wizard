import type { Contract, GenericOptions, Kind } from '@openzeppelin/wizard';
import type { ComponentType } from 'svelte';
import type { SupportedLanguage } from '../../api/ai-assistant/types/languages';
import type { Language } from '../common/languages-types';
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
   * Whether to omit the Download Foundry package feature
   */
  omitZipFoundry: boolean;

  /**
   * Overrides for the Open in Remix feature
   */
  remix?: { label: string; url: string };

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
}

export const defaultOverrides: Overrides = {
  omitTabs: [],
  omitFeatures: new Map(),
  omitZipHardhat: () => false,
  overrideZipHardhat: undefined,
  omitZipFoundry: false,
  remix: undefined,
  sanitizeOmittedFeatures: (_: GenericOptions) => {},
  postConfigLanguage: undefined,
  aiAssistant: undefined,
};
