export type Message = ResizeMessage | TabChangeMessage | UnsupportedVersionMessage;

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

export function postMessage(msg: Message) {
  if (parent) {
    parent.postMessage(msg, '*');
  }
}
