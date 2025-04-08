Contributing to OpenZeppelin Contracts Wizard
=======

Contributions to OpenZeppelin Contracts Wizard are welcome. Please review the information below to test out and contribute your changes.

## Project layout

- `packages/core` contains the code generation logic for each language under separately named subfolders.
- `packages/ui` is the interface built in Svelte.

## Building and testing the project

### Prerequisites
The following prerequisites are required to build the project locally:
- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/getting-started/install)

If you want to run the local API server for the AI Assistant, you also need to install [Deno](https://github.com/denoland/deno?tab=readme-ov-file#installation).

### Installing dependencies
From the root directory:
- ```yarn install```

The dependencies must be installed at least once before proceeding to any of the below.

### Running tests
From each language's subfolder under `packages/core`:
- ```yarn test```

Ensure that all tests pass.  If you are adding new functionality, include testcases as appropriate.
If tests fail due to snapshots not matching and the new behavior is expected, run `yarn test:update-snapshots` to update AVA snapshots and commit the changes.

> [!TIP]
> From the root directory, you can use `yarn run:core` to run specific commands within `core/{language}` folders.
> For example, running `yarn run:core cairo test` from the root directory will run tests for Cairo.

### Running linter
From the root directory:
- ```yarn lint```

If linting errors or warnings occur, run `yarn lint --fix` to attempt to auto-fix issues.  If there are remaining issues that cannot be auto-fixed, manually address them and re-run the command to ensure it passes.

### Running formater
From the root directory:
- ```yarn format:{check|write}```

If formatting errors or warnings occurs when running `yarn format:check`, run `yarn format:write` to attempt to auto-fix issues.
It is recommended to use automatic formatter in your code editor or run this command before making your merge request as formatting error will fail CI.

### Running the UI
From the `packages/ui` directory:
- Run `yarn dev` to start a local server for the UI.
  - Default port is 8080. To use another port, set the environment variable `PORT`, for example: `PORT=800 yarn dev`

### Running the AI Assistant (Optional)
Create a `.env` file at the root directory, set the environment variable `OPENAI_API_KEY` using your OpenAI API key, and configure your OpenAI project limits to allow the `gpt-4o-mini` model or set the environment variable `OPENAI_MODEL` to a specific model.

Then from the `packages/ui` directory:
- In one terminal, start the UI according to the above section if the UI isn't already running.
- In another terminal, run `yarn dev:api` to start a local API server which handles AI Assistant functions.
  - Default port is 3000. To use another port, set the environment variable `API_PORT`

> [!TIP]
> You can also start both the UI and API servers simultaneously by running `yarn dev` from the root directory.

## Creating Pull Requests (PRs)

As a contributor, we ask that you fork this repository, work on your own fork and then submit pull requests. The pull requests will be reviewed and eventually merged into the main repo. See ["Fork-a-Repo"](https://help.github.com/articles/fork-a-repo/) for how this works.
