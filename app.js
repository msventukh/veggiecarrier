// In-memory game state. Nothing here is persisted — a reload starts fresh.
const state = {
  players: [],   // { name, score }
  board: null,   // [{ name, cells: [{ value, audio, youtube, answer, used }] }]
  activeCell: null, // { catIndex, valIndex, remainingPlayerIndexes }
};

let selectedPlayerCount = null;

// ---- Screens ----

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ---- Start screen ----

const countButtonsEl = document.getElementById("count-buttons");
const playerNameInputsEl = document.getElementById("player-name-inputs");
const startGameBtn = document.getElementById("start-game-btn");

countButtonsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".count-btn");
  if (!btn) return;
  selectedPlayerCount = Number(btn.dataset.count);

  countButtonsEl.querySelectorAll(".count-btn").forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");

  renderPlayerNameInputs();
  validateStartForm();
});

function renderPlayerNameInputs() {
  playerNameInputsEl.innerHTML = "";
  for (let i = 0; i < selectedPlayerCount; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Player ${i + 1} name`;
    input.id = `player-name-${i}`;
    input.addEventListener("input", validateStartForm);
    playerNameInputsEl.appendChild(input);
  }
}

function validateStartForm() {
  if (!selectedPlayerCount) {
    startGameBtn.disabled = true;
    return;
  }
  const inputs = playerNameInputsEl.querySelectorAll("input");
  const allFilled = Array.from(inputs).every((i) => i.value.trim().length > 0);
  startGameBtn.disabled = !allFilled;
}

startGameBtn.addEventListener("click", () => {
  const inputs = playerNameInputsEl.querySelectorAll("input");
  state.players = Array.from(inputs).map((i) => ({ name: i.value.trim(), score: 0 }));
  state.board = buildBoard();
  renderScoreboard();
  renderBoard();
  showScreen("screen-board");
});

// ---- Board construction (seam: swap this out to support multiple stages later) ----

function buildBoard() {
  return CATEGORIES.map((category) => ({
    name: category.name,
    cells: category.questions.map((q, i) => ({
      value: VALUES[i],
      audio: q.audio,
      youtube: q.youtube,
      answer: q.answer,
      used: false,
    })),
  }));
}

// ---- Board screen ----

const scoreboardEl = document.getElementById("scoreboard");
const boardTableEl = document.getElementById("board-table");

function renderScoreboard() {
  scoreboardEl.innerHTML = "";
  state.players.forEach((player) => {
    const card = document.createElement("div");
    card.className = "score-card";
    card.innerHTML = `<div class="name">${escapeHtml(player.name)}</div><div class="score">${player.score}</div>`;
    scoreboardEl.appendChild(card);
  });
}

function renderBoard() {
  boardTableEl.innerHTML = "";
  state.board.forEach((category, catIndex) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.className = "category-cell";
    nameCell.textContent = category.name;
    row.appendChild(nameCell);

    category.cells.forEach((cell, valIndex) => {
      const td = document.createElement("td");
      td.className = "value-cell";
      const btn = document.createElement("button");
      btn.textContent = cell.used ? "" : cell.value;
      btn.disabled = cell.used;
      btn.addEventListener("click", () => openQuestion(catIndex, valIndex));
      td.appendChild(btn);
      row.appendChild(td);
    });

    boardTableEl.appendChild(row);
  });
}

// ---- Question overlay ----

const overlayEl = document.getElementById("question-overlay");
const overlayCategoryEl = document.getElementById("overlay-category");
const overlayValueEl = document.getElementById("overlay-value");
const overlayAnswerEl = document.getElementById("overlay-answer");
const overlayPlayersEl = document.getElementById("overlay-players");
const revealAnswerBtn = document.getElementById("reveal-answer-btn");
const cancelQuestionBtn = document.getElementById("cancel-question-btn");
const audioStatusEl = document.getElementById("audio-status");
const audioControlsEl = document.getElementById("audio-controls");
const audioToggleBtn = document.getElementById("audio-toggle-btn");
const audioReplayBtn = document.getElementById("audio-replay-btn");
const videoBoxEl = document.getElementById("video-box");
const videoHostEl = document.getElementById("video-host");
const videoCoverEl = document.getElementById("video-cover");

function openQuestion(catIndex, valIndex) {
  state.activeCell = {
    catIndex,
    valIndex,
    remainingPlayerIndexes: state.players.map((_, i) => i),
  };
  const category = state.board[catIndex];
  const cell = category.cells[valIndex];

  overlayCategoryEl.textContent = category.name;
  overlayValueEl.textContent = cell.value;
  overlayAnswerEl.textContent = cell.answer;
  overlayAnswerEl.classList.add("hidden");
  videoCoverEl.classList.remove("hidden");
  renderQuestionContent(cell);
  renderOverlayPlayers();
  overlayEl.classList.remove("hidden");
}

function closeQuestion() {
  stopClip();
  state.activeCell = null;
  overlayEl.classList.add("hidden");
}

// Only the player list is re-rendered after a wrong answer, so the clip keeps
// playing (or stays paused) instead of restarting.
function renderOverlayPlayers() {
  const { remainingPlayerIndexes } = state.activeCell;

  overlayPlayersEl.innerHTML = "";
  remainingPlayerIndexes.forEach((playerIndex) => {
    const player = state.players[playerIndex];
    const row = document.createElement("div");
    row.className = "player-attempt-row";
    row.innerHTML = `
      <span class="player-name">${escapeHtml(player.name)}</span>
      <span class="attempt-buttons">
        <button class="btn-correct" data-player-index="${playerIndex}">Correct</button>
        <button class="btn-wrong" data-player-index="${playerIndex}">Wrong</button>
      </span>
    `;
    overlayPlayersEl.appendChild(row);
  });
}

// ---- Clip playback ----

// A question's clip is either a local audio file or a segment of a YouTube
// video. Both are wrapped in the same small interface, so the overlay
// controls don't care which one is playing:
//   status()      "loading", "ready" (not started), "playing", "paused",
//                 "ended" or "error"
//   errorMessage  shown when status() is "error"
//   toggle()      play / pause / resume / play again
//   restart()     play from the clip's start
//   stop()        stop for good and release the player
let activeClip = null;

// Starts the question's clip as soon as the overlay opens. The cell click
// counts as a user gesture, so browsers allow the autoplay.
function renderQuestionContent(cell) {
  stopClip();
  // Ignore events from a clip that has since been stopped/replaced (or that
  // fire while it's still being created; it's rendered right after anyway).
  let clip = null;
  const onChange = () => {
    if (clip && clip === activeClip) updateClipControls();
  };
  clip = cell.youtube
    ? createYouTubeClip(cell.youtube, onChange)
    : createAudioClip(cell.audio, onChange);
  activeClip = clip;
  updateClipControls();
}

const CLIP_STATUS_VIEW = {
  // status: [status text, toggle button label (null = no controls), show Replay]
  loading: ["Loading…", null, false],
  ready: ["Ready", "Play", false],
  playing: ["Playing…", "Pause", false],
  paused: ["Paused", "Resume", true],
  ended: ["Finished", "Play again", false],
};

function updateClipControls() {
  const status = activeClip.status();
  const [text, toggleLabel, showReplay] =
    status === "error" ? [activeClip.errorMessage, null, false] : CLIP_STATUS_VIEW[status];

  // For YouTube clips the cover over the video shows the status instead.
  audioStatusEl.classList.toggle("hidden", !videoBoxEl.classList.contains("hidden"));
  audioStatusEl.textContent = text;
  videoCoverEl.textContent = text;

  audioControlsEl.classList.toggle("hidden", !toggleLabel);
  audioToggleBtn.textContent = toggleLabel || "";
  audioReplayBtn.classList.toggle("hidden", !showReplay);
}

function stopClip() {
  if (!activeClip) return;
  const clip = activeClip;
  activeClip = null;
  clip.stop();
}

audioToggleBtn.addEventListener("click", () => activeClip && activeClip.toggle());
audioReplayBtn.addEventListener("click", () => activeClip && activeClip.restart());

// Revealing the answer also uncovers the video, if there is one.
revealAnswerBtn.addEventListener("click", () => {
  const hidden = overlayAnswerEl.classList.toggle("hidden");
  videoCoverEl.classList.toggle("hidden", !hidden);
});

// -- Local audio file --

function createAudioClip(src, onChange) {
  const audio = new Audio(src);
  ["play", "pause", "ended", "error"].forEach((ev) => audio.addEventListener(ev, onChange));
  audio.play().catch(onChange);

  return {
    errorMessage: `Audio failed to load: ${src}`,
    status() {
      if (audio.error) return "error";
      if (audio.ended) return "ended";
      if (!audio.paused) return "playing";
      // Not started yet (still loading, or autoplay was blocked).
      return audio.currentTime === 0 ? "ready" : "paused";
    },
    toggle() {
      if (audio.ended) audio.currentTime = 0;
      if (audio.paused) audio.play();
      else audio.pause();
    },
    restart() {
      audio.currentTime = 0;
      audio.play();
    },
    stop() {
      audio.pause();
      audio.removeAttribute("src");
      audio.load(); // abort any in-flight loading
    },
  };
}

// -- YouTube video segment --

const YOUTUBE_ERRORS = {
  2: "Invalid YouTube video ID.",
  5: "The YouTube player failed to play this video.",
  100: "This YouTube video was not found or is private.",
  101: "The video's owner doesn't allow it to be played outside YouTube.",
  150: "The video's owner doesn't allow it to be played outside YouTube.",
  153: "YouTube refused to play the video. Open the game through the local server (see README).",
};

let youTubeApi = null; // Promise of the YT global, loaded on first use

function loadYouTubeApi() {
  if (!youTubeApi) {
    youTubeApi = new Promise((resolve, reject) => {
      window.onYouTubeIframeAPIReady = () => resolve(window.YT);
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.onerror = () => {
        youTubeApi = null; // allow a retry on the next question
        script.remove();
        reject(new Error("Couldn't load the YouTube player. Check the internet connection."));
      };
      document.head.appendChild(script);
    });
  }
  return youTubeApi;
}

// Accepts seconds (83.5) or "m:ss" ("1:23.5"), like clips.txt.
function parseClipTime(value) {
  if (typeof value === "number") return value;
  return String(value)
    .split(":")
    .reduce((total, part) => total * 60 + Number(part), 0);
}

function createYouTubeClip({ id, start = 0, end }, onChange) {
  const startSec = parseClipTime(start);
  const endSec = end === undefined ? null : parseClipTime(end);

  let status = "loading";
  let player = null;
  let endTimer = null;
  let startTimer = null;
  let stopped = false;

  const clip = {
    errorMessage: "",
    status: () => status,
    toggle() {
      if (!player) return;
      if (status === "playing") {
        player.pauseVideo();
        return;
      }
      if (status === "ended") player.seekTo(startSec, true);
      player.playVideo();
    },
    restart() {
      if (!player) return;
      player.seekTo(startSec, true);
      player.playVideo();
    },
    stop() {
      stopped = true;
      clearInterval(endTimer);
      clearTimeout(startTimer);
      if (player) player.destroy();
      videoHostEl.replaceChildren();
      videoBoxEl.classList.add("hidden");
    },
  };

  function setStatus(next) {
    status = next;
    onChange();
  }

  function fail(message) {
    clearInterval(endTimer);
    clip.errorMessage = message;
    setStatus("error");
  }

  // The player API replaces this element with its iframe.
  const target = document.createElement("div");
  videoHostEl.replaceChildren(target);
  videoBoxEl.classList.remove("hidden");

  if (location.protocol === "file:") {
    fail("YouTube clips only play when the game is opened through the local server (see README).");
    return clip;
  }
  if (!id || isNaN(startSec) || (endSec !== null && isNaN(endSec))) {
    fail(`Invalid YouTube clip in questions.js: ${JSON.stringify({ id, start, end })}`);
    return clip;
  }

  loadYouTubeApi().then(
    (YT) => {
      if (stopped) return;
      player = new YT.Player(target, {
        videoId: id,
        width: "100%",
        height: "100%",
        playerVars: {
          controls: 0,
          disablekb: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
          origin: location.origin,
        },
        events: {
          onReady: () => {
            if (stopped) return;
            player.seekTo(startSec, true);
            player.playVideo();
            // Buffering can take a few seconds, so the status stays "loading"
            // until playback starts. If it never does (e.g. the browser blocked
            // autoplay), offer the Play button instead.
            startTimer = setTimeout(() => {
              if (status === "loading") setStatus("ready");
            }, 5000);
          },
          onStateChange: (e) => {
            if (stopped) return;
            if (e.data === YT.PlayerState.PLAYING) setStatus("playing");
            else if (e.data === YT.PlayerState.ENDED) setStatus("ended");
            // A pause we triggered at the clip's end time keeps "ended".
            else if (e.data === YT.PlayerState.PAUSED && status !== "ended") setStatus("paused");
          },
          onError: (e) => {
            if (!stopped) fail(YOUTUBE_ERRORS[e.data] || `YouTube player error ${e.data}.`);
          },
        },
      });

      // The player's own "end" option is unreliable after seeking, so the
      // clip's end time is enforced here instead.
      if (endSec !== null) {
        endTimer = setInterval(() => {
          if (status === "playing" && player.getCurrentTime() >= endSec) {
            setStatus("ended");
            player.pauseVideo();
          }
        }, 200);
      }
    },
    (err) => {
      if (!stopped) fail(err.message);
    }
  );

  return clip;
}

// Start fetching the player script early if any question needs it.
if (location.protocol !== "file:" && CATEGORIES.some((c) => c.questions.some((q) => q.youtube))) {
  loadYouTubeApi().catch(() => {}); // the error is shown when a YouTube question opens
}

overlayPlayersEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const playerIndex = Number(btn.dataset.playerIndex);

  if (btn.classList.contains("btn-correct")) {
    markCorrect(playerIndex);
  } else if (btn.classList.contains("btn-wrong")) {
    markWrong(playerIndex);
  }
});

cancelQuestionBtn.addEventListener("click", closeQuestion);

function markCorrect(playerIndex) {
  const { catIndex, valIndex } = state.activeCell;
  const cell = state.board[catIndex].cells[valIndex];

  state.players[playerIndex].score += cell.value;
  cell.used = true;

  closeQuestion();
  renderScoreboard();
  renderBoard();
  checkGameOver();
}

function markWrong(playerIndex) {
  const activeCell = state.activeCell;
  activeCell.remainingPlayerIndexes = activeCell.remainingPlayerIndexes.filter((i) => i !== playerIndex);

  if (activeCell.remainingPlayerIndexes.length === 0) {
    const cell = state.board[activeCell.catIndex].cells[activeCell.valIndex];
    cell.used = true;
    closeQuestion();
    renderBoard();
    checkGameOver();
  } else {
    renderOverlayPlayers();
  }
}

// ---- End game (seam: swap this check for a different end condition later) ----

function isGameOver() {
  return state.board.every((category) => category.cells.every((cell) => cell.used));
}

function checkGameOver() {
  if (isGameOver()) {
    renderGameOver();
    showScreen("screen-gameover");
  }
}

// ---- Game over screen ----

const finalScoresEl = document.getElementById("final-scores");
const newGameBtn = document.getElementById("new-game-btn");

function renderGameOver() {
  const ranked = [...state.players].sort((a, b) => b.score - a.score);
  finalScoresEl.innerHTML = ranked
    .map((p) => `<li>${escapeHtml(p.name)} &mdash; ${p.score}</li>`)
    .join("");
}

newGameBtn.addEventListener("click", () => {
  state.players = [];
  state.board = null;
  state.activeCell = null;
  selectedPlayerCount = null;

  countButtonsEl.querySelectorAll(".count-btn").forEach((b) => b.classList.remove("selected"));
  playerNameInputsEl.innerHTML = "";
  startGameBtn.disabled = true;

  showScreen("screen-start");
});

// ---- Utility ----

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
