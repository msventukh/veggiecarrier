# Trivia Board

A personal-use, local-only Jeopardy-style trivia game for 2-4 players. The
repo name ("veggiecarrier") has no relation to the project — it predates the
idea.

## How it's played

- A single **game master (GM)** operates the app on one screen; players never
  touch the UI directly. Players verbally signal the GM, who performs all
  actions on their behalf.
- The board is an 8x8 grid: 8 categories (rows) x 8 point values (columns):
  100, 200, 300, 400, 500, 600, 800, 1000.
- Each question is a short audio clip from a song; players guess the song.
  Opening a cell autoplays its clip. The GM can pause, then either resume or
  replay from the start. The GM reveals the answer to themself via a toggle
  and judges correctness manually — there's no automated answer-checking.
- Each player gets **exactly one attempt per question**. A wrong answer has
  no score penalty; the question just stays open for the next player who
  signaled. It closes as soon as someone answers correctly, or once every
  player has had an unsuccessful attempt (no one scores).
- Game ends once all 64 cells have been used; final scores are ranked on a
  Game Over screen with a reset-to-start "New Game" button.

Deliberately **not** implemented (minimal v1 scope): Daily Double, a Final
round/tiebreaker, score penalties for wrong answers.

## Architecture

- Plain HTML/CSS/JS. No framework, no build step, no package manager, no
  server. Open `index.html` directly in a browser.
- No persistence of any kind — all game state lives in an in-memory JS object
  (`state` in `app.js`) and is lost on reload/restart by design. There is no
  database and none is planned.
- This is intentional given the project's scope: single machine, single
  session, personal use. Don't introduce a backend, storage, or network layer
  without the user explicitly asking for it.

## Files

- `index.html` — the three screens (start, board, game-over) plus the
  question overlay markup (including the audio controls).
- `style.css` — all styling.
- `app.js` — all game logic and state. Key functions:
  - `buildBoard()` — builds the in-memory board from `questions.js`.
  - `renderQuestionContent(cell)` — starts the question's audio clip and
    wires up the overlay's play/pause/replay controls. `stopAudio()` is
    called from `closeQuestion()` so a clip never outlives its overlay.
  - `isGameOver()` — the end-of-game condition (currently: every cell used).
  - `markCorrect(playerIndex)` / `markWrong(playerIndex)` — scoring and
    per-question attempt tracking.
- `questions.js` — the editable content file: `VALUES` (the 8 column point
  values) and `CATEGORIES` (8 categories, each with 8 questions in the same
  order as `VALUES`). Each question is `{ audio, answer }`: `audio` is a path
  (relative to `index.html`) to a pre-trimmed clip that is played in full.
  **Edit this file directly** to set up real questions before a game; it
  currently ships with placeholder paths to files that don't exist.
- `audio/` — where the clip files go. Its contents are git-ignored (the
  songs are copyrighted), only `.gitkeep` is tracked. How to prepare the
  clips is still to be decided.

## Known future directions (not yet built)

The user has flagged these as likely follow-ups once the v1 prototype has
been used in a real game — not current requirements, but the reason a few
functions above are kept as isolated seams rather than inlined:

1. **Multiple stages** — more than one full board (a "stage") may be needed,
   with the number of stages configurable. Touches `buildBoard()` and the
   board-screen state/rendering, which currently assume a single board.
2. **Configurable end-game trigger** — the end condition may become
   something other than "all 64 cells used". Touches `isGameOver()`.

When asked to build any of these, treat it as expected evolution of this
project, not a surprise pivot — but don't preemptively generalize the code
for them until actually asked.
