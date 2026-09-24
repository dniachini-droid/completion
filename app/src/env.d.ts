/// <reference types="svelte" />
/// <reference types="vite/client" />
declare module '*/live.js' { export function live(host: HTMLElement, meta: unknown): { stop(): void }; }
declare module '*/scene/light.js' { export function tunnelLight(root: HTMLElement): () => void; }
