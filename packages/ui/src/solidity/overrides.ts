import type { Kind } from "@openzeppelin/wizard";

/**
 * For ecosystem Wizard apps that inherit the Solidity Wizard, they can override specific features in the UI
 */
export interface Overrides {
    omitTabs: Kind[];
    omitFeatures: Map<Kind, string[]>;
    remix: { label: string; url: string } | undefined;
}