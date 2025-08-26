import type { GenericOptions, Kind } from "@openzeppelin/wizard";
import type { ComponentType } from "svelte";
import type { SupportedLanguage } from "../../api/ai-assistant/types/languages";

/**
 * For ecosystem Wizard apps that inherit the Solidity Wizard, they can override specific features in the UI
 */
export interface Overrides {
    omitTabs: Kind[];
    omitFeatures: Map<Kind, string[]>;
    omitZipFoundry: boolean;
    remix?: { label: string; url: string };
    removeOmittedFeatures: (opts: GenericOptions) => GenericOptions;
    aiAssistant?: {
        svelteComponent: ComponentType,
        language: SupportedLanguage,
        sampleMessages: string[]
    }
}

export const defaultOverrides: Overrides = {
    omitTabs: [],
    omitFeatures: new Map(),
    omitZipFoundry: false,
    remix: undefined,
    removeOmittedFeatures: (opts: GenericOptions) => opts,
    aiAssistant: undefined,
};