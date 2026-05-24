# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

A **revitalization in progress** of a 2011 vanilla-JS 2-player browser fighting game I wrote as a junior dev. The 2011 original is preserved under [`legacy/`](legacy/) and is being rebuilt from scratch at the repo root in Phaser 3 + Vite, deployed to Cloudflare Pages via Terraform.

The repo is moving through phases:

- **Phase 0 — done.** 2011 code archived under `legacy/`. Script written to zip it for download (dormant until Phase 2 installs `archiver`).
- **Phase 1 — in progress / done.** Terraform scaffold under [`terraform/`](terraform/) provisions a Cloudflare Pages project (direct-upload mode), attaches a custom subdomain, and creates the DNS record. First deploy serves the contents of `legacy/` as-is.
- **Phase 2+ — not yet started.** New Phaser 3 + Vite scaffold, then homepage, then arena, then combat, then polish. See the [Notion project page](https://www.notion.so/3693e7c4833e81328b0fc607e7173f84) for the full plan.

When working on this repo, **always know which phase the change belongs to** before editing. Touching `legacy/` is only for archival corrections; new gameplay code goes at the repo root in the new project structure that arrives in Phase 2.

## Working conventions

- **New code is in English.** The legacy code is Portuguese (`jogador`, `vocacao`, `dano`); the rewrite uses `player`, `vocation`, `damage`, etc. Don't reintroduce Portuguese identifiers in new code; don't rename anything inside `legacy/`.
- **`legacy/` is frozen.** Don't refactor, lint, or "modernize" anything in there. The only legitimate change is producing a new archival snapshot, and that should be a deliberate decision.
- **The downloadable zip is reproducible.** [`scripts/build-legacy-zip.mjs`](scripts/build-legacy-zip.mjs) pins entry timestamps to the Unix epoch so the artifact is byte-identical across rebuilds. Don't break this — it lets us avoid committing the binary while keeping downloads stable.
- **Terraform state stays out of git.** `terraform/.gitignore` excludes `*.tfstate*`, `*.tfvars` (except the example), and `.terraform/`. Treat secrets the same way.

## How to run

### The new project (Phase 2+)

Not scaffolded yet. This section will be filled in once Vite + Phaser arrive.

### The legacy game

```
# from the repo root
start "legacy/Runaway for browser.html"      # Windows
open "legacy/Runaway for browser.html"        # macOS
xdg-open "legacy/Runaway for browser.html"    # Linux
```

Or just double-click the file. Full architecture, controls, and known gotchas for that build are in the [Legacy appendix](#legacy-appendix-the-2011-build) below.

### Terraform (Phase 1)

See [`terraform/README.md`](terraform/README.md) for the first-time setup walkthrough. Short version:

```
cd terraform
cp terraform.tfvars.example terraform.tfvars   # fill in your values
terraform init
terraform plan
terraform apply
# then, to push the legacy build live:
npx wrangler pages deploy ../legacy --project-name=<your project name> --branch=main
```

## Legacy appendix — the 2011 build

Everything below describes the code under `legacy/`. It is accurate for that folder only and does **not** apply to the new project at the repo root.

### What it is

A 2-player local-multiplayer browser fighting game. Pure HTML/CSS/JavaScript — no build system, no package manager, no dependencies, no tests. Source identifiers and comments are in Portuguese (`jogador` = player, `vocacao` = class/vocation, `tile` = tile, `dano` = damage, `cenario` = stage).

### Entry points

- [legacy/Runaway for browser.html](legacy/Runaway%20for%20browser.html) — the **playable game** (loads `legacy/css/style.css` and `legacy/js/funcoes.js`).
- [legacy/index.html](legacy/index.html) — an **unfinished** redesigned stage layout (20×20 hand-written `row-*/col-*` divs, loads `legacy/css/runaway.css`). It pulls in `funcoes.js` but does not wire up any players — opening it just renders an empty grid.

Known broken asset: the playable HTML references `somFire.mp3`, which is not in the repo. The `<audio>` tag 404s silently.

### Controls

| Action       | Player 1 (`jogador1`)        | Player 2 (`jogador2`) |
|--------------|------------------------------|-----------------------|
| Move         | Arrow keys                   | W A S D               |
| Fist attack  | Delete (keyCode 46)          | Q                     |
| Fire attack  | Insert (keyCode 45)          | E                     |
| Heal         | Home (keyCode 36)            | F                     |

Fist attack only fires if the players are adjacent (`verificaProximidade`).

### Architecture (legacy)

Everything lives in one ~400-line file: [`legacy/js/funcoes.js`](legacy/js/funcoes.js). The two backup files (`funcoes_backup.js`, `funcoes_backup2.js`) are older snapshots and are not loaded by any HTML.

#### World model

- Stage is `tamanhoTela` 1000×600 px divided into `tamanhoTile` 50 px squares → a 20×12 grid. Wrapping is implemented in `changeX`/`changeY` — walking off one edge teleports to the other.
- `objetos[]` is a flat global array of every placed tile, each a `tipoobjeto { info, xy, tangivel }` where `xy` is the string `"x,y"`. This is the source of truth for both collision (`verificaChoque`) and damage-on-step (`verificaTile`). `criaTile` and `deletaTile` must keep DOM and this array in sync.
- All gameplay DOM is injected as `innerHTML` into `#hits`. No virtual DOM or framework.

#### Player

`Player(jogador, vocation)` is a constructor-style "class". Two vocations exist: `guerreiro` (1000 HP / 100 mana / strong fist) and `mago` (500 HP / 500 mana / weak fist but high `magiclevel`). Both players are hard-coded as `guerreiro` in the playable HTML.

`changeX`/`changeY` are deliberately split for browser performance (per the in-file comment). They check `verificaChoque`, update coords, update CSS in pixels, call `setDirection`, and call `verificaTile` for standing-on-tile damage.

`setDirection(l)` writes `backgroundPosition = (l * 50)px 0px`, anticipating a sprite sheet that was never wired up. Currently a no-op visually but the direction is tracked and consumed by `firegun` to aim.

#### Combat

- `fistAtk(jogador)` — random damage 1..`fist`, calls `hita`.
- `firegun(jogador)` — costs 20 mana. Spawns 3 fire tiles in a line in the player's `direction`; each tile is `deletavel` (auto-removed after 500 ms). Damage is checked **only at spawn**, not as a moving projectile.
- `heal(jogador)` — costs 25 mana, restores `Math.random() * 1000 + 1` HP. Can overheal past `lifeInic`.
- `hita(dano, jogador)` — applies damage, updates the HUD, plays `somPunch`, floats a damage number via `geraHit`, `alert()`s + reloads on death.
- `recuperaMana()` is defined but **never called** — mana regen is not wired to any timer.

#### Initialization

The playable HTML ends with a 3-line inline `<script>`:
```js
var jogador1 = new Player('player1','guerreiro');
var jogador2 = new Player('player2','guerreiro');
randomMapFire(100);
```
`randomMapFire(100)` scatters 100 fire tiles with `dano: 100`. No collision check against player spawn positions — a player can spawn already on fire.

### Conventions and gotchas (legacy)

- **Globals everywhere** — `jogador1`, `jogador2`, `objetos`, and helpers are all on `window`.
- **No collision check on attacks vs. self or arena edges** — `firegun` can spawn tiles at negative coords or past column 19; they render off-screen.
- **`objetos` grows** every time a fire/hit tile spawns and only shrinks on `deletaTile`. `firegun` tiles and hit-damage floats self-delete; the initial `randomMapFire` tiles do not.
- **`verificaChoque` only blocks `tangivel: true` tiles** — currently nothing in the codebase passes `true`, so nothing is actually solid.
