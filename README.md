# [OpenZeppelin Contracts Wizard](https://wizard.openzeppelin.com)

[![Solidity NPM Package](https://img.shields.io/npm/v/@openzeppelin/wizard?color=%234e5de4&label=%40openzeppelin%2Fwizard)](https://www.npmjs.com/package/@openzeppelin/wizard)
[![Cairo NPM Package](https://img.shields.io/npm/v/@openzeppelin/wizard-cairo?color=%23e55233&label=%40openzeppelin%2Fwizard-cairo)](https://www.npmjs.com/package/@openzeppelin/wizard-cairo)
[![Netlify Status](https://api.netlify.com/api/v1/badges/ca9b53e1-44eb-410d-aac7-31b2f5399b68/deploy-status)](https://app.netlify.com/sites/openzeppelin-contracts-wizard/deploys)

Contracts Wizard is a web application to interactively build a contract out of components from OpenZeppelin Contracts. Select the kind of contract that you want, set your parameters and desired features, and the Wizard will generate all of the code necessary. The resulting code is ready to be compiled and deployed, or it can serve as a starting point and customized further with application specific logic.

[![](./screenshot.png)](https://wizard.openzeppelin.com/)

## Development

Install dependencies with `yarn install`.

If you want to run the local API server you need to install [Deno](https://github.com/denoland/deno?tab=readme-ov-file#installation)

`packages/core` contains the code generation logic for each language under separately named subfolders. From each language's subfolder:

- Run `yarn test` to run the tests.
- Run `yarn test:update-snapshots` to update AVA snapshots and run the tests.
- Run `yarn lint` to run the linter across the codebase (optionally `yarn lint --fix` will automatically fix fixable issues, like formatting issues).

`packages/ui` is the interface built in Svelte. From the `packages/ui` directory, run `yarn dev` to spin up the client.
The client communicate with a small API server that you can start with `yarn dev:api`.

- By default, the local client server runs on port 8080. To use another port, set the environment variable `PORT`, for example: `PORT=800 yarn dev`
- Similarly, the local API server runs on port 3000. To use another port, set the environment variable `API_PORT`

You'll need to supply your own environment variables if you want to enable Wizard AI Assistant (OPENAI_API_KEY) and/or logging (REDIS_URL, REDIS_TOKEN).

From **root folder**:

- You can run yarn commands directly into `core/{language}` folders with `yarn run:core`.
  For example, running `yarn run:core cairo test` from the root directory will run tests for Cairo.
- You can also spin both the client and the API concurrently with `yarn dev`

## Embedding

To embed Contracts Wizard on your site, first include the script tag:

```html
<script async src="https://wizard.openzeppelin.com/build/embed.js"></script>
```

Then place `<oz-wizard></oz-wizard>` in the body where you want Contracts Wizard to load.

Optionally focus on specific tab with the `data-tab` attribute as in `<oz-wizard data-tab="ERC721"></oz-wizard>`.

For languages other than Solidity, use the `data-lang` attribute, for example: `<oz-wizard data-lang="cairo"></oz-wizard>`.

## API

The following describes how to use the Contracts Wizard programmatic API in your own applications.

- [Contracts Wizard API for Solidity](packages/core/solidity/README.md)
- [Contracts Wizard API for Cairo](packages/core/cairo/README.md)
