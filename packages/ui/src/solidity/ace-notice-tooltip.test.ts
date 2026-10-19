import test from 'ava';
import { aceNoticeTooltipProps } from './ace-notice-tooltip';

test('ace notice shows programmatically, not on hover', t => {
  t.is(aceNoticeTooltipProps.trigger, 'manual');
});

test('ace notice tells the user the action they still have to take', t => {
  const content = String(aceNoticeTooltipProps.content);
  t.regex(content, /will not apply until you deploy/);
  t.regex(content, /identity and credential registries/);
  t.regex(content, /https:\/\/docs\.chain\.link\/ace\/concepts\/cross-chain-identity/);
});
