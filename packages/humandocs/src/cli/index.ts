#!/usr/bin/env node
import { parseArgs } from 'node:util';
import process from 'node:process';

const USAGE = `humandocs — documentation kit CLI

Usage:
  humandocs extract-api --lib <dir> --content <dir> [--components a,b]

Commands:
  extract-api   Generate api.json files for documented components.

Options:
  --lib         Component library source root (one folder per component).
  --content     Docs content root; subfolders opt components in.
  --components  Comma-separated subset of components to process.
`;

const [command, ...rest] = process.argv.slice(2);

if (command !== 'extract-api') {
	console.error(command ? `humandocs: unknown command "${command}"\n` : USAGE);
	process.exit(command ? 1 : 0);
}

const { values } = parseArgs({
	args: rest,
	options: {
		lib: { type: 'string' },
		content: { type: 'string' },
		components: { type: 'string' }
	}
});

if (!values.lib || !values.content) {
	console.error('humandocs extract-api: --lib and --content are required.\n');
	console.error(USAGE);
	process.exit(1);
}

// Dynamic import keeps ts-morph out of any bundle that touches the package.
const { runExtractApi } = await import('./extract-api.js');
await runExtractApi({
	lib: values.lib,
	content: values.content,
	components: values.components?.split(',').map((s) => s.trim())
});
