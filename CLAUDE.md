# Trivia Board

A personal-use, local-only Jeopardy-style trivia game for 2-4 players. The
name "VeggieCarrier" references the popular YouTube channel "Овощевоз"
(roughly "veggie carrier"), where players guess songs from short clips.

## How it's played

- A single **game master (GM)** operates the app on one screen; players never
  touch the UI directly. Players verbally signal the GM, who performs all
  actions on their behalf.
- The board is an 8x8 grid: 8 categories (rows) x 8 point values (columns):
  100, 200, 300, 400, 500, 600, 800, 1000.
- Each question is a short audio clip from a song; players guess the song.
  Opening a cell autoplays its clip. The GM can pause, then either resume or
  replay from the start. The GM judges correctness manually — there's no
  automated answer-checking. To see answers without the players seeing them,
  the GM opens the answer-key page (`gm.html`) on a second screen of the same
  computer; the main page's Reveal Answer toggle still exists too.
- Each player gets **exactly one attempt per question**. A wrong answer has
  no score penalty; the question just stays open for the next player who
  signaled. It closes as soon as someone answers correctly, or once every
  player has had an unsuccessful attempt (no one scores).
- Setup is two steps on the start screen: (1) player count + names, then
  (2) the end mode, which is hidden until a player count is picked.
- The end condition ("end mode") is chosen on the start screen:
  **Questions** (a configurable number of questions played, 1–64, default
  64; a question counts once it's used — answered correctly or tried by
  everyone; Cancel doesn't count) or **Score** (first player to reach a
  configurable target; the game also ends if the board runs out first).
  The Score default depends on the player count (`DEFAULT_TARGET_SCORES` in
  `app.js`: 2 → 15000, 3 → 10000, 4 → 8000) until the GM types their own
  target, which is then kept. New Game keeps the last mode and values.
  Final scores are ranked on a Game Over screen (which also says why the
  game ended) with a reset-to-start "New Game" button.

Deliberately **not** implemented (minimal v1 scope): Daily Double, a Final
round/tiebreaker, score penalties for wrong answers.

## Architecture

- Plain HTML/CSS/JS. No framework, no build step, no package manager, no
  backend. Served by a plain static local server
  (`python3 -m http.server`, bound to 127.0.0.1), which YouTube's embedded
  player needs. `make start` / `make stop` run it in the background (PID in
  `.server.pid`, git-ignored; `PORT=` overrides 8000) and print both page
  URLs. Keep the 127.0.0.1 binding: the GM view runs on the same computer
  (second screen), and the user decided against exposing the game, answer
  key included, to the LAN. Local-file-only boards still work opened
  directly from disk.
- YouTube questions use YouTube's IFrame Player API, loaded from
  youtube.com. That's the only network access, and it's needed for YouTube
  questions only.
- No persistence of any kind — all game state lives in an in-memory JS object
  (`state` in `app.js`) and is lost on reload/restart by design. There is no
  database and none is planned.
- This is intentional given the project's scope: single machine, single
  session, personal use. Don't introduce a backend, storage, or network layer
  without the user explicitly asking for it.

## Files

- `index.html` — the three screens (start, board, game-over) plus the
  question overlay markup (including the audio controls).
- `gm.html` + `gm.js` — the game master's answer key, a separate page for a
  screen the players can't see: the same board, where clicking a cell only
  shows its answer. No playback, scoring, or sync with the main page (the GM
  still runs the game there). It finds the question file by fetching
  `index.html` and reading its `questions/` script tag, so `index.html`
  stays the single place that picks the game; this needs the server
  (`fetch` fails on file://).
- `style.css` — all styling (both pages).
- `app.js` — all game logic and state. Key functions:
  - `buildBoard()` — builds the in-memory board from the loaded question
    file's `VALUES` and `CATEGORIES` globals.
  - `renderQuestionContent(cell)` — starts the question's clip. A clip is
    either `createAudioClip()` (local file) or `createYouTubeClip()` (video
    segment), both behind one small interface (`status()`, `toggle()`,
    `restart()`, `stop()`) that `updateClipControls()` renders. `stopClip()`
    is called from `closeQuestion()` so a clip never outlives its overlay.
  - YouTube clips: the video plays under a cover panel (title/art would spoil
    the answer) that **Reveal Answer** removes. The clip's `end` is enforced
    by polling `getCurrentTime()`, not the player's own `end` option.
    Status stays "loading" through initial buffering; it falls back to
    "ready" (Play button) after 5 s in case autoplay was blocked.
  - `isGameOver()` — the end-of-game condition, driven by
    `state.endCondition` (`{ mode: "questions", count }` or
    `{ mode: "score", target }`, set from the start screen). Every mode also
    ends once all cells are used (`allQuestionsUsed()`); `questionsPlayed()`
    counts used cells; `scoreWinner()` finds the player who hit the target.
    Each mode's setting is a `.mode-setting` row with a number input whose
    `min`/`max` attributes are the validation limits (`readWholeNumber()`).
    New modes go here plus a button in `#mode-buttons`.
  - `markCorrect(playerIndex)` / `markWrong(playerIndex)` — scoring and
    per-question attempt tracking.
- `questions/` — one question file per game, named `questions.<game>.js`
  (e.g. `questions.max-favs.js`, the user's favorites; "Max" is the user).
  `index.html` loads exactly one of them via its `<script src="questions/…">`
  tag; switching games means changing that tag. Each file defines `VALUES`
  (the 8 column point values) and `CATEGORIES` (8 categories, each with 8
  questions in the same order as `VALUES`). Each question is `{ audio, answer }` or
  `{ youtube: { id, start, end }, answer }`: `audio` is a path (relative to
  `index.html`, not to the question file) to a pre-trimmed clip that is
  played in full; `start`/`end` are seconds or "m:ss" strings.
  **Edit these files directly** to set up a game.
  `questions.placeholder.js` is the blank template (placeholder categories
  A–H pointing at audio files that don't exist).
- `audio/` — where the clip files go. Its contents are git-ignored (the
  songs are copyrighted), only `.gitkeep` is tracked. Full source songs go in
  `audio/source/` (also ignored).
- `make-clips.sh` + `clips.txt` — clip preparation. `clips.txt` lists
  `output | source | start | duration` per clip; the script cuts each one
  with ffmpeg (fades + loudness normalization, cover art/tags stripped) and
  re-creates every clip on each run. `--dry-run` prints the ffmpeg commands.
  Bash 3.2-compatible (macOS default). Sources must be legitimately obtained
  files (bought or ripped) — the user explicitly rejected anything that
  violates YouTube's ToS (downloading/recording from YouTube).

## Preparing questions

- **Sources:** YouTube clips (by video ID) or local clips cut by
  `make-clips.sh`. The user rejects anything that violates YouTube's ToS:
  no downloading or recording from YouTube, and no automated scraping of
  YouTube pages. For YouTube metadata use the official **YouTube Data API**
  (`videos.list`, 50 IDs per call, 1 quota unit each; avoid `search.list`,
  which costs 100 units).
- **API key:** `YOUTUBE_API_KEY=…` in `.secrets` (git-ignored). Read it from
  the file in scripts; never print, log, or commit it.
- **Personal data** goes in `.tmp/` (git-ignored), e.g.
  `.tmp/liked-songs.tsv`: the user's YouTube Music liked songs as TSV
  (`id, title, artist, album, duration, views`). `views` is the API
  `viewCount` of that exact video (mostly "- Topic" audio tracks), which is
  lower than YouTube Music's displayed "plays" (those include the music
  video); the user accepted views as the popularity measure.
- **Playability:** check `status.embeddable` and
  `contentDetails.regionRestriction` with the API. Games are played in
  **Germany (DE)**. Prefer this over browser playback tests, which time out
  when the Chrome tab is in the background (Chrome defers media loading).
- **Category conventions** used so far: 8 distinct songs per category, no
  song repeated across the board, at most ~2 per artist (unless the category
  is the artist); within a category the most-viewed song is worth 100 and
  the least-viewed 1000. Answers are `"Artist — Title"`, plus a note where
  useful: `(original: …)` for covers, the film/game for soundtracks. Start
  and end times are left for the user to set.

## Working on this repo

- Keep `README.md` (human-facing) and this file in sync with every feature
  change; the user expects docs updated alongside code.
- Commit/push only when asked. Messages use conventional prefixes (`feat:`,
  `docs:`, `refactor:`, `chore:`). The code is MIT-licensed (`LICENSE`,
  © Maksim Sventukh (@msventukh)); music is never part of the repo.
- Testing in a browser: the user often has their own `make start` server
  running on port 8000 — reuse it and don't stop it (check `.server.pid`).
  If you start one yourself, run `python3 -m http.server 8000 --bind
  127.0.0.1` directly (`make start` opens a browser window on the user's
  screen) and stop it afterwards. To test game logic silently, stub
  `window.renderQuestionContent` and `window.updateClipControls` with no-ops
  before opening questions.

## Known future directions (not yet built)

The user has flagged this as a likely follow-up once the prototype has been
used in real games — not a current requirement, but the reason
`buildBoard()` is kept as an isolated seam:

- **Multiple stages** — more than one full board (a "stage") may be needed,
  with the number of stages configurable. Touches `buildBoard()` and the
  board-screen state/rendering, which currently assume a single board.

(The other flagged direction, a configurable end-game trigger, is now built:
see `isGameOver()` above.)

When asked to build this, treat it as expected evolution of this project,
not a surprise pivot — but don't preemptively generalize the code for it
until actually asked.
