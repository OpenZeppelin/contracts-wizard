import { Contract, ContractBuilder } from "./contract";
import {
    Access,
    setAccessControl,
    requireAccessControl,
} from "./set-access-control";
import { addPausable } from "./add-pausable";
import { defineFunctions } from "./utils/define-functions";
import {
    CommonOptions,
    withCommonDefaults,
    defaults as commonDefaults,
} from "./common-options";
import { setUpgradeable } from "./set-upgradeable";
import { setInfo } from "./set-info";
import { printContract } from "./print";

export interface ERC777Options extends CommonOptions {
    name: string;
    symbol: string;
    pausable?: boolean;
    premint?: string;
    mintable?: boolean;
}

export const defaults: Required<ERC777Options> = {
    name: "MyToken",
    symbol: "MTK",
    pausable: false,
    premint: "0",
    mintable: false,
    access: commonDefaults.access,
    upgradeable: commonDefaults.upgradeable,
    info: commonDefaults.info,
} as const;

function withDefaults(opts: ERC777Options): Required<ERC777Options> {
    return {
        ...opts,
        ...withCommonDefaults(opts),
        pausable: opts.pausable ?? defaults.pausable,
        premint: opts.premint || defaults.premint,
        mintable: opts.mintable ?? defaults.mintable,
    };
}

export function printERC777(opts: ERC777Options = defaults): string {
    return printContract(buildERC777(opts));
}

export function isAccessControlRequired(opts: Partial<ERC777Options>): boolean {
    return opts.mintable || opts.pausable || opts.upgradeable === "uups";
}

export function buildERC777(opts: ERC777Options): Contract {
    const allOpts = withDefaults(opts);
    const c = new ContractBuilder(allOpts.name);

    const { access, upgradeable, info } = allOpts;

    addBase(c, allOpts.name, allOpts.symbol);

    if (allOpts.pausable) {
        addPausable(c, access, [functions._beforeTokenTransfer]);
    }

    if (allOpts.premint) {
        addPremint(c, allOpts.premint);
    }

    if (allOpts.mintable) {
        addMintable(c, access);
    }

    setAccessControl(c, access);
    setUpgradeable(c, upgradeable, access);
    setInfo(c, info);

    return c;
}

function addBase(c: ContractBuilder, name: string, symbol: string) {
    c.addConstructorArgument({
        type: "address[]",
        name: "operators",
        memoryType: "memory",
    });

    c.addParent(
        {
            name: "ERC777",
            path: "@openzeppelin/contracts/token/ERC777/ERC777.sol",
        },
        [name, symbol, { lit: "operators" }]
    );

    c.addOverride("ERC777", functions._beforeTokenTransfer);
    c.addOverride("ERC777", functions._mint);
    c.addOverride("ERC777", functions._burn);
}

export const premintPattern = /^(\d*)(?:\.(\d+))?(?:e(\d+))?$/;

function addPremint(c: ContractBuilder, amount: string) {
    const m = amount.match(premintPattern);
    if (m) {
        const integer = m[1]?.replace(/^0+/, "") ?? "";
        const decimals = m[2]?.replace(/0+$/, "") ?? "";
        const exponent = Number(m[3] ?? 0);

        if (Number(integer + decimals) > 0) {
            const decimalPlace = decimals.length - exponent;
            const zeroes = new Array(Math.max(0, -decimalPlace))
                .fill("0")
                .join("");
            const units = integer + decimals + zeroes;
            const exp =
                decimalPlace <= 0
                    ? "decimals()"
                    : `(decimals() - ${decimalPlace})`;
            c.addConstructorCode(
                `_mint(msg.sender, ${units} * 10 ** ${exp}, \"\",, \"\", false);`
            );
        }
    }
}

function addMintable(c: ContractBuilder, access: Access) {
    requireAccessControl(c, functions.mint, access, "MINTER");
    c.addFunctionCode(
        "_mint(to, amount, userData, operatorData, requireReceptionAck);",
        functions.mint
    );
}

const functions = defineFunctions({
    _beforeTokenTransfer: {
        kind: "internal" as const,
        args: [
            { name: "operator", type: "address" },
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
        ],
    },

    _burn: {
        kind: "internal" as const,
        args: [
            { name: "from", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "data", type: "bytes", memoryType: "memory" },
            { name: "operatorData", type: "bytes", memoryType: "memory" },
        ],
    },

    _mint: {
        kind: "internal" as const,
        args: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "userData", type: "bytes" },
            { name: "operatorData", type: "bytes" },
            { name: "requireReceptionAck", type: "bool" },
        ],
    },

    mint: {
        kind: "public" as const,
        args: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "userData", type: "bytes", memoryType: "memory" },
            { name: "operatorData", type: "bytes", memoryType: "memory" },
            { name: "requireReceptionAck", type: "bool" },
        ],
    },

    pause: {
        kind: "public" as const,
        args: [],
    },

    unpause: {
        kind: "public" as const,
        args: [],
    },
});
