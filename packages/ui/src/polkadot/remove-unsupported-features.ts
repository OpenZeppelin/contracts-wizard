import type { GenericOptions } from "@openzeppelin/wizard";

export function removeUnsupportedFeatures(opts: GenericOptions): GenericOptions {
    if (opts.kind === 'ERC20' || opts.kind === 'Stablecoin' || opts.kind === 'RealWorldAsset') {
        if (opts.permit) {
            opts.permit = false;
        }
        if (opts.votes) {
            opts.votes = false;
        }
        if (opts.crossChainBridging === 'superchain') {
            opts.crossChainBridging = false;
        }
    }
    if (opts.kind === 'ERC721') {
        if (opts.votes) {
            opts.votes = false;
        }
    }
    return opts;
}