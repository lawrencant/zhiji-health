/** 常量与文案 — 对齐 PRD V1.1.2 */

export const STORAGE_KEY = "zhiji_v3";
export const STORAGE_BROKEN = "zhiji_v3_broken";
export const LEGACY_KEY = "zhiji_v2";
export const AUDIO_DB = "zhiji_audio";

export const EXERCISES = [
  { id: "jingang", group: "常规", name: "金刚蹲", unit: "次", goal: 20 },
  { id: "plank", group: "常规", name: "平板支撑", unit: "秒", goal: 60 },
  { id: "bridge", group: "常规", name: "臀桥", unit: "次", goal: 20 },
  { id: "squat", group: "常规", name: "深蹲", unit: "次", goal: 20 },
  { id: "jumping", group: "常规", name: "开合跳", unit: "次", goal: 30 },
  { id: "zhan", group: "静修", name: "站桩", unit: "分钟", goal: 10 },
  { id: "baduanjin", group: "静修", name: "八段锦", unit: "分钟", goal: 12 },
  { id: "meditate", group: "静修", name: "冥想", unit: "分钟", goal: 10 },
];

export const MOODS = [
  { id: "joy", label: "开心愉悦", color: "var(--mood-joy)", icon: "☀", hug: "这份好心情值得被记住。让身体里的暖再多留一会儿。", q1: "现在身体哪一处是松的或暖的？", q2: "想对这份心情说一句什么？" },
  { id: "calm", label: "平静放松", color: "var(--mood-calm)", icon: "🍃", hug: "平静本身就是一种力量。你可以慢慢待在这种安定里。", q1: "呼吸、肩膀、肚子，哪里最稳？", q2: "想让这份安定听到一句什么？" },
  { id: "sad", label: "低落难过", color: "var(--mood-sad)", icon: "☁", hug: "难过可以待着，不必马上好起来。我在这儿陪你。", q1: "难过或发沉停在身体的哪？", q2: "想对它说：我看见你了——后面还可以补半句" },
  { id: "anxiety", label: "焦虑紧张", color: "var(--mood-anxiety)", icon: "〰️", hug: "先把肩膀放下来。你已经在面对了，这一刻这样就好。", q1: "胸口、肚子、手、牙关，哪里最紧？", q2: "想对这份紧说一句什么才能让它松一点？" },
  { id: "anger", label: "愤怒烦躁", color: "var(--mood-anger)", icon: "🔥", hug: "怒气往往是界限被碰到了。先站稳，再决定下一步。", q1: "热或力出现在哪（头、胸、拳）？", q2: "想对愤怒说：你在保护什么？" },
  { id: "tired", label: "疲惫无力", color: "var(--mood-tired)", icon: "🌙", hug: "累了就允许自己慢一点。休息不是偷懒，是在回血。", q1: "眼皮、四肢、后背，哪里最沉？", q2: "身体现在最需要听到一句什么？" },
  { id: "shame", label: "羞耻自责", color: "var(--mood-shame)", icon: "🌱", hug: "你会难受，说明你在意。先对自己柔和一点，再谈对错。", q1: "脸、胸口、肚子，哪里发烫或发缩？", q2: "想对自责说一句更公平的话？" },
  { id: "lonely", label: "孤独迷茫", color: "var(--mood-lonely)", icon: "✦", hug: "孤单或迷茫时，不必急着找到答案。你愿意看见它，就已经在照顾自己了。", q1: "这份孤单或迷茫在身体哪一处最明显？", q2: "想对它说一句什么？" },
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
  limbs: "温热",
  tongue: "正常",
  thirst: "正常",
  sweat: "正常",
  moxa_points: ["今日未灸"],
  moxa_minutes: "",
  note: "",
};

export const WATER_MAP = {
  未记: 0,
  "300ml": 300,
  "500ml": 500,
  "800ml": 800,
  "1000ml": 1000,
  "1500ml": 1500,
  "2000ml+": 2000,
};
