import { resolve } from '$app/paths';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithoutChild<T> = T extends { child?: unknown } ? Omit<T, 'child'> : T;
export type WithoutChildren<T> = T extends { children?: unknown } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/** Resolve a runtime path string through SvelteKit's typed route resolver. */
export function resolveAppPath(path: string): string {
	// SAFETY: the typed overload only accepts literals, but every app route id is also
	// a valid runtime path string.
	return resolve(path as '/');
}
