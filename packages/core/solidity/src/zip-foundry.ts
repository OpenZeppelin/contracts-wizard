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
    const result = [
      'import {Test} from "forge-std/Test.sol";',
    ];
    if (c.upgradeable) {
      result.push('import {Upgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";');
    }
    result.push(`import {${c.name}} from "src/${c.name}.sol";`);
    return result;
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
          getAddressVariables(c, args),
          getDeploymentCode(c, args),
          '}',
        ],
        getContractSpecificTestFunction(),
      ),
      '}',
    ];
  }

  function getDeploymentCode(c: Contract, args: string[]): Lines[] {
    if (c.upgradeable) {
      if (opts?.upgradeable === 'transparent') {
        return [
          `address proxy = Upgrades.deployTransparentProxy(`,
          [
            `"${c.name}.sol",`,
            `initialOwner,`,
            `abi.encodeCall(${c.name}.initialize, (${args.join(', ')}))`
          ],
          ');',
          `instance = ${c.name}(proxy);`,
        ];
      } else {
        return [
          `address proxy = Upgrades.deployUUPSProxy(`,
          [
            `"${c.name}.sol",`,
            `abi.encodeCall(${c.name}.initialize, (${args.join(', ')}))`
          ],
          ');',
          `instance = ${c.name}(proxy);`,
        ];
      }
    } else {
      return [
        `instance = new ${c.name}(${args.join(', ')});`,
      ];
    }
  }

  function getAddressVariables(c: Contract, args: string[]): Lines[] {
    const vars = [];
    let i = 1; // private key index starts from 1 since it must be non-zero
    if (c.upgradeable && opts?.upgradeable === 'transparent' && !args.includes('initialOwner')) {
      vars.push(`address initialOwner = vm.addr(${i++});`);
    }
    for (const arg of args) {
      vars.push(`address ${arg} = vm.addr(${i++});`);
    }
    return vars;
  }

  function getContractSpecificTestFunction(): Lines[] {
    if (opts !== undefined) {
      switch (opts.kind) {
        case 'ERC20':
        case 'ERC721':
          return [
            'function testName() public view {',
            [
              `assertEq(instance.name(), "${opts.name}");`
            ],
            '}',
          ];

        case 'ERC1155':
          return [
            'function testUri() public view {',
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

const script = (c: Contract, opts?: GenericOptions) => {
  return formatLinesWithSpaces(
    2,
    ...spaceBetween(
      getHeader(c),
      getImports(c),
      getScript(c),
    ),
  );

  function getImports(c: Contract) {
    const result = [
      'import {Script} from "forge-std/Script.sol";',
      'import {console} from "forge-std/console.sol";',
    ];
    if (c.upgradeable) {
      result.push('import {Upgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";');
    }
    result.push(`import {${c.name}} from "src/${c.name}.sol";`);
    return result;
  }

  function getScript(c: Contract) {
    const args = getAddressArgs(c);
    const deploymentLines = [
      'vm.startBroadcast();',
      ...getAddressVariables(c, args),
      ...getDeploymentCode(c, args),
      `console.log("${c.upgradeable ? 'Proxy' : 'Contract'} deployed to %s", address(instance));`,
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

  function getDeploymentCode(c: Contract, args: string[]): Lines[] {
    if (c.upgradeable) {
      if (opts?.upgradeable === 'transparent') {
        return [
          `address proxy = Upgrades.deployTransparentProxy(`,
          [
            `"${c.name}.sol",`,
            `initialOwner,`,
            `abi.encodeCall(${c.name}.initialize, (${args.join(', ')}))`
          ],
          ');',
          `${c.name} instance = ${c.name}(proxy);`,
        ];
      } else {
        return [
          `address proxy = Upgrades.deployUUPSProxy(`,
          [
            `"${c.name}.sol",`,
            `abi.encodeCall(${c.name}.initialize, (${args.join(', ')}))`
          ],
          ');',
          `${c.name} instance = ${c.name}(proxy);`,
        ];
      }
    } else {
      return [
        `${c.name} instance = new ${c.name}(${args.join(', ')});`,
      ];
    }
  }

  function getAddressVariables(c: Contract, args: string[]): Lines[] {
    const vars = [];
    if (c.upgradeable && opts?.upgradeable === 'transparent' && !args.includes('initialOwner')) {
      vars.push('address initialOwner = <Set initialOwner address here>;');
    }
    for (const arg of args) {
      vars.push(`address ${arg} = <Set ${arg} address here>;`);
    }
    return vars;
  }

  function addTodoAndCommentOut(lines: Lines[]) {
    return [
      '// TODO: Set addresses for the variables below, then uncomment the following section:',
      '/*',
      ...lines,
      '*/',
    ];
  }
};

const setupSh = (c: Contract) => `\
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

  # Backup Wizard template readme to avoid it being overwritten
  mv README.md README-oz.md

  # Initialize sample Foundry project
  forge init --force --no-commit --quiet

${c.upgradeable ? `\
  # Install OpenZeppelin Contracts and Upgrades
  forge install OpenZeppelin/openzeppelin-contracts-upgradeable@v${contracts.version} --no-commit --quiet
  forge install OpenZeppelin/openzeppelin-foundry-upgrades --no-commit --quiet\
` : `\
  # Install OpenZeppelin Contracts
  forge install OpenZeppelin/openzeppelin-contracts@v${contracts.version} --no-commit --quiet\
`}

  # Remove unneeded Foundry template files
  rm src/Counter.sol
  rm script/Counter.s.sol
  rm test/Counter.t.sol
  rm README.md

  # Restore Wizard template readme
  mv README-oz.md README.md

  # Add remappings
  if [ -f "remappings.txt" ]
  then
    echo "" >> remappings.txt
  fi
${c.upgradeable ? `\
  echo "@openzeppelin/contracts/=lib/openzeppelin-contracts-upgradeable/lib/openzeppelin-contracts/contracts/" >> remappings.txt
  echo "@openzeppelin/contracts-upgradeable/=lib/openzeppelin-contracts-upgradeable/contracts/" >> remappings.txt

  # Add settings in foundry.toml
  echo "" >> foundry.toml
  echo "ffi = true" >> foundry.toml
  echo "ast = true" >> foundry.toml
  echo "build_info = true" >> foundry.toml
  echo "extra_output = [\\"storageLayout\\"]" >> foundry.toml\
` : `\
  echo "@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/" >> remappings.txt\
`}

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
forge test${c.upgradeable ? ' --force' : ''}
\`\`\`

## Deploying the contract

You can simulate a deployment by running the script:

\`\`\`
forge script script/${c.name}.s.sol${c.upgradeable ? ' --force' : ''}
\`\`\`

See [Solidity scripting guide](https://book.getfoundry.sh/tutorials/solidity-scripting) for more information.
`;

export async function zipFoundry(c: Contract, opts?: GenericOptions) {
  const zip = new JSZip();

  zip.file(`src/${c.name}.sol`, printContract(c));
  zip.file(`test/${c.name}.t.sol`, test(c, opts));
  zip.file(`script/${c.name}.s.sol`, script(c, opts));
  zip.file('setup.sh', setupSh(c));
  zip.file('README.md', readme(c));

  return zip;
}