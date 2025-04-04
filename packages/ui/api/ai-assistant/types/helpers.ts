export type IsPrimitiveUnion<T, U = T> = [T] extends [never]
  ? false // Edge case for `never`
  : [T] extends [boolean]
    ? false
    : T extends U
      ? [U] extends [T]
        ? false
        : true
      : false;

export type AllRequiredKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

export type Permutation<T extends string | number | symbol, U extends string | number | symbol = T> = [T] extends [
  never,
]
  ? []
  : {
      [K in T]: [K, ...Permutation<Exclude<U, K>>];
    }[T];

export type ExactRequiredKeys<T> = Permutation<AllRequiredKeys<T>>;

export type UnionToIntersection<U> = (U extends unknown ? (x: U) => unknown : never) extends (x: infer I) => unknown
  ? I
  : never;

export type LastOf<U> =
  UnionToIntersection<U extends unknown ? (x: U) => void : never> extends (x: infer L) => void ? L : never;

export type UnionToTuple<U, L = LastOf<U>> = [U] extends [never] ? [] : [...UnionToTuple<Exclude<U, L>>, L];
