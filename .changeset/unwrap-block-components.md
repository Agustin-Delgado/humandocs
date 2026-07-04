---
'@human-kit/markdown': patch
---

Don't wrap block-level components in `<p>`. A component written on its own line (`<Demo />`, `<ApiReference />`) was paragraph-wrapped by remark; when it renders a block element the result is `<p><div></p>`, which the browser reparents — breaking Svelte hydration (`HierarchyRequestError`) and leaving the page unstyled after hydration. Paragraphs whose only content is raw component/HTML nodes are now unwrapped, while inline usage (`text <Component /> text`) keeps its paragraph.
