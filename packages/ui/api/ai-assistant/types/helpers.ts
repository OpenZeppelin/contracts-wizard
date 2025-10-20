type Primitive = string | number | boolean;

type IsUnion<T, U = T> = [T] extends [never] ? false : T extends U ? ([U] extends [T] ? false : true) : false;

export type IsPrimitiveUnion<T> = [T] extends [never] ? false : T extends Primitive ? IsUnion<T> : false;

type RequiredKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

export type ExactRequiredKeys<T extends object> = readonly RequiredKeys<T>[];

export type EnumValues<T> = [T] extends [Primitive] ? readonly T[] : never;

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

type BooleanAnyOf<T> =
  Extract<T, boolean> extends never
    ? never
    : {
        type: 'boolean';
        enum?: EnumValues<Extract<T, boolean>>;
      };

type BooleanAnyOfWithEnum<T> =
  Extract<T, boolean> extends never
    ? never
    : {
        type: 'boolean';
        enum: EnumValues<Extract<T, boolean>>;
      };

type NumberAnyOf<T> =
  Extract<T, number> extends never
    ? never
    : {
        type: 'number';
        enum?: EnumValues<Extract<T, number>>;
      };

type StringAnyOf<T> =
  Extract<T, string> extends never
    ? never
    : {
        type: 'string';
        enum?: EnumValues<Extract<T, string>>;
      };

type StringAnyOfWithEnum<T> =
  Extract<T, string> extends never
    ? never
    : {
        type: 'string';
        enum: EnumValues<Extract<T, string>>;
      };

type PrimitiveAnyOf<T> = BooleanAnyOf<T> | NumberAnyOf<T> | StringAnyOf<T>;

type PrimitiveAnyOfRest<T> = readonly Extract<PrimitiveAnyOf<T>, object>[];

type BooleanStringAnyOf<T> =
  | readonly [BooleanAnyOfWithEnum<T>, StringAnyOfWithEnum<T>, ...PrimitiveAnyOfRest<T>]
  | readonly [StringAnyOfWithEnum<T>, BooleanAnyOfWithEnum<T>, ...PrimitiveAnyOfRest<T>];

type HasBoolean<T> = [Extract<T, boolean>] extends [never] ? false : true;
type HasString<T> = [Extract<T, string>] extends [never] ? false : true;
type HasNumber<T> = [Extract<T, number>] extends [never] ? false : true;

type RequiresBooleanStringEnforcement<T> = HasBoolean<T> extends true
  ? HasString<T> extends true
    ? HasNumber<T> extends true
      ? false
      : true
    : false
  : false;

export type AiFunctionCallAnyOf<T> = RequiresBooleanStringEnforcement<T> extends true
  ? BooleanStringAnyOf<T>
  : readonly Extract<PrimitiveAnyOf<T>, object>[];

type EnsureEnumCoverage<TUnion extends Primitive, TValues extends readonly TUnion[]> =
  Exclude<TUnion, TValues[number]> extends never ? TValues : never;

export const enumValues =
  <TUnion extends Primitive>() =>
  <TValues extends readonly TUnion[]>(values: EnsureEnumCoverage<TUnion, TValues>) =>
    values;
