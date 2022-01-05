export type OptionalPick<T, K extends keyof T> = {
  [P in K]?: T[P];
};
