const STORAGE_KEY = "megatlon-session-v2";
const SWIPE_THRESHOLD = 72;

const state = {
  routine: null,
  activeDayIndex: 0,
  listMode: "active", // "active" | "done"
  view: "routine", // "routine" | "weight"
  session: loadSession(),
};

function currentWeekKey(date = new Date()) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc - yearStart) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: {}, weightsByTitle: {}, bodyWeight: [] };
    const parsed = JSON.parse(raw);
    return {
      completed: parsed.completed || {},
      weightsByTitle: parsed.weightsByTitle || {},
      bodyWeight: Array.isArray(parsed.bodyWeight) ? parsed.bodyWeight : [],
    };
  } catch {
    return { completed: {}, weightsByTitle: {}, bodyWeight: [] };
  }
}

function todayIsoDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getBodyWeightEntries() {
  return [...state.session.bodyWeight].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

function upsertBodyWeight(date, weight) {
  const value = String(weight).trim();
  if (!date || value === "") return;

  const existing = state.session.bodyWeight.findIndex(
    (entry) => entry.date === date
  );
  const next = { date, weight: value };

  if (existing >= 0) {
    state.session.bodyWeight[existing] = next;
  } else {
    state.session.bodyWeight.push(next);
  }

  saveSession();
}

function removeBodyWeight(date) {
  state.session.bodyWeight = state.session.bodyWeight.filter(
    (entry) => entry.date !== date
  );
  saveSession();
}

function setView(view) {
  state.view = view;
  render();
}

function renderWeightList() {
  const list = document.getElementById("weight-list");
  const empty = document.getElementById("weight-empty");
  const summaryValue = document.getElementById("weight-summary-value");
  const summaryDate = document.getElementById("weight-summary-date");
  if (!list || !empty) return;

  const entries = getBodyWeightEntries();
  list.innerHTML = "";
  empty.hidden = entries.length > 0;

  if (summaryValue && summaryDate) {
    if (entries.length) {
      summaryValue.innerHTML = `${entries[0].weight}<span>kg</span>`;
      summaryDate.textContent = formatDisplayDate(entries[0].date);
    } else {
      summaryValue.innerHTML = `—<span>kg</span>`;
      summaryDate.textContent = "Sin registros todavía";
    }
  }

  entries.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "weight-list__item";

    const date = document.createElement("span");
    date.className = "weight-list__date";
    date.textContent = formatDisplayDate(entry.date);

    const weight = document.createElement("span");
    weight.className = "weight-list__weight";
    weight.textContent = `${entry.weight} kg`;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "weight-list__delete";
    removeBtn.setAttribute(
      "aria-label",
      `Eliminar registro del ${formatDisplayDate(entry.date)}`
    );
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      removeBodyWeight(entry.date);
      renderWeightList();
    });

    item.append(date, weight, removeBtn);
    list.appendChild(item);
  });
}

function renderWeightView() {
  const main = document.getElementById("day-content");
  const rail = document.getElementById("exercise-rail");
  if (!main) return;

  if (rail) rail.innerHTML = "";

  main.innerHTML = `
    <div class="weight-view">
      <section class="weight-summary" aria-live="polite">
        <p class="weight-summary__label">Último peso</p>
        <p class="weight-summary__value" id="weight-summary-value">—<span>kg</span></p>
        <p class="weight-summary__date" id="weight-summary-date">Sin registros todavía</p>
      </section>

      <form class="weight-form" id="weight-form">
        <label class="weight-form__field">
          <span>Fecha</span>
          <input type="date" name="date" id="weight-date" required />
        </label>
        <label class="weight-form__field">
          <span>Peso</span>
          <input
            type="number"
            name="weight"
            id="weight-value"
            inputmode="decimal"
            min="0"
            step="0.1"
            placeholder="kg"
            required
          />
        </label>
        <button type="submit" class="weight-form__submit">Agregar</button>
      </form>

      <section class="weight-history">
        <h3 class="weight-history__title">Historial</h3>
        <ul class="weight-list" id="weight-list"></ul>
        <p class="weight-empty" id="weight-empty" hidden>
          Todavía no hay registros. Podés cargar fechas pasadas.
        </p>
      </section>
    </div>
  `;

  const dateInput = document.getElementById("weight-date");
  const weightInput = document.getElementById("weight-value");
  const form = document.getElementById("weight-form");

  if (dateInput) dateInput.value = todayIsoDate();

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const date = dateInput?.value;
    const weight = weightInput?.value;
    if (!date || weight === "" || weight == null) return;

    upsertBodyWeight(date, weight);
    renderWeightList();
    if (weightInput) {
      weightInput.value = "";
      weightInput.focus();
    }
  });

  renderWeightList();
  requestAnimationFrame(() => weightInput?.focus());
}

function setupBodyWeightUi() {
  const openBtn = document.getElementById("profile-btn");

  openBtn?.addEventListener("click", () => {
    if (state.view === "weight") {
      setView("routine");
      return;
    }
    setView("weight");
  });
}

function saveSession() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.session));
}

function isDone(exerciseId) {
  return Boolean(state.session.completed[exerciseId]);
}

function getWeightForTitle(title) {
  const weeks = state.session.weightsByTitle[title];
  if (!weeks) return "";
  const week = currentWeekKey();
  if (weeks[week] != null && weeks[week] !== "") return weeks[week];

  const keys = Object.keys(weeks).sort();
  for (let i = keys.length - 1; i >= 0; i -= 1) {
    if (weeks[keys[i]] !== "") return weeks[keys[i]];
  }
  return "";
}

function setWeightForTitle(title, value) {
  if (!state.session.weightsByTitle[title]) {
    state.session.weightsByTitle[title] = {};
  }
  state.session.weightsByTitle[title][currentWeekKey()] = value;
  saveSession();
}

function restartWeek() {
  state.session.completed = {};
  state.listMode = "active";
  saveSession();
  renderRail();
  renderDay();
}

function getActiveDay() {
  return state.routine.days[state.activeDayIndex];
}

function getDayExercises(day) {
  return day.blocks.flatMap((block) => block.exercises);
}

function formatPrescription(exercise) {
  if (exercise.durationMinutes != null) {
    return `${exercise.durationMinutes} min`;
  }
  if (exercise.durationSeconds != null && exercise.sets != null) {
    return `${exercise.sets} × ${exercise.durationSeconds}s`;
  }
  if (exercise.durationSeconds != null) {
    return `${exercise.durationSeconds}s`;
  }
  if (exercise.sets != null && exercise.reps != null) {
    return `${exercise.sets} × ${exercise.reps}`;
  }
  if (exercise.sets != null) {
    return `${exercise.sets} series`;
  }
  return "—";
}

function scrollToExercise(exerciseId) {
  const card = document.getElementById(exerciseId);
  const main = document.getElementById("day-content");
  if (!card || !main) return;

  document
    .querySelectorAll(".rail__thumb.is-active")
    .forEach((el) => el.classList.remove("is-active"));
  document
    .querySelectorAll(".card.is-flash")
    .forEach((el) => el.classList.remove("is-flash"));

  const thumb = document.querySelector(
    `.rail__thumb[data-exercise-id="${exerciseId}"]`
  );
  if (thumb) thumb.classList.add("is-active");

  const mainRect = main.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const top = Math.max(0, main.scrollTop + (cardRect.top - mainRect.top) - 8);

  main.style.scrollBehavior = "smooth";
  main.scrollTo({ top, behavior: "smooth" });
  card.classList.add("is-flash");
  window.setTimeout(() => card.classList.remove("is-flash"), 700);
}

function onRailClick(exercise) {
  const done = isDone(exercise.id);

  if (done) {
    state.listMode = "done";
    renderDay();
    renderRail();
    requestAnimationFrame(() => scrollToExercise(exercise.id));
    return;
  }

  state.listMode = "active";
  renderDay();
  renderRail();
  requestAnimationFrame(() => scrollToExercise(exercise.id));
}

function renderRail() {
  const rail = document.getElementById("exercise-rail");
  rail.innerHTML = "";

  getDayExercises(getActiveDay()).forEach((exercise) => {
    const done = isDone(exercise.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `rail__thumb${done ? " is-done" : ""}${
      state.listMode === "done" && done ? " is-filter" : ""
    }`;
    button.dataset.exerciseId = exercise.id;
    button.title = exercise.name;
    button.setAttribute(
      "aria-label",
      done ? `Ver completados: ${exercise.name}` : `Ir a ${exercise.name}`
    );

    const img = document.createElement("img");
    img.src = exercise.image || "";
    img.alt = "";
    img.loading = "lazy";
    button.appendChild(img);

    button.addEventListener("click", () => onRailClick(exercise));
    rail.appendChild(button);
  });

  const restartBtn = document.createElement("button");
  restartBtn.type = "button";
  restartBtn.className = "rail__thumb rail__restart";
  restartBtn.title = "Reiniciar semana";
  restartBtn.setAttribute("aria-label", "Reiniciar semana");
  restartBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path
        d="M21 12a9 9 0 1 1-2.64-6.36"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
      <path
        d="M21 3v6h-6"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
  restartBtn.addEventListener("click", restartWeek);
  rail.appendChild(restartBtn);
}

function renderTabs() {
  const nav = document.getElementById("day-tabs");
  nav.innerHTML = "";

  if (state.view === "weight") {
    nav.setAttribute("aria-label", "Seguimiento de peso");
    const title = document.createElement("div");
    title.className = "view-title";
    title.setAttribute("aria-current", "page");
    title.textContent = "Peso corporal";
    nav.appendChild(title);
    return;
  }

  nav.setAttribute("aria-label", "Días de rutina");

  state.routine.days.forEach((day, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tab";
    button.textContent = day.name;
    button.setAttribute("aria-selected", String(index === state.activeDayIndex));
    button.addEventListener("click", () => {
      state.activeDayIndex = index;
      state.listMode = "active";
      state.view = "routine";
      render();
    });
    nav.appendChild(button);
  });
}

function attachSwipe(card, exercise) {
  let startX = 0;
  let startY = 0;
  let tracking = false;
  let axis = null;

  const resetTransform = () => {
    card.classList.remove("is-swiping");
    card.style.transform = "";
    card.style.opacity = "";
  };

  const finishToggle = (direction) => {
    const nextDone = !isDone(exercise.id);
    card.classList.add("is-swiping");
    card.classList.toggle("is-done", nextDone);
    card.style.transform = `translateX(${direction > 0 ? 120 : -120}%)`;
    card.style.opacity = "0";

    window.setTimeout(() => {
      state.session.completed[exercise.id] = nextDone;
      saveSession();

      if (!nextDone && state.listMode === "done") {
        const stillDone = getDayExercises(getActiveDay()).some((ex) =>
          isDone(ex.id)
        );
        if (!stillDone) state.listMode = "active";
      }

      renderRail();
      renderDay();
    }, 180);
  };

  card.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".card__weight")) return;
    tracking = true;
    axis = null;
    startX = event.clientX;
    startY = event.clientY;
    card.classList.add("is-swiping");
    try {
      card.setPointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  });

  card.addEventListener("pointermove", (event) => {
    if (!tracking) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    if (axis === null) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      axis = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
      if (axis === "v") {
        tracking = false;
        resetTransform();
        return;
      }
    }

    if (axis !== "h") return;
    event.preventDefault();
    const drag = Math.max(-140, Math.min(140, dx));
    card.style.transform = `translateX(${drag}px)`;
    card.style.opacity = String(1 - Math.min(0.35, Math.abs(drag) / 280));
    card.classList.toggle("is-swipe-hint", Math.abs(drag) > SWIPE_THRESHOLD / 2);
  });

  const endPointer = (event) => {
    if (!tracking) return;
    tracking = false;
    const dx = event.clientX - startX;

    if (axis === "h" && Math.abs(dx) >= SWIPE_THRESHOLD) {
      finishToggle(dx);
      return;
    }

    resetTransform();
    card.classList.remove("is-swipe-hint");
  };

  card.addEventListener("pointerup", endPointer);
  card.addEventListener("pointercancel", endPointer);
}

function createCard(exercise) {
  const done = isDone(exercise.id);
  const weight = getWeightForTitle(exercise.name);

  const card = document.createElement("article");
  card.className = `card${done ? " is-done" : ""}`;
  card.id = exercise.id;
  card.dataset.exerciseId = exercise.id;
  card.dataset.exerciseTitle = exercise.name;

  card.innerHTML = `
    <div class="card__head">
      <h3 class="card__name"></h3>
    </div>
    <div class="card__media">
      <img alt="" loading="lazy" />
      <span class="card__chip"></span>
      <label class="card__weight">
        <input
          type="number"
          inputmode="decimal"
          min="0"
          step="0.5"
          placeholder="0"
          aria-label="Peso en kilogramos"
        />
        <span class="card__weight-unit">kg</span>
      </label>
    </div>
  `;

  card.querySelector(".card__name").textContent = exercise.name;

  const img = card.querySelector("img");
  img.src = exercise.image || "";
  img.alt = exercise.name;

  card.querySelector(".card__chip").textContent = formatPrescription(exercise);

  const weightInput = card.querySelector(".card__weight input");
  weightInput.value = weight;
  weightInput.addEventListener("input", () => {
    setWeightForTitle(exercise.name, weightInput.value);
  });

  attachSwipe(card, exercise);
  return card;
}

function renderDay() {
  const day = getActiveDay();
  const main = document.getElementById("day-content");
  main.innerHTML = "";
  main.dataset.listMode = state.listMode;

  let visibleCount = 0;

  if (state.listMode === "done") {
    const banner = document.createElement("p");
    banner.className = "list-banner";
    banner.textContent = "Completados";
    main.appendChild(banner);
  }

  day.blocks.forEach((block) => {
    const exercises = block.exercises.filter((exercise) => {
      const done = isDone(exercise.id);
      return state.listMode === "done" ? done : !done;
    });

    if (!exercises.length) return;

    const section = document.createElement("section");
    section.className = "block";

    const title = document.createElement("h2");
    title.className = "block__title";
    title.textContent = block.title;
    section.appendChild(title);

    if (block.rounds) {
      const meta = document.createElement("p");
      meta.className = "block__meta";
      meta.textContent = `${block.rounds} vueltas`;
      section.appendChild(meta);
    }

    exercises.forEach((exercise) => {
      section.appendChild(createCard(exercise));
      visibleCount += 1;
    });

    main.appendChild(section);
  });

  if (visibleCount === 0) {
    const empty = document.createElement("p");
    empty.className = "status";
    empty.textContent =
      state.listMode === "done"
        ? "Todavía no hay ejercicios completados."
        : "Todo listo. Tocá un thumb verde para ver los completados.";
    main.appendChild(empty);
  }
}

function render() {
  const app = document.getElementById("app");
  const profileBtn = document.getElementById("profile-btn");
  const onWeight = state.view === "weight";

  app?.setAttribute("data-view", state.view);
  profileBtn?.classList.toggle("is-active", onWeight);
  profileBtn?.setAttribute("aria-pressed", String(onWeight));

  renderTabs();

  if (onWeight) {
    renderWeightView();
    return;
  }

  if (!state.routine) return;
  renderRail();
  renderDay();
}

async function init() {
  setupBodyWeightUi();

  try {
    const response = await fetch("data/routine.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.routine = await response.json();
    render();
  } catch (error) {
    document.getElementById("day-content").innerHTML =
      `<p class="status">No se pudo cargar la rutina.</p>`;
    console.error(error);
  }

  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("sw.js");
    } catch (error) {
      console.warn("SW registration failed", error);
    }
  }
}

init();
