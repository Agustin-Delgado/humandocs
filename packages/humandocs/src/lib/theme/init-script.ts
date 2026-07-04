/**
 * Anti-FOUC snippet: paste inside `<head>` of `src/app.html`, wrapped in a
 * `<script>` tag, so the persisted theme applies before styles load. Must
 * stay in sync with `theme.svelte.ts` (same localStorage key and class).
 */
export const THEME_INIT_SCRIPT = `// Anti-FOUC: apply the persisted theme before styles load.
const theme = localStorage.getItem('theme');
if (theme === 'dark' || (!theme && matchMedia('(prefers-color-scheme: dark)').matches)) {
	document.documentElement.classList.add('dark');
}`;
