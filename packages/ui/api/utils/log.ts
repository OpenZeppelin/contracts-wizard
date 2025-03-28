import { green, red, yellow } from 'https://deno.land/std/fmt/colors.ts';

const originalConsole = { ...console };

console.log = (...messages: unknown[]) => originalConsole.log(green('[API]'), ...messages);

console.warn = (...messages: unknown[]) => originalConsole.warn(red('[API Error]'), ...messages);

console.error = (...messages: unknown[]) => originalConsole.error(yellow('[API Warn]'), ...messages);
