export type MacrosOptions = {
  withComponents: boolean;
};

const options = {
  withComponentsOFF: { withComponents: false },
  withComponentsON: { withComponents: true },
} as const;

export const defaults: MacrosOptions = options.withComponentsOFF;
export type MacrosSubset = 'all' |'none' | 'with_components';

export function resolveMacrosOptions(subset: MacrosSubset): MacrosOptions[] {
  switch (subset) {
    case 'all':
      return [options.withComponentsOFF, options.withComponentsON];
    case 'none':
      return [options.withComponentsOFF];
    case 'with_components':
      return [options.withComponentsON];
    default: {
      const _: never = subset;
      throw new Error('Unknown MacrosSubset');
    }
  }
}
