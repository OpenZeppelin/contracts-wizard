import type { GenericOptions, Kind } from "@openzeppelin/wizard";

/**
 * For ecosystem Wizard apps that inherit the Solidity Wizard, they can override specific features in the UI
 */
export interface Overrides {
    omitTabs: Kind[];
    omitFeatures: Map<Kind, string[]>;
    omitZipFoundry: boolean;
    remix: { label: string; url: string } | undefined;
    removeOmittedFeatures: (opts: GenericOptions) => GenericOptions;
}

export const defaultOverrides: Overrides = {
    omitTabs: [],
    omitFeatures: new Map(),
    omitZipFoundry: false,
    remix: undefined,
    removeOmittedFeatures: (opts: GenericOptions) => opts,
};