import type { GenericOptions, Kind } from '@openzeppelin/wizard';
import type { ComponentType } from 'svelte';
import type { SupportedLanguage } from '../../api/ai-assistant/types/languages';

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
  omitZipHardhat: boolean;

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
   * Removes or modifies the options as appropriate.
   */
  sanitizeOmittedFeatures: (opts: GenericOptions) => GenericOptions;

  /**
   * AI Assistant overrides
   */
  aiAssistant?: {
    svelteComponent: ComponentType;
    language: SupportedLanguage;
    sampleMessages: string[];
  };
}

export const defaultOverrides: Overrides = {
  omitTabs: [],
  omitFeatures: new Map(),
  omitZipHardhat: false,
  omitZipFoundry: false,
  remix: undefined,
  sanitizeOmittedFeatures: (opts: GenericOptions) => opts,
  aiAssistant: undefined,
};
