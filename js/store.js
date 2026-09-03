/** 数据层 zhiji_v3 */
import { STORAGE_KEY, STORAGE_BROKEN, LEGACY_KEY, OVERRIDE_SCORE, WATER_MAP, EXERCISES } from "./constants.js";
import { todayKey, toast } from "./utils.js";

function emptyStore() {
  return { version: 3, days: {}, audioMeta: [] };
}

export let store = emptyStore();

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      migrateFromV2();
      return store;
    }
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("bad");
    store = {
      version: 3,
      days: data.days && typeof data.days === "object" ? data.days : {},
      audioMeta: Array.isArray(data.audioMeta) ? data.audioMeta : [],
    };
    return store;
  } catch (e) {
    try {
      const broken = localStorage.getItem(STORAGE_KEY);
      if (broken) localStorage.setItem(STORAGE_BROKEN, broken);
    } catch (_) {}
    store = emptyStore();
    saveStore();
    toast("记录读不出来，已为你开了空白手记。可到设置导入备份");
    return store;
  }
}

function migrateFromV2() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) {
      store = emptyStore();
      saveStore();
      return;
    }
    const v2 = JSON.parse(raw);
    store = emptyStore();
    // 宽松迁移：若 v2 是按日字典
    const days = v2?.days || v2;
    if (days && typeof days === "object") {
      for (const [k, day] of Object.entries(days)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !day || typeof day !== "object") continue;
        const out = {};
        if (day.sleep || day.bedtime || day.wake) {
          out.sleep = {
            bed: day.sleep?.bed || day.bedtime || "",
            wake: day.sleep?.wake || day.wake || "",
            wakes: String(day.sleep?.wakes ?? day.wakes ?? "0"),
            dream: day.sleep?.dream || day.dream || "无",
            systemScore: day.sleep?.systemScore ?? null,
            systemLevel: day.sleep?.systemLevel ?? null,
            override: day.sleep?.override ?? null,
          };
        }
        if (day.mood || day.emotion) {
          out.mood = {
            label: day.mood?.label || day.emotion || "",
            body: day.mood?.body || "",
            words: day.mood?.words || "",
          };
        }
        if (day.weight != null || day.diet || day.checkin) {
          out.checkin = day.checkin || {
            weight: day.weight ?? "",
            note: day.note || "",
            water_ml: day.diet?.water_ml ?? 0,
          };
        }
        if (Object.keys(out).length) store.days[k] = out;
      }
    }
    saveStore();
  } catch (_) {
    store = emptyStore();
    saveStore();
  }
}

export function saveStore() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function dayOf(key = todayKey()) {
  if (!store.days[key]) store.days[key] = {};
  return store.days[key];
}

export function getDay(key = todayKey()) {
  return store.days[key] || {};
}

export function displaySleepScore(sleep) {
  if (!sleep) return null;
  if (sleep.override && OVERRIDE_SCORE[sleep.override] != null) return OVERRIDE_SCORE[sleep.override];
  if (sleep.systemScore != null) return sleep.systemScore;
  return null;
}

export function displaySleepLevel(sleep) {
  if (!sleep) return null;
  if (sleep.override) return sleep.override;
  return sleep.systemLevel || null;
}

export function healthScore(key = todayKey()) {
  const d = getDay(key);
  const hasAny = !!(d.sleep || d.checkin || d.mood || (d.exercise && Object.keys(d.exercise).length));
  if (!hasAny) return 0;

  const sleep = d.sleep;
  const show = displaySleepScore(sleep);
  const sleepContrib = show != null ? show : 0;
  const exerciseContrib = d.exercise && Object.keys(d.exercise).some((k) => d.exercise[k]?.value != null) ? 100 : 0;
  const moodContrib = d.mood?.label ? 100 : 0;
  const checkinContrib = d.checkin ? 100 : 0;

  return Math.round(
    0.4 * sleepContrib + 0.25 * exerciseContrib + 0.2 * moodContrib + 0.15 * checkinContrib
  );
}

export function exerciseStreak(id) {
  let n = 0;
  for (const day of Object.values(store.days)) {
    if (day.exercise?.[id]?.value != null) n += 1;
  }
  return n;
}

export function exerciseRecent(id, days = 7) {
  const keys = Object.keys(store.days).sort().reverse();
  const out = [];
  const today = todayKey();
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = todayKey(d);
    const v = store.days[k]?.exercise?.[id];
    if (v?.value != null) out.push({ date: k, value: v.value, unit: v.unit });
  }
  return out;
}

export function hasAnyHistory() {
  return Object.keys(store.days).some((k) => {
    const d = store.days[k];
    return d.sleep || d.checkin || d.mood || (d.exercise && Object.keys(d.exercise).length);
  });
}

export function dayHasData(key) {
  const d = store.days[key];
  if (!d) return false;
  return !!(d.sleep || d.checkin || d.mood || (d.exercise && Object.keys(d.exercise).length));
}

export function waterMl(checkin) {
  if (!checkin) return 0;
  if (checkin.water_ml != null) return checkin.water_ml;
  if (checkin.water && WATER_MAP[checkin.water] != null) return WATER_MAP[checkin.water];
  return 0;
}

export function clearAll() {
  store = emptyStore();
  saveStore();
}

export function importData(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("format");
  const days = obj.days && typeof obj.days === "object" ? obj.days : null;
  if (!days && !obj.version) {
    // 允许纯 days 字典
    const maybeDays = obj;
    const keys = Object.keys(maybeDays);
    if (!keys.length || !keys.every((k) => /^\d{4}-\d{2}-\d{2}$/.test(k))) throw new Error("format");
    store = { version: 3, days: maybeDays, audioMeta: [] };
  } else {
    store = {
      version: 3,
      days: days || {},
      audioMeta: Array.isArray(obj.audioMeta) ? obj.audioMeta : [],
    };
  }
  saveStore();
}

export function exportPayload() {
  return { version: 3, days: store.days, audioMeta: store.audioMeta, exerciseCatalog: EXERCISES.map((e) => e.id) };
}
