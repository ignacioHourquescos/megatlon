const STORAGE_KEY = "megatlon-session-v2";
const SWIPE_THRESHOLD = 72;
const RAIL_LONG_PRESS_MS = 280;
const RAIL_MOVE_CANCEL_PX = 10;

const MEAL_TYPES = [
  { id: "desayuno", label: "Desayuno" },
  { id: "almuerzo", label: "Almuerzo" },
  { id: "merienda", label: "Merienda" },
  { id: "cena", label: "Cena" },
  { id: "extra", label: "Extra" },
];

const TRACKER_TABS = [
  { id: "weight", label: "Peso" },
  { id: "meals", label: "Comidas" },
];

const state = {
  routine: null,
  activeDayIndex: 0,
  listMode: "active", // "active" | "done"
  view: "routine", // "routine" | "weight"
  trackerTab: "weight", // "weight" | "meals"
  session: loadSession(),
};

function asPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function currentWeekKey(date = new Date()) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc - yearStart) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function emptySession() {
  return {
    completed: {},
    weightsByTitle: {},
    bodyWeight: [],
    meals: [],
    railOrder: {},
    prescriptions: {},
    customExercises: {},
  };
}

function mealTypeLabel(id) {
  return MEAL_TYPES.find((type) => type.id === id)?.label || "Comida";
}

function normalizeMeals(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const date = typeof entry.date === "string" ? entry.date : "";
      const food = typeof entry.food === "string" ? entry.food.trim() : "";
      if (!date || !food) return null;
      const type = MEAL_TYPES.some((item) => item.id === entry.type)
        ? entry.type
        : "extra";
      return {
        id:
          typeof entry.id === "string" && entry.id
            ? entry.id
            : `meal-${date}-${Math.random().toString(36).slice(2, 8)}`,
        date,
        type,
        food,
      };
    })
    .filter(Boolean);
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySession();
    const parsed = JSON.parse(raw);
    return {
      completed: parsed.completed || {},
      weightsByTitle: parsed.weightsByTitle || {},
      bodyWeight: Array.isArray(parsed.bodyWeight) ? parsed.bodyWeight : [],
      meals: normalizeMeals(parsed.meals),
      railOrder: asPlainObject(parsed.railOrder),
      prescriptions: asPlainObject(parsed.prescriptions),
      customExercises: normalizeCustomExercises(parsed.customExercises),
    };
  } catch {
    return emptySession();
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

function getChartEntries() {
  return [...state.session.bodyWeight]
    .map((entry) => ({
      date: entry.date,
      weight: Number(String(entry.weight).replace(",", ".")),
    }))
    .filter((entry) => entry.date && Number.isFinite(entry.weight))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getMealEntries() {
  return [...state.session.meals].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate) return byDate;
    const order = MEAL_TYPES.map((type) => type.id);
    return order.indexOf(a.type) - order.indexOf(b.type);
  });
}

function addMeal(date, type, food) {
  const trimmed = String(food || "").trim();
  if (!date || !trimmed) return;
  const mealType = MEAL_TYPES.some((item) => item.id === type) ? type : "extra";
  state.session.meals.push({
    id: `meal-${Date.now()}`,
    date,
    type: mealType,
    food: trimmed,
  });
  saveSession();
}

function removeMeal(id) {
  state.session.meals = state.session.meals.filter((entry) => entry.id !== id);
  saveSession();
}

function setView(view) {
  state.view = view;
  render();
}

function setTrackerTab(tab) {
  state.trackerTab = tab;
  render();
}

function svgEl(name, attrs = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => {
    node.setAttribute(key, String(value));
  });
  return node;
}

function renderWeightChart() {
  const host = document.getElementById("weight-chart");
  if (!host) return;

  const entries = getChartEntries();
  host.innerHTML = "";
  host.classList.toggle("is-empty", entries.length < 2);

  if (entries.length < 2) {
    const empty = document.createElement("p");
    empty.className = "weight-chart__empty";
    empty.textContent = entries.length
      ? "Cargá otro peso para ver la evolución."
      : "El gráfico aparece con al menos dos registros.";
    host.appendChild(empty);
    return;
  }

  const width = 320;
  const height = 176;
  const pad = { top: 18, right: 16, bottom: 30, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const weights = entries.map((entry) => entry.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const span = max - min || 1;
  const yMin = min - span * 0.15;
  const yMax = max + span * 0.15;
  const ySpan = yMax - yMin;

  const xAt = (index) =>
    pad.left + (index / (entries.length - 1)) * innerW;
  const yAt = (weight) =>
    pad.top + (1 - (weight - yMin) / ySpan) * innerH;

  const points = entries.map((entry, index) => [xAt(index), yAt(entry.weight)]);
  const lineD = points
    .map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const areaD = `${lineD} L${points[points.length - 1][0].toFixed(1)} ${(pad.top + innerH).toFixed(1)} L${points[0][0].toFixed(1)} ${(pad.top + innerH).toFixed(1)} Z`;

  const svg = svgEl("svg", {
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": `Evolución de peso de ${entries[0].weight} kg a ${entries[entries.length - 1].weight} kg`,
  });

  svg.appendChild(
    svgEl("path", {
      d: areaD,
      class: "weight-chart__area",
    })
  );
  svg.appendChild(
    svgEl("path", {
      d: lineD,
      class: "weight-chart__line",
    })
  );

  const yTicks =
    max === min ? [max] : [max, Number(((min + max) / 2).toFixed(2)), min];
  yTicks.forEach((tick) => {
    const y = yAt(tick);
    svg.appendChild(
      svgEl("line", {
        x1: pad.left,
        x2: width - pad.right,
        y1: y,
        y2: y,
        class: "weight-chart__grid",
      })
    );
    const label = svgEl("text", {
      x: pad.left - 8,
      y: y + 4,
      class: "weight-chart__axis",
      "text-anchor": "end",
    });
    label.textContent = tick.toFixed(tick % 1 === 0 ? 0 : 1);
    svg.appendChild(label);
  });

  const xIndexes = [0, Math.floor((entries.length - 1) / 2), entries.length - 1]
    .filter((value, index, all) => all.indexOf(value) === index);

  xIndexes.forEach((index) => {
    const label = svgEl("text", {
      x: xAt(index),
      y: height - 8,
      class: "weight-chart__axis weight-chart__axis--x",
      "text-anchor":
        index === 0 ? "start" : index === entries.length - 1 ? "end" : "middle",
    });
    const [, month, day] = entries[index].date.split("-");
    label.textContent = `${day}/${month}`;
    svg.appendChild(label);
  });

  points.forEach(([x, y], index) => {
    svg.appendChild(
      svgEl("circle", {
        cx: x,
        cy: y,
        r: index === points.length - 1 ? 4.5 : 3.2,
        class: "weight-chart__dot",
      })
    );
  });

  host.appendChild(svg);
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
      renderWeightChart();
      renderWeightList();
    });

    item.append(date, weight, removeBtn);
    list.appendChild(item);
  });
}

function renderMealList() {
  const list = document.getElementById("meal-list");
  const empty = document.getElementById("meal-empty");
  if (!list || !empty) return;

  const entries = getMealEntries();
  list.innerHTML = "";
  empty.hidden = entries.length > 0;

  entries.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "meal-list__item";

    const meta = document.createElement("div");
    meta.className = "meal-list__meta";

    const type = document.createElement("span");
    type.className = "meal-list__type";
    type.textContent = mealTypeLabel(entry.type);

    const date = document.createElement("span");
    date.className = "meal-list__date";
    date.textContent = formatDisplayDate(entry.date);

    meta.append(type, date);

    const food = document.createElement("p");
    food.className = "meal-list__food";
    food.textContent = entry.food;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "weight-list__delete";
    removeBtn.setAttribute(
      "aria-label",
      `Eliminar ${mealTypeLabel(entry.type)} del ${formatDisplayDate(entry.date)}`
    );
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      removeMeal(entry.id);
      renderMealList();
    });

    item.append(meta, food, removeBtn);
    list.appendChild(item);
  });
}

function renderWeightPanel() {
  const main = document.getElementById("day-content");
  if (!main) return;

  main.innerHTML = `
    <div class="weight-view">
      <section class="weight-summary" aria-live="polite">
        <p class="weight-summary__label">Último peso</p>
        <p class="weight-summary__value" id="weight-summary-value">—<span>kg</span></p>
        <p class="weight-summary__date" id="weight-summary-date">Sin registros todavía</p>
      </section>

      <section class="weight-chart" id="weight-chart" aria-label="Gráfico de peso"></section>

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
    renderWeightChart();
    renderWeightList();
    if (weightInput) {
      weightInput.value = "";
      weightInput.focus();
    }
  });

  renderWeightChart();
  renderWeightList();
}

function renderMealsPanel() {
  const main = document.getElementById("day-content");
  if (!main) return;

  const typeOptions = MEAL_TYPES.map(
    (type) => `<option value="${type.id}">${type.label}</option>`
  ).join("");

  main.innerHTML = `
    <div class="weight-view">
      <form class="weight-form meal-form" id="meal-form">
        <label class="weight-form__field">
          <span>Fecha</span>
          <input type="date" name="date" id="meal-date" required />
        </label>
        <label class="weight-form__field">
          <span>Comida</span>
          <select name="type" id="meal-type" required>
            ${typeOptions}
          </select>
        </label>
        <label class="weight-form__field meal-form__food">
          <span>Qué comiste</span>
          <input
            type="text"
            name="food"
            id="meal-food"
            maxlength="160"
            autocomplete="off"
            placeholder="Ej: pollo, arroz y ensalada"
            required
          />
        </label>
        <button type="submit" class="weight-form__submit">Agregar</button>
      </form>

      <section class="weight-history">
        <h3 class="weight-history__title">Entradas</h3>
        <ul class="meal-list" id="meal-list"></ul>
        <p class="weight-empty" id="meal-empty" hidden>
          Todavía no hay comidas. Cargá desayuno, almuerzo o lo que hayas comido.
        </p>
      </section>
    </div>
  `;

  const dateInput = document.getElementById("meal-date");
  const typeInput = document.getElementById("meal-type");
  const foodInput = document.getElementById("meal-food");
  const form = document.getElementById("meal-form");

  if (dateInput) dateInput.value = todayIsoDate();

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const date = dateInput?.value;
    const type = typeInput?.value;
    const food = foodInput?.value;
    if (!date || !food) return;

    addMeal(date, type, food);
    renderMealList();
    if (foodInput) {
      foodInput.value = "";
      foodInput.focus();
    }
  });

  renderMealList();
  requestAnimationFrame(() => foodInput?.focus());
}

function renderTrackerView() {
  const rail = document.getElementById("exercise-rail");
  if (rail) rail.innerHTML = "";

  if (state.trackerTab === "meals") {
    renderMealsPanel();
    return;
  }
  renderWeightPanel();
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

function getCustomExercises(dayId) {
  return Array.isArray(state.session.customExercises[dayId])
    ? state.session.customExercises[dayId]
    : [];
}

function normalizeCustomExercises(value) {
  const raw = asPlainObject(value);
  const next = {};
  Object.keys(raw).forEach((dayId) => {
    if (!Array.isArray(raw[dayId])) return;
    next[dayId] = raw[dayId]
      .filter((item) => item && item.id && item.name)
      .map((item) => ({
        id: String(item.id),
        name: String(item.name).trim(),
        sets: parsePositiveInt(item.sets) ?? 3,
        reps: parsePositiveInt(item.reps) ?? 10,
        custom: true,
      }));
  });
  return next;
}

function addCustomExercise(dayId, name, sets, reps) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return null;

  const exercise = {
    id: `custom-${dayId}-${Date.now()}`,
    name: trimmed,
    sets,
    reps,
    custom: true,
  };

  if (!Array.isArray(state.session.customExercises[dayId])) {
    state.session.customExercises[dayId] = [];
  }
  state.session.customExercises[dayId].push(exercise);
  saveSession();
  return exercise;
}

function removeCustomExercise(dayId, exerciseId) {
  state.session.customExercises[dayId] = getCustomExercises(dayId).filter(
    (exercise) => exercise.id !== exerciseId
  );
  delete state.session.completed[exerciseId];
  delete state.session.prescriptions[exerciseId];
  if (Array.isArray(state.session.railOrder[dayId])) {
    state.session.railOrder[dayId] = state.session.railOrder[dayId].filter(
      (id) => id !== exerciseId
    );
  }
  saveSession();
}

function getDayBlocks(day) {
  const custom = getCustomExercises(day.id);
  if (!custom.length) return day.blocks;
  return [
    ...day.blocks,
    { type: "custom", title: "Agregados", exercises: custom },
  ];
}

function exerciseInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "EX";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getActiveDay() {
  return state.routine.days[state.activeDayIndex];
}

function getDayExercises(day) {
  return getDayBlocks(day).flatMap((block) => block.exercises);
}

function applyExerciseOrder(exercises, dayId) {
  const saved = state.session.railOrder[dayId];
  if (!Array.isArray(saved) || !saved.length) return exercises.slice();

  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const ordered = [];
  const seen = new Set();

  saved.forEach((id) => {
    const exercise = byId.get(id);
    if (!exercise || seen.has(id)) return;
    ordered.push(exercise);
    seen.add(id);
  });

  exercises.forEach((exercise) => {
    if (!seen.has(exercise.id)) ordered.push(exercise);
  });

  return ordered;
}

function getOrderedDayExercises(day = getActiveDay()) {
  return applyExerciseOrder(getDayExercises(day), day.id);
}

function setDayExerciseOrder(dayId, ids) {
  state.session.railOrder[dayId] = ids;
  saveSession();
}

function getPrescription(exercise) {
  const override = state.session.prescriptions[exercise.id] || {};
  return {
    sets: override.sets ?? exercise.sets,
    reps: override.reps ?? exercise.reps,
    durationMinutes: override.durationMinutes ?? exercise.durationMinutes,
    durationSeconds: override.durationSeconds ?? exercise.durationSeconds,
  };
}

function setPrescriptionField(exerciseId, field, value) {
  const current = state.session.prescriptions[exerciseId] || {};
  state.session.prescriptions[exerciseId] = { ...current, [field]: value };
  saveSession();
}

function parsePositiveInt(value) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function formatPrescription(exercise) {
  const rx = getPrescription(exercise);
  if (rx.durationMinutes != null) {
    return `${rx.durationMinutes} min`;
  }
  if (rx.durationSeconds != null && rx.sets != null) {
    return `${rx.sets} × ${rx.durationSeconds}s`;
  }
  if (rx.durationSeconds != null) {
    return `${rx.durationSeconds}s`;
  }
  if (rx.sets != null && rx.reps != null) {
    return `${rx.sets} × ${rx.reps}`;
  }
  if (rx.sets != null) {
    return `${rx.sets} series`;
  }
  return "—";
}

function getOrderedBlockGroups(day) {
  const blockByExerciseId = new Map();
  getDayBlocks(day).forEach((block) => {
    block.exercises.forEach((exercise) => {
      blockByExerciseId.set(exercise.id, block);
    });
  });

  const groups = [];
  getOrderedDayExercises(day).forEach((exercise) => {
    const block = blockByExerciseId.get(exercise.id);
    const last = groups[groups.length - 1];
    if (last && last.block === block) {
      last.exercises.push(exercise);
      return;
    }
    groups.push({ block, exercises: [exercise] });
  });

  return groups;
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

function getRailThumbs(rail) {
  return [...rail.querySelectorAll(".rail__thumb:not(.rail__restart):not(.rail__add)")];
}

function moveRailThumbToIndex(rail, thumb, targetIndex) {
  const thumbs = getRailThumbs(rail);
  const currentIndex = thumbs.indexOf(thumb);
  if (currentIndex < 0 || targetIndex < 0 || currentIndex === targetIndex) {
    return currentIndex;
  }

  thumbs.splice(currentIndex, 1);
  thumbs.splice(targetIndex, 0, thumb);

  const restart = rail.querySelector(".rail__restart");
  thumbs.forEach((item) => rail.insertBefore(item, restart));
  return targetIndex;
}

function railIndexFromPoint(rail, clientY) {
  const thumbs = getRailThumbs(rail);
  if (!thumbs.length) return 0;

  for (let i = 0; i < thumbs.length; i += 1) {
    const rect = thumbs[i].getBoundingClientRect();
    if (clientY < rect.top + rect.height / 2) return i;
  }

  return thumbs.length - 1;
}

function attachRailReorder(rail, thumb) {
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let longPressTimer = 0;
  let dragging = false;
  let movedWhileDragging = false;
  let suppressClick = false;
  let originIndex = -1;
  let pointerType = "touch";

  const clearTimer = () => {
    if (longPressTimer) {
      window.clearTimeout(longPressTimer);
      longPressTimer = 0;
    }
  };

  const unbindWindow = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
  };

  const stopDragging = () => {
    dragging = false;
    pointerId = null;
    movedWhileDragging = false;
    thumb.classList.remove("is-dragging");
    rail.classList.remove("is-reordering");
    originIndex = -1;
    unbindWindow();
  };

  const commitOrder = () => {
    const day = getActiveDay();
    const ids = getRailThumbs(rail).map((item) => item.dataset.exerciseId);
    setDayExerciseOrder(day.id, ids);
    renderDay();
  };

  const beginDrag = () => {
    if (dragging) return;
    dragging = true;
    originIndex = getRailThumbs(rail).indexOf(thumb);
    thumb.classList.add("is-dragging");
    rail.classList.add("is-reordering");
    if (typeof navigator.vibrate === "function" && pointerType !== "mouse") {
      navigator.vibrate(12);
    }
  };

  const onMove = (event) => {
    if (pointerId !== event.pointerId) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    const distance = Math.hypot(dx, dy);

    if (!dragging) {
      if (pointerType === "mouse") {
        if (distance > RAIL_MOVE_CANCEL_PX) beginDrag();
        else return;
      } else {
        if (distance > RAIL_MOVE_CANCEL_PX) clearTimer();
        return;
      }
    }

    event.preventDefault();
    try {
      thumb.setPointerCapture(event.pointerId);
    } catch {
      // ignore
    }

    const nextIndex = railIndexFromPoint(rail, event.clientY);
    const currentIndex = getRailThumbs(rail).indexOf(thumb);
    if (nextIndex !== currentIndex) movedWhileDragging = true;
    moveRailThumbToIndex(rail, thumb, nextIndex);
  };

  const onUp = (event) => {
    if (pointerId !== event.pointerId) return;
    clearTimer();

    if (!dragging) {
      pointerId = null;
      unbindWindow();
      return;
    }

    const currentIndex = getRailThumbs(rail).indexOf(thumb);
    const changed = originIndex !== currentIndex;
    suppressClick = movedWhileDragging || changed;
    stopDragging();
    if (changed) commitOrder();
  };

  thumb.addEventListener("pointerdown", (event) => {
    if (event.button != null && event.button !== 0) return;
    pointerId = event.pointerId;
    pointerType = event.pointerType || "touch";
    startX = event.clientX;
    startY = event.clientY;
    dragging = false;
    movedWhileDragging = false;
    suppressClick = false;
    clearTimer();
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    if (pointerType !== "mouse") {
      longPressTimer = window.setTimeout(() => {
        longPressTimer = 0;
        beginDrag();
      }, RAIL_LONG_PRESS_MS);
    }
  });

  thumb.addEventListener(
    "click",
    (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressClick = false;
    },
    true
  );

  thumb.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
}

function renderRail() {
  const rail = document.getElementById("exercise-rail");
  rail.innerHTML = "";
  rail.classList.remove("is-reordering");

  const day = getActiveDay();
  const byId = new Map(getDayExercises(day).map((exercise) => [exercise.id, exercise]));

  getOrderedDayExercises(day).forEach((exercise) => {
    const done = isDone(exercise.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `rail__thumb${exercise.image ? "" : " rail__thumb--text"}${
      done ? " is-done" : ""
    }${state.listMode === "done" && done ? " is-filter" : ""}`;
    button.dataset.exerciseId = exercise.id;
    button.title = `${exercise.name}. Mantener presionado para reordenar`;
    button.setAttribute(
      "aria-label",
      done
        ? `Ver completados: ${exercise.name}. Mantener para reordenar`
        : `Ir a ${exercise.name}. Mantener para reordenar`
    );

    if (exercise.image) {
      const img = document.createElement("img");
      img.src = exercise.image;
      img.alt = "";
      img.draggable = false;
      img.loading = "lazy";
      button.appendChild(img);
    } else {
      const mark = document.createElement("span");
      mark.textContent = exerciseInitials(exercise.name);
      button.appendChild(mark);
    }

    button.addEventListener("click", () => {
      const current = byId.get(exercise.id) || exercise;
      onRailClick(current);
    });
    attachRailReorder(rail, button);
    rail.appendChild(button);
  });

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "rail__thumb rail__add";
  addBtn.title = "Agregar ejercicio";
  addBtn.setAttribute("aria-label", "Agregar ejercicio");
  addBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
      />
    </svg>
  `;
  addBtn.addEventListener("click", openAddExerciseDialog);
  rail.appendChild(addBtn);

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
    nav.setAttribute("aria-label", "Peso y comidas");
    TRACKER_TABS.forEach((tab) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tab";
      button.textContent = tab.label;
      button.setAttribute("aria-selected", String(tab.id === state.trackerTab));
      button.addEventListener("click", () => setTrackerTab(tab.id));
      nav.appendChild(button);
    });
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
    if (event.target.closest(".card__weight, .card__chip, .card__delete")) return;
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

function createChipInput(exercise, field, value, ariaLabel, suffix = "") {
  const input = document.createElement("input");
  input.type = "number";
  input.inputMode = "numeric";
  input.min = "1";
  input.step = "1";
  input.className = "card__chip-input";
  input.setAttribute("aria-label", ariaLabel);
  input.value = value ?? "";
  input.enterKeyHint = "done";

  const restore = () => {
    const rx = getPrescription(exercise);
    input.value = rx[field] ?? "";
  };

  const commit = () => {
    const parsed = parsePositiveInt(input.value);
    if (parsed == null) {
      restore();
      return;
    }
    input.value = String(parsed);
    setPrescriptionField(exercise.id, field, parsed);
  };

  input.addEventListener("input", () => {
    const parsed = parsePositiveInt(input.value);
    if (parsed != null) setPrescriptionField(exercise.id, field, parsed);
  });
  input.addEventListener("change", commit);
  input.addEventListener("blur", () => {
    if (parsePositiveInt(input.value) == null) restore();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      input.blur();
    }
  });

  if (!suffix) return input;

  const wrap = document.createDocumentFragment();
  wrap.appendChild(input);
  const unit = document.createElement("span");
  unit.className = "card__chip-unit";
  unit.textContent = suffix;
  wrap.appendChild(unit);
  return wrap;
}

function createPrescriptionChip(exercise) {
  const rx = getPrescription(exercise);
  const chip = document.createElement("div");
  chip.className = "card__chip";
  chip.setAttribute("role", "group");
  chip.setAttribute("aria-label", formatPrescription(exercise));

  const addSep = () => {
    const sep = document.createElement("span");
    sep.className = "card__chip-sep";
    sep.textContent = "×";
    chip.appendChild(sep);
  };

  if (rx.durationMinutes != null) {
    chip.appendChild(
      createChipInput(
        exercise,
        "durationMinutes",
        rx.durationMinutes,
        "Minutos",
        " min"
      )
    );
    return chip;
  }

  if (rx.durationSeconds != null) {
    if (rx.sets != null) {
      chip.appendChild(
        createChipInput(exercise, "sets", rx.sets, "Series")
      );
      addSep();
    }
    chip.appendChild(
      createChipInput(
        exercise,
        "durationSeconds",
        rx.durationSeconds,
        "Segundos",
        "s"
      )
    );
    return chip;
  }

  if (rx.sets != null && rx.reps != null) {
    chip.appendChild(createChipInput(exercise, "sets", rx.sets, "Series"));
    addSep();
    chip.appendChild(
      createChipInput(exercise, "reps", rx.reps, "Repeticiones")
    );
    return chip;
  }

  if (rx.sets != null) {
    chip.appendChild(
      createChipInput(exercise, "sets", rx.sets, "Series", " series")
    );
    return chip;
  }

  const fallback = document.createElement("span");
  fallback.textContent = "—";
  chip.appendChild(fallback);
  return chip;
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

  if (exercise.custom) {
    const del = document.createElement("button");
    del.type = "button";
    del.className = "card__delete";
    del.setAttribute("aria-label", `Eliminar ${exercise.name}`);
    del.textContent = "×";
    del.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!window.confirm(`¿Eliminar “${exercise.name}”?`)) return;
      removeCustomExercise(getActiveDay().id, exercise.id);
      render();
    });
    card.querySelector(".card__head").appendChild(del);
  }

  const media = card.querySelector(".card__media");
  const img = card.querySelector("img");
  if (exercise.image) {
    img.src = exercise.image;
    img.alt = exercise.name;
  } else {
    img.replaceWith(createMediaPlaceholder(exercise));
  }

  media.insertBefore(
    createPrescriptionChip(exercise),
    card.querySelector(".card__weight")
  );

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

  getOrderedBlockGroups(day).forEach(({ block, exercises: groupExercises }) => {
    const exercises = groupExercises.filter((exercise) => {
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
        : "Todo listo. Tocá un ícono marcado para ver los completados.";
    main.appendChild(empty);
  }
}

function createMediaPlaceholder(exercise) {
  const el = document.createElement("div");
  el.className = "card__placeholder";
  el.setAttribute("aria-hidden", "true");
  el.textContent = exerciseInitials(exercise.name);
  return el;
}

function openAddExerciseDialog() {
  const dialog = document.getElementById("add-exercise-dialog");
  const form = document.getElementById("add-exercise-form");
  const nameInput = document.getElementById("add-exercise-name");
  const setsInput = document.getElementById("add-exercise-sets");
  const repsInput = document.getElementById("add-exercise-reps");
  if (!dialog || !form) return;

  form.reset();
  if (setsInput) setsInput.value = "3";
  if (repsInput) repsInput.value = "10";
  dialog.showModal();
  requestAnimationFrame(() => nameInput?.focus());
}

function setupAddExerciseUi() {
  const dialog = document.getElementById("add-exercise-dialog");
  const form = document.getElementById("add-exercise-form");
  const cancelBtn = document.getElementById("add-exercise-cancel");
  if (!dialog || !form) return;

  cancelBtn?.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.routine) return;

    const name = document.getElementById("add-exercise-name")?.value;
    const sets = parsePositiveInt(document.getElementById("add-exercise-sets")?.value) ?? 3;
    const reps = parsePositiveInt(document.getElementById("add-exercise-reps")?.value) ?? 10;
    const created = addCustomExercise(getActiveDay().id, name, sets, reps);
    if (!created) return;

    dialog.close();
    state.listMode = "active";
    state.view = "routine";
    render();
    requestAnimationFrame(() => scrollToExercise(created.id));
  });
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
    renderTrackerView();
    return;
  }

  if (!state.routine) return;
  renderRail();
  renderDay();
}

async function init() {
  setupBodyWeightUi();
  setupAddExerciseUi();

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
