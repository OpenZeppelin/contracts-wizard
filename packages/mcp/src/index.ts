#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server';

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
(async () => {
  const server = createServer();
  await server.connect(transport);
})();
