/** 睡眠打分算法 — PRD 功能 2 */
import { clamp } from "./utils.js";

const DREAM_PENALTY = { 无: 0, 少: 4, 多: 12 };
const WAKE_PENALTY = { 0: 0, 1: 8, 2: 16, 3: 22, "4+": 28 };

export function calcSleepScore({ hours, wakes = "0", dream = "无" }) {
  if (hours == null || Number.isNaN(hours)) {
    return { score: null, level: null, reason: null, deductions: [] };
  }

  const deductions = [];
  let durationPenalty = 0;
  let durationKind = null;
  if (hours >= 7 && hours <= 9) durationPenalty = 0;
  else if ((hours >= 6 && hours < 7) || (hours > 9 && hours <= 10)) {
    durationPenalty = 10;
    durationKind = hours < 7 ? "short" : "long";
  } else if ((hours >= 5 && hours < 6) || (hours > 10 && hours <= 11)) {
    durationPenalty = 20;
    durationKind = hours < 6 ? "short" : "long";
  } else {
    durationPenalty = 30;
    durationKind = hours < 5 ? "short" : "long";
  }
  if (durationPenalty) deductions.push({ key: "duration", kind: durationKind, points: durationPenalty });

  const wp = WAKE_PENALTY[wakes] ?? 0;
  if (wp) deductions.push({ key: "wake", points: wp });

  const dp = DREAM_PENALTY[dream] ?? 0;
  if (dp) deductions.push({ key: "dream", points: dp });

  const score = clamp(100 - deductions.reduce((s, d) => s + d.points, 0), 0, 100);
  const level = score >= 80 ? "安稳" : score >= 60 ? "一般" : "需关注";

  let reason = "时长和连贯性都不错";
  if (deductions.length) {
    const top = [...deductions].sort((a, b) => b.points - a.points)[0];
    if (top.key === "duration" && top.kind === "short") reason = "睡眠偏短，身体还没睡够";
    else if (top.key === "duration") reason = "睡得偏久，白天可能仍发沉";
    else if (top.key === "wake") reason = "夜醒打断了整觉，对应『一觉到天亮』还差一点";
    else if (top.key === "dream") reason = "多梦容易睡不实";
  }

  return { score, level, reason, deductions };
}

export function levelClass(level) {
  if (level === "安稳") return "good";
  if (level === "一般") return "warn";
  if (level === "需关注") return "bad";
  return "";
}
