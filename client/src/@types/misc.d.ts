export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

export type KeysOfMultiType<T, V> = {
  [K in keyof T]: V extends T[K] ? K : never;
}[keyof T];

export type KeysNotOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

export type ArrayOrSingle<T> = Array<T> | T;

export type Resolved<T> = T extends Promise<infer R> ? R : T;
