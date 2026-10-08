# Trivia Board

A Jeopardy-style "guess the song" game for 2–4 players, run from a single
browser window on one computer.

One person is the **game master (GM)** and controls the app. Players never
touch it; they tell the GM when they want to answer, and the GM clicks for
them. Each question is a short song clip, and players try to name the song.

> The game is called `VeggieCarrier`, which is the reference to a popular
> YouTube channel "Овощевоз", where players guess songs by short clips.

## How a game works

1. **Setup** happens in two steps:
   1. Pick the number of players (2, 3 or 4) and type each player's name.
   2. Once a player count is picked, choose when the game ends:
      - **Questions** (the default): after the number of **Questions to
        play** you set, from 1 to 64 (64 by default, the whole board). A
        question counts once someone answers it correctly or every player has
        tried it; a cancelled question doesn't count.
      - **Score**: as soon as one player reaches the **Points to win** you
        set. The default depends on the number of players: 15,000 for 2,
        10,000 for 3 and 8,000 for 4 (the whole board is worth 32,800). Once
        you type your own target, it's kept. If the board runs out before
        anyone gets there, the game ends anyway.

   **Start Game** becomes clickable once every name is filled in and the
   number for the chosen mode is a valid whole number. **New Game** keeps
   your last choice.
2. **The board.** The board has 8 categories (rows) and 8 point values
   (columns): 100, 200, 300, 400, 500, 600, 800 and 1000. Current scores are
   shown above it, along with the goal (for example "The game ends after 20
   questions (3 played)" or "First to 10000 points wins").
3. **Opening a question.** Click a cell to open it. Its clip starts playing
   right away. The GM can:
   - **Pause** and then **Resume**, or **Replay from start**.
   - **Reveal Answer** to see the correct answer. Only the GM should be
     looking at the screen when they use this.
   - **Cancel** to close the question without using it up. The cell stays
     available on the board.
4. **Judging answers.** When a player signals, they give their answer out loud
   and the GM clicks **Correct** or **Wrong** next to that player's name.
   - **Correct:** the player gets the cell's points and the question closes.
   - **Wrong:** no points are taken away. That player can't try this question
     again, but the clip keeps going and the remaining players can still
     answer.
   - If every player answers wrong, the question closes and nobody scores.
5. **Game over.** When the chosen end condition is met, the Game Over screen
   shows why the game ended and the final ranking. **New Game** takes you back
   to setup.

There are no Daily Doubles, no Final round and no penalties for wrong answers.

## Running it

You don't need to install anything. There's no build step or package manager.

1. Put your song clips in the `audio/` folder (see below).
2. Pick or create the question file for your game (see below).
3. Run `make start` in the project folder. It starts a small local web
   server in the background and opens the game at <http://localhost:8000>.
4. Run `make stop` when you're done.

If port 8000 is taken, use another one: `make start PORT=8080`. Without
`make`, you can run the server directly and stop it with Ctrl+C:
`python3 -m http.server 8000 --bind 127.0.0.1`.

The server is needed for YouTube questions, because YouTube won't play videos
in a page opened directly from disk. If all your questions are local audio
files, you can skip it and simply open `index.html` in a browser instead.

Nothing is saved. Reloading or closing the page clears the game, scores
included. Avoid refreshing in the middle of a game.

### Game master view

<http://localhost:8000/gm.html> is a separate page for the GM, to open on a
screen the players can't see. It shows the same board, and clicking a cell
shows only that question's answer. It doesn't play anything or keep score;
the game itself is still run on the main page. It always shows the same
question file the main page loads, and it needs the local server.

## Setting up questions

Each game's content lives in its own file in the **`questions/`** folder,
for example `questions/questions.max-favs.js`. The game loads one of them,
chosen by this line near the end of `index.html`:

```html
<script src="questions/questions.max-favs.js"></script>
```

To prepare a new game, copy an existing file (or
`questions/questions.placeholder.js`, the blank template) to a new name,
edit it, and change that line to point at it. Then reload the page.

Each question file contains:

- `VALUES` holds the 8 point values, one per column.
- `CATEGORIES` holds the 8 categories. Each one has a `name` and exactly 8
  questions, in the same order as `VALUES`. The first question is worth 100,
  the second 200, and so on.

Each question's clip is either a local audio file or a segment of a YouTube
video. You can mix both kinds on one board.

```js
{ audio: "audio/rock-300.mp3", answer: "Queen — Bohemian Rhapsody" }
{ youtube: { id: "fJ9rUzIMcZQ", start: "0:50", end: "0:58" }, answer: "Queen — Bohemian Rhapsody" }
```

- `audio` is the path to the clip, relative to `index.html` (not to the
  question file), for example `audio/rock-300.mp3`. The app plays the
  whole file, so trim each clip to the length you want before the game.
- `youtube` plays part of a YouTube video:
  - `id` is the part after `v=` in the video's URL.
  - `start` and `end` are where the clip begins and ends, in seconds (`50`) or
    minutes and seconds (`"0:50"`). Without `start` the clip plays from the
    beginning; without `end` it plays to the end of the video.
- `answer` is the text the GM sees after clicking **Reveal Answer**.

### YouTube questions

- They need an internet connection and the local server (see
  [Running it](#running-it)).
- While the clip plays, the video is hidden behind a status panel, because
  the video's title and picture usually give the answer away. **Reveal
  Answer** uncovers it.
- If you're signed in to YouTube Premium in the same browser, there are no
  ads.
- Some videos can't be played outside YouTube. Their owners have blocked it.
  The question then shows an error instead of playing, so test your YouTube
  questions before the game.

`questions/questions.placeholder.js` contains placeholder categories (A–H)
that point to audio files that don't exist. Opening one of those cells shows
"Audio failed to load". It's meant as a starting point for a new game, not to
be played as is.

### Audio files

Put the clips in the `audio/` folder. Git ignores everything in that folder
except `.gitkeep`, because the songs are copyrighted and shouldn't be
committed. Any format your browser can play will work; MP3 is the safest
choice.

### Making clips from full songs

`make-clips.sh` cuts clips out of full songs for you. It needs
[ffmpeg](https://ffmpeg.org/) (macOS: `brew install ffmpeg`).

1. Put the full songs in `audio/source/`. Use songs you've bought or ripped
   from your own CDs.
2. List the clips in `clips.txt`, one per line:

   ```
   audio/a-100.mp3 | audio/source/Queen - Bohemian Rhapsody.mp3 | 0:50 | 8
   ```

   The fields are: where the clip goes (the same path as in your question
   file),
   the source song, the start time (`1:23` or `83`), and the length in
   seconds.
3. Run `./make-clips.sh`.

Each clip gets a short fade in and out, and its volume is evened out so
clips play at a similar loudness. Cover art and song tags are removed so the
file itself can't give the answer away. Every run re-creates all clips, so to
adjust a clip, change its line and run the script again.
`./make-clips.sh --dry-run` shows what would be done without creating
anything.

## Project files

| File           | What it's for                                                     |
|----------------|-------------------------------------------------------------------|
| `index.html`   | Page layout: setup, board and Game Over screens, plus the question pop-up |
| `gm.html`, `gm.js` | Game master view: the board as an answer key                 |
| `style.css`    | All styling                                                       |
| `app.js`       | Game logic and in-memory game state                               |
| `questions/`   | One file per game: categories, point values, clips and answers   |
| `audio/`       | Your song clips (not committed to git)                            |
| `make-clips.sh`| Cuts clips from full songs using `clips.txt`                      |
| `clips.txt`    | The list of clips to cut: source song, start time, length         |

## License

The code is released under the [MIT License](LICENSE), © 2026 Maksim
Sventukh (@msventukh).

The license covers this project's own code, docs and question files only.
The music is not part of the project: songs and clips are never committed
(see [Audio files](#audio-files)), and YouTube questions only reference
videos by ID. All music belongs to its respective rights holders.
