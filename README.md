# [OpenZeppelin Contracts Wizard](https://wizard.openzeppelin.com)

[![Solidity NPM Package](https://img.shields.io/npm/v/@openzeppelin/wizard?color=%234e5de4&label=%40openzeppelin%2Fwizard)](https://www.npmjs.com/package/@openzeppelin/wizard)
[![Cairo NPM Package](https://img.shields.io/npm/v/@openzeppelin/wizard-cairo?color=%23e55233&label=%40openzeppelin%2Fwizard-cairo)](https://www.npmjs.com/package/@openzeppelin/wizard-cairo)
[![Stellar NPM Package](https://img.shields.io/npm/v/@openzeppelin/wizard-stellar?color=%23e55233&label=%40openzeppelin%2Fwizard-stellar)](https://www.npmjs.com/package/@openzeppelin/wizard-stellar)
[![Stylus NPM Package](https://img.shields.io/npm/v/@openzeppelin/wizard-stylus?color=%23e55233&label=%40openzeppelin%2Fwizard-stylus)](https://www.npmjs.com/package/@openzeppelin/wizard-stylus)
[![Netlify Status](https://api.netlify.com/api/v1/badges/ca9b53e1-44eb-410d-aac7-31b2f5399b68/deploy-status)](https://app.netlify.com/sites/openzeppelin-contracts-wizard/deploys)

Contracts Wizard is a web application to interactively build a contract out of components from OpenZeppelin Contracts. Select the kind of contract that you want, set your parameters and desired features, and the Wizard will generate all of the code necessary. The resulting code is ready to be compiled and deployed, or it can serve as a starting point and customized further with application specific logic.

[![](./screenshot.png)](https://wizard.openzeppelin.com/)

## Contributing

See our [contributing guidelines](CONTRIBUTING.md).

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
- [Contracts Wizard API for Stellar](packages/core/stellar/README.md)
- [Contracts Wizard API for Stylus](packages/core/stylus/README.md)
