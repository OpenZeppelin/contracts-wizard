export interface Chat {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
