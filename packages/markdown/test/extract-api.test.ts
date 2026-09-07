import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { runExtractApi } from '../src/cli/extract-api.js';

type ApiFile = {
	component: string;
	parts: { name: string; props: { name: string }[] }[];
};

async function write(file: string, contents: string) {
	await mkdir(path.dirname(file), { recursive: true });
	await writeFile(file, contents, 'utf-8');
}

/**
 * A group whose props live in a shared `types.ts`, with a part that lives in another component
 * folder and declares its own props inline. This is the shape a library reaches for when a group
 * republishes a standalone component under its own namespace.
 */
async function buildFixture() {
	const root = await mkdtemp(path.join(tmpdir(), 'hk-extract-api-'));
	const lib = path.join(root, 'lib');
	const content = path.join(root, 'content');

	await write(
		path.join(lib, 'widget-group/types.ts'),
		`export type WidgetGroupRootProps = {
	/** The selected values. */
	value?: string[];
	/** The orientation of the layout. */
	orientation?: 'horizontal' | 'vertical';
};
`
	);
	await write(
		path.join(lib, 'widget-group/index.parts.ts'),
		`export { default as Root } from './root/widget-group-root.svelte';
export { default as Item } from '../widget/root/widget-root.svelte';
`
	);
	await write(
		path.join(lib, 'widget-group/root/widget-group-root.svelte'),
		`<script lang="ts">
	import type { WidgetGroupRootProps } from '../types.js';

	let { value, orientation = 'vertical' }: WidgetGroupRootProps = $props();
</script>

<div data-widget-group-root="true">{value}{orientation}</div>
`
	);
	await write(
		path.join(lib, 'widget/root/widget-root.svelte'),
		`<script lang="ts">
	type WidgetRootProps = {
		/** The value this widget writes to the group. */
		value: string;
		/** Disables this widget alone. */
		disabled?: boolean;
	};

	let { value, disabled = false }: WidgetRootProps = $props();
</script>

<span data-widget-root="true">{value}{disabled}</span>
`
	);

	await mkdir(path.join(content, 'widget-group'), { recursive: true });
	await runExtractApi({ lib, content });

	return JSON.parse(
		await readFile(path.join(content, 'widget-group/api.json'), 'utf-8')
	) as ApiFile;
}

describe('extract-api', () => {
	let api: ApiFile;

	beforeAll(async () => {
		api = await buildFixture();
	});

	it('reads each part from its own file', () => {
		expect(api.parts.map((part) => part.name)).toEqual(['Root', 'Item']);
	});

	// The shared `types.ts` holds the props of the root alone. Before this, a part with no
	// declaration in that file took the first one it found there, and the API reference told the
	// reader that `Item` accepts `value` and `orientation` — the props of the group.
	it('does not give a part the props of another part', () => {
		const root = api.parts.find((part) => part.name === 'Root');
		const item = api.parts.find((part) => part.name === 'Item');

		expect(root?.props.map((prop) => prop.name)).toEqual(['value', 'orientation']);
		expect(item?.props.map((prop) => prop.name)).toEqual(['value', 'disabled']);
	});
});
