export const pickKeys = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> =>
  Object.fromEntries(keys.map(k => [k, obj[k]])) as Pick<T, K>;
