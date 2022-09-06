import { erc777 } from "@openzeppelin/wizard";
import { erc20 } from "@openzeppelin/wizard";

console.log(
    erc777.print({
        name: "token777",
        symbol: "7777",
        defaultOperators: [
            "0x1234567890123456789012345678901234567890",
            "0x1234567890123456789012345678901234567890",
            "0x1234567890123456789012345678901234567890",
            "0x1234567890123456789012345678901234567890",
        ],
        mintable: true,
    })
);

// console.log("/n/n", erc20.print({ name: "token20", symbol: "2020" }));
