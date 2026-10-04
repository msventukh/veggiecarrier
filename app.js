// In-memory game state. Nothing here is persisted — a reload starts fresh.
const state = {
  players: [],   // { name, score }
  board: null,   // [{ name, cells: [{ value, question, answer, used }] }]
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
      question: q.question,
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
const overlayContentEl = document.getElementById("overlay-content");
const overlayAnswerEl = document.getElementById("overlay-answer");
const overlayPlayersEl = document.getElementById("overlay-players");
const revealAnswerBtn = document.getElementById("reveal-answer-btn");
const cancelQuestionBtn = document.getElementById("cancel-question-btn");

function openQuestion(catIndex, valIndex) {
  state.activeCell = {
    catIndex,
    valIndex,
    remainingPlayerIndexes: state.players.map((_, i) => i),
  };
  overlayAnswerEl.classList.add("hidden");
  renderQuestionOverlay();
  overlayEl.classList.remove("hidden");
}

function closeQuestion() {
  state.activeCell = null;
  overlayEl.classList.add("hidden");
}

function renderQuestionOverlay() {
  const { catIndex, valIndex, remainingPlayerIndexes } = state.activeCell;
  const category = state.board[catIndex];
  const cell = category.cells[valIndex];

  overlayCategoryEl.textContent = category.name;
  overlayValueEl.textContent = cell.value;
  overlayContentEl.innerHTML = renderQuestionContent(cell);
  overlayAnswerEl.textContent = cell.answer;

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

// seam: text today, could render an <audio> player instead in a later version
function renderQuestionContent(cell) {
  return escapeHtml(cell.question);
}

revealAnswerBtn.addEventListener("click", () => {
  overlayAnswerEl.classList.toggle("hidden");
});

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
    renderQuestionOverlay();
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
