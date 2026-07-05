---
'@human-kit/humandocs': patch
---

Fix the table of contents not updating on client-side navigation. The heading registry lives in the docs shell (a layout), which navigation does not remount, so entries pushed by content components (e.g. `ApiReference`) accumulated across pages: the TOC kept showing the previous page's headings, and when two pages registered the same part name (e.g. `api-root`) the duplicate ids crashed the TOC's keyed list until a full reload.

The registry is now reactive (`$state`) and `registerHeadings` returns an unregister function that `ApiReference` calls on unmount, so each page's component headings are dropped when navigating away and the TOC always reflects the current page. Registered headings are also deduplicated by id.
