import type { GenericOptions, Kind } from "@openzeppelin/wizard";

export function defineOmitFeatures(): Map<Kind, string[]> {
    const omitFeatures: Map<Kind, string[]> = new Map();
    omitFeatures.set('ERC20', ['superchain', 'permit', 'votes']);
    omitFeatures.set('ERC721', ['votes']);
    omitFeatures.set('Stablecoin', ['superchain', 'permit', 'votes']);
    omitFeatures.set('RealWorldAsset', ['superchain', 'permit', 'votes']);
    return omitFeatures;
}

export function removeOmittedFeatures(opts: GenericOptions): GenericOptions {
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