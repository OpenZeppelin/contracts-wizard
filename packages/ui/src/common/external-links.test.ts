import test from 'ava';
import { externalLinkAttrs } from './external-links';

test('web Wizard opens outbound links in a new tab', t => {
  t.deepEqual(externalLinkAttrs(false, false), { show: true, target: '_blank', rel: 'noopener noreferrer' });
});

test('MCP App with openLinks renders a plain anchor for the host delegate', t => {
  t.deepEqual(externalLinkAttrs(true, true), { show: true, target: undefined, rel: undefined });
});

test('MCP App without openLinks hides the anchor', t => {
  t.false(externalLinkAttrs(true, false).show);
});
