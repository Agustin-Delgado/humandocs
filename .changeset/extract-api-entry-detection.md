---
'@human-kit/markdown': patch
---

Run `hk-extract-api` again when a package manager starts it. The guard that keeps the CLI from running on import compared the entry path with the module url as text, but a package manager runs the CLI through a shim: the entry path then holds `..` segments and goes through a symlink, while the module url holds the resolved path. The two never matched, thus the command exited with no work, no output file and no message. It now compares the real path of each.
