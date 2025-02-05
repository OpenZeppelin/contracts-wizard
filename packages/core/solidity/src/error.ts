export type OptionsErrorMessages = { [prop in string]?: string };

export class OptionsError extends Error {
  constructor(readonly messages: OptionsErrorMessages) {
    super("Invalid options for Governor");
  }
}
