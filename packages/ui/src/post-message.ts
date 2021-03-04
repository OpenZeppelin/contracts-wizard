export type Message = ResizeMessage;

export interface ResizeMessage {
  kind: 'oz-wizard-resize';
  height: number;
}

export function postMessage(msg: Message) {
  if (parent) {
    parent.postMessage(msg, '*');
  }
}
