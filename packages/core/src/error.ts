export class OptionsValidationError<T> extends Error {
  constructor(
    readonly errors: Partial<Record<keyof T, string>>,
  ) {
    super("Invalid options for Governor");
  }
}
