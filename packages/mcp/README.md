# OpenZeppelin Contracts Wizard MCP Server

A Model Context Protocol (MCP) server that allows AI agents to generate smart contracts using the [OpenZeppelin Contracts Wizard](https://wizard.openzeppelin.com/).

> [!WARNING]
> AI agents determine when and how to use the MCP server and therefore may produce inaccurate results. You should always review any information produced by the AI agent to ensure that any results are accurate and suit your purposes.

## Features

Provides tools to generate smart contracts for the following languages and contract kinds. Tools are named in the format `<language>-<contract>`.

| Language | Contracts |
| --- | --- |
| solidity | erc20, erc721, erc1155, stablecoin, rwa, account, governor, custom |
| cairo | erc20, erc721, erc1155, account, multisig, governor, vesting, custom |
| stellar | fungible, non-fungible |
| stylus | erc20, erc721, erc1155 |


## Installation

### MCP Configuration

Add the following to your MCP configuration file:
```
{
  "mcpServers": {
    "openzeppelin-contracts-wizard": {
      "command": "npx",
      "args": [
        "@openzeppelin/wizard-mcp"
      ]
    }
  }
}
```

### Windsurf

1. Go to Settings > Windsurf Settings > Cascade > Manage Plugins > View raw config.
2. Add the above [MCP Configuration](#mcp-configuration) to the config file and save.
3. Click Refresh on the Manage Plugins page.
4. See the MCP server in the list.

### Cursor

1. Go to Settings > Cursor Settings > MCP Tools > New MCP Server.
2. Add the above [MCP Configuration](#mcp-configuration) to the config file and save.
3. See the MCP server in the list.

## Usage

In your IDE's Write or Agent mode, ask the AI agent to write or modify smart contracts for your use case. When the AI agent determines it is appropriate to do so, it will use the MCP server to generate the contracts or determine best practices for your use case.
