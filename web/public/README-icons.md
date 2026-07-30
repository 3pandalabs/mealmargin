# Icons

`icon.png` (512), `icon-192.png`, `apple-icon.png` (180) and `favicon-32.png`
are all crops of one source tile, added 2026-07-30. `icon-192.png` doubles as
the header mark in `src/components/Header.tsx`, and `icon.png` is the Open Graph
image.

Two things worth knowing before regenerating them:

- The source image was produced on a **mocked home-screen backdrop** — blurred
  other app icons around the tile. Everything here is cropped to the tile alone
  (`extract` at 328,302 · 1340×1340 of the 2048² source); shipping the backdrop
  would render as visual noise at every size an icon is actually shown at.
- **The tile carries the wordmark "EATWELL", not MealMargin.** That is
  deliberate as of 2026-07-30 — flagged and confirmed as intended, treated as a
  placeholder to swap later. If you are wondering whether it is a mistake: it
  was noticed, not missed. Replacing it means regenerating all four files from a
  new source at the same sizes and leaving the rest of the wiring alone.

The four sizes are declared explicitly in `src/app/layout.tsx` rather than using
Next's file-convention icons, because the 32px favicon has to be its own
downscale — letting a browser shrink the 512 turns the plate into mush in a tab
strip.

`panda-mark.svg` / `panda-mark-256.png` are the shared 3PandaLabs mark, copied
from `3pandalabs/brand` per the copy-not-import convention. Currently unused —
the company is credited by the "by 3PandaLabs" attribution tag in the header
instead. Kept because that is where the brand asset belongs if a use appears.
