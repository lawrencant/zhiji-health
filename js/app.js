/**
 * 知己 · 健康手记 — 主应用（PRD V1.1.2）
 */
import {
  EXERCISES,
  MOODS,
  CHECKIN_DEFAULTS,
  WATER_MAP,
  BUILTIN_TRACKS,
} from "./constants.js";
import {
  loadStore,
  saveStore,
  store,
  getDay,
  dayOf,
  healthScore,
  displaySleepScore,
  displaySleepLevel,
  exerciseStreak,
  exerciseRecent,
  hasAnyHistory,
  dayHasData,
  waterMl,
  clearAll,
  importData,
  exportPayload,
} from "./store.js";
import { calcSleepScore, levelClass } from "./sleep-score.js";
import {
  todayKey,
  greeting,
  toast,
  escapeHtml,
  sleepHours,
  downloadJson,
  pickFile,
  $,
  $all,
} from "./utils.js";
import {
  playBuiltin,
  playBlob,
  pauseAudio,
  getPlaying,
  setAudioListener,
  saveCustomAudio,
  getCustomAudio,
  deleteCustomAudio,
  clearCustomAudio,
} from "./audio.js";

const state = {
  tab: "home",
  secondary: null,
  moodDraft: null,
  sleepDraft: null,
  checkinDraft: null,
  trendRange: "week",
  trendDay: todayKey(),
  audioGroup: "音乐",
};

const viewEl = () => document.getElementById("view");
const overlayEl = () => document.getElementById("overlay");

function setTab(tab) {
  if (state.secondary) closeSecondary(false);
  state.tab = tab;
  $all(".tab").forEach((b) => b.classList.toggle("on", b.dataset.tab === tab));
  if (tab === "mood") initMoodDraft();
  if (tab === "trend") state.trendDay = todayKey();
  render();
}

function initMoodDraft() {
  const m = getDay().mood;
  state.moodDraft = m
    ? { label: m.label || "", body: m.body || "", words: m.words || "", saved: true }
    : { label: "", body: "", words: "", saved: false };
}

function openSecondary(name) {
  state.secondary = name;
  if (name === "sleep") {
    const s = getDay().sleep || {};
    state.sleepDraft = {
      bed: s.bed || "",
      wake: s.wake || "",
      wakes: s.wakes || "0",
      dream: s.dream || "无",
      override: s.override || null,
    };
  }
  if (name === "checkin") {
    const c = getDay().checkin;
    state.checkinDraft = normalizeCheckin(c);
  }
  render();
}

function normalizeCheckin(c) {
  if (!c) return { ...CHECKIN_DEFAULTS, meals: [], supplements: ["无"], moxa_points: ["今日未灸"] };
  const water =
    typeof c.water === "string" && WATER_MAP[c.water] != null
      ? c.water
      : Object.entries(WATER_MAP).find(([, ml]) => ml === (c.water_ml || 0))?.[0] || "未记";
  return {
    ...CHECKIN_DEFAULTS,
    ...c,
    meals: Array.isArray(c.meals) ? c.meals : [],
    supplements: Array.isArray(c.supplements) ? c.supplements : c.supplements ? [c.supplements] : ["无"],
    moxa_points: Array.isArray(c.moxa_points) ? c.moxa_points : ["今日未灸"],
    water,
    moxa_minutes: c.moxa_minutes != null ? String(c.moxa_minutes) : "",
  };
}

function closeSecondary(doPause = true) {
  if (doPause && state.secondary === "sleep") pauseAudio();
  state.secondary = null;
  state.sleepDraft = null;
  state.checkinDraft = null;
  render();
}

function showOverlay(html, center = false) {
  const el = overlayEl();
  el.hidden = false;
  el.classList.toggle("center", center);
  el.innerHTML = html;
  el.onclick = (e) => {
    if (e.target === el) hideOverlay();
  };
}

function hideOverlay() {
  const el = overlayEl();
  el.hidden = true;
  el.innerHTML = "";
}

function render() {
  const root = viewEl();
  if (state.secondary) {
    root.innerHTML = `<div class="secondary-layer" id="sec"></div>`;
    const sec = $("#sec");
    if (state.secondary === "sleep") renderSleep(sec);
    else if (state.secondary === "checkin") renderCheckin(sec);
    else if (state.secondary === "settings") renderSettings(sec);
  } else if (state.tab === "home") renderHome(root);
  else if (state.tab === "exercise") renderExercise(root);
  else if (state.tab === "mood") renderMood(root);
  else if (state.tab === "trend") renderTrend(root);
  renderPlayerBar();
}

function renderPlayerBar() {
  let bar = document.getElementById("player-bar");
  const p = getPlaying();
  if (!p.playing) {
    bar?.remove();
    return;
  }
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "player-bar";
    bar.className = "player-bar";
    document.getElementById("app").appendChild(bar);
  }
  bar.innerHTML = `<button type="button" class="btn sm" id="pb-toggle">暂停</button><div class="t">${escapeHtml(p.name)}</div>`;
  $("#pb-toggle").onclick = () => {
    pauseAudio();
    renderPlayerBar();
  };
}

/* —— 首页 —— */
function renderHome(root) {
  const key = todayKey();
  const d = getDay(key);
  const score = healthScore(key);
  const mood = d.mood?.label;
  const exCount = d.exercise ? Object.keys(d.exercise).filter((k) => d.exercise[k]?.value != null).length : 0;
  const sleep = d.sleep;
  const showScore = displaySleepScore(sleep);
  const showLevel = displaySleepLevel(sleep);
  const hours = sleep ? sleepHours(sleep.bed, sleep.wake) : null;
  const w = waterMl(d.checkin);
  const empty = !d.sleep && !d.checkin && !d.mood && !exCount;

  let sleepBody = '<span class="muted">点击记录睡眠</span>';
  if (showScore != null) {
    sleepBody = sleep?.override
      ? `你的判断：${escapeHtml(sleep.override)}（系统 ${sleep.systemScore ?? "—"} 分）`
      : `${showScore} 分`;
    if (hours != null) sleepBody += `<div class="muted">${escapeHtml(sleep.bed)} → ${escapeHtml(sleep.wake)} · ${hours}h</div>`;
  }

  root.innerHTML = `
    <div class="topbar">
      <div class="brand"><span class="brand-ico" aria-hidden="true"><svg viewBox="0 0 28 28" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg"><!-- 后手：加大底部张角 --><g transform="translate(0 1) rotate(-42 14 18)"><rect x="11.2" y="6.5" width="5.6" height="14" rx="2.8" fill="#7CB87A" stroke="#4F8A5B" stroke-width="1.2"/><circle cx="14" cy="5.8" r="2.35" fill="#8FCB8C" stroke="#4F8A5B" stroke-width="1.1"/><circle cx="11.5" cy="8.1" r="1.45" fill="#A8D4A4" stroke="#4F8A5B" stroke-width="1"/><circle cx="16.5" cy="8.1" r="1.45" fill="#A8D4A4" stroke="#4F8A5B" stroke-width="1"/></g><!-- 前手 --><g transform="translate(0 1) rotate(42 14 18)"><rect x="11.2" y="6.5" width="5.6" height="14" rx="2.8" fill="#5FAE6C" stroke="#4F8A5B" stroke-width="1.2"/><circle cx="14" cy="5.8" r="2.35" fill="#7CB87A" stroke="#4F8A5B" stroke-width="1.1"/><circle cx="11.5" cy="8.1" r="1.45" fill="#8FCB8C" stroke="#4F8A5B" stroke-width="1"/><circle cx="16.5" cy="8.1" r="1.45" fill="#8FCB8C" stroke="#4F8A5B" stroke-width="1"/></g></svg></span>知己</div>
      <button type="button" class="gear" id="go-settings">设置</button>
    </div>
    <p class="greet">${escapeHtml(greeting())} · ${key}</p>
    <div class="score-wrap">
      <div class="score-ring" style="--p:${score}"><b>${score}</b><span>健康分</span></div>
      <div class="score-deco" aria-hidden="true">✦ · ✦ · ✦</div>
    </div>
    <button type="button" class="checkin-cta" id="go-checkin">
      <span class="cta-ico" aria-hidden="true">🍃</span>
      <span>今日打卡</span>
      <span class="cta-arrow" aria-hidden="true">›</span>
    </button>
    ${
      d.checkin && w < 800
        ? `<div class="water-bar">饮水${w < 400 ? "严重不足" : "还需补充"} · ${w}/1000ml
            <div class="bar"><div class="fill" style="width:${Math.min(100, (w / 1000) * 100)}%"></div></div></div>`
        : ""
    }
    ${
      empty
        ? `<div class="emp emp-guide">
            <div class="emp-box">
              <p class="emp-hint">点今日打卡，开启身心健康的全面记录~</p>
            </div>
            <div class="emp-illust" aria-hidden="true">🪴</div>
          </div>`
        : ""
    }
    <button type="button" class="card clickable" id="card-mood"><div class="card-h"><div class="left"><span class="ico-round">☀</span>心情</div></div>
      <div>${mood ? escapeHtml(mood) : '<span class="muted">去情绪页选一选</span>'}</div></button>
    <button type="button" class="card clickable" id="card-ex"><div class="card-h"><div class="left"><span class="ico-round ico-ex" aria-hidden="true"><svg viewBox="0 0 32 32" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><rect x="11" y="14" width="10" height="4.2" rx="2.1" fill="#4F8A5B"/><circle cx="8.2" cy="16.1" r="5.2" fill="#7CB87A"/><circle cx="8.2" cy="16.1" r="3.3" fill="#5FAE6C"/><circle cx="23.8" cy="16.1" r="5.2" fill="#7CB87A"/><circle cx="23.8" cy="16.1" r="3.3" fill="#5FAE6C"/><circle cx="7.1" cy="14.8" r="0.7" fill="#EAF5E6"/><circle cx="22.7" cy="14.8" r="0.7" fill="#EAF5E6"/><path d="M14.6 9.2c.5-1.2 1.3-1.8 1.9-1.8s1.4.6 1.9 1.8" stroke="#4F8A5B" stroke-width="1.6" stroke-linecap="round" fill="none"/><circle cx="16" cy="11.2" r="1.15" fill="#4F8A5B"/></svg></span>运动</div></div>
      <div>${exCount ? `今日已记 ${exCount} 项` : '<span class="muted">还没动</span>'}</div></button>
    <button type="button" class="card clickable" id="card-sleep"><div class="card-h"><div class="left"><span class="ico-round ico-sleep" aria-hidden="true"><svg viewBox="0 0 32 32" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 22.5h6.2l-5.6 5.2h6.4" stroke="#8FCB8C" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.2 14.2h7.2L11.8 20.8h7.4" stroke="#5FAE6C" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.2 5.2h8.2L19 12.6h8.6" stroke="#4F8A5B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="27.2" cy="4.4" r="1.2" fill="#7CB87A"/></svg></span>睡眠</div>
      ${showLevel ? `<span class="badge ${levelClass(showLevel)}">${escapeHtml(showLevel)}</span>` : ""}</div>
      <div>${sleepBody}</div></button>
    ${
      d.checkin?.weight
        ? `<button type="button" class="card clickable" id="card-wt"><div class="card-h"><div class="left"><span class="ico-round">⚖</span>体重</div></div>
           <div>${escapeHtml(d.checkin.weight)} kg</div></button>`
        : ""
    }
  `;
  $("#go-settings").onclick = () => openSecondary("settings");
  $("#go-checkin").onclick = () => openSecondary("checkin");
  $("#card-mood").onclick = () => setTab("mood");
  $("#card-ex").onclick = () => setTab("exercise");
  $("#card-sleep").onclick = () => openSecondary("sleep");
  $("#card-wt") && ($("#card-wt").onclick = () => openSecondary("checkin"));
}

/* —— 睡眠 —— */
function renderSleep(root) {
  const draft = state.sleepDraft;
  const hours = sleepHours(draft.bed, draft.wake);
  const preview = calcSleepScore({ hours, wakes: draft.wakes, dream: draft.dream });
  const showLevel = draft.override || preview.level;

  root.innerHTML = `
    <div class="topbar"><button type="button" class="back" id="back">返回</button><div class="ttl">睡眠</div><span style="width:48px"></span></div>
    <div class="score-wrap">
      ${
        preview.score == null
          ? `<p class="muted">填完入睡和起床后生成睡眠分</p>`
          : `<div class="score-ring" style="--p:${preview.score}"><b>${preview.score}</b><span>睡眠分</span></div>
             <div style="margin-top:8px"><span class="badge ${levelClass(showLevel)}">${escapeHtml(showLevel || "")}</span>
             ${draft.override ? `<span class="muted"> 系统 ${preview.score} 分</span>` : ""}</div>
             <p class="muted" style="margin-top:8px">${escapeHtml(preview.reason || "")}</p>
             <button type="button" class="linkbtn" id="override">不准确？</button>`
      }
    </div>
    <div class="field"><label>入睡时间</label><input type="time" id="bed" value="${escapeHtml(draft.bed)}" /></div>
    <div class="field"><label>起床时间</label><input type="time" id="wake" value="${escapeHtml(draft.wake)}" /></div>
    <div class="field"><label>夜醒</label><div class="chip-wrap" id="wakes">${chipHtml(["0", "1", "2", "3", "4+"], draft.wakes)}</div></div>
    <div class="field"><label>做梦</label><div class="chip-wrap" id="dream">${chipHtml(["无", "少", "多"], draft.dream)}</div></div>
    <div class="grp">睡前放松</div>
    <div class="seg" id="audio-seg">${["音乐", "冥想", "我的"]
      .map((g) => `<button type="button" class="${state.audioGroup === g ? "on" : ""}" data-g="${g}">${g}</button>`)
      .join("")}</div>
    <div id="tracks"></div>
    <div class="sticky-save"><button type="button" class="btn pri" id="save-sleep">保存睡眠</button></div>
  `;

  $("#back").onclick = () => closeSecondary();
  const refresh = () => {
    draft.bed = $("#bed").value;
    draft.wake = $("#wake").value;
    renderSleep(root);
  };
  $("#bed").onchange = refresh;
  $("#wake").onchange = refresh;
  bindSingleChips("#wakes", (v) => {
    draft.wakes = v;
    renderSleep(root);
  });
  bindSingleChips("#dream", (v) => {
    draft.dream = v;
    renderSleep(root);
  });

  const ov = $("#override");
  if (ov) {
    ov.onclick = () => {
      if (preview.score == null) return toast("先填入睡和起床，让我打个分");
      showOverlay(
        `<div class="modal"><h3>你觉得实际更接近哪一档？</h3>
         <p class="muted">系统分会保留，首页按你选的档来显示</p>
         <div class="chip-wrap" id="ov-chips">${chipHtml(["安稳", "一般", "需关注"], draft.override)}</div>
         <button type="button" class="btn pri" id="ov-ok">确定</button>
         <button type="button" class="btn" id="ov-reset">恢复系统判断</button>
         <button type="button" class="btn ghost" id="ov-cancel">取消</button></div>`,
        true
      );
      let pick = draft.override;
      bindSingleChips("#ov-chips", (v) => {
        pick = v;
      });
      $("#ov-ok").onclick = () => {
        if (!pick) return toast("请选择一档判断");
        draft.override = pick;
        hideOverlay();
        renderSleep(root);
      };
      $("#ov-reset").onclick = () => {
        draft.override = null;
        hideOverlay();
        renderSleep(root);
      };
      $("#ov-cancel").onclick = hideOverlay;
    };
  }

  $all("#audio-seg button").forEach((b) => {
    b.onclick = () => {
      state.audioGroup = b.dataset.g;
      renderSleep(root);
    };
  });
  fillTracks($("#tracks"));

  $("#save-sleep").onclick = () => {
    const h = sleepHours(draft.bed, draft.wake);
    const result = calcSleepScore({ hours: h, wakes: draft.wakes, dream: draft.dream });
    dayOf().sleep = {
      bed: draft.bed,
      wake: draft.wake,
      wakes: draft.wakes,
      dream: draft.dream,
      systemScore: result.score,
      systemLevel: result.level,
      reason: result.reason,
      override: draft.override,
    };
    try {
      saveStore();
      toast(result.score == null ? "先记上了。补全入睡和起床后才会有睡眠分" : "睡眠已记下");
      setTimeout(() => closeSecondary(), 300);
    } catch (_) {
      toast("没存上，请再试一次");
    }
  };
}

function chipHtml(options, current) {
  return options
    .map((o) => `<button type="button" class="chip ${current === o ? "on" : ""}" data-v="${escapeHtml(o)}">${escapeHtml(o)}</button>`)
    .join("");
}

function bindSingleChips(sel, onPick) {
  $all(`${sel} .chip`).forEach((c) => {
    c.onclick = () => {
      $all(`${sel} .chip`).forEach((x) => x.classList.toggle("on", x === c));
      onPick(c.dataset.v);
    };
  });
}

async function fillTracks(el) {
  if (state.audioGroup === "我的") {
    const list = store.audioMeta || [];
    el.innerHTML =
      (list
        .map(
          (t) => `<div class="track"><span>${escapeHtml(t.name)}</span>
          <span><button type="button" class="btn sm" data-play="${t.id}">播放</button>
          <button type="button" class="btn sm" data-del="${t.id}">删</button></span></div>`
        )
        .join("") || `<p class="muted">还没有自己的音频，点「添加」从手机选一首</p>`) +
      `<button type="button" class="btn" id="add-audio" ${list.length >= 5 ? "disabled" : ""}>添加</button>`;

    $("#add-audio")?.addEventListener("click", async () => {
      if ((store.audioMeta || []).length >= 5) return toast("最多 5 条自定义音频，先删一条");
      const file = await pickFile("audio/*");
      if (!file) return;
      if (file.size > 20 * 1024 * 1024) return toast("请选择 20MB 以内的音频文件");
      const id = `c_${Date.now()}`;
      const name = file.name.replace(/\.[^.]+$/, "").slice(0, 40);
      try {
        await saveCustomAudio(id, file);
        store.audioMeta = [...(store.audioMeta || []), { id, name }];
        saveStore();
        toast("已添加到「我的」");
        render();
      } catch (_) {
        toast("存储空间不足，请先到设置导出并清理");
      }
    });
    $all("[data-play]").forEach((b) => {
      b.onclick = async () => {
        const id = b.dataset.play;
        const meta = store.audioMeta.find((x) => x.id === id);
        const blob = await getCustomAudio(id);
        if (!blob) {
          store.audioMeta = store.audioMeta.filter((x) => x.id !== id);
          saveStore();
          toast("文件找不到了，请重新添加");
          return render();
        }
        await playBlob(blob, meta?.name || "我的音频");
        renderPlayerBar();
      };
    });
    $all("[data-del]").forEach((b) => {
      b.onclick = async () => {
        await deleteCustomAudio(b.dataset.del);
        store.audioMeta = store.audioMeta.filter((x) => x.id !== b.dataset.del);
        saveStore();
        render();
      };
    });
    return;
  }

  const tracks = BUILTIN_TRACKS.filter((t) => t.group === state.audioGroup);
  el.innerHTML = tracks
    .map(
      (t) => `<div class="track"><div><b>${escapeHtml(t.name)}</b><div class="muted">${t.dur}</div></div>
      <button type="button" class="btn sm" data-id="${t.id}">播放</button></div>`
    )
    .join("");
  $all("[data-id]").forEach((b) => {
    b.onclick = async () => {
      await playBuiltin(BUILTIN_TRACKS.find((x) => x.id === b.dataset.id));
      renderPlayerBar();
    };
  });
}

/* —— 打卡 —— */
function renderCheckin(root) {
  const d = state.checkinDraft;
  root.innerHTML = `
    <div class="topbar"><button type="button" class="back" id="back">返回</button><div class="ttl">今日打卡</div><span style="width:48px"></span></div>
    <p class="muted">今天的身体情况，点选即可，能填多少算多少</p>
    <div class="grp">体重</div>
    <div class="field"><label>体重 (kg)</label><input type="number" id="weight" inputmode="decimal" step="0.1" value="${escapeHtml(d.weight)}" /><div class="err" id="w-err"></div></div>
    <div class="grp">饮食</div>
    ${multiChips("meals", "三餐是否吃了", ["早餐已吃", "午餐已吃", "晚餐已吃"])}
    ${singleChips("appetite", "食量", ["正常", "偏少", "偏多", "不想吃"])}
    ${singleChips("taste", "口味", ["清淡", "一般", "偏油腻", "偏甜咸"])}
    ${singleChips("snacks", "零食", ["无", "少许", "较多"])}
    ${singleChips("water", "饮水", ["未记", "300ml", "500ml", "800ml", "1000ml", "1500ml", "2000ml+"])}
    ${multiChips("supplements", "药物/补品", ["无", "维生素", "钙片鱼油等营养剂", "膏方", "中药", "西药", "其他保健品"], "无")}
    <div class="grp">二便</div>
    ${selectHtml("stool_count", "大便次数", ["0", "1", "2", "3", "4+"])}
    ${selectHtml("stool_form", "大便形态", ["成形", "偏干", "偏稀/不成型", "水样"])}
    ${selectHtml("stool_color", "大便颜色", ["正常", "偏黑", "偏黄", "偏绿"])}
    ${selectHtml("urine", "小便次数", ["3次以下", "4-5次", "6-7次", "8次以上"])}
    <div class="grp">体征</div>
    ${selectHtml("limbs", "手脚温度", ["温热", "脚凉", "手脚都凉"])}
    ${selectHtml("tongue", "舌苔", ["正常", "厚腻", "淡白", "偏红"])}
    ${selectHtml("thirst", "口渴", ["正常", "口干想喝水", "口干但不想喝", "不渴"])}
    ${selectHtml("sweat", "出汗", ["正常", "汗多", "盗汗", "不出汗"])}
    <div class="grp">艾灸</div>
    ${multiChips("moxa_points", "穴位", ["今日未灸", "足三里", "关元", "气海", "命门", "涌泉", "三阴交", "神阙", "百会", "其他穴位"], "今日未灸")}
    ${singleChips("moxa_minutes", "时长（分钟）", ["10", "15", "20", "30", "45", "60"])}
    <div class="grp">备注</div>
    <div class="field"><input type="text" id="note" maxlength="80" placeholder="可选，80字内" value="${escapeHtml(d.note)}" /></div>
    <div class="sticky-save"><button type="button" class="btn pri" id="save-checkin">保存记录</button></div>
  `;

  function singleChips(key, label, options) {
    return `<div class="field"><label>${label}</label><div class="chip-wrap" data-single="${key}">${options
      .map((o) => `<button type="button" class="chip ${String(d[key]) === o ? "on" : ""}" data-v="${escapeHtml(o)}">${escapeHtml(o)}</button>`)
      .join("")}</div></div>`;
  }
  function multiChips(key, label, options, exclusive) {
    const set = new Set(Array.isArray(d[key]) ? d[key] : []);
    return `<div class="field"><label>${label}</label><div class="chip-wrap" data-multi="${key}" data-ex="${exclusive || ""}">${options
      .map((o) => `<button type="button" class="chip ${set.has(o) ? "on" : ""}" data-v="${escapeHtml(o)}">${escapeHtml(o)}</button>`)
      .join("")}</div></div>`;
  }
  function selectHtml(key, label, options) {
    return `<div class="field"><label>${label}</label><select data-sel="${key}">${options
      .map((o) => `<option value="${escapeHtml(o)}" ${d[key] === o ? "selected" : ""}>${escapeHtml(o)}</option>`)
      .join("")}</select></div>`;
  }

  // BUG: functions used before definition in template string - need hoist
  // Actually in JS function declarations inside renderCheckin are hoisted within the function body!
  // Function declarations are hoisted to the top of the enclosing function, so singleChips etc. ARE available when evaluating the template. Good.

  $("#back").onclick = () => closeSecondary();

  $all("[data-single]").forEach((wrap) => {
    const key = wrap.dataset.single;
    $all(".chip", wrap).forEach((c) => {
      c.onclick = () => {
        d[key] = c.dataset.v;
        $all(".chip", wrap).forEach((x) => x.classList.toggle("on", x === c));
      };
    });
  });

  $all("[data-multi]").forEach((wrap) => {
    const key = wrap.dataset.multi;
    const ex = wrap.dataset.ex;
    $all(".chip", wrap).forEach((c) => {
      c.onclick = () => {
        let set = new Set(Array.isArray(d[key]) ? d[key] : []);
        const v = c.dataset.v;
        if (ex && v === ex) {
          set = new Set([ex]);
        } else {
          set.delete(ex);
          if (set.has(v)) set.delete(v);
          else set.add(v);
          if (!set.size && ex) set.add(ex);
        }
        d[key] = [...set];
        $all(".chip", wrap).forEach((x) => x.classList.toggle("on", set.has(x.dataset.v)));
      };
    });
  });

  $all("[data-sel]").forEach((sel) => {
    sel.onchange = () => {
      d[sel.dataset.sel] = sel.value;
    };
  });

  $("#save-checkin").onclick = () => {
    const w = $("#weight").value.trim();
    $("#w-err").textContent = "";
    if (w !== "") {
      const n = Number(w);
      if (Number.isNaN(n) || n < 30 || n > 200) {
        $("#w-err").textContent = "体重请填 30–200 之间的数字";
        return;
      }
    }
    const btn = $("#save-checkin");
    btn.disabled = true;
    btn.textContent = "保存中…";
    const waterLabel = d.water || "未记";
    dayOf().checkin = {
      ...d,
      weight: w,
      note: $("#note").value.slice(0, 80),
      water: waterLabel,
      water_ml: WATER_MAP[waterLabel] ?? 0,
      moxa_minutes: d.moxa_points?.includes("今日未灸") ? "" : d.moxa_minutes,
    };
    try {
      saveStore();
      toast("记录已保存");
      setTimeout(() => closeSecondary(), 300);
    } catch (_) {
      toast("存储空间不足，请先导出再清理");
      btn.disabled = false;
      btn.textContent = "保存记录";
    }
  };
}

/* —— 运动 —— */
function renderExercise(root) {
  const today = getDay().exercise || {};
  const groups = ["常规", "静修"];
  root.innerHTML = `
    <div class="topbar"><span></span><div class="ttl">运动记录</div><span style="width:48px"></span></div>
    <p class="muted" style="text-align:center;margin-top:0">坚持每一步，越来越好</p>
    ${groups
      .map((g) => {
        const items = EXERCISES.filter((e) => e.group === g);
        return `<div class="grp">${g}</div>${items
          .map((e) => {
            const streak = exerciseStreak(e.id);
            const done = streak >= 21;
            const val = today[e.id]?.value;
            const hasToday = val != null;
            const tip = done ? "目标已达成" : hasToday ? "今天这组记下了" : "先做一小会儿也算";
            return `<div class="card">
              <div class="card-h"><div class="left"><span class="ico-round">◎</span>${escapeHtml(e.name)}</div>
                <span class="badge ${done ? "good" : "warn"}">${done ? "已达成" : "进行中"}</span></div>
              <div>${hasToday ? `${val}` : "0"} ${e.unit} / ${e.goal} ${e.unit}</div>
              <div class="progress"><i style="width:${Math.min(100, (streak / 21) * 100)}%"></i></div>
              <div class="muted">已坚持 ${streak} / 21 天 · ${tip}</div>
              <div class="btn-row">
                <button type="button" class="btn pri sm" data-rec="${e.id}">${hasToday ? "改今日" : "记录今日"}</button>
                <button type="button" class="btn sm" data-detail="${e.id}">详情</button>
              </div>
            </div>`;
          })
          .join("")}`;
      })
      .join("")}
  `;

  $all("[data-rec]").forEach((b) => {
    b.onclick = () => openRecordSheet(b.dataset.rec);
  });
  $all("[data-detail]").forEach((b) => {
    b.onclick = () => openDetailSheet(b.dataset.detail);
  });
}

function openRecordSheet(id) {
  const e = EXERCISES.find((x) => x.id === id);
  const cur = getDay().exercise?.[id]?.value ?? "";
  showOverlay(`<div class="sheet"><h3>记录今日 · ${escapeHtml(e.name)}</h3>
    <div class="field"><label>今日数量（${escapeHtml(e.unit)}）</label>
      <input type="number" id="ex-val" inputmode="decimal" value="${escapeHtml(String(cur))}" />
      <div class="err" id="ex-err"></div></div>
    <button type="button" class="btn pri" id="ex-ok">确定</button>
    <button type="button" class="btn ghost" id="ex-cancel">取消</button></div>`);
  setTimeout(() => $("#ex-val")?.focus(), 50);
  $("#ex-cancel").onclick = hideOverlay;
  $("#ex-ok").onclick = () => {
    const raw = $("#ex-val").value.trim();
    if (raw === "") return toast("请填写今天的数量");
    const n = Number(raw);
    const max = e.unit === "分钟" ? 300 : 9999;
    if (Number.isNaN(n) || n < 0 || n > max) {
      $("#ex-err").textContent = `请填写 0 到 ${max} 之间的数字`;
      return;
    }
    const day = dayOf();
    if (!day.exercise) day.exercise = {};
    day.exercise[id] = { value: n, unit: e.unit };
    try {
      saveStore();
      hideOverlay();
      toast("今日已记下");
      render();
    } catch (_) {
      toast("没存上，请再试一次");
    }
  };
}

function openDetailSheet(id) {
  const e = EXERCISES.find((x) => x.id === id);
  const rows = exerciseRecent(id, 7);
  showOverlay(`<div class="sheet"><h3>${escapeHtml(e.name)} · 近 7 日</h3>
    ${
      rows.length
        ? `<table class="mini" style="width:100%;border-collapse:collapse;font-size:13px">
            ${rows.map((r) => `<tr><td style="padding:6px;border-bottom:1px solid var(--line)">${r.date}</td>
            <td style="padding:6px;border-bottom:1px solid var(--line)">${r.value} ${escapeHtml(r.unit)}</td></tr>`).join("")}
          </table>`
        : `<p class="muted">最近 7 天还没有这条记录</p>`
    }
    <button type="button" class="btn" id="ex-close">关闭</button></div>`);
  $("#ex-close").onclick = hideOverlay;
}

/* —— 情绪 —— */
function renderMood(root) {
  if (!state.moodDraft) initMoodDraft();
  const d = state.moodDraft;
  const mood = MOODS.find((m) => m.label === d.label);

  root.innerHTML = `
    <div class="mood-page">
    <div class="topbar"><span></span><div class="ttl">情绪 ${d.saved && d.label ? '<span class="badge">今日已记下</span>' : ""}</div><span style="width:48px"></span></div>

    <section class="mood-block">
      <h3 class="mood-block-title"><span class="mood-block-dot" aria-hidden="true"></span>今日心情</h3>
      <div class="chip-wrap" id="moods">${MOODS.map(
        (m) => `<button type="button" class="chip mood ${d.label === m.label ? "on" : ""}" data-l="${escapeHtml(m.label)}"><span>${m.icon}</span>${escapeHtml(m.label)}</button>`
      ).join("")}</div>
    </section>

    <section class="mood-block">
      <h3 class="mood-block-title"><span class="mood-block-dot" aria-hidden="true"></span>抱抱你</h3>
      ${
        mood
          ? `<div class="bubble">🤗 ${escapeHtml(mood.hug)}</div>`
          : `<div class="mood-placeholder" aria-hidden="true"></div>`
      }
    </section>

    <section class="mood-block">
      <h3 class="mood-block-title"><span class="mood-block-dot" aria-hidden="true"></span>情绪觉察</h3>
      ${
        mood
          ? `<div class="field"><label>${escapeHtml(mood.q1)}</label><textarea id="body" maxlength="80" rows="2" placeholder="可选，写一句也可以">${escapeHtml(d.body)}</textarea></div>
             <div class="field"><label>${escapeHtml(mood.q2)}</label><textarea id="words" maxlength="80" rows="2" placeholder="可选，写一句也可以">${escapeHtml(d.words)}</textarea></div>`
          : `<div class="mood-placeholder mood-placeholder-tall" aria-hidden="true"></div>`
      }
    </section>

    <div class="sticky-save mood-save"><button type="button" class="btn pri" id="save-mood">保存今日情绪</button></div>
    </div>
  `;

  $all("#moods .chip").forEach((c) => {
    c.onclick = () => {
      const next = c.dataset.l;
      if (d.label !== next) {
        d.label = next;
        d.body = "";
        d.words = "";
        d.saved = false;
      }
      renderMood(root);
    };
  });

  $("#save-mood").onclick = () => {
    if (!d.label) return toast("请先选一个心情");
    d.body = $("#body")?.value.slice(0, 80) || "";
    d.words = $("#words")?.value.slice(0, 80) || "";
    dayOf().mood = { label: d.label, body: d.body, words: d.words };
    try {
      saveStore();
      d.saved = true;
      toast("情绪已记下");
      renderMood(root);
    } catch (_) {
      toast("没存上，请再试一次");
    }
  };
}

/* —— 趋势 —— */
function renderTrend(root) {
  if (!hasAnyHistory()) {
    root.innerHTML = `<div class="topbar"><span></span><div class="ttl">趋势</div><span style="width:48px"></span></div>
      <div class="emp"><div class="big">📈</div><b>还没有记录数据</b><br>先记几天睡眠、运动或情绪，再来看变化</div>`;
    return;
  }

  const range = state.trendRange;
  const sleepSeries = seriesSleep(range);
  const exSeries = seriesExercise(range);
  const moodSeries = seriesMood(range);

  root.innerHTML = `
    <div class="topbar"><span></span><div class="ttl">趋势</div><span style="width:48px"></span></div>
    <div class="seg" id="range">
      <button type="button" class="${range === "week" ? "on" : ""}" data-r="week">一周</button>
      <button type="button" class="${range === "month" ? "on" : ""}" data-r="month">一月</button>
      <button type="button" class="${range === "year" ? "on" : ""}" data-r="year">一年</button>
    </div>
    <div class="card"><div class="card-h"><div class="left">睡眠分</div></div>${chartOrEmpty(sleepSeries, 100)}</div>
    <div class="card"><div class="card-h"><div class="left">运动天数</div></div>${chartOrEmpty(exSeries, range === "year" ? 31 : 1)}</div>
    <div class="card"><div class="card-h"><div class="left">心情</div></div>${moodChart(moodSeries)}</div>
    <div class="card">
      <div class="card-h"><div class="left">按日查询</div></div>
      <div class="cal" id="cal"></div>
      <div id="day-sum"></div>
    </div>
  `;

  $all("#range button").forEach((b) => {
    b.onclick = () => {
      state.trendRange = b.dataset.r;
      render();
    };
  });
  fillCalendar($("#cal"), $("#day-sum"));
}

function lastNDates(n) {
  const arr = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push(todayKey(d));
  }
  return arr;
}

function seriesSleep(range) {
  if (range === "year") {
    return last12Months().map(({ key, label }) => {
      const days = Object.keys(store.days).filter((k) => k.startsWith(key));
      const scores = days.map((k) => displaySleepScore(store.days[k].sleep)).filter((x) => x != null);
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      return { label, value: avg };
    });
  }
  const n = range === "week" ? 7 : 30;
  return lastNDates(n).map((k) => ({
    label: k.slice(5),
    value: displaySleepScore(getDay(k).sleep) || 0,
  }));
}

function seriesExercise(range) {
  if (range === "year") {
    return last12Months().map(({ key, label }) => {
      const days = Object.keys(store.days).filter((k) => k.startsWith(key));
      const count = days.filter((k) => {
        const ex = store.days[k].exercise;
        return ex && Object.keys(ex).length;
      }).length;
      return { label, value: count };
    });
  }
  const n = range === "week" ? 7 : 30;
  return lastNDates(n).map((k) => {
    const ex = getDay(k).exercise;
    return { label: k.slice(5), value: ex && Object.keys(ex).length ? 1 : 0 };
  });
}

function seriesMood(range) {
  if (range === "year") {
    return last12Months().map(({ key, label }) => {
      const days = Object.keys(store.days).filter((k) => k.startsWith(key) && store.days[k].mood?.label);
      return { label, value: days.length, colors: [] };
    });
  }
  const n = range === "week" ? 7 : 30;
  return lastNDates(n).map((k) => {
    const label = getDay(k).mood?.label;
    const m = MOODS.find((x) => x.label === label);
    return { label: k.slice(5), value: label ? 1 : 0, color: m?.color, mood: label };
  });
}

function last12Months() {
  const out = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ key, label: `${d.getMonth() + 1}月` });
  }
  return out;
}

function chartOrEmpty(series, maxHint) {
  if (!series.some((s) => s.value > 0)) return `<p class="muted">这段时间还没有这类记录</p>`;
  const max = Math.max(maxHint || 1, ...series.map((s) => s.value), 1);
  const slim = series.length > 14;
  return `<div class="chart">${series
    .map((s, i) => {
      const h = Math.max(2, Math.round((s.value / max) * 72));
      const showLbl = !slim || i % Math.ceil(series.length / 7) === 0;
      return `<div class="col"><div class="bar" style="height:${h}px"></div>${showLbl ? `<div class="lbl">${escapeHtml(s.label)}</div>` : ""}</div>`;
    })
    .join("")}</div>`;
}

function moodChart(series) {
  if (state.trendRange === "year") return chartOrEmpty(series, 31);
  if (!series.some((s) => s.value > 0)) return `<p class="muted">这段时间还没有这类记录</p>`;
  return `<div class="mood-dots">${series
    .map((s) => (s.mood ? `<i title="${escapeHtml(s.mood)}" style="background:${s.color}"></i>` : `<i style="background:#ddd"></i>`))
    .join("")}</div>`;
}

function fillCalendar(cal, sum) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const wds = ["日", "一", "二", "三", "四", "五", "六"];
  let html = wds.map((w) => `<button type="button" class="wd" disabled>${w}</button>`).join("");
  for (let i = 0; i < first; i++) html += `<button type="button" disabled></button>`;
  for (let d = 1; d <= days; d++) {
    const key = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const on = key === state.trendDay ? "on" : "";
    const dot = dayHasData(key) ? '<span class="dot"></span>' : "";
    html += `<button type="button" class="${on}" data-day="${key}">${d}${dot}</button>`;
  }
  cal.innerHTML = html;
  $all("[data-day]", cal).forEach((b) => {
    b.onclick = () => {
      state.trendDay = b.dataset.day;
      fillCalendar(cal, sum);
    };
  });
  renderDaySum(sum, state.trendDay);
}

function renderDaySum(el, key) {
  if (!dayHasData(key)) {
    el.innerHTML = `<p class="muted">这天还没有记录</p>`;
    return;
  }
  const d = getDay(key);
  const lv = displaySleepLevel(d.sleep);
  const sc = displaySleepScore(d.sleep);
  const ex = d.exercise ? Object.keys(d.exercise).length : 0;
  const w = waterMl(d.checkin);
  el.innerHTML = `<div class="box">
    <b>${key}</b><br>
    ${lv != null ? `睡眠：${escapeHtml(lv)} · ${sc ?? "—"} 分<br>` : ""}
    ${ex ? `运动：${ex} 项<br>` : ""}
    ${d.mood?.label ? `心情：${escapeHtml(d.mood.label)}<br>` : ""}
    ${d.checkin ? `饮水 ${w}ml${d.checkin.stool_form ? ` · 大便 ${escapeHtml(d.checkin.stool_form)}` : ""}` : ""}
  </div>`;
}

/* —— 设置 —— */
function renderSettings(root) {
  root.innerHTML = `
    <div class="topbar"><button type="button" class="back" id="back">返回</button><div class="ttl">设置</div><span style="width:48px"></span></div>
    <div class="card">
      <div class="card-h"><div class="left">数据管理</div></div>
      <p class="muted">不需要登录。下一版会做账号和云端。</p>
      <button type="button" class="btn" id="export">导出数据 (JSON)</button>
      <button type="button" class="btn" id="import">导入数据 (JSON)</button>
      <button type="button" class="btn danger" id="clear">清除所有数据</button>
    </div>
    <div class="card">
      <div class="card-h"><div class="left">关于知己</div></div>
      <p style="font-size:13px;line-height:1.7">知己是健康手记，给分享群的姐妹日常用。不替代医生。<br>
      v3.0 · 2026.09 本机保存；账号云同步下一版再做。</p>
    </div>
  `;
  $("#back").onclick = () => closeSecondary();
  $("#export").onclick = () => {
    try {
      const name = `zhiji-backup-${todayKey()}.json`;
      downloadJson(name, exportPayload());
      toast("数据已导出");
    } catch (_) {
      toast("浏览器拦住了下载，请允许下载后重试");
    }
  };
  $("#import").onclick = async () => {
    const file = await pickFile(".json,application/json");
    if (!file) return;
    try {
      const text = await file.text();
      importData(JSON.parse(text));
      toast("数据已导入");
      closeSecondary();
      setTab("home");
    } catch (_) {
      toast("文件格式错误");
    }
  };
  $("#clear").onclick = () => {
    showOverlay(
      `<div class="modal"><h3>确认清除</h3>
       <p style="font-size:13px">此操作将删除这台设备上的全部健康记录和自定义音频，无法恢复。建议先导出备份。</p>
       <button type="button" class="btn" id="c-cancel">取消</button>
       <button type="button" class="btn danger" id="c-ok">确认清除</button></div>`,
      true
    );
    $("#c-cancel").onclick = hideOverlay;
    $("#c-ok").onclick = async () => {
      clearAll();
      await clearCustomAudio().catch(() => {});
      hideOverlay();
      toast("数据已清除");
      closeSecondary();
      setTab("home");
    };
  };
}

/* —— 启动 —— */
loadStore();
setAudioListener(() => renderPlayerBar());
$all(".tab").forEach((b) => {
  b.onclick = () => setTab(b.dataset.tab);
});
initMoodDraft();
render();
