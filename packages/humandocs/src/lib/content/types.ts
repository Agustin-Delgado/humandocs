export interface NavItem {
	slug: string;
	title: string;
}

export interface NavGroup {
	label: string;
	items: NavItem[];
}

export interface DocMeta {
	title: string;
	description?: string;
	[key: string]: unknown;
}
