/// <reference types="@human-kit/humandocs/ambient" />

declare module '*.md' {
	import type { Component } from 'svelte';

	export const metadata: Record<string, unknown>;
	const component: Component;
	export default component;
}

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
