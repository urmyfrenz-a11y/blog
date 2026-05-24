const journalKey = "daily-journal-v2";
const form = document.querySelector("[data-journal-form]");
const entriesRoot = document.querySelector("[data-entries]");
const countRoot = document.querySelector("[data-entry-count]");

function readEntries() {
  const fallback = [
    {
      id: "sample",
      title: "첫 기록",
      body: "나의 관심사, 분석 노트, 여행과 책 이야기를 한 곳에서 관리하기 시작했다.",
      date: new Date().toISOString()
    }
  ];

  try {
    const saved = JSON.parse(localStorage.getItem(journalKey) || "null");
    return Array.isArray(saved) ? saved : fallback;
  } catch {
    return fallback;
  }
}

function saveEntries(entries) {
  localStorage.setItem(journalKey, JSON.stringify(entries));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[char]));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(new Date(value));
}

function renderEntries() {
  if (!entriesRoot) return;
  const entries = readEntries();

  if (countRoot) {
    countRoot.textContent = String(entries.length);
  }

  entriesRoot.innerHTML = entries.map((entry) => `
    <article class="panel entry">
      <time>${formatDate(entry.date)}</time>
      <h3>${escapeHtml(entry.title)}</h3>
      <p>${escapeHtml(entry.body)}</p>
      <button class="delete-entry" type="button" data-delete-entry="${entry.id}">삭제</button>
    </article>
  `).join("");
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    const body = String(data.get("body") || "").trim();
    if (!title || !body) return;

    const entry = {
      id: crypto.randomUUID(),
      title,
      body,
      date: new Date().toISOString()
    };

    saveEntries([entry, ...readEntries()]);
    form.reset();
    renderEntries();
  });
}

if (entriesRoot) {
  entriesRoot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-entry]");
    if (!button) return;
    saveEntries(readEntries().filter((entry) => entry.id !== button.dataset.deleteEntry));
    renderEntries();
  });
}

renderEntries();
