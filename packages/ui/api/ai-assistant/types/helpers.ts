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
      : K extends 'object'
        ? Extract<U, object>
        : never;

type BooleanEnum = [false] | [true] | [false, true] | [true, false];

type EnumFor<K extends string, U> = K extends 'boolean' ? BooleanEnum : Permutation<MembersOf<U, K>>;

export type TypeFor<K extends string, U> = {
  type: K;
  enum: K extends 'object' ? undefined : EnumFor<K, U>;
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
