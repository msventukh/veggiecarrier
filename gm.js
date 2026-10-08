// Game master's answer key: the same board as the players' screen, but
// clicking a cell only shows its answer. Meant for a screen the players can't
// see. Nothing here talks to the players' page; the GM still runs the game
// there.

const answerEl = document.getElementById("gm-answer");
const boardEl = document.getElementById("gm-board");

let selectedBtn = null;

loadQuestionFile().then(renderBoard, (err) => {
  answerEl.textContent = err.message;
});

// Loads whichever question file index.html loads, so switching games stays a
// one-line change in index.html.
async function loadQuestionFile() {
  let src;
  try {
    const res = await fetch("index.html");
    if (!res.ok) throw new Error(res.statusText);
    const doc = new DOMParser().parseFromString(await res.text(), "text/html");
    src = doc.querySelector('script[src^="questions/"]')?.getAttribute("src");
  } catch (e) {
    throw new Error("Couldn't read index.html. Open this page through the local server (make start).");
  }
  if (!src) throw new Error("index.html doesn't load a question file from the questions/ folder.");

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Couldn't load ${src}.`));
    document.head.appendChild(script);
  });
}

function renderBoard() {
  CATEGORIES.forEach((category) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.className = "category-cell";
    nameCell.textContent = category.name;
    row.appendChild(nameCell);

    category.questions.forEach((question, i) => {
      const td = document.createElement("td");
      td.className = "value-cell";
      const btn = document.createElement("button");
      btn.textContent = VALUES[i];
      btn.addEventListener("click", () => showAnswer(btn, category.name, VALUES[i], question.answer));
      td.appendChild(btn);
      row.appendChild(td);
    });

    boardEl.appendChild(row);
  });
}

function showAnswer(btn, categoryName, value, answer) {
  if (selectedBtn) selectedBtn.classList.remove("selected");
  selectedBtn = btn;
  btn.classList.add("selected");

  const meta = document.createElement("div");
  meta.className = "gm-meta";
  meta.textContent = `${categoryName} — ${value}`;
  const text = document.createElement("div");
  text.textContent = answer;
  answerEl.replaceChildren(meta, text);
}
