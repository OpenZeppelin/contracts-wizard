#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server';

async function main() {
  const transport = new StdioServerTransport();
  const server = createServer();
  await server.connect(transport);
  console.log("OpenZeppelin Contracts MCP Server is running...");
}

main().catch((error) => {
  console.error("Failed to start OpenZeppelin Contracts MCP Server:", error);
  process.exit(1);
});