import { createHighlighter, type Highlighter } from 'shiki';
import { escapeSvelte } from './index.js';

let highlighterPromise: Promise<Highlighter> | undefined;

export function getHighlighter(): Promise<Highlighter> {
	highlighterPromise ??= createHighlighter({
		themes: ['github-light', 'github-dark'],
		langs: ['svelte', 'typescript', 'javascript', 'html', 'css', 'bash', 'json']
	});
	return highlighterPromise;
}

/**
 * Highlight a code block with dual light/dark themes emitted as CSS
 * variables (`--shiki-light` / `--shiki-dark`); switch them under a `.dark`
 * class in the consumer's CSS:
 *
 * ```css
 * .shiki, .shiki span { color: var(--shiki-light); background-color: var(--shiki-light-bg); }
 * .dark .shiki, .dark .shiki span { color: var(--shiki-dark); background-color: var(--shiki-dark-bg); }
 * ```
 *
 * Pass this as the `highlight` option of `humandocsMarkdown`. The output is
 * already Svelte-safe (braces and backticks escaped).
 */
export async function highlight(code: string, lang = 'text'): Promise<string> {
	const highlighter = await getHighlighter();
	const loadedLang = lang && highlighter.getLoadedLanguages().includes(lang) ? lang : 'text';
	return escapeSvelte(
		highlighter.codeToHtml(code, {
			lang: loadedLang,
			themes: { light: 'github-light', dark: 'github-dark' },
			defaultColor: false
		})
	);
}
