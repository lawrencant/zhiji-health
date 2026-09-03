/** 常量与文案 — 对齐 PRD V1.1.2 */

export const STORAGE_KEY = "zhiji_v3";
export const STORAGE_BROKEN = "zhiji_v3_broken";
export const LEGACY_KEY = "zhiji_v2";
export const AUDIO_DB = "zhiji_audio";

/** 空心太阳：无填充，弯弯光线，柔软线稿 */
export const ICON_SUN = `<svg class="ico-mood" viewBox="0 0 32 32" width="16" height="16" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="5.2" stroke="currentColor" stroke-width="1.55"/><path d="M14.1 5.6c1.3-1.15 2.5-1.15 3.8 0" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"/><path d="M23.6 8.8c1.35.55 1.85 1.55 1.35 2.95" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"/><path d="M26.4 14.2c1.15 1.25 1.15 2.45 0 3.7" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"/><path d="M23.6 23.2c-.55 1.35-1.55 1.85-2.95 1.35" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"/><path d="M17.9 26.4c-1.25 1.15-2.45 1.15-3.7 0" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"/><path d="M8.8 23.6c-1.35-.55-1.85-1.55-1.35-2.95" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"/><path d="M5.6 17.9c-1.15-1.25-1.15-2.45 0-3.7" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"/><path d="M8.8 8.8c.55-1.35 1.55-1.85 2.95-1.35" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"/></svg>`;

const moodIcon = (inner) =>
  `<svg class="ico-mood" viewBox="0 0 32 32" width="16" height="16" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

/** 空心线稿情绪图标（与太阳/云同一风格） */
export const ICON_LEAF = moodIcon(
  `<path d="M16 26.2V14.5" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/><path d="M16 15.2c-3.8-1.2-6.6-4.2-7.2-8.2 4.2.2 7.6 2.4 9.2 5.8" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 15.2c3.8-1.2 6.6-4.2 7.2-8.2-4.2.2-7.6 2.4-9.2 5.8" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/>`
);
export const ICON_CLOUD = moodIcon(
  `<path d="M10.2 21.5h12.2c2.4 0 4.3-1.9 4.3-4.2 0-2.2-1.7-4-3.9-4.2-.6-3.1-3.4-5.4-6.7-5.4-2.8 0-5.2 1.6-6.3 4-2.4.3-4.2 2.3-4.2 4.8 0 2.7 2.2 5 5 5z" stroke="currentColor" stroke-width="1.55" stroke-linejoin="round"/>`
);
export const ICON_WAVE = moodIcon(
  `<path d="M5.5 16.5c2.2-3.2 3.8-3.2 6 0s3.8 3.2 6 0 3.8-3.2 6 0" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 21c2.2-3.2 3.8-3.2 6 0s3.8 3.2 6 0 3.8-3.2 6 0" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>`
);
export const ICON_FLAME = moodIcon(
  `<path d="M16 26c4.2 0 7.2-3 7.2-7.1 0-3.6-2.2-5.8-4.2-7.6-.5-.5-1.2-.1-1.1.6.3 2.1-.4 3.4-1.7 3.4-1.8 0-2.6-2.5-2.2-5.3.1-.8-.7-1.3-1.3-.8C10.2 11 8.8 14 8.8 18.2 8.8 22.6 11.7 26 16 26z" stroke="currentColor" stroke-width="1.55" stroke-linejoin="round"/>`
);
export const ICON_MOON = moodIcon(
  `<path d="M19.8 8.2A8.4 8.4 0 1 0 23.6 18c-4.2-.4-7.5-3.9-7.5-8.2 0-.7.1-1.4.2-2 .1-.6.7-.9 1.2-.6 0 0 1.4.7 2.3 1z" stroke="currentColor" stroke-width="1.55" stroke-linejoin="round"/>`
);
export const ICON_SPROUT = moodIcon(
  `<path d="M16 26.2V14.8" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/><path d="M16 16.2c-3.6-1.4-6-4.4-6.4-7.8 3.8.4 6.8 2.8 8 5.8" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 15.4c2.6-.6 4.6-2.2 5.6-4.4-2.2.6-4 2-5.2 3.6" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.5 26.2h9" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/>`
);
export const ICON_STAR = moodIcon(
  `<path d="M16 6.2l1.9 6.2h6.5l-5.2 3.9 1.9 6.2L16 18.8l-5.1 3.7 1.9-6.2-5.2-3.9h6.5L16 6.2z" stroke="currentColor" stroke-width="1.55" stroke-linejoin="round"/>`
);

export const EXERCISES = [
  { id: "jingang", group: "常规", name: "金刚蹲", unit: "分钟", goal: 2 },
  { id: "plank", group: "常规", name: "平板支撑", unit: "秒", goal: 60 },
  { id: "bridge", group: "常规", name: "臀桥", unit: "次", goal: 30 },
  { id: "squat", group: "常规", name: "深蹲", unit: "次", goal: 40 },
  { id: "jumping", group: "常规", name: "开合跳", unit: "次", goal: 30 },
  { id: "zhan", group: "静修", name: "站桩", unit: "分钟", goal: 10 },
  { id: "baduanjin", group: "静修", name: "八段锦", unit: "分钟", goal: 12 },
  { id: "meditate", group: "静修", name: "冥想", unit: "分钟", goal: 10 },
];

export const MOODS = [
  { id: "joy", label: "开心愉悦", color: "var(--mood-joy)", icon: ICON_SUN, hug: "这份好心情值得被记住。让身体里的暖再多留一会儿。", q1: "现在身体哪一处是松的或暖的？", q2: "想对这份心情说一句什么？" },
  { id: "calm", label: "平静放松", color: "var(--mood-calm)", icon: ICON_LEAF, hug: "平静本身就是一种力量。你可以慢慢待在这种安定里。", q1: "呼吸、肩膀、肚子，哪里最稳？", q2: "想让这份安定听到一句什么？" },
  { id: "sad", label: "低落难过", color: "var(--mood-sad)", icon: ICON_CLOUD, hug: "难过可以待着，不必马上好起来。我在这儿陪你。", q1: "难过或发沉停在身体的哪？", q2: "想对它说：我看见你了——后面还可以补半句" },
  { id: "anxiety", label: "焦虑紧张", color: "var(--mood-anxiety)", icon: ICON_WAVE, hug: "先把肩膀放下来。你已经在面对了，这一刻这样就好。", q1: "胸口、肚子、手、牙关，哪里最紧？", q2: "想对这份紧说一句什么才能让它松一点？" },
  { id: "anger", label: "愤怒烦躁", color: "var(--mood-anger)", icon: ICON_FLAME, hug: "怒气往往是界限被碰到了。先站稳，再决定下一步。", q1: "热或力出现在哪（头、胸、拳）？", q2: "想对愤怒说：你在保护什么？" },
  { id: "tired", label: "疲惫无力", color: "var(--mood-tired)", icon: ICON_MOON, hug: "累了就允许自己慢一点。休息不是偷懒，是在回血。", q1: "眼皮、四肢、后背，哪里最沉？", q2: "身体现在最需要听到一句什么？" },
  { id: "shame", label: "羞耻自责", color: "var(--mood-shame)", icon: ICON_SPROUT, hug: "你会难受，说明你在意。先对自己柔和一点，再谈对错。", q1: "脸、胸口、肚子，哪里发烫或发缩？", q2: "想对自责说一句更公平的话？" },
  { id: "lonely", label: "孤独迷茫", color: "var(--mood-lonely)", icon: ICON_STAR, hug: "孤单或迷茫时，不必急着找到答案。你愿意看见它，就已经在照顾自己了。", q1: "这份孤单或迷茫在身体哪一处最明显？", q2: "想对它说一句什么？" },
];

export const MOOD_BY_LABEL = Object.fromEntries(MOODS.map((m) => [m.label, m]));

export const OVERRIDE_SCORE = { 安稳: 88, 一般: 70, 需关注: 48 };

export const BUILTIN_TRACKS = [
  { id: "rain", group: "音乐", name: "雨声", file: "assets/audio/rain.mp3", dur: "30:00", kind: "noise" },
  { id: "piano", group: "音乐", name: "轻柔钢琴", file: "assets/audio/piano.mp3", dur: "20:00", kind: "soft" },
  { id: "body", group: "冥想", name: "身体扫描（短）", file: "assets/audio/body-scan.mp3", dur: "08:00", kind: "soft" },
  { id: "breath", group: "冥想", name: "腹式呼吸", file: "assets/audio/breath.mp3", dur: "05:00", kind: "soft" },
];

export const CHECKIN_DEFAULTS = {
  weight: "",
  meals: [],
  appetite: "正常",
  taste: "一般",
  snacks: "无",
  water: "未记",
  supplements: ["无"],
  stool_count: "1",
  stool_form: "成形",
  stool_color: "正常",
  urine: "4-5次",
  moxa_points: ["今日未灸"],
  moxa_minutes: "",
  note: "",
};

/** 档位存库用代表值（区间中位；2000+ 按 2200） */
export const WATER_MAP = {
  未记: 0,
  "0-500ml": 250,
  "500-1000ml": 750,
  "1000-1500ml": 1250,
  "1500-2000ml": 1750,
  "2000+ml": 2200,
  /* 旧版 chip，读历史数据用 */
  "300ml": 300,
  "500ml": 500,
  "800ml": 800,
  "1000ml": 1000,
  "1500ml": 1500,
  "2000ml+": 2000,
};

export const WATER_OPTIONS = ["未记", "0-500ml", "500-1000ml", "1000-1500ml", "1500-2000ml", "2000+ml"];

/** 旧标签 → 新档位，便于编辑页回显 */
export const WATER_LEGACY = {
  "300ml": "0-500ml",
  "500ml": "500-1000ml",
  "800ml": "500-1000ml",
  "1000ml": "1000-1500ml",
  "1500ml": "1500-2000ml",
  "2000ml+": "2000+ml",
};
