const modes = [
  ["💬", "Assistant", "Normal AI conversation and questions."],
  ["📚", "Study", "Lessons, quizzes, flashcards and homework."],
  ["🎯", "Focus", "Timers, tasks and distraction-free focus."],
  ["💻", "Coding", "Write, explain, debug and organize code."],
  ["🔎", "Research", "Research topics and summarize information."],
  ["📝", "Writing", "Essays, notes, outlines and proofreading."],
  ["🧮", "Math", "Step-by-step math help."],
  ["🎙️", "Voice", "Hands-free voice conversation."],
  ["⚡", "Command", "Use commands instead of normal questions."],
  ["🛠️", "Developer", "Build, test and configure JARVIS."]
];

const modeBox = document.getElementById("modes");
const modeTitle = document.getElementById("modeTitle");
const modeDesc = document.getElementById("modeDesc");
const messages = document.getElementById("messages");
const input = document.getElementById("input");
const state = document.getElementById("state");
const core = document.getElementById("core");

let currentMode = "Assistant";
let lastResponse = "";

modes.forEach((mode, index) => {
  const button = document.createElement("button");

  button.className = "mode" + (index === 0 ? " active" : "");
  button.innerHTML = `${mode[0]} ${mode[1]} Mode`;

  button.onclick = () => {
    document.querySelectorAll(".mode").forEach(b => b.classList.remove("active"));
    button.classList.add("active");

    currentMode = mode[1];
    modeTitle.textContent = `${mode[1]} Mode`;
    modeDesc.textContent = mode[2];

    speak(`Switched to ${mode[1]} Mode.`);
  };

  modeBox.appendChild(button);
});

function addMessage(who, text) {
  const div = document.createElement("div");

  div.className = "message " + (who === "YOU" ? "user" : "jarvis");

  div.innerHTML = `
    <b>${who}</b>
    <p>${escapeHTML(text)}</p>
  `;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function escapeHTML(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function getResponse(text) {
  const q = text.toLowerCase();

  if (q.includes("hello") || q.includes("hi")) {
    return "Hello. Systems are online. How can I help?";
  }

  if (q.includes("who are you")) {
    return "I am JARVIS, your personal AI assistant.";
  }

  if (q.includes("study")) {
    return "Study Mode is ready. I can explain a lesson, create practice questions, or quiz you.";
  }

  if (q.includes("math")) {
    return "Math Mode is ready. Give me a math problem and I can walk through the steps.";
  }

  if (q.includes("coding") || q.includes("code")) {
    return "Coding Mode is ready. I can help explain code, find bugs, and plan projects.";
  }

  if (q.includes("focus") || q.includes("timer")) {
    startTimer(25);
    return "Focus session started. You have 25 minutes.";
  }

  if (q.includes("research")) {
    return "Research Mode is ready. Tell me the topic you want to investigate.";
  }

  if (q.includes("write")) {
    return "Writing Mode is ready. I can help organize, improve, or draft your writing.";
  }

  return `I'm ready to help with that in ${currentMode} Mode. For the full AI brain, we'll connect a secure AI backend next.`;
}

document.getElementById("chatForm").addEventListener("submit", e => {
  e.preventDefault();

  const text = input.value.trim();

  if (!text) return;

  addMessage("YOU", text);
  input.value = "";

  state.textContent = "THINKING";
  core.style.animationDuration = ".5s";

  setTimeout(() => {
    const response = getResponse(text);

    lastResponse = response;

    addMessage("JARVIS", response);

    state.textContent = "SPEAKING";
    speak(response);

    setTimeout(() => {
      state.textContent = "STANDBY";
      core.style.animationDuration = "2s";
    }, 1800);
  }, 600);
});

document.querySelectorAll("[data-q]").forEach(button => {
  button.onclick = () => {
    input.value = button.dataset.q;
    document.getElementById("chatForm").requestSubmit();
  };
});

document.getElementById("clear").onclick = () => {
  messages.innerHTML = `
    <div class="message jarvis">
      <b>JARVIS</b>
      <p>Conversation cleared. Systems are ready.</p>
    </div>
  `;
};

function updateClock() {
  const now = new Date();

  document.getElementById("time").textContent =
    now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

  document.getElementById("date").textContent =
    now.toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric"
    });
}

setInterval(updateClock, 1000);
updateClock();

const taskInput = document.getElementById("taskInput");
const tasks = document.getElementById("tasks");

let taskList = JSON.parse(localStorage.getItem("jarvisTasks") || "[]");

function saveTasks() {
  localStorage.setItem("jarvisTasks", JSON.stringify(taskList));
}

function renderTasks() {
  tasks.innerHTML = "";

  taskList.forEach((task, index) => {
    const div = document.createElement("div");

    div.className = "task";

    div.innerHTML = `
      ${escapeHTML(task)}
      <button onclick="removeTask(${index})"
        style="float:right;background:none;border:0;color:#f66">
        ×
      </button>
    `;

    tasks.appendChild(div);
  });
}

window.removeTask = index => {
  taskList.splice(index, 1);
  saveTasks();
  renderTasks();
};

document.getElementById("addTask").onclick = () => {
  const task = taskInput.value.trim();

  if (!task) return;

  taskList.push(task);
  taskInput.value = "";

  saveTasks();
  renderTasks();
};

renderTasks();

let timerInterval;

function startTimer(minutes) {
  clearInterval(timerInterval);

  let seconds = minutes * 60;

  timerInterval = setInterval(() => {
    seconds--;

    if (seconds <= 0) {
      clearInterval(timerInterval);
      state.textContent = "STANDBY";
      speak("Focus session complete.");
    }
  }, 1000);
}

const settings = document.getElementById("settings");

document.getElementById("settingsBtn").onclick = () => {
  settings.classList.remove("hidden");
};

document.getElementById("closeSettings").onclick = () => {
  settings.classList.add("hidden");
};

document.getElementById("nameSetting").oninput = e => {
  document.querySelector(".brand strong").textContent =
    e.target.value || "JARVIS";
};

document.getElementById("speak").onclick = () => {
  if (lastResponse) speak(lastResponse);
};

let recognition;

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    state.textContent = "LISTENING";
    document.getElementById("voiceStatus").textContent = "LISTENING";
  };

  recognition.onresult = event => {
    const text = event.results[0][0].transcript;

    input.value = text;

    document.getElementById("chatForm").requestSubmit();
  };

  recognition.onend = () => {
    document.getElementById("voiceStatus").textContent = "READY";
  };

} else {
  document.getElementById("voiceStatus").textContent = "UNAVAILABLE";
}

document.getElementById("mic").onclick = () => {

  if (!recognition) {
    alert("Voice input isn't supported by this browser.");
    return;
  }

  recognition.start();
};

function speak(text) {

  const enabled =
    document.getElementById("voiceToggle").checked;

  if (!enabled || !("speechSynthesis" in window)) {
    state.textContent = "STANDBY";
    return;
  }

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.rate =
    Number(document.getElementById("rate").value);

  utterance.onstart = () => {
    state.textContent = "SPEAKING";
  };

  utterance.onend = () => {
    state.textContent = "STANDBY";
  };

  speechSynthesis.speak(utterance);
}
