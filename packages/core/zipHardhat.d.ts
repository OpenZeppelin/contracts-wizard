import JSZip from "jszip";
import type { GenericOptions } from "./src/build-generic";
import type { Contract } from "./src/contract";
export declare function zipHardhat(c: Contract, opts?: GenericOptions): Promise<JSZip>;
