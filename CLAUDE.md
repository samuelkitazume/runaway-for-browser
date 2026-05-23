# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A 2-player local-multiplayer browser fighting game written in 2011 as a junior-dev learning project. Pure HTML/CSS/JavaScript — **no build system, no package manager, no dependencies, no tests**. Source identifiers and comments are in Portuguese (`jogador` = player, `vocacao` = class/vocation, `tile` = tile, `dano` = damage, `cenario` = stage).

## How to run

Open the HTML file directly in a browser — there is nothing to build or install.

- [Runaway for browser.html](Runaway for browser.html) is the **playable game** (loads [css/style.css](css/style.css) and [js/funcoes.js](js/funcoes.js)).
- [index.html](index.html) is a separate, **unfinished** redesigned stage layout (20×20 hand-written `row-*/col-*` divs, loads [css/runaway.css](css/runaway.css)). It pulls in `funcoes.js` but does not wire up any players — opening it just renders an empty grid. Treat it as a started-but-abandoned v2 unless the user says otherwise.

Known broken asset: `Runaway for browser.html` references `somFire.mp3` which is not in the repo — only `somPunch.mp3` exists. The `<audio>` tag will 404 silently.

## Controls

| Action       | Player 1 (`jogador1`)        | Player 2 (`jogador2`) |
|--------------|------------------------------|-----------------------|
| Move         | Arrow keys                   | W A S D               |
| Fist attack  | Delete (keyCode 46)          | Q                     |
| Fire attack  | Insert (keyCode 45)          | E                     |
| Heal         | Home (keyCode 36)            | F                     |

Fist attack only fires if the players are adjacent (`verificaProximidade`).

## Architecture

Everything lives in one ~400-line file: [js/funcoes.js](js/funcoes.js). The two backup files (`funcoes_backup.js`, `funcoes_backup2.js`) are **older snapshots** of the same file and are not loaded by any HTML — leave them alone unless explicitly asked to clean up.

### World model

- Stage is a fixed `tamanhoTela` 1000×600 px divided into `tamanhoTile` 50 px squares → a 20×12 grid. Wrapping is implemented in `changeX`/`changeY` — walking off one edge teleports to the other.
- `objetos[]` is a flat global array of every placed tile, each a `tipoobjeto { info, xy, tangivel }` where `xy` is the string `"x,y"`. This array is the source of truth for both collision (`verificaChoque`) and damage-on-step (`verificaTile`). Anything that adds DOM tiles via `criaTile` must also push into `objetos`, and `deletaTile` must splice it back out — keep them in sync.
- All gameplay DOM is injected as innerHTML into `#hits`. `criaTile` builds an HTML string and appends; there is no virtual DOM or framework.

### Player

`Player(jogador, vocation)` is a constructor-style "class". Two vocations exist in the `vocacao` table: `guerreiro` (1000 HP / 100 mana / strong fist) and `mago` (500 HP / 500 mana / weak fist but high `magiclevel`). Both `Runaway for browser.html` hard-codes both players as `guerreiro`.

`changeX`/`changeY` are deliberately split (see in-file comment) so the browser only updates the changed CSS coordinate. They (a) check `verificaChoque` for blocking tiles, (b) update the player's grid coords, (c) update `style.left`/`style.top` in pixels, (d) call `setDirection` if the move had a direction, and (e) call `verificaTile` to apply damage from any standing-on tile (e.g. fire).

`setDirection(l)` writes `backgroundPosition = (l * 50)px 0px`, anticipating a sprite sheet (see `imgs/exemplo_sprite.png`). The current build uses solid color blocks instead, so this is a no-op visually but still tracked as `this.direction` and consumed by `firegun` to decide aim.

### Combat

- `fistAtk(jogador)` — random damage 1..`fist`, calls `hita`.
- `firegun(jogador)` — costs 20 mana. Spawns 3 fire tiles in a line in the player's `direction`; each tile is `deletavel` (auto-removed after 500 ms via `setTimeout` in `criaTile`). If the other player is on a spawned tile at spawn time, they take `Math.random() * 1000 * magiclevel` damage. Note: damage is checked only at spawn, not as the projectile travels (it doesn't travel — all 3 tiles appear at once).
- `heal(jogador)` — costs 25 mana, restores `Math.random() * 1000 + 1` HP. Can overheal past `lifeInic`.
- `hita(dano, jogador)` — applies damage, updates the life span in the HUD, plays `somPunch`, calls `geraHit` to float a damage number, and `alert()`s + reloads on death.
- `recuperaMana()` is defined but **never called** — mana regen is not wired to any timer.

### Initialization

`Runaway for browser.html` ends with a 3-line inline `<script>`:
```js
var jogador1 = new Player('player1','guerreiro');
var jogador2 = new Player('player2','guerreiro');
randomMapFire(100);
```
`randomMapFire(100)` scatters 100 fire tiles with `dano: 100`. There's no collision check against player spawn positions, so a player can spawn already on fire.

## Conventions and gotchas

- **Portuguese-language identifiers** are intentional — when adding code, match the existing style rather than renaming things, unless asked to do an English rename pass.
- **Globals everywhere** — `jogador1`, `jogador2`, `objetos`, and helpers are all on `window`. Inline scripts in the HTML rely on this. Don't wrap in IIFEs or modules without coordinating an HTML update.
- **No collision check on attacks vs. self or arena edges** — `firegun` can spawn tiles at negative coords or past column 19; they just render off-screen. Be careful if you tighten this — it may break the existing wrap-around movement assumption.
- **The `objetos` array grows** every time a fire/hit tile is spawned and only shrinks on `deletaTile`. Hit-damage floats (`geraHit`) and `firegun` tiles do self-delete; the initial `randomMapFire` tiles do not. After a long game the array is large but bounded.
- **`verificaChoque` only blocks tiles with `tangivel: true`** — currently nothing in the codebase passes `true`, so nothing is actually solid. The plumbing is there but unused.
