export type Message = ResizeMessage | TabChangeMessage;

export interface ResizeMessage {
  kind: 'oz-wizard-resize';
  height: number;
}

export interface TabChangeMessage {
  kind: 'oz-wizard-tab-change';
  tab: string;
}

export function postMessage(msg: Message) {
  if (globalThis.parent) {
    globalThis.parent.postMessage(msg, '*');
  }
}
