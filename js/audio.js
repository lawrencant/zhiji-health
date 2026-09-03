/** 睡前音频：优先本地 mp3，失败则程序生成柔和音 */
import { AUDIO_DB, BUILTIN_TRACKS } from "./constants.js";
import { toast } from "./utils.js";

let ctx;
let current = { stop: null, name: "", playing: false };
let onChange = () => {};

export function setAudioListener(fn) {
  onChange = fn || (() => {});
}

function ensureCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function stopCurrent() {
  if (current.stop) {
    try {
      current.stop();
    } catch (_) {}
  }
  current = { stop: null, name: "", playing: false };
  onChange(current);
}

function playNoise(name) {
  const c = ensureCtx();
  const bufferSize = 2 * c.sampleRate;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 2.5;
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 800;
  const gain = c.createGain();
  gain.gain.value = 0.15;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  src.start();
  current = {
    name,
    playing: true,
    stop: () => {
      src.stop();
      src.disconnect();
    },
  };
  onChange(current);
}

function playSoft(name) {
  const c = ensureCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.value = 220;
  gain.gain.value = 0.04;
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 0.08;
  lfoGain.gain.value = 40;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  lfo.start();
  current = {
    name,
    playing: true,
    stop: () => {
      osc.stop();
      lfo.stop();
      osc.disconnect();
      lfo.disconnect();
    },
  };
  onChange(current);
}

async function playUrl(url, name, fallbackKind) {
  stopCurrent();
  try {
    const audio = new Audio(url);
    audio.loop = true;
    await audio.play();
    current = {
      name,
      playing: true,
      stop: () => {
        audio.pause();
        audio.src = "";
      },
    };
    onChange(current);
  } catch (_) {
    if (fallbackKind === "noise") playNoise(name);
    else playSoft(name);
  }
}

export function getPlaying() {
  return current;
}

export function pauseAudio() {
  stopCurrent();
}

export async function playBuiltin(track) {
  await playUrl(track.file, track.name, track.kind);
}

export async function playBlob(blob, name) {
  stopCurrent();
  const url = URL.createObjectURL(blob);
  try {
    const audio = new Audio(url);
    audio.loop = true;
    await audio.play();
    current = {
      name,
      playing: true,
      stop: () => {
        audio.pause();
        URL.revokeObjectURL(url);
      },
    };
    onChange(current);
  } catch (_) {
    URL.revokeObjectURL(url);
    toast("这首放不了，换一首");
  }
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(AUDIO_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("files")) db.createObjectStore("files");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveCustomAudio(id, blob) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCustomAudio(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readonly");
    const req = tx.objectStore("files").get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteCustomAudio(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearCustomAudio() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export { BUILTIN_TRACKS };
