// Lesson 5.8 — Toast store built with module-level $state.
// A .svelte.ts file can use runes; a plain .ts file cannot.

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
	id: number;
	kind: ToastKind;
	message: string;
}

let nextId: number = 1;
export const toasts: Toast[] = $state([]);

export function show(kind: ToastKind, message: string, ttl: number = 3000): number {
	const id: number = nextId++;
	toasts.push({ id, kind, message });
	setTimeout(() => dismiss(id), ttl);
	return id;
}

export function dismiss(id: number): void {
	const index: number = toasts.findIndex((t) => t.id === id);
	if (index !== -1) toasts.splice(index, 1);
}

export function clear(): void {
	toasts.length = 0;
}
