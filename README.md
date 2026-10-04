# Trivia Board

A Jeopardy-style "guess the song" game for 2–4 players, run from a single
browser window on one computer.

One person is the **game master (GM)** and controls the app. Players never
touch it; they tell the GM when they want to answer, and the GM clicks for
them. Each question is a short song clip, and players try to name the song.

> The game is called `VeggieCarrier`, which is the reference to a popular
> YouTube channel "Овощевоз", where players guess songs by short clips.

## How a game works

1. **Setup.** Pick the number of players (2, 3 or 4) and type each player's
   name. **Start Game** becomes clickable once every name is filled in.
2. **The board.** The board has 8 categories (rows) and 8 point values
   (columns): 100, 200, 300, 400, 500, 600, 800 and 1000. Current scores are
   shown above it.
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
5. **Game over.** When all 64 cells have been used, the Game Over screen shows
   the final ranking. **New Game** takes you back to setup.

There are no Daily Doubles, no Final round and no penalties for wrong answers.

## Running it

You don't need to install anything. There's no build step or package manager.

1. Put your song clips in the `audio/` folder (see below).
2. Edit `questions.js` with your categories and answers (see below).
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

## Setting up questions

All game content is in **`questions.js`**. Edit it directly before a game.

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

- `audio` is the path to the clip, relative to `index.html`. The app plays the
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

As shipped, `questions.js` contains placeholder categories (A–H) that point to
audio files that don't exist. Opening one of those cells shows
"Audio failed to load". Replace the placeholders with your own content before
playing.

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

   The fields are: where the clip goes (the same path as in `questions.js`),
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
| `style.css`    | All styling                                                       |
| `app.js`       | Game logic and in-memory game state                               |
| `questions.js` | Your categories, point values, clips and answers                  |
| `audio/`       | Your song clips (not committed to git)                            |
| `make-clips.sh`| Cuts clips from full songs using `clips.txt`                      |
| `clips.txt`    | The list of clips to cut: source song, start time, length         |
