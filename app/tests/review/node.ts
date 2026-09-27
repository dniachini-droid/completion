/** Node's own bits for the review's tests, reached without Node's types (as tests/rules/nodedb.ts does). */
const proc = (globalThis as unknown as { process: { env: Record<string, string | undefined>; getBuiltinModule(n: string): any } }).process;
export const env = proc.env;
export const appendFileSync = (path: string, text: string): void => proc.getBuiltinModule('node:fs').appendFileSync(path, text);
export const writeFileSync = (path: string, text: string): void => proc.getBuiltinModule('node:fs').writeFileSync(path, text);
