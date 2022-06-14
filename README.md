# [OpenZeppelin Contracts Wizard](https://wizard.openzeppelin.com)

Contracts Wizard is a web application to interactively build a contract out of components from OpenZeppelin Contracts. Select the kind of contract that you want, set your parameters and desired features, and the Wizard will generate all of the code necessary. The resulting code is ready to be compiled and deployed, or it can serve as a starting point and customized further with application specific logic.

![](./screenshot.png)

## Development

`packages/core` contains the code generation logic for Solidity.

`packages/core-cairo` contains the code generation logic for Cairo.

`packages/ui` is the interface built in Svelte. `yarn dev` spins up a local server to develop the UI.

## Embedding

To embed Contracts Wizard on your site, first include the script tag:

```html
<script async src="https://wizard.openzeppelin.com/build/embed.js"></script>
```

Then place `<oz-wizard></oz-wizard>` in the body where you want Contracts Wizard to load.

Optionally focus on specific tab with the `data-tab` attribute as in `<oz-wizard data-tab="ERC721"></oz-wizard>`.

For Cairo, use the `data-lang` attribute: `<oz-wizard data-lang="cairo"></oz-wizard>`.

## API

The following describes how to use the Contracts Wizard programmatic API in your own applications.

- [Contracts Wizard API for Solidity](packages/core/README.md)
- [Contracts Wizard API for Cairo](packages/core-cairo/README.md)
