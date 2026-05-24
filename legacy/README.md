# Legacy — Runaway for Browser (2011 original)

This folder holds the **original 2011 build** of Runaway for Browser exactly as I wrote it as a junior dev, frozen and preserved. The active project at the repo root is a from-scratch rewrite in Phaser 3 — this folder is kept for archaeology, sentimental value, and downloadable proof that the project predates modern tooling (and AI).

## What's in here

| Path                              | What it is                                                             |
|-----------------------------------|------------------------------------------------------------------------|
| `Runaway for browser.html`        | The playable 2011 game. Open in a browser, no build needed.            |
| `index.html`                      | Unfinished v2 stage redesign (empty 20×20 grid, no players wired up).  |
| `js/funcoes.js`                   | All ~400 lines of game logic. Identifiers in Portuguese.               |
| `js/funcoes_backup.js`            | Older snapshot of `funcoes.js`, not loaded by any HTML.                |
| `js/funcoes_backup2.js`           | Even older snapshot.                                                   |
| `js/Testes/index.html`            | A scratch page where I was experimenting with constructors.            |
| `css/style.css`                   | Stylesheet for the playable game.                                      |
| `css/runaway.css`                 | Stylesheet for the unfinished v2 layout.                               |
| `imgs/`                           | Tile and sprite assets (the sprite sheet was never wired up).          |
| `somPunch.mp3`                    | The one sound effect that made it in.                                  |

Note: `Runaway for browser.html` references a `somFire.mp3` that was never committed — the fire attack has always been silent. Authentic shipping software, 2011 edition.

## How to run

Open `Runaway for browser.html` in any modern browser. There's nothing to install or build.

Controls and architecture details are in the root `CLAUDE.md` under the "Legacy" section.

## Why it's still here

1. **History.** This was my first non-trivial codebase.
2. **A downloadable artifact.** The homepage of the revived game offers the zip of this folder for download — anyone curious can play the original and read 400 lines of well-meaning Portuguese identifiers.
3. **A reminder.** Real engineers ship messy first drafts. This one is mine.

Do not edit anything in this folder unless you are deliberately producing an updated archival snapshot. The new build lives at the repo root.
