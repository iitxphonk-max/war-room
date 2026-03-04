// ---------- TAB SYSTEM (FIXED & STABLE) ----------

function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(t =>
    t.classList.remove("active")
  );

  document.querySelectorAll(".tabs button").forEach(b =>
    b.classList.remove("activeTab")
  );

  document.getElementById(tabId).classList.add("active");

  const buttonMap = {
    pomodoro: 0,
    calendar: 1,
    vault: 2
  };

  const buttons = document.querySelectorAll(".tabs button");
  if (buttonMap[tabId] !== undefined) {
    buttons[buttonMap[tabId]].classList.add("activeTab");
  }
}

showTab("pomodoro");


// ---------- PARTICLES ----------

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

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

let total = 25 * 60;
let time = total;
let interval = null;

let sessionFinished = false;

let sessions = Number(localStorage.getItem("sessions")) || 0;
let streak = Number(localStorage.getItem("streak")) || 0;
let xp = Number(localStorage.getItem("xp")) || 0;

// ---------- DAILY MISSION ----------
const missionTarget = 4;
let missionProgress = parseInt(localStorage.getItem("missionProgress")) || 0;

const today = new Date().toDateString();
const missionDate = localStorage.getItem("missionDate");

if(missionDate !== today){
  missionProgress = 0;
  localStorage.setItem("missionProgress",0);
  localStorage.setItem("missionDate",today);
}

document.getElementById("missionProgress").textContent =
  missionProgress + " / " + missionTarget;

//----------XP LEVELS NAMES------
const levels = [
  { level: 1, xp: 0, title: "Focus Cadet" },
  { level: 2, xp: 100, title: "Discipline Rookie" },
  { level: 3, xp: 250, title: "Time Soldier" },
  { level: 4, xp: 500, title: "Focus Warrior" },
  { level: 5, xp: 800, title: "War Strategist" },
  { level: 6, xp: 1200, title: "Elite Grinder" },
  { level: 7, xp: 1700, title: "Study Commander" },
  { level: 8, xp: 2300, title: "Productivity Beast" },
  { level: 9, xp: 3000, title: "Focus General" },
  { level: 10, xp: 4000, title: "WAR ROOM Legend" }
];

function updateRank() {
  let current = levels[0];

  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i].xp) {
      current = levels[i];
    }
  }

  document.getElementById("rankTitle").textContent =
    `Level ${current.level} – ${current.title}`;

  const nextLevel = levels.find(l => l.level === current.level + 1);

  if (nextLevel) {
    const progress =
      ((xp - current.xp) / (nextLevel.xp - current.xp)) * 100;

    document.getElementById("xpFill").style.width =
      Math.min(progress, 100) + "%";

    document.getElementById("xpText").textContent =
      `${xp} / ${nextLevel.xp} XP`;
  } else {
    document.getElementById("xpFill").style.width = "100%";
    document.getElementById("xpText").textContent =
      `${xp} XP (MAX LEVEL)`;
  }
}
updateRank();

const lastSavedDate = localStorage.getItem("lastDate");
if (lastSavedDate !== today) {
  streak = 0;
  localStorage.setItem("streak", streak);
  localStorage.setItem("lastDate", today);
}

document.getElementById("sessions").textContent = sessions;
document.getElementById("streak").textContent = streak;

const alarm = document.getElementById("alarmSound");

const todayKey = "lastFocusDate";
const todayDate = new Date().toDateString();
const lastFocus = localStorage.getItem(todayKey);

if(lastFocus === todayDate){
  document.getElementById("streakBanner").style.display = "none";
}

function updateDisplay() {
  const m = Math.floor(time / 60).toString().padStart(2, "0");
  const s = (time % 60).toString().padStart(2, "0");
  document.getElementById("timer").textContent = `${m}:${s}`;

  const percent = time / total;
const degrees = percent * 360;

document.querySelector(".ring").style.background =
  `conic-gradient(#60a5fa ${degrees}deg, rgba(255,255,255,0.1) ${degrees}deg)`;
}

let startTimestamp = null;

function startTimer() {
  if (interval || sessionFinished) return;

  document.querySelector(".ring").style.filter =
    "drop-shadow(0 0 25px #60a5fa)";

  startTimestamp = Date.now() - (total - time) * 1000;

  interval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
    time = total - elapsed;

    if (time <= 0) {
      time = 0;
      clearInterval(interval);
      interval = null;
      sessionFinished = true;

      sessions++;
      streak++;
      xp += 20;
      missionProgress++;
      localStorage.setItem("missionProgress", missionProgress);

      // HEATMAP SAVE
const todayKey = "focus-" + new Date().toDateString();
let todayCount = Number(localStorage.getItem(todayKey)) || 0;
todayCount++;

localStorage.setItem(todayKey, todayCount);

      document.getElementById("missionProgress").textContent =
      missionProgress + " / " + missionTarget;

      if(missionProgress === missionTarget){

        xp += 10;
        localStorage.setItem("xp", xp);

        document.getElementById("missionText").textContent =
        "🔥 Daily mission complete! Discipline +10 XP";

}
const today = new Date().toDateString();
const missionDate = localStorage.getItem("missionDate");


      localStorage.setItem("sessions", sessions);
      localStorage.setItem("streak", streak);
      localStorage.setItem("xp", xp);
      localStorage.setItem("lastFocusDate", new Date().toDateString());

      updateRank();

      document.getElementById("sessions").textContent = sessions;
      document.getElementById("streak").textContent = streak;

      alarm.play();
      const ring = document.querySelector(".ring");

ring.classList.add("sessionComplete");

setTimeout(()=>{
  ring.classList.remove("sessionComplete");
},900);

      document.querySelector(".ring").style.filter = "none";
    }

    function renderHeatmap(){

  const container = document.getElementById("heatmap");
  container.innerHTML = "";

  for(let i=27;i>=0;i--){

    const d = new Date();
    d.setDate(d.getDate()-i);

    const key = "focus-" + d.toDateString();
    const count = Number(localStorage.getItem(key)) || 0;

    const cell = document.createElement("div");
    cell.className = "heatCell";

    if(count >= 1) cell.classList.add("heat1");
    if(count >= 2) cell.classList.add("heat2");
    if(count >= 3) cell.classList.add("heat3");
    if(count >= 4) cell.classList.add("heat4");

    container.appendChild(cell);
  }
}
    renderHeatmap();
    updateDisplay();
  }, 1000);
}

function pauseTimer() {
  clearInterval(interval);
  interval = null;

  document.querySelector(".ring").style.filter = "none";
}

function resetTimer() {
  pauseTimer();
  time = total;
  sessionFinished = false;
  updateDisplay();
}

updateDisplay();
renderHeatmap();


// ---------- CALENDAR ----------

let currentDate = new Date();
let selectedDay = null;

const grid = document.getElementById("calendarGrid");
const monthTitle = document.getElementById("monthTitle");
const modal = document.getElementById("dayModal");
const modalDate = document.getElementById("modalDate");
const textarea = document.querySelector(".modalCard textarea");

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

function changeMonth(offset) {
  currentDate.setMonth(currentDate.getMonth() + offset);
  renderCalendar();
}

function openModal(day) {
  selectedDay = day;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const key = `${year}-${month}-${day}`;

  modalDate.textContent = `${monthTitle.textContent} ${day}`;
  textarea.value = localStorage.getItem(key) || "";

  modal.classList.add("show");
}

textarea.addEventListener("input", () => {
  if (selectedDay === null) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const key = `${year}-${month}-${selectedDay}`;

  localStorage.setItem(key, textarea.value);
});

function closeModal() {
  modal.classList.remove("show");
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

renderCalendar();


// ---------- VAULT ----------

const vaultGrid = document.getElementById("vaultGrid");
const viewer = document.getElementById("viewer");
const viewerImg = document.getElementById("viewerImg");

let vaultData = [];
let currentIndex = 0;

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

    div.querySelector("img").onclick = () => openViewer(index);

    div.querySelector(".deleteBtn").onclick = (e) => {
      e.stopPropagation();
      vaultData.splice(index, 1);
      localStorage.setItem("vault", JSON.stringify(vaultData));
      loadVault();
    };

    vaultGrid.appendChild(div);
  });
}

function saveImage(base64, name = "Image") {
  vaultData.push({ src: base64, name });
  localStorage.setItem("vault", JSON.stringify(vaultData));
  loadVault();
}

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

document.addEventListener("keydown", e => {
  if (!viewer.classList.contains("show")) return;

  if (e.key === "Escape") closeViewer();
  if (e.key === "ArrowRight") nextImage();
  if (e.key === "ArrowLeft") prevImage();
});

loadVault();


// ---------- AUTO LOAD TODAY GOALS ----------

function loadTodayGoals() {
  const today = new Date();
  const key = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const saved = localStorage.getItem(key);

  if (saved) {
    document.getElementById("dailyGoals").value = saved;
  }
}

loadTodayGoals();
