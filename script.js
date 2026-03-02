// ---------- TAB SYSTEM ----------

function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
}
showTab("pomodoro");


// FLOATING PARTICLES

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

for (let i = 0; i < 120; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2,
    speed: Math.random() * 0.6 + 0.2
  });
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fill();

    p.y -= p.speed;
    if (p.y < 0) p.y = canvas.height;
  });

  requestAnimationFrame(drawParticles);
}

drawParticles();

// ---------- POMODORO ----------

let time = 25 * 60;
let interval = null;
let sessions = 0;
let streak = 0;
const total = 25 * 60;

const ring = document.getElementById("progressRing");
const alarm = document.getElementById("alarmSound");

function updateDisplay() {
  const m = Math.floor(time / 60).toString().padStart(2, "0");
  const s = (time % 60).toString().padStart(2, "0");
  document.getElementById("timer").textContent = `${m}:${s}`;

  const percent = time / total;
  ring.style.strokeDashoffset = 817 * (1 - percent);
}

function startTimer() {
  if (interval) return;

  interval = setInterval(() => {
    time--;
    updateDisplay();

    if (time <= 0) {
      clearInterval(interval);
      interval = null;

      sessions++;
      streak++;

      document.getElementById("sessions").textContent = sessions;
      document.getElementById("streak").textContent = streak;

      alarm.play();

      time = total;
      updateDisplay();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(interval);
  interval = null;
}

function resetTimer() {
  pauseTimer();
  time = total;
  updateDisplay();
}

updateDisplay();

// ===== REAL CALENDAR SYSTEM =====

let currentDate = new Date();
let selectedDay = null;

const grid = document.getElementById("calendarGrid");
const monthTitle = document.getElementById("monthTitle");
const modal = document.getElementById("dayModal");
const modalDate = document.getElementById("modalDate");
const textarea = document.querySelector(".modalCard textarea");

// ---- RENDER MONTH ----

function renderCalendar() {
  grid.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  monthTitle.textContent = `${monthNames[month]} ${year}`;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement("div");
    day.className = "day";
    day.textContent = i;

    day.onclick = () => openModal(i);

    grid.appendChild(day);
  }
}

// ---- CHANGE MONTH ----

function changeMonth(offset) {
  currentDate.setMonth(currentDate.getMonth() + offset);
  renderCalendar();
}

// ---- OPEN MODAL ----

function openModal(day) {
  selectedDay = day;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const key = `${year}-${month}-${day}`;

  modalDate.textContent =
    `${monthTitle.textContent} ${day}`;

  textarea.value = localStorage.getItem(key) || "";

  modal.classList.add("show");
}

// ---- SAVE NOTE ----

textarea.addEventListener("input", () => {
  if (selectedDay === null) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const key = `${year}-${month}-${selectedDay}`;

  localStorage.setItem(key, textarea.value);
});

// ---- CLOSE MODAL ----

function closeModal() {
  modal.classList.remove("show");
}

// ESC key support

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

// INITIAL RENDER
renderCalendar();

// ===== FINAL VAULT =====

const vaultGrid = document.getElementById("vaultGrid");
const viewer = document.getElementById("viewer");
const viewerImg = document.getElementById("viewerImg");

let vaultData = [];
let currentIndex = 0;

// LOAD VAULT
function loadVault() {
  vaultData = JSON.parse(localStorage.getItem("vault") || "[]");
  vaultGrid.innerHTML = "";

  vaultData.forEach((item, index) => {

    const div = document.createElement("div");
    div.className = "vaultItem";

    div.innerHTML = `
      <button class="deleteBtn">✕</button>
      <img src="${item.src}">
      <div class="fileName">${item.name}</div>
    `;

    // OPEN VIEWER
    div.querySelector("img").onclick = () => openViewer(index);

    // DELETE
    div.querySelector(".deleteBtn").onclick = (e) => {
      e.stopPropagation();
      vaultData.splice(index, 1);
      localStorage.setItem("vault", JSON.stringify(vaultData));
      loadVault();
    };

    vaultGrid.appendChild(div);
  });
}

// SAVE IMAGE
function saveImage(base64, name = "Image") {
  vaultData.push({ src: base64, name });
  localStorage.setItem("vault", JSON.stringify(vaultData));
  loadVault();
}

// PASTE SUPPORT
document.addEventListener("paste", e => {
  for (const item of e.clipboardData.items) {
    if (item.type.startsWith("image")) {
      const file = item.getAsFile();
      const reader = new FileReader();

      reader.onload = () =>
        saveImage(reader.result, file.name || "Pasted Image");

      reader.readAsDataURL(file);
    }
  }
});

// DRAG & DROP
vaultGrid.addEventListener("dragover", e => e.preventDefault());

vaultGrid.addEventListener("drop", e => {
  e.preventDefault();

  for (const file of e.dataTransfer.files) {
    if (file.type.startsWith("image")) {
      const reader = new FileReader();
      reader.onload = () => saveImage(reader.result, file.name);
      reader.readAsDataURL(file);
    }
  }
});

// ===== VIEWER =====

function openViewer(index) {
  currentIndex = index;
  viewerImg.src = vaultData[index].src;
  viewer.classList.add("show");
}

function closeViewer() {
  viewer.classList.remove("show");
}

function nextImage() {
  currentIndex = (currentIndex + 1) % vaultData.length;
  viewerImg.src = vaultData[currentIndex].src;
}

function prevImage() {
  currentIndex =
    (currentIndex - 1 + vaultData.length) % vaultData.length;
  viewerImg.src = vaultData[currentIndex].src;
}

// KEYBOARD SUPPORT
document.addEventListener("keydown", e => {
  if (!viewer.classList.contains("show")) return;

  if (e.key === "Escape") closeViewer();
  if (e.key === "ArrowRight") nextImage();
  if (e.key === "ArrowLeft") prevImage();
});

// INITIAL LOAD
loadVault();

// ===== AUTO IMPORT GOALS FROM CALENDAR =====

function loadTodayGoals() {

  const today = new Date();

  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  const key = `${year}-${month}-${day}`;

  const saved = localStorage.getItem(key);

  if (saved) {
    document.getElementById("dailyGoals").value = saved;
  }
}

// Run when page loads
loadTodayGoals();