export type IsPrimitiveUnion<T, U = T> = [T] extends [never]
  ? false
  : [T] extends [boolean]
    ? false
    : T extends U
      ? [U] extends [T]
        ? false
        : true
      : false;

export type Permutation<T, K = T> = [T] extends [never] ? [] : K extends K ? [K, ...Permutation<Exclude<T, K>>] : never;

type RequiredKeys<T, K = keyof T> = K extends keyof T ? (T extends Required<Pick<T, K>> ? K : never) : never;

export type ExactRequiredKeys<T extends object> = Permutation<RequiredKeys<T>>;

export type StringifyPrimaryType<TType> = TType extends string
  ? 'string'
  : TType extends number
    ? 'number'
    : TType extends boolean
      ? 'boolean'
      : TType extends unknown[]
        ? 'array'
        : TType extends object
          ? 'object'
          : never;

type MembersOf<U, K extends string> = K extends 'boolean'
  ? Extract<U, boolean>
  : K extends 'string'
    ? Extract<U, string>
    : K extends 'number'
      ? Extract<U, number>
      : never;

type TypeFor<K extends string, U> = {
  type: K;
  enum: Permutation<MembersOf<U, K>>;
};

type Wrap<T> = { __wrapped: T };

type WrappedTypeFor<K extends string, U> = Wrap<TypeFor<K, U>>;

export type TypeGroup<U> = {
  [K in StringifyPrimaryType<U>]: WrappedTypeFor<K, U>;
}[StringifyPrimaryType<U>];

export type AiFunctionCallAnyOf<U> =
  Permutation<TypeGroup<U>> extends infer P
    ? P extends readonly unknown[]
      ? { [I in keyof P]: P[I] extends Wrap<infer X> ? X : never }
      : never
    : never;

type IsAny<T> = 0 extends 1 & T ? true : false;

type HasDeepAny<T> =
  IsAny<T> extends true
    ? true
    : T extends object
      ? {
          [K in keyof T]: HasDeepAny<T[K]>;
        }[keyof T] extends true
        ? true
        : false
      : false;

export type UnknownIfHasAnAnyAttribute<T> = HasDeepAny<T> extends true ? unknown : T;

export type IsObject<T extends object> = T;

export type ReplaceKeys<TOrigin, TReplace extends Partial<Record<keyof TOrigin, unknown>>> = {
  [K in keyof TOrigin]: K extends keyof TReplace ? TReplace[K] : TOrigin[K];
};

export type SafeNoAnyReplacedKeys<
  TOrigin extends object,
  TReplace extends Partial<Record<keyof TOrigin, unknown>>,
> = UnknownIfHasAnAnyAttribute<{
  [K in keyof TOrigin]: K extends keyof TReplace ? TReplace[K] : TOrigin[K];
}>;
