import { en, type CopyKey } from './en';

export type { CopyKey };

/** Look up a line by key, filling {name} slots. */
export function t(key: CopyKey, vars: Record<string, string | number> = {}): string {
  return en[key].replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}
