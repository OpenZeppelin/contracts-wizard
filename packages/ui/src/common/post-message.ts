import type { SolcInputSources } from '@openzeppelin/wizard/get-imports';

export type Message = ResizeMessage | TabChangeMessage | UnsupportedVersionMessage | DefenderDeployMessage;

export interface ResizeMessage {
  kind: 'oz-wizard-resize';
  height: number;
}

export interface TabChangeMessage {
  kind: 'oz-wizard-tab-change';
  tab: string;
}

export interface UnsupportedVersionMessage {
  kind: 'oz-wizard-unsupported-version';
}

export interface DefenderDeployMessage {
  kind: 'oz-wizard-defender-deploy';
  sources: SolcInputSources;
}

export function postMessage(msg: Message) {
  if (parent) {
    parent.postMessage(msg, '*');
  }
}

export function postMessageToIframe(id: 'defender-deploy', msg: Message) {
  const iframe: HTMLIFrameElement | null = document.getElementById(id) as HTMLIFrameElement;
  if (iframe) {
    iframe.contentWindow?.postMessage(msg, '*');
    // in case the iframe is still loading, waits
    // a second to fully load and tries again
    iframe.onload = () => {
      setTimeout(() => {
        iframe?.contentWindow?.postMessage(msg, '*');
      }, 1000);
    };
  }
}
