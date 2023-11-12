import type { GenericOptions } from '@openzeppelin/wizard';
import type { GenericOptions as CairoOptions } from '@openzeppelin/wizard-cairo';
import type { Language } from './post-config';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type Chat = {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

export async function postChats(opts: Required<GenericOptions> | Required<CairoOptions>, chats: Chat[], language: Language) {
  window.gtag?.('event', 'chat_update', { ...opts, chats, wizard_lang: language });
}