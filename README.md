# OpenZeppelin Contracts Wizard

Wizard is an interface to interactively build a contract out of components from OpenZeppelin Contracts. Select the kind of contract that you want, set your parameters and desired features, and the Wizard will generate all of the code necessary. The resulting code is ready to be compiled and deployed, or it can serve as a starting point and customized further with application specific logic.

![](./screenshot.png)

## Development

`packages/core` contains the code generation logic.

`packages/ui` is the interface built in Svelte. `yarn dev` spins up a local server to develop the UI.
