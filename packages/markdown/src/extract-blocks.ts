export interface ScriptBlock {
	/** Raw attribute string as written, e.g. ` lang="ts"`. */
	attributes: string;
	body: string;
}

export interface ExtractedBlocks {
	moduleScript: ScriptBlock | undefined;
	instanceScript: ScriptBlock | undefined;
	/** The full original `<style>...</style>` tag, reattached verbatim. */
	styleTag: string | undefined;
	content: string;
}

const SCRIPT_RE = /<script([^>]*)>([\s\S]*?)<\/script>/g;
const STYLE_RE = /<style([^>]*)>[\s\S]*?<\/style>/g;
const MODULE_ATTR_RE = /(^|\s)(module(\s|=|$)|context\s*=\s*["']module["'])/;
const FENCE_RE = /^ {0,3}(`{3,}|~{3,})/;

export function isModuleScript(attributes: string): boolean {
	return MODULE_ATTR_RE.test(attributes);
}

/**
 * Character ranges covered by fenced code blocks. Scripts inside a fence are
 * code examples, not page scripts — they must never be extracted.
 */
function fencedRanges(source: string): Array<[number, number]> {
	const ranges: Array<[number, number]> = [];
	let offset = 0;
	let fence: { char: string; length: number; start: number } | undefined;
	for (const line of source.split('\n')) {
		const match = FENCE_RE.exec(line);
		if (match) {
			if (!fence) {
				fence = { char: match[1][0], length: match[1].length, start: offset };
			} else if (match[1][0] === fence.char && match[1].length >= fence.length) {
				ranges.push([fence.start, offset + line.length]);
				fence = undefined;
			}
		}
		offset += line.length + 1;
	}
	if (fence) ranges.push([fence.start, source.length]);
	return ranges;
}

function insideRanges(index: number, ranges: Array<[number, number]>): boolean {
	return ranges.some(([start, end]) => index >= start && index < end);
}

/**
 * Scripts and styles are pulled out BEFORE remark ever sees the source:
 * indented lines inside a script would otherwise become CommonMark code
 * blocks, and blank lines would split the surrounding HTML block.
 *
 * Known limitation (shared with mdsvex): a literal `</script>` inside a
 * string in the script body ends the block early.
 */
export function extractBlocks(source: string): ExtractedBlocks {
	const fences = fencedRanges(source);
	let moduleScript: ScriptBlock | undefined;
	let instanceScript: ScriptBlock | undefined;
	let content = source;

	for (const match of source.matchAll(SCRIPT_RE)) {
		if (insideRanges(match.index, fences)) continue;
		const [full, attributes, body] = match;
		if (isModuleScript(attributes)) {
			if (moduleScript) {
				throw new Error('humandocs-markdown: only one <script module> block is allowed');
			}
			moduleScript = { attributes, body };
		} else {
			if (instanceScript) {
				throw new Error('humandocs-markdown: only one instance <script> block is allowed');
			}
			instanceScript = { attributes, body };
		}
		content = content.replace(full, '');
	}

	let styleTag: string | undefined;
	for (const match of source.matchAll(STYLE_RE)) {
		if (insideRanges(match.index, fences)) continue;
		if (styleTag) {
			throw new Error('humandocs-markdown: only one <style> block is allowed');
		}
		styleTag = match[0];
		content = content.replace(match[0], '');
	}

	return { moduleScript, instanceScript, styleTag, content };
}
