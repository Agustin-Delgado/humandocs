import type { NavGroup } from '@human-kit/humandocs/content';

export const nav: NavGroup[] = [
	{
		label: 'Guide',
		items: [
			{ slug: 'getting-started', title: 'Getting started' },
			{ slug: 'markdown', title: 'Markdown' },
			{ slug: 'blueprints', title: 'Blueprints' }
		]
	},
	{
		label: 'Kit',
		items: [
			{ slug: 'components', title: 'Components' },
			{ slug: 'cli', title: 'CLI' }
		]
	}
];
