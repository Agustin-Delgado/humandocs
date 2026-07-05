---
'@human-kit/humandocs': patch
---

Stop the table of contents from flashing the wrong item. The active heading depends on scroll, which SSR cannot know, so it no longer guesses (previously the first heading), which showed the wrong item for a frame when a page loaded scrolled (e.g. a reload). SSR now marks nothing active and the client sets it — the first heading at the top, or the scrolled section — computed synchronously so the correct item is active from the first client frame.
