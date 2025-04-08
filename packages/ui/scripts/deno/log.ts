/// <reference lib="deno.ns" />
/// <reference lib="dom" />
import { green, red, yellow } from 'https://deno.land/std/fmt/colors.ts';

const originalConsole = { ...console };

console.log = (...messages: unknown[]) => originalConsole.log(green('[Info]'), ...messages);

console.warn = (...messages: unknown[]) => originalConsole.warn(red('[Error]'), ...messages);

console.error = (...messages: unknown[]) => originalConsole.error(yellow('[Warn]'), ...messages);
