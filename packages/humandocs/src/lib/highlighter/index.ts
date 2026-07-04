import { createHighlighter, type Highlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | undefined;

export function getHighlighter(): Promise<Highlighter> {
	highlighterPromise ??= createHighlighter({
		themes: ['github-light', 'github-dark'],
		langs: ['svelte', 'typescript', 'javascript', 'html', 'css', 'bash', 'json']
	});
	return highlighterPromise;
}

/**
 * Highlighted HTML is inlined into Svelte component source, so `{`, `}` and
 * backticks must be escaped or Svelte parses them as expressions.
 */
export function escapeSvelte(html: string): string {
	return html
		.replace(/{/g, '&#123;')
		.replace(/}/g, '&#125;')
		.replace(/`/g, '&#96;');
}

/**
 * Highlight a code block with dual light/dark themes emitted as CSS
 * variables (`--shiki-light` / `--shiki-dark`); `theme.css` switches them
 * under `.dark`. Pass this as the `highlight` option of humandocsMarkdown.
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
