export type IsPrimitiveUnion<T, U = T> = [T] extends [never]
  ? false
  : [T] extends [boolean]
    ? false
    : T extends U
      ? [U] extends [T]
        ? false
        : true
      : false;

type RequiredKeys<T, K = keyof T> = K extends keyof T ? (T extends Required<Pick<T, K>> ? K : never) : never;

export type ExactRequiredKeys<T extends object> = readonly RequiredKeys<T>[];

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

type InferredEnumValue<K extends string, U> = K extends 'boolean'
  ? Extract<U, boolean>
  : K extends 'string'
    ? Extract<U, string>
    : K extends 'number'
      ? Extract<U, number>
      : U;

type TypeFor<K extends string, U> = {
  type: K;
  enum?: readonly InferredEnumValue<K, U>[];
};

export type TypeGroup<U> = {
  [K in StringifyPrimaryType<U>]: TypeFor<K, U>;
}[StringifyPrimaryType<U>];

export type AiFunctionCallAnyOf<U> = readonly TypeGroup<U>[];
