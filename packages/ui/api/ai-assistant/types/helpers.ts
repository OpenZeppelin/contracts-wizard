import type { Object } from 'https://deno.land/x/ts_toolbelt_unofficial@1.1.0/mod.ts';

export type IsPrimitiveUnion<T, U = T> = [T] extends [never]
  ? false // Edge case for `never`
  : [T] extends [boolean]
    ? false
    : T extends U
      ? [U] extends [T]
        ? false
        : true
      : false;

type Permutation<T, K = T> = [T] extends [never] ? [] : K extends K ? [K, ...Permutation<Exclude<T, K>>] : never;

export type ExactRequiredKeys<T extends object> = Permutation<Object.RequiredKeys<T>>;

export type UnionToIntersection<U> = (U extends unknown ? (x: U) => unknown : never) extends (x: infer I) => unknown
  ? I
  : never;

export type LastOf<U> =
  UnionToIntersection<U extends unknown ? (x: U) => void : never> extends (x: infer L) => void ? L : never;

export type UnionToTuple<U, L = LastOf<U>> = [U] extends [never] ? [] : [...UnionToTuple<Exclude<U, L>>, L];
