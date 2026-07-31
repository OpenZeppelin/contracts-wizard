import type { Props } from 'tippy.js';

/**
 * Tippy.js properties for a notice that is shown programmatically when the user selects a
 * combination of options that needs a warning, rather than on hover.
 */
export function manualNoticeTooltipProps(content: string): Partial<Props> {
  return {
    content,
    trigger: 'manual',
    placement: 'bottom',
    maxWidth: '22em',
    allowHTML: true,
    interactive: true,
  };
}
