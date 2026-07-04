import { readFileSync, statSync } from 'node:fs';
import { extractBlocks } from './extract-blocks.js';
import type { BlueprintConfig, ResolvedConfig } from './config.js';

export interface BlueprintInfo {
	/** Filesystem path, reported in `dependencies` for HMR invalidation. */
	path: string;
	/** POSIX-normalized path used in the generated import statement. */
	importPath: string;
	/** Lowercase tag names the blueprint's module script exports as overrides. */
	overrides: Set<string>;
}

/** Windows paths must be normalized or Vite rejects the generated import. */
export function toImportPath(path: string): string {
	return path.replace(/\\/g, '/');
}

const EXPORT_RE = /export\s*\{([^}]*)\}/g;
const TAG_NAME_RE = /^[a-z][a-z0-9]*$/;

/**
 * Statically scan a blueprint's module script for exports named after HTML
 * tags (`export { default as h2 } from './h2.svelte'`). Those elements are
 * emitted as `<namespace.tag>` instead of the plain tag.
 */
export function scanOverrides(source: string): Set<string> {
	const overrides = new Set<string>();
	const { moduleScript } = extractBlocks(source);
	if (!moduleScript) return overrides;
	for (const match of moduleScript.body.matchAll(EXPORT_RE)) {
		for (const specifier of match[1].split(',')) {
			const name = (specifier.split(/\bas\b/).pop() ?? '').trim();
			if (TAG_NAME_RE.test(name)) overrides.add(name);
		}
	}
	return overrides;
}

const cache = new Map<string, { mtimeMs: number; overrides: Set<string> }>();

export function resolveBlueprint(config: BlueprintConfig): BlueprintInfo {
	const { path } = config;
	const mtimeMs = statSync(path).mtimeMs;
	let entry = cache.get(path);
	if (!entry || entry.mtimeMs !== mtimeMs) {
		entry = { mtimeMs, overrides: scanOverrides(readFileSync(path, 'utf8')) };
		cache.set(path, entry);
	}
	return { path, importPath: toImportPath(path), overrides: entry.overrides };
}

export function selectBlueprint(
	metadata: Record<string, unknown>,
	config: ResolvedConfig,
	filename: string
): BlueprintInfo | undefined {
	const requested = metadata.blueprint;
	if (requested === false) return undefined;
	if (typeof requested === 'string') {
		const blueprint = config.blueprints[requested];
		if (!blueprint) {
			throw new Error(`humandocs-markdown: ${filename} requests unknown blueprint "${requested}"`);
		}
		return resolveBlueprint(blueprint);
	}
	const fallback = config.blueprints.default;
	return fallback ? resolveBlueprint(fallback) : undefined;
}
