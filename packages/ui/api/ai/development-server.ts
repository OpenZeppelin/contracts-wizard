/// <reference lib="deno.ns" />
/// <reference lib="dom" />
import './utils/log.ts';
import { getEnvironmentVariableOr } from './utils/env.ts';
import { dirname } from 'https://deno.land/std/path/mod.ts';
import { join } from 'https://deno.land/std@0.224.0/path/mod.ts';

const listAll = async (dirPath: string) => {
  for await (const entry of Deno.readDir(dirPath)) {
    const fullPath = join(dirPath, entry.name);
    console.log(fullPath);

    if (entry.isDirectory) {
      await listAll(fullPath);
    }
  }
};

const developmentCors = new Response(undefined, {
  status: 200,
  headers: new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }),
});

Deno.serve(
  { port: Number(getEnvironmentVariableOr('API_PORT', '3000')) },
  async (request: Request): Promise<Response> => {
    if (request.method === 'OPTIONS') return developmentCors;

    const calledEndpoint = new URL(request.url).pathname;

    try {
      console.log(`file://${dirname(Deno.cwd())}/ai/paths/${calledEndpoint}.ts`);

      await listAll('.');

      // Dynamically import the route handler
      const module = await import(`file://${dirname(Deno.cwd())}/ai/paths${calledEndpoint}.ts`);

      if (module.default) {
        return module.default(request);
      } else {
        return new Response(`Not Found ${calledEndpoint}`, { status: 404 });
      }
    } catch (error) {
      console.error(`Error ${calledEndpoint}:`, error);
      return new Response('Error', { status: 500 });
    }
  },
);
