const STORAGE_KEY = "megatlon-session-v2";
const SWIPE_THRESHOLD = 72;
const RAIL_LONG_PRESS_MS = 280;
const RAIL_MOVE_CANCEL_PX = 10;
const CARD_TIMER_HOLD_MS = 380;
const CARD_TIMER_MOVE_CANCEL_PX = 12;
const SCROLL_SPY_LOCK_MS = 750;
const SCROLL_ANIM_MS = 450;

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
  { id: "steps", label: "Pasos" },
];

const FOOD_STOPWORDS = new Set([
  "de",
  "del",
  "con",
  "y",
  "e",
  "la",
  "el",
  "los",
  "las",
  "un",
  "una",
  "uno",
  "dos",
  "tres",
  "cuatro",
  "porcion",
  "porciones",
  "grande",
  "grandes",
  "mediana",
  "mediano",
  "medianas",
  "medianos",
  "chica",
  "chico",
  "chicas",
  "mas",
  "otro",
  "otra",
]);

const FOOD_TYPOS = [
  ["salchica", "salchicha"],
  ["echcolota", "chocolate"],
  ["chocolata", "chocolate"],
  ["milanesas", "milanesa"],
];

const FOOD_QTY = [
  { keys: ["cuatro", "4"], n: 4 },
  { keys: ["tres", "3"], n: 3 },
  { keys: ["dos", "2"], n: 2 },
  { keys: ["una", "un", "uno", "1"], n: 1 },
];

const FOOD_SIZE = [
  { keys: ["grandes", "grande"], n: 1.35 },
  { keys: ["medianas", "medianos", "mediana", "mediano"], n: 1 },
  { keys: ["chicas", "chicos", "chica", "chico"], n: 0.7 },
];

const FOOD_DB = [
  { name: "milanesa napolitana", keys: ["milanesa napolitana"], kcal: 380 },
  { name: "milanesa", keys: ["milanesa"], kcal: 280 },
  { name: "papas fritas", keys: ["papas fritas", "papa frita"], kcal: 320 },
  { name: "muslo", keys: ["pata muslo", "muslo de pollo", "pata", "muslo"], kcal: 220 },
  { name: "pechuga", keys: ["pechuga"], kcal: 180 },
  { name: "pollo", keys: ["pollo"], kcal: 220 },
  { name: "asado", keys: ["asado"], kcal: 350 },
  { name: "bife", keys: ["bife", "bife de chorizo"], kcal: 280 },
  { name: "carne", keys: ["carne"], kcal: 250 },
  { name: "bondiola", keys: ["bondiola"], kcal: 280 },
  { name: "matambre", keys: ["matambre"], kcal: 260 },
  { name: "hamburguesa", keys: ["hamburguesa", "hamburguesas"], kcal: 350 },
  { name: "empanada", keys: ["empanadas", "empanada"], kcal: 220 },
  { name: "pizza", keys: ["pizza"], kcal: 280 },
  { name: "tarta", keys: ["tarta"], kcal: 250 },
  { name: "pescado", keys: ["pescado"], kcal: 190 },
  { name: "merluza", keys: ["merluza"], kcal: 160 },
  { name: "atún", keys: ["atun"], kcal: 130 },
  { name: "huevo", keys: ["huevos", "huevo"], kcal: 78 },
  { name: "omelette", keys: ["omelette", "omelet"], kcal: 180 },
  { name: "jamón", keys: ["jamon"], kcal: 45 },
  { name: "queso", keys: ["queso"], kcal: 90 },
  { name: "salchicha", keys: ["salchichas", "salchicha"], kcal: 160 },
  { name: "chorizo", keys: ["chorizo"], kcal: 290 },
  { name: "morcilla", keys: ["morcilla"], kcal: 250 },
  { name: "arroz", keys: ["arroz"], kcal: 200 },
  { name: "fideos", keys: ["fideos", "pasta", "spaghettis", "spaghetti"], kcal: 250 },
  { name: "lentejas", keys: ["lentejas", "lenteja"], kcal: 180 },
  { name: "porotos", keys: ["porotos", "poroto"], kcal: 180 },
  { name: "garbanzos", keys: ["garbanzos", "garbanzo"], kcal: 170 },
  { name: "papas", keys: ["papas", "papa"], kcal: 150 },
  { name: "puré", keys: ["pure"], kcal: 180 },
  { name: "batata", keys: ["batata"], kcal: 130 },
  { name: "choclo", keys: ["choclo"], kcal: 100 },
  { name: "ensalada", keys: ["ensalada"], kcal: 70 },
  { name: "verdura", keys: ["verduras", "verdura"], kcal: 50 },
  { name: "tomate", keys: ["tomates", "tomate"], kcal: 22 },
  { name: "sopa", keys: ["sopa"], kcal: 90 },
  { name: "guiso", keys: ["guiso"], kcal: 320 },
  { name: "locro", keys: ["locro"], kcal: 380 },
  { name: "manzana", keys: ["manzanas", "manzana"], kcal: 95 },
  { name: "banana", keys: ["bananas", "banana", "bananas"], kcal: 105 },
  { name: "naranja", keys: ["naranjas", "naranja"], kcal: 62 },
  { name: "pera", keys: ["peras", "pera"], kcal: 85 },
  { name: "mandarina", keys: ["mandarinas", "mandarina"], kcal: 50 },
  { name: "yogur", keys: ["yogurt", "yogur"], kcal: 120 },
  { name: "leche", keys: ["leche"], kcal: 120 },
  { name: "café con leche", keys: ["cafe con leche"], kcal: 60 },
  { name: "café", keys: ["cafe"], kcal: 5 },
  { name: "tostada", keys: ["tostadas", "tostada"], kcal: 80 },
  { name: "pan", keys: ["pan"], kcal: 80 },
  { name: "medialuna", keys: ["medialunas", "medialuna"], kcal: 240 },
  { name: "factura", keys: ["facturas", "factura"], kcal: 250 },
  { name: "avena", keys: ["avena"], kcal: 150 },
  { name: "cereal", keys: ["cereal"], kcal: 150 },
  { name: "galletita", keys: ["galletitas", "galletita"], kcal: 45 },
  { name: "alfajor", keys: ["alfajores", "alfajor"], kcal: 250 },
  { name: "chocolate", keys: ["coco de chocolate", "chocolate"], kcal: 160 },
  { name: "helado", keys: ["helado"], kcal: 210 },
  { name: "flan", keys: ["flan"], kcal: 180 },
  { name: "dulce de leche", keys: ["dulce de leche"], kcal: 70 },
  { name: "coco", keys: ["coco"], kcal: 70 },
  { name: "gaseosa", keys: ["gaseosa", "coca", "sprite"], kcal: 140 },
  { name: "jugo", keys: ["jugo"], kcal: 110 },
  { name: "cerveza", keys: ["cerveza"], kcal: 150 },
  { name: "vino", keys: ["vino"], kcal: 85 },
  { name: "agua", keys: ["agua"], kcal: 0 },
];

const STEP_MIN_INTERVAL_MS = 300;
const STEP_PEAK_DELTA = 1.15;

const pedometer = {
  wantRunning: false,
  listening: false,
  filtered: 0,
  lastPeak: false,
  lastStepAt: 0,
  gotSample: false,
  sampleTimer: 0,
  uiTimer: 0,
  wakeLock: null,
};

const state = {
  routine: null,
  activeDayIndex: 0,
  listMode: "active", // "active" | "done"
  view: "routine", // "routine" | "weight"
  trackerTab: "weight", // "weight" | "meals" | "steps"
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
    steps: [],
    railOrder: {},
    prescriptions: {},
    customExercises: {},
  };
}

function mealTypeLabel(id) {
  return MEAL_TYPES.find((type) => type.id === id)?.label || "Comida";
}

function foldFoodText(text) {
  let next = String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  FOOD_TYPOS.forEach(([from, to]) => {
    next = next.split(from).join(to);
  });
  return next
    .replace(/\bd\b/g, "de")
    .replace(/[^a-z0-9,;\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isWordBoundary(text, start, end) {
  const left = start === 0 || text[start - 1] === " " || text[start - 1] === "," || text[start - 1] === ";";
  const right =
    end >= text.length || text[end] === " " || text[end] === "," || text[end] === ";";
  return left && right;
}

function lookupWordValue(pairs, text) {
  const padded = ` ${text} `;
  for (const { keys, n } of pairs) {
    if (keys.some((key) => padded.includes(` ${key} `))) return n;
  }
  return null;
}

function quantityBefore(text, index) {
  const left = ` ${text.slice(Math.max(0, index - 24), index).trim()} `;
  const numbered = left.match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s+$/);
  if (numbered) {
    const n = Number(numbered[1].replace(",", "."));
    if (Number.isFinite(n) && n > 0) return n;
  }
  for (const { keys, n } of FOOD_QTY) {
    if (keys.some((key) => left.endsWith(` ${key} `))) return n;
  }
  if (/\bporciones?\s+$/.test(left)) return 1;
  return 1;
}

function sizeNear(text, start, end) {
  const window = ` ${text.slice(Math.max(0, start - 16), Math.min(text.length, end + 16))} `;
  return lookupWordValue(FOOD_SIZE, window.trim()) || 1;
}

function estimateFoodText(text) {
  const folded = foldFoodText(text);
  if (!folded) return { kcal: 0, items: [], unmatched: true };

  const used = Array.from(folded, () => false);
  const items = [];
  const ranked = FOOD_DB.flatMap((food) =>
    food.keys.map((key) => ({
      name: food.name,
      kcal: food.kcal,
      key: foldFoodText(key),
    }))
  ).sort((a, b) => b.key.length - a.key.length);

  ranked.forEach((food) => {
    if (!food.key) return;
    let from = 0;
    while (from <= folded.length - food.key.length) {
      const index = folded.indexOf(food.key, from);
      if (index < 0) break;
      const end = index + food.key.length;
      const spanFree = used.slice(index, end).every((flag) => !flag);
      if (spanFree && isWordBoundary(folded, index, end)) {
        for (let i = index; i < end; i += 1) used[i] = true;
        const qty = quantityBefore(folded, index);
        const size = sizeNear(folded, index, end);
        items.push({
          name: food.name,
          qty,
          kcal: Math.round(food.kcal * qty * size),
        });
      }
      from = index + food.key.length;
    }
  });

  const leftover = [];
  let token = "";
  for (let i = 0; i <= folded.length; i += 1) {
    const active = i < folded.length && !used[i] && /[a-z]/.test(folded[i]);
    if (active) {
      token += folded[i];
    } else if (token) {
      if (token.length > 2 && !FOOD_STOPWORDS.has(token)) leftover.push(token);
      token = "";
    }
  }

  const kcal = items.reduce((sum, item) => sum + item.kcal, 0);
  return {
    kcal,
    items,
    unmatched: items.length === 0,
    partial: items.length > 0 && leftover.length > items.length,
  };
}

function parseOptionalKcal(value) {
  if (value == null || String(value).trim() === "") return null;
  const n = Number(String(value).replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

function mealEnergy(entry) {
  if (entry.kcal != null) {
    return { kcal: entry.kcal, source: "manual", items: [], unmatched: false };
  }
  const estimated = estimateFoodText(entry.food);
  return { ...estimated, source: "estimate" };
}

function formatKcal(value) {
  return `${Math.round(value).toLocaleString("es-AR")} kcal`;
}

function mealsOnDate(date) {
  return getMealEntries().filter((entry) => entry.date === date);
}

function dayMealEnergy(date) {
  const meals = mealsOnDate(date);
  let kcal = 0;
  let unmatched = 0;
  meals.forEach((entry) => {
    const energy = mealEnergy(entry);
    if (energy.unmatched) unmatched += 1;
    else kcal += energy.kcal;
  });
  return { kcal, unmatched, count: meals.length };
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
      const kcal = parseOptionalKcal(entry.kcal);
      return {
        id:
          typeof entry.id === "string" && entry.id
            ? entry.id
            : `meal-${date}-${Math.random().toString(36).slice(2, 8)}`,
        date,
        type,
        food,
        ...(kcal != null ? { kcal } : {}),
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
      steps: normalizeSteps(parsed.steps),
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

function addMeal(date, type, food, kcal) {
  const trimmed = String(food || "").trim();
  if (!date || !trimmed) return;
  const mealType = MEAL_TYPES.some((item) => item.id === type) ? type : "extra";
  const next = {
    id: `meal-${Date.now()}`,
    date,
    type: mealType,
    food: trimmed,
  };
  const manual = parseOptionalKcal(kcal);
  if (manual != null) next.kcal = manual;
  state.session.meals.push(next);
  saveSession();
}

function removeMeal(id) {
  state.session.meals = state.session.meals.filter((entry) => entry.id !== id);
  saveSession();
}

function parseStepCount(value) {
  const n = Number(String(value).replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

function normalizeSteps(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const date = typeof entry.date === "string" ? entry.date : "";
      const steps = parseStepCount(entry.steps);
      if (!date || steps == null) return null;
      return { date, steps };
    })
    .filter(Boolean);
}

function getStepEntries() {
  return [...state.session.steps].sort((a, b) => b.date.localeCompare(a.date));
}

function getStepsForDate(date) {
  return (
    state.session.steps.find((entry) => entry.date === date)?.steps ?? 0
  );
}

function upsertSteps(date, steps) {
  const value = parseStepCount(steps);
  if (!date || value == null) return;

  const existing = state.session.steps.findIndex((entry) => entry.date === date);
  const next = { date, steps: value };
  if (existing >= 0) {
    state.session.steps[existing] = next;
  } else {
    state.session.steps.push(next);
  }
  saveSession();
}

function addTodaySteps(amount) {
  const date = todayIsoDate();
  upsertSteps(date, getStepsForDate(date) + amount);
}

function removeSteps(date) {
  state.session.steps = state.session.steps.filter(
    (entry) => entry.date !== date
  );
  saveSession();
}

function motionAvailable() {
  return typeof window.DeviceMotionEvent !== "undefined";
}

function motionNeedsPermission() {
  return (
    typeof DeviceMotionEvent !== "undefined" &&
    typeof DeviceMotionEvent.requestPermission === "function"
  );
}

function stepMagnitude(event) {
  const gravity = event.accelerationIncludingGravity;
  if (gravity && gravity.x != null) {
    return Math.hypot(gravity.x, gravity.y || 0, gravity.z || 0);
  }
  const acc = event.acceleration;
  if (acc && acc.x != null) {
    return Math.hypot(acc.x, acc.y || 0, acc.z || 0);
  }
  return null;
}

function onDeviceMotion(event) {
  const mag = stepMagnitude(event);
  if (mag == null) return;
  pedometer.gotSample = true;

  if (!pedometer.filtered) pedometer.filtered = mag;
  pedometer.filtered = pedometer.filtered * 0.82 + mag * 0.18;
  const delta = mag - pedometer.filtered;
  const now = performance.now();
  const isPeak = delta > STEP_PEAK_DELTA;
  if (
    isPeak &&
    !pedometer.lastPeak &&
    now - pedometer.lastStepAt > STEP_MIN_INTERVAL_MS
  ) {
    pedometer.lastStepAt = now;
    addTodaySteps(1);
    refreshStepsLiveUi();
  }
  pedometer.lastPeak = isPeak;
}

function attachMotion() {
  if (pedometer.listening) return;
  window.addEventListener("devicemotion", onDeviceMotion, { passive: true });
  pedometer.listening = true;
  pedometer.filtered = 0;
  pedometer.lastPeak = false;
  pedometer.gotSample = false;
  window.clearTimeout(pedometer.sampleTimer);
  pedometer.sampleTimer = window.setTimeout(() => {
    if (pedometer.wantRunning && !pedometer.gotSample) {
      stopPedometer(
        "No se detecta el acelerómetro. En el celular hay que dar permiso; si no, cargá los pasos a mano."
      );
    }
  }, 1800);
}

function detachMotion() {
  if (!pedometer.listening) return;
  window.removeEventListener("devicemotion", onDeviceMotion);
  pedometer.listening = false;
  window.clearTimeout(pedometer.sampleTimer);
}

async function requestWakeLock() {
  try {
    if (!("wakeLock" in navigator)) return;
    pedometer.wakeLock = await navigator.wakeLock.request("screen");
    pedometer.wakeLock.addEventListener("release", () => {
      if (pedometer.wantRunning && !document.hidden) {
        requestWakeLock();
      }
    });
  } catch {
    pedometer.wakeLock = null;
  }
}

function releaseWakeLock() {
  const lock = pedometer.wakeLock;
  pedometer.wakeLock = null;
  lock?.release?.().catch(() => {});
}

async function startPedometer() {
  if (!motionAvailable()) {
    setStepsHint(
      "Este navegador no expone el sensor de movimiento. Cargá los pasos a mano."
    );
    return;
  }

  try {
    if (motionNeedsPermission()) {
      const result = await DeviceMotionEvent.requestPermission();
      if (result !== "granted") {
        setStepsHint("Hace falta permiso de movimiento para contar pasos.");
        return;
      }
    }
  } catch {
    setStepsHint("No se pudo activar el sensor. Cargá los pasos a mano.");
    return;
  }

  pedometer.wantRunning = true;
  attachMotion();
  await requestWakeLock();
  setStepsHint("Contando con el teléfono. Dejá la app abierta.");
  refreshStepsLiveUi();
}

function stopPedometer(message) {
  pedometer.wantRunning = false;
  detachMotion();
  releaseWakeLock();
  setStepsHint(message || "Pausado. El total del día queda guardado.");
  refreshStepsLiveUi();
}

function setStepsHint(text) {
  const hint = document.getElementById("steps-hint");
  if (hint) hint.textContent = text;
}

function formatStepCount(value) {
  return Number(value || 0).toLocaleString("es-AR");
}

function refreshStepsLiveUi() {
  const today = todayIsoDate();
  const steps = getStepsForDate(today);
  const value = document.getElementById("steps-summary-value");
  const date = document.getElementById("steps-summary-date");
  const toggle = document.getElementById("steps-toggle");
  const userBtn = document.getElementById("nav-user");

  if (value) {
    value.innerHTML = `${formatStepCount(steps)}<span>pasos</span>`;
  }
  if (date) date.textContent = formatDisplayDate(today);
  if (toggle) {
    toggle.textContent = pedometer.wantRunning ? "Pausar" : "Iniciar conteo";
    toggle.setAttribute("aria-pressed", String(pedometer.wantRunning));
    toggle.classList.toggle("is-active", pedometer.wantRunning);
  }
  userBtn?.classList.toggle("is-counting", pedometer.wantRunning);

  window.clearTimeout(pedometer.uiTimer);
  pedometer.uiTimer = window.setTimeout(() => {
    if (!document.getElementById("steps-list")) return;
    renderStepsList();
    renderStepsChart();
  }, 700);
}

function setupPedometerUi() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      detachMotion();
      releaseWakeLock();
      return;
    }
    if (!pedometer.wantRunning) return;
    attachMotion();
    requestWakeLock();
  });
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

function formatChartTick(value, integer) {
  if (integer) return Math.round(value).toLocaleString("es-AR");
  return value % 1 === 0 ? String(Math.round(value)) : value.toFixed(1);
}

function isoDateToUtcMs(isoDate) {
  const [y, m, d] = String(isoDate).split("-").map(Number);
  if (!y || !m || !d) return NaN;
  return Date.UTC(y, m - 1, d);
}

/** Catmull-Rom → cubic Bézier; lower tension = more elastic curve. */
function smoothLinePath(points, tension = 4.5) {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)} L${points[1][0].toFixed(1)} ${points[1][1].toFixed(1)}`;
  }

  let d = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / tension;
    const cp1y = p1[1] + (p2[1] - p0[1]) / tension;
    const cp2x = p2[0] - (p3[0] - p1[0]) / tension;
    const cp2y = p2[1] - (p3[1] - p1[1]) / tension;
    d += ` C${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function renderTrendChart(host, entries, options = {}) {
  if (!host) return;

  const {
    emptyOne = "Cargá otro valor para ver la evolución.",
    emptyNone = "El gráfico aparece con al menos dos registros.",
    ariaLabel = "Evolución",
    integer = false,
  } = options;

  host.innerHTML = "";
  host.classList.toggle("is-empty", entries.length < 2);

  if (entries.length < 2) {
    const empty = document.createElement("p");
    empty.className = "weight-chart__empty";
    empty.textContent = entries.length ? emptyOne : emptyNone;
    host.appendChild(empty);
    return;
  }

  const width = 320;
  const height = 176;
  const pad = { top: 18, right: 16, bottom: 30, left: integer ? 52 : 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const values = entries.map((entry) => entry.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const yMin = min - span * 0.15;
  const yMax = max + span * 0.15;
  const ySpan = yMax - yMin;

  const times = entries.map((entry) => isoDateToUtcMs(entry.date));
  const tMin = times[0];
  const tMax = times[times.length - 1];
  const tSpan = tMax - tMin || 1;

  const xAt = (index) => pad.left + ((times[index] - tMin) / tSpan) * innerW;
  const yAt = (value) =>
    pad.top + (1 - (value - yMin) / ySpan) * innerH;

  const points = entries.map((entry, index) => [xAt(index), yAt(entry.value)]);
  const lineD = smoothLinePath(points);
  const areaD = `${lineD} L${points[points.length - 1][0].toFixed(1)} ${(pad.top + innerH).toFixed(1)} L${points[0][0].toFixed(1)} ${(pad.top + innerH).toFixed(1)} Z`;

  const svg = svgEl("svg", {
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": ariaLabel,
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
    label.textContent = formatChartTick(tick, integer);
    svg.appendChild(label);
  });

  const midTime = tMin + tSpan / 2;
  let midIndex = 0;
  let midDist = Infinity;
  times.forEach((time, index) => {
    const dist = Math.abs(time - midTime);
    if (dist < midDist) {
      midDist = dist;
      midIndex = index;
    }
  });
  const xIndexes = [0, midIndex, entries.length - 1].filter(
    (value, index, all) => all.indexOf(value) === index
  );

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

function renderWeightChart() {
  const host = document.getElementById("weight-chart");
  const entries = getChartEntries().map((entry) => ({
    date: entry.date,
    value: entry.weight,
  }));
  renderTrendChart(host, entries, {
    emptyOne: "Cargá otro peso para ver la evolución.",
    emptyNone: "El gráfico aparece con al menos dos registros.",
    ariaLabel: entries.length
      ? `Evolución de peso de ${entries[0].value} kg a ${entries[entries.length - 1].value} kg`
      : "Gráfico de peso",
  });
}

function renderStepsChart() {
  const host = document.getElementById("steps-chart");
  const entries = [...getStepEntries()]
    .reverse()
    .map((entry) => ({ date: entry.date, value: entry.steps }));
  renderTrendChart(host, entries, {
    emptyOne: "Cargá otro día para ver la evolución.",
    emptyNone: "El gráfico aparece con al menos dos días.",
    ariaLabel: entries.length
      ? `Evolución de pasos de ${entries[0].value} a ${entries[entries.length - 1].value}`
      : "Gráfico de pasos",
    integer: true,
  });
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
  renderMealDaySummary();

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

    const energy = mealEnergy(entry);
    const kcal = document.createElement("span");
    kcal.className = "meal-list__kcal";
    kcal.textContent = energy.unmatched
      ? "sin est."
      : energy.source === "manual"
        ? formatKcal(energy.kcal)
        : `~${formatKcal(energy.kcal)}`;

    meta.append(type, date, kcal);

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

function renderMealDaySummary() {
  const value = document.getElementById("meal-summary-value");
  const dateEl = document.getElementById("meal-summary-date");
  if (!value || !dateEl) return;

  const date = document.getElementById("meal-date")?.value || todayIsoDate();
  const day = dayMealEnergy(date);
  if (!day.count) {
    value.innerHTML = `—<span>kcal</span>`;
    dateEl.textContent = "Sin comidas en este día";
    return;
  }
  value.innerHTML = `${Math.round(day.kcal).toLocaleString("es-AR")}<span>kcal</span>`;
  dateEl.textContent = day.unmatched
    ? `${formatDisplayDate(date)} · estimado · ${day.unmatched} sin reconocer`
    : `${formatDisplayDate(date)} · estimado`;
}

function updateMealEstimatePreview() {
  const preview = document.getElementById("meal-estimate");
  if (!preview) return;
  const food = document.getElementById("meal-food")?.value;
  const manual = parseOptionalKcal(document.getElementById("meal-kcal")?.value);
  if (manual != null) {
    preview.textContent = `${formatKcal(manual)} (manual)`;
    return;
  }
  if (!String(food || "").trim()) {
    preview.textContent = "La estimación aparece al escribir la comida.";
    return;
  }
  const estimated = estimateFoodText(food);
  if (estimated.unmatched) {
    preview.textContent = "No se reconoció. Completá las kcal a mano.";
    return;
  }
  const detail = estimated.items
    .map((item) => (item.qty > 1 ? `${item.name} ×${item.qty}` : item.name))
    .join(", ");
  preview.textContent = `~${formatKcal(estimated.kcal)} · ${detail}`;
}

function renderWeightPanel() {
  const main = document.getElementById("day-content");
  if (!main) return;

  main.innerHTML = `
    <div class="weight-view weight-view--docked">
      <div class="weight-view__scroll">
        <section class="weight-summary" aria-live="polite">
          <p class="weight-summary__label">Último peso</p>
          <p class="weight-summary__value" id="weight-summary-value">—<span>kg</span></p>
          <p class="weight-summary__date" id="weight-summary-date">Sin registros todavía</p>
        </section>

        <section class="weight-chart" id="weight-chart" aria-label="Gráfico de peso"></section>

        <section class="weight-history">
          <h3 class="weight-history__title">Historial</h3>
          <ul class="weight-list" id="weight-list"></ul>
          <p class="weight-empty" id="weight-empty" hidden>
            Todavía no hay registros. Podés cargar fechas pasadas.
          </p>
        </section>
      </div>

      <form class="weight-form weight-form--dock" id="weight-form">
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
      <section class="weight-summary" aria-live="polite">
        <p class="weight-summary__label">Calorías del día</p>
        <p class="weight-summary__value" id="meal-summary-value">—<span>kcal</span></p>
        <p class="weight-summary__date" id="meal-summary-date">Sin comidas en este día</p>
      </section>

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
            maxlength="240"
            autocomplete="off"
            placeholder="Ej: dos milanesas, arroz y ensalada"
            required
          />
        </label>
        <label class="weight-form__field">
          <span>Kcal (opcional)</span>
          <input
            type="number"
            name="kcal"
            id="meal-kcal"
            inputmode="numeric"
            min="0"
            step="1"
            placeholder="auto"
          />
        </label>
        <p class="meal-estimate" id="meal-estimate">La estimación aparece al escribir la comida.</p>
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
  const kcalInput = document.getElementById("meal-kcal");
  const form = document.getElementById("meal-form");

  if (dateInput) dateInput.value = todayIsoDate();
  dateInput?.addEventListener("change", renderMealDaySummary);
  foodInput?.addEventListener("input", updateMealEstimatePreview);
  kcalInput?.addEventListener("input", updateMealEstimatePreview);

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const date = dateInput?.value;
    const type = typeInput?.value;
    const food = foodInput?.value;
    if (!date || !food) return;

    addMeal(date, type, food, kcalInput?.value);
    renderMealList();
    if (foodInput) {
      foodInput.value = "";
      foodInput.focus();
    }
    if (kcalInput) kcalInput.value = "";
    updateMealEstimatePreview();
  });

  renderMealList();
  updateMealEstimatePreview();
  requestAnimationFrame(() => foodInput?.focus());
}

function renderStepsList() {
  const list = document.getElementById("steps-list");
  const empty = document.getElementById("steps-empty");
  if (!list || !empty) return;

  const entries = getStepEntries();
  list.innerHTML = "";
  empty.hidden = entries.length > 0;

  entries.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "weight-list__item";

    const date = document.createElement("span");
    date.className = "weight-list__date";
    date.textContent = formatDisplayDate(entry.date);

    const steps = document.createElement("span");
    steps.className = "weight-list__weight";
    steps.textContent = `${formatStepCount(entry.steps)} pasos`;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "weight-list__delete";
    removeBtn.setAttribute(
      "aria-label",
      `Eliminar pasos del ${formatDisplayDate(entry.date)}`
    );
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      removeSteps(entry.date);
      renderStepsChart();
      renderStepsList();
      refreshStepsLiveUi();
    });

    item.append(date, steps, removeBtn);
    list.appendChild(item);
  });
}

function renderStepsPanel() {
  const main = document.getElementById("day-content");
  if (!main) return;

  const today = todayIsoDate();
  const todaySteps = getStepsForDate(today);
  const running = pedometer.wantRunning;

  main.innerHTML = `
    <div class="weight-view">
      <section class="weight-summary" aria-live="polite">
        <p class="weight-summary__label">Hoy</p>
        <p class="weight-summary__value" id="steps-summary-value">${formatStepCount(todaySteps)}<span>pasos</span></p>
        <p class="weight-summary__date" id="steps-summary-date">${formatDisplayDate(today)}</p>
      </section>

      <div class="steps-controls">
        <button
          type="button"
          class="steps-toggle${running ? " is-active" : ""}"
          id="steps-toggle"
          aria-pressed="${running}"
        >${running ? "Pausar" : "Iniciar conteo"}</button>
        <p class="steps-hint" id="steps-hint">${
          running
            ? "Contando con el teléfono. Dejá la app abierta."
            : "Cuenta mientras la app está abierta. También podés guardar el total del día a mano."
        }</p>
      </div>

      <section class="weight-chart" id="steps-chart" aria-label="Gráfico de pasos"></section>

      <form class="weight-form" id="steps-form">
        <label class="weight-form__field">
          <span>Fecha</span>
          <input type="date" name="date" id="steps-date" required />
        </label>
        <label class="weight-form__field">
          <span>Pasos</span>
          <input
            type="number"
            name="steps"
            id="steps-value"
            inputmode="numeric"
            min="0"
            step="1"
            placeholder="8000"
            required
          />
        </label>
        <button type="submit" class="weight-form__submit">Guardar</button>
      </form>

      <section class="weight-history">
        <h3 class="weight-history__title">Historial</h3>
        <ul class="weight-list" id="steps-list"></ul>
        <p class="weight-empty" id="steps-empty" hidden>
          Todavía no hay pasos. Iniciá el conteo o cargá un día a mano.
        </p>
      </section>
    </div>
  `;

  const dateInput = document.getElementById("steps-date");
  const stepsInput = document.getElementById("steps-value");
  const form = document.getElementById("steps-form");
  const toggle = document.getElementById("steps-toggle");

  if (dateInput) dateInput.value = today;
  if (stepsInput && todaySteps) stepsInput.value = String(todaySteps);

  toggle?.addEventListener("click", () => {
    if (pedometer.wantRunning) stopPedometer();
    else startPedometer();
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const date = dateInput?.value;
    const steps = stepsInput?.value;
    if (!date || steps === "" || steps == null) return;
    upsertSteps(date, steps);
    renderStepsChart();
    renderStepsList();
    refreshStepsLiveUi();
    stepsInput?.blur();
  });

  renderStepsChart();
  renderStepsList();
}

function renderTrackerView() {
  const rail = document.getElementById("exercise-rail");
  if (rail) rail.innerHTML = "";

  if (state.trackerTab === "meals") {
    renderMealsPanel();
    return;
  }
  if (state.trackerTab === "steps") {
    renderStepsPanel();
    return;
  }
  renderWeightPanel();
}

function setupDockNav() {
  const userBtn = document.getElementById("nav-user");
  const routineBtn = document.getElementById("nav-routine");

  userBtn?.addEventListener("click", () => {
    if (state.view !== "weight") setView("weight");
  });

  routineBtn?.addEventListener("click", () => {
    if (state.view !== "routine") setView("routine");
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

function getTimerSeconds(exercise) {
  const rx = getPrescription(exercise);
  if (rx.durationSeconds != null) return rx.durationSeconds;
  if (rx.durationMinutes != null) return rx.durationMinutes * 60;
  return null;
}

function formatTimerSeconds(total) {
  return String(total);
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

let scrollSpyRaf = 0;
let scrollSpyLockToken = 0;
let scrollSpyLockedUntil = 0;
let scrollAnimFrame = 0;

function ensureRailThumbVisible(thumb) {
  const rail = document.getElementById("exercise-rail");
  if (!rail || !thumb) return;

  const railRect = rail.getBoundingClientRect();
  const thumbRect = thumb.getBoundingClientRect();
  const pad = 8;

  if (thumbRect.top < railRect.top + pad) {
    rail.scrollTop += thumbRect.top - railRect.top - pad;
  } else if (thumbRect.bottom > railRect.bottom - pad) {
    rail.scrollTop += thumbRect.bottom - railRect.bottom + pad;
  }
}

function setActiveRailThumb(exerciseId, { ensureVisible = false } = {}) {
  if (!exerciseId) return;

  const current = document.querySelector(".rail__thumb.is-active");
  if (current?.dataset.exerciseId === exerciseId) {
    if (ensureVisible) ensureRailThumbVisible(current);
    return;
  }

  document
    .querySelectorAll(".rail__thumb.is-active")
    .forEach((el) => el.classList.remove("is-active"));

  const thumb = document.querySelector(
    `.rail__thumb[data-exercise-id="${exerciseId}"]`
  );
  if (!thumb) return;

  thumb.classList.add("is-active");
  if (ensureVisible) ensureRailThumbVisible(thumb);
}

function updateScrollSpy() {
  if (state.view === "weight") return;
  if (performance.now() < scrollSpyLockedUntil) return;

  const main = document.getElementById("day-content");
  if (!main) return;

  const cards = [...main.querySelectorAll(".card[id]")];
  if (!cards.length) {
    document
      .querySelectorAll(".rail__thumb.is-active")
      .forEach((el) => el.classList.remove("is-active"));
    return;
  }

  const mainRect = main.getBoundingClientRect();
  const marker = mainRect.top + Math.min(96, mainRect.height * 0.28);
  let activeId = cards[0].id;

  for (const card of cards) {
    const rect = card.getBoundingClientRect();
    if (rect.top <= marker) activeId = card.id;
    else break;
  }

  if (main.scrollTop + main.clientHeight >= main.scrollHeight - 8) {
    activeId = cards[cards.length - 1].id;
  }

  setActiveRailThumb(activeId, { ensureVisible: true });
}

function scheduleScrollSpy() {
  if (scrollSpyRaf) return;
  scrollSpyRaf = window.requestAnimationFrame(() => {
    scrollSpyRaf = 0;
    updateScrollSpy();
  });
}

function lockScrollSpy(ms = SCROLL_SPY_LOCK_MS) {
  scrollSpyLockToken += 1;
  const token = scrollSpyLockToken;
  scrollSpyLockedUntil = performance.now() + ms;
  window.setTimeout(() => {
    if (token !== scrollSpyLockToken) return;
    scrollSpyLockedUntil = 0;
    updateScrollSpy();
  }, ms);
}

function attachScrollSpy() {
  const main = document.getElementById("day-content");
  if (!main || main.dataset.scrollSpyAttached === "1") return;
  main.dataset.scrollSpyAttached = "1";
  main.addEventListener("scroll", scheduleScrollSpy, { passive: true });
}

function cancelScrollAnimation() {
  if (!scrollAnimFrame) return;
  window.cancelAnimationFrame(scrollAnimFrame);
  scrollAnimFrame = 0;
}

function animateScrollTo(container, top, duration = SCROLL_ANIM_MS) {
  cancelScrollAnimation();

  const from = container.scrollTop;
  const distance = top - from;
  if (Math.abs(distance) < 2) return;

  const prevBehavior = container.style.scrollBehavior;
  container.style.scrollBehavior = "auto";
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - progress) ** 3;
    container.scrollTop = from + distance * eased;
    if (progress < 1) {
      scrollAnimFrame = window.requestAnimationFrame(step);
      return;
    }
    scrollAnimFrame = 0;
    container.style.scrollBehavior = prevBehavior;
  };

  scrollAnimFrame = window.requestAnimationFrame(step);
}

function scrollToExercise(exerciseId) {
  const card = document.getElementById(exerciseId);
  const main = document.getElementById("day-content");
  if (!card || !main) return;

  document
    .querySelectorAll(".card.is-flash")
    .forEach((el) => el.classList.remove("is-flash"));

  setActiveRailThumb(exerciseId, { ensureVisible: true });
  lockScrollSpy(SCROLL_ANIM_MS + 80);

  const mainRect = main.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const top = Math.max(0, main.scrollTop + (cardRect.top - mainRect.top) - 8);

  animateScrollTo(main, top);
  card.classList.add("is-flash");
  window.setTimeout(() => card.classList.remove("is-flash"), 700);
}

function onRailClick(exercise) {
  const nextMode = isDone(exercise.id) ? "done" : "active";

  if (state.listMode !== nextMode) {
    state.listMode = nextMode;
    renderDay();
    renderRail();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToExercise(exercise.id));
    });
    return;
  }

  scrollToExercise(exercise.id);
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
  if (!nav) return;
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
  let holdTimer = 0;
  let countdownTimer = 0;
  let remaining = 0;
  let totalSeconds = 0;
  let timing = false;
  let overlay = null;
  let overlayFill = null;
  let overlayValue = null;

  const clearHold = () => {
    if (!holdTimer) return;
    window.clearTimeout(holdTimer);
    holdTimer = 0;
  };

  const clearCountdown = () => {
    if (!countdownTimer) return;
    window.clearInterval(countdownTimer);
    countdownTimer = 0;
  };

  const resetTransform = () => {
    card.classList.remove("is-swiping");
    card.style.transform = "";
    card.style.opacity = "";
  };

  const ensureOverlay = () => {
    if (overlay) return overlay;
    const media = card.querySelector(".card__media");
    if (!media) return null;

    overlay = document.createElement("div");
    overlay.className = "card__timer";
    overlay.setAttribute("aria-live", "polite");
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="card__timer-fill" aria-hidden="true"></div>
      <p class="card__timer-value"></p>
    `;
    overlayFill = overlay.querySelector(".card__timer-fill");
    overlayValue = overlay.querySelector(".card__timer-value");
    media.appendChild(overlay);
    return overlay;
  };

  const paintTimer = () => {
    if (!overlay || !overlayFill || !overlayValue) return;
    overlayValue.textContent = formatTimerSeconds(remaining);
    const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
    overlayFill.style.transform = `scaleY(${progress})`;
  };

  const stopTimer = () => {
    clearCountdown();
    timing = false;
    remaining = 0;
    totalSeconds = 0;
    card.classList.remove("is-timing");
    if (overlay) {
      overlay.hidden = true;
      overlayFill.style.transform = "scaleY(1)";
    }
  };

  const finishTimer = () => {
    clearCountdown();
    if (typeof navigator.vibrate === "function") {
      navigator.vibrate([20, 40, 20]);
    }
    window.setTimeout(() => {
      if (!timing) return;
      stopTimer();
    }, 320);
  };

  const tickTimer = () => {
    if (!card.isConnected) {
      stopTimer();
      return;
    }
    remaining -= 1;
    if (remaining <= 0) {
      remaining = 0;
      paintTimer();
      finishTimer();
      return;
    }
    paintTimer();
  };

  const startTimer = () => {
    const seconds = getTimerSeconds(exercise);
    if (seconds == null || timing) return;
    if (!ensureOverlay()) return;

    clearHold();
    tracking = false;
    axis = null;
    resetTransform();
    card.classList.remove("is-swipe-hint");

    timing = true;
    totalSeconds = seconds;
    remaining = seconds;
    card.classList.add("is-timing");
    overlay.hidden = false;
    paintTimer();

    if (typeof navigator.vibrate === "function") {
      navigator.vibrate(18);
    }

    clearCountdown();
    countdownTimer = window.setInterval(tickTimer, 1000);
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
    if (timing) return;

    tracking = true;
    axis = null;
    startX = event.clientX;
    startY = event.clientY;
    card.classList.add("is-swiping");
    clearHold();

    if (getTimerSeconds(exercise) != null) {
      holdTimer = window.setTimeout(() => {
        holdTimer = 0;
        startTimer();
      }, CARD_TIMER_HOLD_MS);
    }

    try {
      card.setPointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  });

  card.addEventListener("pointermove", (event) => {
    if (!tracking || timing) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    const distance = Math.hypot(dx, dy);

    if (distance > CARD_TIMER_MOVE_CANCEL_PX) clearHold();

    if (axis === null) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      axis = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
      if (axis === "v") {
        tracking = false;
        clearHold();
        resetTransform();
        return;
      }
    }

    if (axis !== "h") return;
    clearHold();
    event.preventDefault();
    const drag = Math.max(-140, Math.min(140, dx));
    card.style.transform = `translateX(${drag}px)`;
    card.style.opacity = String(1 - Math.min(0.35, Math.abs(drag) / 280));
    card.classList.toggle("is-swipe-hint", Math.abs(drag) > SWIPE_THRESHOLD / 2);
  });

  const endPointer = (event) => {
    clearHold();
    if (!tracking || timing) {
      tracking = false;
      return;
    }
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

  requestAnimationFrame(updateScrollSpy);
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
  const userBtn = document.getElementById("nav-user");
  const routineBtn = document.getElementById("nav-routine");
  const onWeight = state.view === "weight";

  app?.setAttribute("data-view", state.view);
  userBtn?.classList.toggle("is-active", onWeight);
  userBtn?.classList.toggle("is-counting", pedometer.wantRunning);
  routineBtn?.classList.toggle("is-active", !onWeight);
  if (onWeight) {
    userBtn?.setAttribute("aria-current", "page");
    routineBtn?.removeAttribute("aria-current");
  } else {
    routineBtn?.setAttribute("aria-current", "page");
    userBtn?.removeAttribute("aria-current");
  }

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
  setupDockNav();
  setupAddExerciseUi();
  setupPedometerUi();
  attachScrollSpy();

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
