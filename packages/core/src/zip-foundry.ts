import JSZip from "jszip";
import type { GenericOptions } from "./build-generic";
import type { Contract } from "./contract";
import { printContract } from "./print";
import SOLIDITY_VERSION from './solidity-version.json';
import contracts from '../openzeppelin-contracts';
import { formatLinesWithSpaces, Lines, spaceBetween } from "./utils/format-lines";

function getHeader(c: Contract) {
  return [
    `// SPDX-License-Identifier: ${c.license}`,
    `pragma solidity ^${SOLIDITY_VERSION};`
  ];
}

const test = (c: Contract, opts?: GenericOptions) => {
  return formatLinesWithSpaces(
    2,
    ...spaceBetween(
      getHeader(c),
      getImports(c),
      getTestCase(c),
    ),
  );

  function getImports(c: Contract) {
    return [
      'import "forge-std/Test.sol";',
      `import "../src/${c.name}.sol";`,
    ];
  }

  function getTestCase(c: Contract) {
    const args = getAddressArgs(c);
    return [
      `contract ${c.name}Test is Test {`,
      spaceBetween(
        [
          `${c.name} public instance;`,
        ],
        [
          'function setUp() public {',
          getAddressVariables(args),
          [
            `instance = new ${getDeploymentCall(c, args)};`,
          ],
          '}',
        ],
        getContractSpecificTestFunction(),
      ),
      '}',
    ];
  }

  function getAddressVariables(args: string[]): Lines[] {
    const vars = [];
    for (let i = 0; i < args.length; i++) {
      // use i + 1 as the private key since it must be non-zero
      vars.push(`address ${args[i]} = vm.addr(${i + 1});`);
    }
    return vars;
  }

  function getContractSpecificTestFunction(): Lines[] {
    if (opts !== undefined) {
      switch (opts.kind) {
        case 'ERC20':
        case 'ERC721':
          return [
            'function testName() public {',
            [
              `assertEq(instance.name(), "${opts.name}");`
            ],
            '}',
          ];

        case 'ERC1155':
          return [
            'function testUri() public {',
            [
              `assertEq(instance.uri(0), "${opts.uri}");`
            ],
            '}',
          ];

        case 'Governor':
        case 'Custom':
          return [
            'function testSomething() public {',
            [
              '// Add your test here',
            ],
            '}',
          ]

        default:
          throw new Error('Unknown ERC');
      }
    }
    return [];
  }
};

function getAddressArgs(c: Contract): string[] {
  const args = [];
  for (const constructorArg of c.constructorArgs) {
    if (constructorArg.type === 'address') {
      args.push(constructorArg.name);
    }
  }
  return args;
}

function getDeploymentCall(c: Contract, args: string[]): string {
  return `${c.name}(${args.join(', ')})`;
}

const script = (c: Contract) => {
  return formatLinesWithSpaces(
    2,
    ...spaceBetween(
      getHeader(c),
      getImports(c),
      getScript(c),
    ),
  );

  function getImports(c: Contract) {
    return [
      'import "forge-std/Script.sol";',
      `import "../src/${c.name}.sol";`,
    ];
  }

  function getScript(c: Contract) {
    const args = getAddressArgs(c);
    const deploymentLines = [
      'vm.startBroadcast();',
      `${c.name} instance = new ${getDeploymentCall(c, args)};`,
      'console.log("Contract deployed to %s", address(instance));',
      'vm.stopBroadcast();',
    ];
    return [
      `contract ${c.name}Script is Script {`,
      spaceBetween(
        [
          'function setUp() public {}',
        ],
        [
          'function run() public {',
          args.length > 0 ? addTodoAndCommentOut(deploymentLines) : deploymentLines,
          '}',
        ],
      ),
      '}',
    ];
  }

  function addTodoAndCommentOut(lines: string[]) {
    return [
      '// TODO: Set addresses for the contract arguments below, then uncomment the following lines',
      ...lines.map(l => `// ${l}`),
    ];
  }
};

const setupSh = `\
#!/usr/bin/env bash

# Check if git is installed
if ! which git &> /dev/null
then
  echo "git command not found. Install git and try again."
  exit 1
fi

# Check if Foundry is installed
if ! which forge &> /dev/null
then
  echo "forge command not found. Install Foundry and try again. See https://book.getfoundry.sh/getting-started/installation"
  exit 1
fi

# Setup Foundry project
if ! [ -f "foundry.toml" ]
then
  echo "Initializing Foundry project..."

  # Initialize sample Foundry project
  forge init --force --no-commit --quiet

  # Install OpenZeppelin Contracts
  forge install OpenZeppelin/openzeppelin-contracts@v${contracts.version} --no-commit --quiet

  # Remove template contracts
  rm src/Counter.sol
  rm script/Counter.s.sol
  rm test/Counter.t.sol

  # Add remappings
  if [ -f "remappings.txt" ]
  then
    echo "" >> remappings.txt
  fi
  echo "@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/" >> remappings.txt

  # Perform initial git commit
  git add .
  git commit -m "openzeppelin: add wizard output" --quiet

  echo "Done."
else
  echo "Foundry project already initialized."
fi
`;

const readme = (c: Contract) => `\
# Sample Foundry Project

This project demonstrates a basic Foundry use case. It comes with a contract generated by [OpenZeppelin Wizard](https://wizard.openzeppelin.com/), a test for that contract, and a script that deploys that contract.

## Installing Foundry

See [Foundry installation guide](https://book.getfoundry.sh/getting-started/installation).

## Initializing the project

\`\`\`
bash setup.sh
\`\`\`

## Testing the contract

\`\`\`
forge test
\`\`\`

## Deploying the contract

You can simulate a deployment by running the script:

\`\`\`
forge script script/${c.name}.s.sol
\`\`\`

See [Solidity scripting guide](https://book.getfoundry.sh/tutorials/solidity-scripting) for more information.
`;

export async function zipFoundry(c: Contract, opts?: GenericOptions) {
  const zip = new JSZip();

  zip.file(`src/${c.name}.sol`, printContract(c));
  zip.file(`test/${c.name}.t.sol`, test(c, opts));
  zip.file(`script/${c.name}.s.sol`, script(c));
  zip.file('setup.sh', setupSh);
  zip.file('README.md', readme(c));

  return zip;
}