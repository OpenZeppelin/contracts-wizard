import type { GenericOptions as SolidityOptions } from "@openzeppelin/wizard";
import type { GenericOptions as CairoOptions } from "@openzeppelin/wizard-cairo";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type Action =
  | "copy"
  | "remix"
  | "download-file"
  | "download-hardhat"
  | "download-foundry"
  | "defender";
export type Language = "solidity" | "cairo" | "stylus" | "stellar";

export async function postConfig(
  opts: Required<SolidityOptions> | Required<CairoOptions>,
  action: Action,
  language: Language,
) {
  window.gtag?.("event", "wizard_action", {
    ...opts,
    action,
    wizard_lang: language,
  });
}
