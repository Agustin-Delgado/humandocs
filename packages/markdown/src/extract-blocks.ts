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

const MODULE_ATTR_RE = /(^|\s)(module(\s|=|$)|context\s*=\s*["']module["'])/;
const FENCE_RE = /^ {0,3}(`{3,}|~{3,})/;
const INLINE_CODE_RE = /(`+)(.+?)\1/g;

export function isModuleScript(attributes: string): boolean {
	return MODULE_ATTR_RE.test(attributes);
}

type Range = [number, number];

/**
 * Character ranges covered by fenced code blocks and inline code spans.
 * Tags in there are code examples, not page scripts — both the opening and
 * the closing tag of a real block must sit outside these ranges.
 */
function maskedRanges(source: string): Range[] {
	const ranges: Range[] = [];
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
		} else if (!fence) {
			for (const span of line.matchAll(INLINE_CODE_RE)) {
				ranges.push([offset + span.index, offset + span.index + span[0].length]);
			}
		}
		offset += line.length + 1;
	}
	if (fence) ranges.push([fence.start, source.length]);
	return ranges;
}

function insideRanges(index: number, ranges: Range[]): boolean {
	return ranges.some(([start, end]) => index >= start && index < end);
}

interface FoundBlock {
	start: number;
	end: number;
	attributes: string;
	body: string;
	full: string;
}

/**
 * Scan for `<tag ...>...</tag>` pairs whose opening AND closing tags both
 * sit outside masked ranges. A lazy regex is not enough here: an inline-code
 * mention of the tag would open a match in prose and close it inside a
 * fence, swallowing everything in between.
 */
function findBlocks(source: string, tag: string, masked: Range[]): FoundBlock[] {
	const blocks: FoundBlock[] = [];
	const openRe = new RegExp(`<${tag}([^>]*)>`, 'g');
	const closeTag = `</${tag}>`;
	let searchFrom = 0;
	for (;;) {
		openRe.lastIndex = searchFrom;
		const open = openRe.exec(source);
		if (!open) break;
		if (insideRanges(open.index, masked)) {
			searchFrom = open.index + 1;
			continue;
		}
		let closeIndex = source.indexOf(closeTag, open.index + open[0].length);
		while (closeIndex !== -1 && insideRanges(closeIndex, masked)) {
			closeIndex = source.indexOf(closeTag, closeIndex + 1);
		}
		if (closeIndex === -1) break;
		const end = closeIndex + closeTag.length;
		blocks.push({
			start: open.index,
			end,
			attributes: open[1],
			body: source.slice(open.index + open[0].length, closeIndex),
			full: source.slice(open.index, end)
		});
		searchFrom = end;
	}
	return blocks;
}

function removeSpans(source: string, spans: Range[]): string {
	let content = source;
	for (const [start, end] of [...spans].sort((a, b) => b[0] - a[0])) {
		content = content.slice(0, start) + content.slice(end);
	}
	return content;
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
	const masked = maskedRanges(source);
	let moduleScript: ScriptBlock | undefined;
	let instanceScript: ScriptBlock | undefined;
	let styleTag: string | undefined;
	const spans: Range[] = [];

	for (const block of findBlocks(source, 'script', masked)) {
		if (isModuleScript(block.attributes)) {
			if (moduleScript) {
				throw new Error('humandocs-markdown: only one <script module> block is allowed');
			}
			moduleScript = { attributes: block.attributes, body: block.body };
		} else {
			if (instanceScript) {
				throw new Error('humandocs-markdown: only one instance <script> block is allowed');
			}
			instanceScript = { attributes: block.attributes, body: block.body };
		}
		spans.push([block.start, block.end]);
	}

	for (const block of findBlocks(source, 'style', masked)) {
		if (styleTag) {
			throw new Error('humandocs-markdown: only one <style> block is allowed');
		}
		styleTag = block.full;
		spans.push([block.start, block.end]);
	}

	return { moduleScript, instanceScript, styleTag, content: removeSpans(source, spans) };
}
