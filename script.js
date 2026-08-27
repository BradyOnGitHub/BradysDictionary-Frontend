let questions = [];
let currentIndex = 0;
let score = 0;
let answerLog = [];
let currentLanguage = localStorage.getItem("quizLanguage");

// ---------- Element references ----------
const languageScreenEl = document.getElementById("languageScreen");
const appEl = document.getElementById("app");
const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const resultEl = document.getElementById("result");
const progressEl = document.getElementById("progress");
const nextBtn = document.getElementById("nextBtn");
const quizEl = document.getElementById("quiz");
const endScreenEl = document.getElementById("endScreen");
const scoreEl = document.getElementById("score");
const shareCardEl = document.getElementById("shareCard");
const copyShareBtn = document.getElementById("copyShareBtn");
const restartBtn = document.getElementById("restartBtn");

const settingsBtn = document.getElementById("settingsBtn");
const aboutBtn = document.getElementById("aboutBtn");
const settingsModal = document.getElementById("settingsModal");
const aboutModal = document.getElementById("aboutModal");
const closeSettingsBtn = document.getElementById("closeSettings");
const closeAboutBtn = document.getElementById("closeAbout");
const darkModeToggle = document.getElementById("darkModeToggle");
const languageSelect = document.getElementById("languageSelect");
const langButtons = document.querySelectorAll(".lang-btn");

// ---------- Dark mode ----------
function applyDarkMode(enabled) {
  document.body.classList.toggle("dark-mode", enabled);
  localStorage.setItem("darkMode", enabled ? "true" : "false");
  darkModeToggle.checked = enabled;
}

applyDarkMode(localStorage.getItem("darkMode") === "true");

darkModeToggle.addEventListener("change", () => {
  applyDarkMode(darkModeToggle.checked);
});

// ---------- Header icons / modals ----------
settingsBtn.addEventListener("click", () => {
  languageSelect.value = currentLanguage || "english";
  settingsModal.classList.remove("hidden");
});

closeSettingsBtn.addEventListener("click", () => {
  settingsModal.classList.add("hidden");
});

aboutBtn.addEventListener("click", () => {
  aboutModal.classList.remove("hidden");
});

closeAboutBtn.addEventListener("click", () => {
  aboutModal.classList.add("hidden");
});

[settingsModal, aboutModal].forEach(modal => {
  modal.addEventListener("click", event => {
    if (event.target === modal) modal.classList.add("hidden");
  });
});

// Changing the language from within Settings restarts the quiz in that language
languageSelect.addEventListener("change", () => {
  settingsModal.classList.add("hidden");
  startQuizWithLanguage(languageSelect.value);
});

// ---------- Language selection screen ----------
langButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    startQuizWithLanguage(btn.dataset.lang);
  });
});

function startQuizWithLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem("quizLanguage", lang);
  languageScreenEl.classList.add("hidden");
  appEl.classList.remove("hidden");
  loadQuestions(lang);
}

function loadQuestions(lang) {
  currentIndex = 0;
  score = 0;
  answerLog = [];
  quizEl.classList.remove("hidden");
  progressEl.classList.remove("hidden");
  endScreenEl.classList.add("hidden");
  questionEl.textContent = "Loading...";
  choicesEl.innerHTML = "";
  resultEl.textContent = "";
  nextBtn.classList.add("hidden");

  fetch(`${lang}.json`)
    .then(response => response.json())
    .then(data => {
      questions = data;
      loadQuestion();
    })
    .catch(error => {
      console.error("Error loading questions:", error);
      questionEl.textContent = "Could not load questions for this language.";
    });
}

// ---------- Quiz logic ----------
function loadQuestion() {
  const q = questions[currentIndex];
  questionEl.textContent = q.question;
  progressEl.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
  resultEl.textContent = "";
  nextBtn.classList.add("hidden");

  choicesEl.innerHTML = "";
  q.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.textContent = choice;
    btn.addEventListener("click", () => selectAnswer(btn, q.answer));
    choicesEl.appendChild(btn);
  });
}

function selectAnswer(selectedBtn, correctAnswer) {
  const buttons = document.querySelectorAll(".choice");
  buttons.forEach(b => b.disabled = true);

  const isCorrect = selectedBtn.textContent === correctAnswer;
  answerLog.push(isCorrect);

  if (isCorrect) {
    selectedBtn.classList.add("correct");
    resultEl.textContent = "Correct!";
    score++;
  } else {
    selectedBtn.classList.add("wrong");
    resultEl.textContent = "Wrong!";
    buttons.forEach(b => {
      if (b.textContent === correctAnswer) b.classList.add("correct");
    });
  }

  nextBtn.classList.remove("hidden");
}

nextBtn.addEventListener("click", () => {
  currentIndex++;
  if (currentIndex < questions.length) {
    loadQuestion();
  } else {
    showEndScreen();
  }
});

// ---------- Share card ----------
const LANGUAGE_LABELS = {
  english: "English",
  french: "French",
  spanish: "Spanish"
};

function buildShareText() {
  const langLabel = LANGUAGE_LABELS[currentLanguage] || currentLanguage;

  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const yyyy = today.getFullYear();
  const dateStr = `${mm}/${dd}/${yyyy}`;

  const squares = answerLog.map(correct => (correct ? "🟩" : "🟥"));
  const rows = [];
  for (let i = 0; i < squares.length; i += 5) {
    rows.push(squares.slice(i, i + 5).join(""));
  }

  return [`Brady's Dictionary`, `${langLabel} ${dateStr}`, ...rows].join("\n");
}

function showEndScreen() {
  quizEl.classList.add("hidden");
  progressEl.classList.add("hidden");
  endScreenEl.classList.remove("hidden");
  scoreEl.textContent = `You scored ${score} out of ${questions.length}`;
  shareCardEl.textContent = buildShareText();
}

copyShareBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(shareCardEl.textContent).then(() => {
    const original = copyShareBtn.textContent;
    copyShareBtn.textContent = "Copied!";
    setTimeout(() => {
      copyShareBtn.textContent = original;
    }, 1500);
  }).catch(() => {
    copyShareBtn.textContent = "Couldn't copy";
  });
});

restartBtn.addEventListener("click", () => {
  currentIndex = 0;
  score = 0;
  answerLog = [];
  quizEl.classList.remove("hidden");
  progressEl.classList.remove("hidden");
  endScreenEl.classList.add("hidden");
  loadQuestion();
});

// ---------- Init ----------
// If a language was already chosen on a previous visit, skip straight to the quiz.
if (currentLanguage) {
  languageScreenEl.classList.add("hidden");
  appEl.classList.remove("hidden");
  loadQuestions(currentLanguage);
} else {
  languageScreenEl.classList.remove("hidden");
  appEl.classList.add("hidden");
}