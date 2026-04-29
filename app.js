const STORAGE_KEY = "quotes_user_v1";
const THEME_KEY = "quote_theme_v1";

const defaultQuotes = [
  { id: "d1", text: "시작이 반이다.", author: "아리스토텔레스", source: "default" },
  { id: "d2", text: "넘어지는 건 실패가 아니라 멈추는 게 실패다.", author: "중국 속담", source: "default" },
  { id: "d3", text: "완벽보다 완성이 중요하다.", author: "셰릴 샌드버그", source: "default" },
  { id: "d4", text: "오늘 걷지 않으면 내일은 뛰어야 한다.", author: "카를로스 푸엔테스", source: "default" },
  { id: "d5", text: "기회는 준비된 사람의 몫이다.", author: "루이 파스퇴르", source: "default" },
  { id: "d6", text: "작은 습관이 큰 변화를 만든다.", author: "제임스 클리어", source: "default" },
  { id: "d7", text: "포기하지 않으면 결국 된다.", author: "윈스턴 처칠", source: "default" },
  { id: "d8", text: "배움에는 끝이 없다.", author: "레오나르도 다 빈치", source: "default" },
  { id: "d9", text: "행동은 두려움을 이긴다.", author: "데일 카네기", source: "default" },
  { id: "d10", text: "문제는 도전할 때 비로소 작아진다.", author: "알베르트 아인슈타인", source: "default" },
  { id: "d11", text: "꿈을 꾸는 자만이 길을 찾는다.", author: "오프라 윈프리", source: "default" },
  { id: "d12", text: "천천히 가도 멈추지만 않으면 된다.", author: "공자", source: "default" },
  { id: "d13", text: "좋은 코드는 읽기 쉽다.", author: "로버트 C. 마틴", source: "default" },
  { id: "d14", text: "실수는 성장의 재료다.", author: "존 듀이", source: "default" },
  { id: "d15", text: "노력은 배신하지 않는다.", author: "일본 속담", source: "default" },
  { id: "d16", text: "자신을 믿는 순간 절반은 이룬 것이다.", author: "시어도어 루스벨트", source: "default" },
  { id: "d17", text: "어제의 나와 경쟁하라.", author: "익명", source: "default" },
  { id: "d18", text: "작게 시작해도 크게 자랄 수 있다.", author: "사이먼 시넥", source: "default" },
  { id: "d19", text: "꾸준함은 재능을 이긴다.", author: "안젤라 더크워스", source: "default" },
  { id: "d20", text: "행복은 지금 이 순간의 선택이다.", author: "톨스토이", source: "default" }
];

const quoteText = document.getElementById("quote-text");
const quoteAuthor = document.getElementById("quote-author");
const quoteSource = document.getElementById("quote-source");
const statusMessage = document.getElementById("status-message");
const nextBtn = document.getElementById("next-btn");
const copyBtn = document.getElementById("copy-btn");
const shareBtn = document.getElementById("share-btn");
const themeBtn = document.getElementById("theme-btn");
const quoteForm = document.getElementById("quote-form");
const inputText = document.getElementById("input-text");
const inputAuthor = document.getElementById("input-author");
const quoteDisplay = document.querySelector(".quote-display");
const myQuotesList = document.getElementById("my-quotes-list");

let userQuotes = loadUserQuotes();
let currentQuote = null;
let currentTheme = "light";

function getAllQuotes() {
  return [...defaultQuotes, ...userQuotes];
}

function loadUserQuotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((q) => q && typeof q.text === "string" && typeof q.author === "string");
  } catch {
    return [];
  }
}

function saveUserQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userQuotes));
}

function detectInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  const isDark = theme === "dark";
  themeBtn.textContent = isDark ? "☀️" : "🌙";
  themeBtn.setAttribute("aria-label", isDark ? "라이트 테마로 전환" : "다크 테마로 전환");
  themeBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
}

function toggleTheme() {
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem(THEME_KEY, nextTheme);
  announce(`${nextTheme === "dark" ? "다크" : "라이트"} 테마로 변경했어요.`);
}

function pickRandomQuote() {
  const allQuotes = getAllQuotes();
  if (allQuotes.length === 0) return null;

  const firstPick = allQuotes[Math.floor(Math.random() * allQuotes.length)];
  if (!currentQuote || allQuotes.length < 2 || firstPick.id !== currentQuote.id) {
    return firstPick;
  }

  return allQuotes[Math.floor(Math.random() * allQuotes.length)];
}

function showQuote(quote) {
  if (!quote) return;
  currentQuote = quote;

  quoteDisplay.classList.remove("quote-fade");
  void quoteDisplay.offsetWidth;
  quoteDisplay.classList.add("quote-fade");

  quoteText.textContent = `“${quote.text}”`;
  quoteAuthor.textContent = `- ${quote.author}`;

  if (quote.source === "user") {
    quoteSource.hidden = false;
    quoteSource.textContent = "내가 추가한 명언";
  } else {
    quoteSource.hidden = true;
    quoteSource.textContent = "";
  }
}

function renderUserQuotesList() {
  if (!myQuotesList) return;

  if (userQuotes.length === 0) {
    myQuotesList.innerHTML = '<li class="empty-list">아직 추가한 명언이 없어요.</li>';
    return;
  }

  myQuotesList.innerHTML = userQuotes
    .map(
      (quote) => `
        <li class="my-quote-item">
          <div>
            <p class="my-quote-text">"${quote.text}"</p>
            <p class="my-quote-author">- ${quote.author}</p>
          </div>
          <button
            type="button"
            class="delete-quote-btn"
            data-delete-id="${quote.id}"
            aria-label="${quote.author} 명언 삭제"
          >
            ❌
          </button>
        </li>
      `
    )
    .join("");
}

function announce(message) {
  statusMessage.textContent = message;
}

function normalize(text) {
  return text.trim().replace(/\s+/g, " ");
}

function validateQuoteInput(text, author) {
  const cleanText = normalize(text);
  const cleanAuthor = normalize(author);

  if (!cleanText || !cleanAuthor) {
    return { ok: false, message: "문구와 저자를 모두 입력해 주세요." };
  }
  if (cleanText.length > 180 || cleanAuthor.length > 40) {
    return { ok: false, message: "입력 길이를 확인해 주세요." };
  }
  const duplicate = getAllQuotes().some((q) => normalize(q.text) === cleanText && normalize(q.author) === cleanAuthor);
  if (duplicate) {
    return { ok: false, message: "이미 같은 명언이 등록되어 있어요." };
  }
  return { ok: true, cleanText, cleanAuthor };
}

function addKeyboardActivation(button) {
  button.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      button.click();
    }
    if (event.key === "Enter") {
      event.preventDefault();
      button.click();
    }
  });
}

nextBtn.addEventListener("click", () => {
  showQuote(pickRandomQuote());
  announce("새 명언을 불러왔어요.");
});

copyBtn.addEventListener("click", async () => {
  if (!currentQuote) return;
  const textToCopy = `"${currentQuote.text}" — ${currentQuote.author}`;

  try {
    await navigator.clipboard.writeText(textToCopy);
    announce("명언을 클립보드에 복사했어요.");
  } catch {
    announce("복사에 실패했어요. 브라우저 권한을 확인해 주세요.");
  }
});

shareBtn.addEventListener("click", async () => {
  if (!currentQuote) return;

  const shareText = `"${currentQuote.text}" — ${currentQuote.author}`;
  const shareData = { title: "오늘의 명언", text: shareText };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      announce("명언을 공유했어요.");
      return;
    }
  } catch {
    announce("공유가 취소되었거나 실패했어요.");
    return;
  }

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  window.open(tweetUrl, "_blank", "noopener,noreferrer");
  announce("트위터 공유 링크를 열었어요.");
});

themeBtn.addEventListener("click", toggleTheme);

quoteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const validation = validateQuoteInput(inputText.value, inputAuthor.value);
  if (!validation.ok) {
    announce(validation.message);
    return;
  }

  const newQuote = {
    id: `u_${Date.now()}`,
    text: validation.cleanText,
    author: validation.cleanAuthor,
    source: "user"
  };

  userQuotes.unshift(newQuote);
  saveUserQuotes();
  renderUserQuotesList();
  showQuote(newQuote);
  quoteForm.reset();
  announce("내 명언을 저장했어요.");
});

myQuotesList.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const button = target.closest(".delete-quote-btn");
  if (!button) return;

  const quoteId = button.dataset.deleteId;
  if (!quoteId) return;

  userQuotes = userQuotes.filter((q) => q.id !== quoteId);
  saveUserQuotes();
  renderUserQuotesList();

  if (currentQuote && currentQuote.id === quoteId) {
    showQuote(pickRandomQuote());
  }

  announce("목록에서 명언을 삭제했어요.");
});

[nextBtn, copyBtn, shareBtn, themeBtn].forEach(addKeyboardActivation);

applyTheme(detectInitialTheme());
renderUserQuotesList();
showQuote(pickRandomQuote());
announce("명언 생성기가 준비되었어요.");
