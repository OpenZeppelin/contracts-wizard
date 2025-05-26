# OpenZeppelin Contracts Wizard MCP Server

A Model Context Protocol (MCP) server that allows AI agents to generate smart contracts using the OpenZeppelin Contracts Wizard.

> [!WARNING]
> AI agents determine when and how to use the MCP server and therefore may produce inaccurate results. You should always review any information produced by the AI agent to ensure that any results are accurate and suit your purposes.

## Features

### Solidity

Provides the following tools:
- `solidity-generate-erc20`: Generate an ERC20 smart contract for Solidity
- `solidity-generate-erc721`: Generate an ERC721 smart contract for Solidity
- `solidity-generate-erc1155`: Generate an ERC1155 smart contract for Solidity
- `solidity-generate-stablecoin`: (Experimental) Generate a stablecoin smart contract for Solidity
- `solidity-generate-account`: (Experimental) Generate an account smart contract for Solidity
- `solidity-generate-custom`: Generate a custom smart contract for Solidity
- `solidity-generate-governor`: Generate a governor smart contract for Solidity
- `solidity-generate-rwa`: (Experimental) Generate a real-world asset smart contract for Solidity

## Installation

### MCP Configuration

Add the following to your MCP configuration file:
```
{
  "mcpServers": {
    "OpenZeppelin Contracts Wizard": {
      "command": "npx",
      "args": [
        "@ericglau/wizard-mcp"
      ]
    }
  }
}
```

### Windsurf

1. Go to Settings > Windsurf Settings > Cascade > Manage Plugins > View raw config.
2. Add the above [MCP Configuration](#mcp-configuration) to the config file and save.
3. Click Refresh on the Manage Plugins page.
4. See the MCP Server in the list.

### Cursor

1. Go to Settings > Cursor Settings > MCP > Add new global MCP server.
2. Add the above [MCP Configuration](#mcp-configuration) to the config file and save.
3. See the MCP Server in the list.

## Usage

In your IDE's Write or Agent mode, ask the AI agent to write or modify smart contracts for your use case. When the AI agent determines it is appropriate to do so, it will use the MCP server to generate the contracts or determine best practices for your use case.
