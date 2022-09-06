import test from "ava";
import { erc777 } from ".";

import { buildERC777, ERC777Options } from "./erc777";
import { printContract } from "./print";

function testERC777(title: string, opts: Partial<ERC777Options>) {
    test(title, (t) => {
        const c = buildERC777({
            name: "MyToken",
            symbol: "MTK",
            ...opts,
        });
        t.snapshot(printContract(c));
    });
}

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: ERC777Options) {
    test(title, (t) => {
        t.is(
            erc777.print(opts),
            printContract(
                buildERC777({
                    name: "MyToken",
                    symbol: "MTK",
                    ...opts,
                })
            )
        );
    });
}

testERC777("basic erc777", {});

testERC777("erc777 only  pausable  ", {
    pausable: true,
});

testERC777("erc777 pausable and ownable access", {
    pausable: true,
    access: "ownable",
});

testERC777("erc777 pausable with roles", {
    pausable: true,
    access: "roles",
});

testERC777("erc777 preminted", {
    premint: "1000",
});

testERC777("erc777 preminted pausable", {
    premint: "1000",
    pausable: true,
});

testERC777("erc777 preminted pausable ownable", {
    premint: "1000",
    pausable: true,
    access: "ownable",
});

testERC777("erc777 premint of 0", {
    premint: "0",
});

testERC777("erc777 mintable", {
    mintable: true,
    access: "ownable",
});

testERC777("erc777 mintable with roles", {
    mintable: true,
    access: "roles",
});

testERC777("erc777 full upgradeable transparent", {
    premint: "77700",
    access: "roles",
    mintable: true,
    pausable: true,
    upgradeable: "transparent",
});

testERC777("erc777 full upgradeable uups", {
    premint: "77700",
    access: "roles",
    mintable: true,
    pausable: true,
    upgradeable: "uups",
});

testAPIEquivalence("erc777 API default");

testAPIEquivalence("erc777 API basic", { name: "CustomToken", symbol: "CTK" });

testAPIEquivalence("erc777 API full upgradeable", {
    name: "CustomToken",
    symbol: "CTK",
    premint: "77700",
    access: "roles",
    mintable: true,
    pausable: true,
    upgradeable: "uups",
});

test("erc777 API assert defaults", async (t) => {
    t.is(erc777.print(erc777.defaults), erc777.print());
});

test("erc777 API isAccessControlRequired", async (t) => {
    t.is(erc777.isAccessControlRequired({ mintable: true }), true);
    t.is(erc777.isAccessControlRequired({ pausable: true }), true);
    t.is(erc777.isAccessControlRequired({ upgradeable: "uups" }), true);
    t.is(erc777.isAccessControlRequired({ upgradeable: "transparent" }), false);
});
