# OpenZeppelin Contracts Wizard MCP Server

A Model Context Protocol (MCP) server that allows AI agents to generate smart contracts using the [OpenZeppelin Contracts Wizard](https://wizard.openzeppelin.com/).

> [!WARNING]
> AI agents determine when and how to use the MCP server and therefore may produce inaccurate results. You should always review any information produced by the AI agent to ensure that any results are accurate and suit your purposes.

## Features

Provides tools to generate smart contract source code for the following languages and contract kinds. Resulting contracts use OpenZeppelin Contracts libraries for each language. Tools are named in the format `<language>-<contract>`.

| Language | Contracts |
| --- | --- |
| solidity | erc20, erc721, erc1155, stablecoin, rwa, account, governor, custom |
| cairo | erc20, erc721, erc1155, account, multisig, governor, vesting, custom |
| stellar | fungible, stablecoin, non-fungible |
| stylus | erc20, erc721, erc1155 |


## Installation

### Cursor

For quick installation, use the button below.

[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=openzeppelin-contracts-wizard&config=eyJjb21tYW5kIjoibnB4IEBvcGVuemVwcGVsaW4vd2l6YXJkLW1jcCJ9)

For manual installation:
1. Go to Settings > Cursor Settings > MCP Tools > New MCP Server.
2. Add the following to your MCP configuration file and save.
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
3. See the MCP server in the list.

### Windsurf

1. Go to Settings > Windsurf Settings > Cascade > Manage Plugins > View raw config.
2. Add the following to your MCP configuration file and save.
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
3. Click Refresh on the Manage Plugins page.
4. See the MCP server in the list.

### VS Code

For quick installation, use one of the buttons below.

[![Add to VS Code](https://img.shields.io/badge/VS_Code-NPM-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=openzeppelin-contracts-wizard&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22%40openzeppelin%2Fwizard-mcp%22%5D%7D) [![Add to VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-NPM-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=openzeppelin-contracts-wizard&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22%40openzeppelin%2Fwizard-mcp%22%5D%7D&quality=insiders)

For manual installation:
1. Follow VS Code documentation to [Add an MCP server to your workspace](https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server-to-your-workspace) using the following configuration:
```
{
  "servers": {
    "openzeppelin-contracts-wizard": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "@openzeppelin/wizard-mcp"
      ]
    }
  }
}
```
2. Start the MCP server according to [Manage MCP servers](https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_manage-mcp-servers).

## Usage

In your IDE's Write or Agent mode, ask the AI agent to write or modify smart contracts for your use case. When the AI agent determines it is appropriate to do so, it will use the MCP server to generate the contracts or determine best practices for your use case.
