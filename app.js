const TEXTGRID_URL = "input/text.TextGrid";
const AUDIO_FILES = {
  1: "input/audio.ogg",
  0.7: "input/audio70.ogg",
};
const SLOKA_TIER_HINT = "sloka";
const PADA_TIER_HINT = "pada";
const GROUP_TIME_TOLERANCE = 0.08;

const summary = document.querySelector("#summary");
const segmentsRoot = document.querySelector("#segments");
const stopButton = document.querySelector("#stopButton");
const tempoControls = document.querySelector("#tempoControls");

let tiers = [];
let segmentGroups = [];
let activeButton = null;
let audioContext = null;
const audioBuffers = new Map();
const audioLoadPromises = new Map();
let activeSources = [];
let activeTimer = null;
let activeProgressFrame = null;
let activeProgressButtons = [];
let playbackRate = 1;

init();

async function init() {
  try {
    const response = await fetch(TEXTGRID_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const textGrid = await readTextGridResponse(response);
    tiers = parseTextGrid(textGrid).filter((tier) => tier.intervals.length > 0);

    if (tiers.length === 0) {
      throw new Error("Brak niepustych segmentów w TextGridzie.");
    }

    const slokaTier = findTier(SLOKA_TIER_HINT);
    const padaTier = findTier(PADA_TIER_HINT);

    if (!slokaTier || !padaTier) {
      throw new Error("TextGrid musi zawierać warstwy Śloka i pāda.");
    }

    segmentGroups = buildSegmentGroups(slokaTier.intervals, padaTier.intervals);
    renderGroups(segmentGroups);
    updateSummary();
    loadAudioBuffer(playbackRate);
  } catch (error) {
    console.error(error);
    summary.textContent = "Nie udało się załadować input/text.TextGrid.";
    segmentsRoot.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  }
}

async function loadAudioBuffer(rate) {
  const key = getRateKey(rate);

  if (audioBuffers.has(key)) {
    return audioBuffers.get(key);
  }

  if (audioLoadPromises.has(key)) {
    return audioLoadPromises.get(key);
  }

  try {
    updateSummary();
    const promise = fetch(AUDIO_FILES[key])
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return response.arrayBuffer();
      })
      .then((buffer) => getAudioContext().decodeAudioData(buffer))
      .then((audioBuffer) => {
        audioBuffers.set(key, audioBuffer);
        audioLoadPromises.delete(key);
        updateSummary();
        return audioBuffer;
      });

    audioLoadPromises.set(key, promise);
    return await promise;
  } catch (error) {
    audioLoadPromises.delete(key);
    console.error(error);
    summary.textContent = `Nie udało się załadować ${AUDIO_FILES[key]}.`;
    throw error;
  }
}

function getRateKey(rate) {
  return String(rate);
}

function getAudioContext() {
  if (!audioContext) {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextConstructor();
  }

  return audioContext;
}

async function readTextGridResponse(response) {
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(buffer);
  }

  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(buffer);
  }

  return new TextDecoder("utf-8").decode(buffer);
}

function normalizeLabel(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function findTier(hint) {
  return tiers.find((tier) => normalizeLabel(tier.name) === hint);
}

function buildSegmentGroups(slokaIntervals, padaIntervals) {
  return slokaIntervals.map((sloka) => ({
    sloka,
    padas: padaIntervals.filter((pada) => isInsideInterval(pada, sloka)),
  }));
}

function isInsideInterval(child, parent) {
  return (
    child.xmin >= parent.xmin - GROUP_TIME_TOLERANCE &&
    child.xmax <= parent.xmax + GROUP_TIME_TOLERANCE
  );
}

function parseTextGrid(source) {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const parsedTiers = [];
  let currentTier = null;
  let currentInterval = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();

    if (/^item \[\d+\]:$/.test(line)) {
      if (currentInterval && currentTier) {
        currentTier.intervals.push(cleanInterval(currentInterval));
      }

      if (currentTier) {
        parsedTiers.push(currentTier);
      }

      currentTier = { name: "", intervals: [] };
      currentInterval = null;
      continue;
    }

    if (!currentTier) {
      continue;
    }

    if (line.startsWith("name =")) {
      currentTier.name = readPraatString(line, lines, i).value || "Warstwa";
      continue;
    }

    if (/^intervals \[\d+\]:$/.test(line)) {
      if (currentInterval) {
        currentTier.intervals.push(cleanInterval(currentInterval));
      }

      currentInterval = { xmin: 0, xmax: 0, text: "" };
      continue;
    }

    if (!currentInterval) {
      continue;
    }

    if (line.startsWith("xmin =")) {
      currentInterval.xmin = Number(line.split("=")[1].trim());
      continue;
    }

    if (line.startsWith("xmax =")) {
      currentInterval.xmax = Number(line.split("=")[1].trim());
      continue;
    }

    if (line.startsWith("text =")) {
      const result = readPraatString(line, lines, i);
      currentInterval.text = result.value;
      i = result.endIndex;
    }
  }

  if (currentInterval && currentTier) {
    currentTier.intervals.push(cleanInterval(currentInterval));
  }

  if (currentTier) {
    parsedTiers.push(currentTier);
  }

  return parsedTiers.map((tier) => ({
    name: tier.name,
    intervals: tier.intervals
      .filter((interval) => interval.text && interval.xmax > interval.xmin)
      .sort((a, b) => a.xmin - b.xmin),
  }));
}

function readPraatString(firstLine, allLines, startIndex) {
  const start = firstLine.indexOf('"');

  if (start === -1) {
    return { value: "", endIndex: startIndex };
  }

  let raw = firstLine.slice(start + 1);
  let quoteCount = countQuotes(firstLine.slice(start));
  let endIndex = startIndex;

  while (quoteCount % 2 !== 0 && endIndex + 1 < allLines.length) {
    endIndex += 1;
    raw += `\n${allLines[endIndex]}`;
    quoteCount += countQuotes(allLines[endIndex]);
  }

  const end = raw.lastIndexOf('"');
  const value = end >= 0 ? raw.slice(0, end) : raw;

  return {
    value: value.replace(/""/g, '"').trim(),
    endIndex,
  };
}

function countQuotes(value) {
  return (value.match(/"/g) || []).length;
}

function cleanInterval(interval) {
  return {
    xmin: Number.isFinite(interval.xmin) ? interval.xmin : 0,
    xmax: Number.isFinite(interval.xmax) ? interval.xmax : 0,
    text: String(interval.text || "").trim(),
  };
}

function updateSummary() {
  if (segmentGroups.length === 0) {
    summary.textContent = "Ładowanie TextGrida...";
    return;
  }

  const key = getRateKey(playbackRate);
  const audioStatus = audioBuffers.has(key)
    ? `audio ${formatRate(playbackRate)} gotowe`
    : `ładowanie audio ${formatRate(playbackRate)}...`;
  const padaCount = segmentGroups.reduce((count, group) => count + group.padas.length, 0);
  summary.textContent = `${segmentGroups.length} ślok | ${padaCount} pāda | ${audioStatus}`;
}

function renderGroups(groups) {
  if (groups.length === 0) {
    segmentsRoot.innerHTML = '<p class="empty-state">Brak segmentów z tekstem.</p>';
    return;
  }

  segmentsRoot.replaceChildren(
    ...groups.map((group) => {
      const groupElement = document.createElement("article");
      groupElement.className = "segment-group";

      const slokaButton = createSegmentButton(
        group.sloka,
        "",
        "sloka-button",
      );
      const padasElement = document.createElement("div");
      padasElement.className = "pada-list";

      padasElement.replaceChildren(...renderPadaPairs(group.padas));

      groupElement.replaceChildren(slokaButton, padasElement);
      return groupElement;
    }),
  );
}

function renderPadaPairs(padas) {
  const rows = [];

  for (let index = 0; index < padas.length; index += 2) {
    const first = padas[index];
    const second = padas[index + 1];

    if (!second) {
      rows.push(
        createSegmentButton(first, `Pāda ${index + 1}`, "pada-button pada-single"),
      );
      continue;
    }

    const row = document.createElement("div");
    row.className = "pada-pair";

    const singleButtons = document.createElement("div");
    singleButtons.className = "pada-pair-singles";
    const firstButton = createSegmentButton(first, `Pāda ${index + 1}`, "pada-button");
    const secondButton = createSegmentButton(second, `Pāda ${index + 2}`, "pada-button");

    singleButtons.replaceChildren(
      firstButton,
      secondButton,
    );

    const combinedInterval = {
      xmin: first.xmin,
      xmax: second.xmax,
      text: `${first.text}\n${second.text}`,
    };
    const combinedButton = createSegmentButton(
      combinedInterval,
      `Pāda ${index + 1}+${index + 2}`,
      "pada-button pada-combined",
      [
        { interval: first, button: firstButton },
        { interval: second, button: secondButton },
      ],
    );

    row.replaceChildren(singleButtons, combinedButton);
    rows.push(row);
  }

  return rows;
}

function createSegmentButton(interval, label, className, linkedParts = []) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `segment-button ${className}`;
  const timeLabel = label
    ? `${escapeHtml(label)}<br>${formatTime(interval.xmin)}-${formatTime(interval.xmax)}`
    : `${formatTime(interval.xmin)}-${formatTime(interval.xmax)}`;

  button.innerHTML = `
    <span class="segment-time">${timeLabel}</span>
    <span class="segment-text">${escapeHtml(interval.text)}</span>
  `;
  button.addEventListener("click", () => playInterval(interval, button, linkedParts));
  button.setAttribute("aria-label", label ? `${label}: ${interval.text}` : interval.text);
  return button;
}

async function playInterval(interval, button, linkedParts = []) {
  const selectedRate = playbackRate;

  if (activeButton) {
    activeButton.classList.remove("is-playing");
  }

  stopPlayback();
  activeButton = button;
  button.classList.add("is-playing");
  activeProgressButtons = [button, ...linkedParts.map((part) => part.button)];
  linkedParts.forEach((part) => part.button.classList.add("is-linked-playing"));

  try {
    const selectedBuffer = await loadAudioBuffer(selectedRate);

    if (selectedRate !== playbackRate) {
      stopPlayback();
      return;
    }

    const context = getAudioContext();

    if (context.state === "suspended") {
      await context.resume();
    }

    const start = Math.max(0, interval.xmin) / selectedRate;
    const duration = Math.max(0.01, interval.xmax - interval.xmin);
    const playbackDuration = duration / selectedRate;
    const sources = playSegmentNormal(context, selectedBuffer, start, playbackDuration);

    activeSources = sources;
    activeTimer = window.setTimeout(() => {
      if (activeSources === sources) {
        stopPlayback();
      }
    }, playbackDuration * 1000 + 80);
    animateProgress(button, context.currentTime, interval, linkedParts, selectedRate);
  } catch (error) {
    console.error(error);
    summary.textContent = error.message || "Nie udało się odtworzyć segmentu audio.";
    stopPlayback();
  }
}

function stopPlayback() {
  activeProgressButtons.forEach((button) => {
    button.classList.remove("is-playing", "is-linked-playing", "is-current-part");
    button.style.setProperty("--progress", "0%");
  });
  activeProgressButtons = [];
  activeButton = null;

  if (activeProgressFrame) {
    window.cancelAnimationFrame(activeProgressFrame);
    activeProgressFrame = null;
  }

  if (activeTimer) {
    window.clearTimeout(activeTimer);
    activeTimer = null;
  }

  activeSources.forEach((source) => {
    try {
      source.stop();
    } catch (error) {
      // The source may have already ended naturally.
    }
  });
  activeSources = [];
}

function playSegmentNormal(context, audioBuffer, start, duration) {
  const source = context.createBufferSource();

  source.buffer = audioBuffer;
  source.connect(context.destination);
  source.addEventListener(
    "ended",
    () => {
      if (activeSources.includes(source)) {
        stopPlayback();
      }
    },
    { once: true },
  );
  source.start(0, start, duration);

  return [source];
}

function animateProgress(button, startedAt, interval, linkedParts, rate) {
  if (activeProgressFrame) {
    window.cancelAnimationFrame(activeProgressFrame);
  }

  const context = getAudioContext();
  const duration = Math.max(0.01, interval.xmax - interval.xmin);
  const playbackDuration = duration / rate;

  const draw = () => {
    if (button !== activeButton) {
      return;
    }

    const elapsed = context.currentTime - startedAt;
    const progress = Math.min(1, Math.max(0, elapsed / playbackDuration));
    button.style.setProperty("--progress", `${progress * 100}%`);
    updateLinkedProgress(interval.xmin + elapsed * rate, linkedParts);

    if (progress < 1) {
      activeProgressFrame = window.requestAnimationFrame(draw);
    }
  };

  button.style.setProperty("--progress", "0%");
  linkedParts.forEach((part) => part.button.style.setProperty("--progress", "0%"));
  activeProgressFrame = window.requestAnimationFrame(draw);
}

function updateLinkedProgress(currentTime, linkedParts) {
  linkedParts.forEach((part) => {
    const duration = Math.max(0.01, part.interval.xmax - part.interval.xmin);
    const elapsed = currentTime - part.interval.xmin;
    const progress = Math.min(1, Math.max(0, elapsed / duration));

    part.button.style.setProperty("--progress", `${progress * 100}%`);
    part.button.classList.toggle("is-current-part", progress > 0 && progress < 1);
  });
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds - minutes * 60;
  return `${minutes}:${rest.toFixed(1).padStart(4, "0")}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setPlaybackRate(rate) {
  stopPlayback();
  playbackRate = rate;

  [...tempoControls.querySelectorAll("button")].forEach((button) => {
    const isActive = Number(button.dataset.rate) === playbackRate;
    button.setAttribute("aria-pressed", String(isActive));
  });

  updateSummary();
  loadAudioBuffer(playbackRate);
}

function formatRate(rate) {
  return `${Math.round(rate * 100)}%`;
}

stopButton.addEventListener("click", stopPlayback);
tempoControls.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-rate]");

  if (!button) {
    return;
  }

  setPlaybackRate(Number(button.dataset.rate));
});
