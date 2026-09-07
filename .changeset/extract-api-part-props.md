---
'@human-kit/markdown': patch
---

`hk-extract-api` gave a part the props of another part. A component folder with a shared `types.ts` holds the props of its root, and a part with no declaration in that file took the first one it found there — so a part that lives in another folder, or that declares its props inline, was documented with the props of the root. The lookup now falls through to the file of the part, which is where its props actually are.

The CLI also stops running on import, so `runExtractApi` can be called from a test.
