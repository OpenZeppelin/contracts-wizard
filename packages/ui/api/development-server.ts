import { getEnvironmentVariableOr } from './utils/env.ts';
import './utils/log.ts';

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
      // Dynamically import the route handler
      const module = await import(`file://${Deno.cwd()}/api${calledEndpoint}.ts`);

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
