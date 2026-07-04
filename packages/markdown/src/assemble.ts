import type { ScriptBlock } from './extract-blocks.js';
import type { BlueprintInfo } from './blueprint.js';

export const BLUEPRINT_IDENTIFIER = 'Blueprint__';
export const BLUEPRINT_NAMESPACE = 'blueprintModule__';

export interface AssembleInput {
	metadata: Record<string, unknown>;
	markup: string;
	moduleScript: ScriptBlock | undefined;
	instanceScript: ScriptBlock | undefined;
	styleTag: string | undefined;
	blueprint: BlueprintInfo | undefined;
}

const LANG_TS_RE = /\blang\s*=\s*["']ts["']/;

export function assemble(input: AssembleInput): string {
	const { metadata, markup, moduleScript, instanceScript, styleTag, blueprint } = input;
	const parts: string[] = [];

	const moduleLang = moduleScript && LANG_TS_RE.test(moduleScript.attributes) ? ' lang="ts"' : '';
	const moduleBody = [
		`\texport const metadata = ${JSON.stringify(metadata)};`,
		moduleScript ? trimBlock(moduleScript.body) : undefined
	]
		.filter((section) => section !== undefined && section !== '')
		.join('\n\n');
	parts.push(`<script module${moduleLang}>\n${moduleBody}\n</script>`);

	const blueprintImport = blueprint
		? blueprint.overrides.size > 0
			? `\timport ${BLUEPRINT_IDENTIFIER}, * as ${BLUEPRINT_NAMESPACE} from '${blueprint.importPath}';`
			: `\timport ${BLUEPRINT_IDENTIFIER} from '${blueprint.importPath}';`
		: undefined;
	if (blueprintImport || instanceScript) {
		const instanceBody = [blueprintImport, instanceScript ? trimBlock(instanceScript.body) : undefined]
			.filter((section) => section !== undefined && section !== '')
			.join('\n\n');
		parts.push(`<script${instanceScript?.attributes ?? ''}>\n${instanceBody}\n</script>`);
	}

	const body = markup.trim();
	parts.push(
		blueprint
			? `<${BLUEPRINT_IDENTIFIER} {metadata}>\n${body}\n</${BLUEPRINT_IDENTIFIER}>`
			: body
	);

	if (styleTag) parts.push(styleTag.trim());

	return parts.join('\n\n') + '\n';
}

function trimBlock(body: string): string {
	return body.replace(/^\r?\n+/, '').replace(/\s+$/, '');
}
