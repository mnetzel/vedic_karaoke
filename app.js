const TEXTGRID_URL = "input/sri_suktam.TextGrid";
const CHANT_ID = "sri-suktam";
const RATINGS_STORAGE_KEY = `vedic-karaoke:ratings:${CHANT_ID}`;
const SETTINGS_STORAGE_KEY = `vedic-karaoke:settings:${CHANT_ID}`;
const AUDIO_FILES = {
  1: "input/audio.ogg",
  0.7: "input/audio70.ogg",
};
const TEXT_VARIANTS = ["Devanagari", "IAST", "PL"];
const DEFAULT_TEXT_VARIANT = "Devanagari";
const FALLBACK_TEXT_VARIANT = "IAST";
const SLOKA_TIER_PREFIX = "sloka";
const PADA_TIER_PREFIX = "pada";
const GROUP_TIME_TOLERANCE = 0.08;
const DEFAULT_REPEAT_COUNT = 5;
const REPEAT_GAP_SECONDS = 1;

const summary = document.querySelector("#summary");
const segmentsRoot = document.querySelector("#segments");
const stopButton = document.querySelector("#stopButton");
const tempoControls = document.querySelector("#tempoControls");
const repeatControls = document.querySelector("#repeatControls");
const filterControls = document.querySelector("#filterControls");
const scriptControls = document.querySelector("#scriptControls");
const resetProgressButton = document.querySelector("#resetProgressButton");

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
let savedSettings = loadSettings();
let playbackRate = savedSettings.playbackRate;
let playbackRequestId = 0;
let repeatCount = savedSettings.repeatCount;
let activeRatingFilter = savedSettings.ratingFilter;
let activeTextVariant = savedSettings.textVariant;
let slokaRatings = loadSlokaRatings();

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

    const tierSet = buildTierSet(tiers);
    const slokaTier = getVariantTier(tierSet.sloka, activeTextVariant);
    const padaTier = getVariantTier(tierSet.pada, activeTextVariant);

    if (!slokaTier || !padaTier) {
      throw new Error("TextGrid musi zawierać warstwy sloka-* i pada-*.");
    }

    segmentGroups = buildSegmentGroups(tierSet, slokaTier.intervals, padaTier.intervals);
    renderGroups(segmentGroups);
    applySavedControls();
    updateSummary();
    loadAudioBuffer(playbackRate);
  } catch (error) {
    console.error(error);
    summary.textContent = `Nie udało się załadować ${TEXTGRID_URL}.`;
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

function buildTierSet(sourceTiers) {
  return sourceTiers.reduce(
    (tierSet, tier) => {
      const info = parseTierName(tier.name);

      if (info && tierSet[info.kind]) {
        tierSet[info.kind][info.variant] = tier;
      }

      return tierSet;
    },
    { sloka: {}, pada: {} },
  );
}

function parseTierName(name) {
  const [kind, ...variantParts] = String(name).split("-");
  const normalizedKind = normalizeLabel(kind);
  const variant = normalizeVariantName(variantParts.join("-"));

  if (!variant || (normalizedKind !== SLOKA_TIER_PREFIX && normalizedKind !== PADA_TIER_PREFIX)) {
    return null;
  }

  return { kind: normalizedKind, variant };
}

function normalizeVariantName(value) {
  const normalized = normalizeLabel(value);
  return TEXT_VARIANTS.find((variant) => normalizeLabel(variant) === normalized) || "";
}

function getVariantTier(variantTiers, requestedVariant) {
  return (
    variantTiers[requestedVariant] ||
    variantTiers[FALLBACK_TEXT_VARIANT] ||
    variantTiers[DEFAULT_TEXT_VARIANT] ||
    Object.values(variantTiers)[0]
  );
}

function buildSegmentGroups(tierSet, baseSlokaIntervals, basePadaIntervals) {
  return baseSlokaIntervals.map((sloka, index) => {
    const id = createSlokaId(sloka, index);
    return {
      id,
      sloka: createVariantInterval(sloka, tierSet.sloka, index),
      rating: getSlokaRating(id),
      padas: basePadaIntervals
        .map((pada, padaIndex) => createVariantInterval(pada, tierSet.pada, padaIndex))
        .filter((pada) => isInsideInterval(pada, sloka)),
    };
  });
}

function isInsideInterval(child, parent) {
  return (
    child.xmin >= parent.xmin - GROUP_TIME_TOLERANCE &&
    child.xmax <= parent.xmax + GROUP_TIME_TOLERANCE
  );
}

function createVariantInterval(baseInterval, variantTiers, index) {
  const texts = {};

  TEXT_VARIANTS.forEach((variant) => {
    const interval = variantTiers[variant]?.intervals[index];
    texts[variant] = interval?.text || "";
  });

  return {
    xmin: baseInterval.xmin,
    xmax: baseInterval.xmax,
    text: resolveVariantText(texts),
    texts,
  };
}

function resolveVariantText(texts) {
  return (
    texts[activeTextVariant] ||
    texts[FALLBACK_TEXT_VARIANT] ||
    texts[DEFAULT_TEXT_VARIANT] ||
    Object.values(texts).find(Boolean) ||
    ""
  );
}

function getIntervalText(interval) {
  if (interval.texts) {
    return resolveVariantText(interval.texts);
  }

  return interval.text || "";
}

function refreshVisibleTexts() {
  segmentGroups.forEach((group) => {
    group.sloka.text = resolveVariantText(group.sloka.texts);
    group.padas.forEach((pada) => {
      pada.text = resolveVariantText(pada.texts);
    });
  });

  document.querySelectorAll("[data-segment-text]").forEach((element) => {
    element.textContent = getIntervalText(element._interval);
  });

  document.querySelectorAll("[data-segment-label]").forEach((element) => {
    element.setAttribute("aria-label", createSegmentAriaLabel(element._label, element._interval));
  });

  document.querySelectorAll("[data-repeat-button='true']").forEach((button) => {
    button.dataset.repeatText = getIntervalText(button._interval);
    updateRepeatButtonLabel(button);
  });
}

function createSlokaId(sloka, index) {
  return `${index}:${sloka.xmin.toFixed(3)}:${sloka.xmax.toFixed(3)}`;
}

function loadSlokaRatings() {
  try {
    return JSON.parse(localStorage.getItem(RATINGS_STORAGE_KEY)) || {};
  } catch (error) {
    console.warn("Nie udało się wczytać ocen ślok.", error);
    return {};
  }
}

function saveSlokaRatings() {
  try {
    localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(slokaRatings));
  } catch (error) {
    console.warn("Nie udało się zapisać ocen ślok.", error);
  }
}

function getSlokaRating(id) {
  const rating = Number(slokaRatings[id] || 0);
  return Number.isInteger(rating) && rating >= 0 && rating <= 3 ? rating : 0;
}

function loadSettings() {
  const defaults = {
    playbackRate: 1,
    repeatCount: DEFAULT_REPEAT_COUNT,
    ratingFilter: "all",
    textVariant: DEFAULT_TEXT_VARIANT,
  };

  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY)) || {};
    const playbackRate = AUDIO_FILES[saved.playbackRate] ? Number(saved.playbackRate) : defaults.playbackRate;
    const repeatCount = [3, 4, 5].includes(Number(saved.repeatCount))
      ? Number(saved.repeatCount)
      : defaults.repeatCount;
    const ratingFilter = ["all", "1", "2"].includes(saved.ratingFilter)
      ? saved.ratingFilter
      : defaults.ratingFilter;
    const textVariant = TEXT_VARIANTS.includes(saved.textVariant)
      ? saved.textVariant
      : defaults.textVariant;

    return { playbackRate, repeatCount, ratingFilter, textVariant };
  } catch (error) {
    console.warn("Nie udało się wczytać ustawień.", error);
    return defaults;
  }
}

function saveSettings() {
  try {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        playbackRate,
        repeatCount,
        ratingFilter: activeRatingFilter,
        textVariant: activeTextVariant,
      }),
    );
  } catch (error) {
    console.warn("Nie udało się zapisać ustawień.", error);
  }
}

function applySavedControls() {
  updatePlaybackRateButtons();
  updateRepeatButtons();
  updateRepeatButtonLabels();
  updateFilterButtons();
  updateScriptButtons();
  applyRatingFilter();
}

function countVisibleGroups() {
  if (activeRatingFilter === "all") {
    return segmentGroups.length;
  }

  const maxRating = Number(activeRatingFilter);
  return segmentGroups.filter((group) => group.rating <= maxRating).length;
}

function applyRatingFilter() {
  const maxRating = activeRatingFilter === "all" ? null : Number(activeRatingFilter);

  document.querySelectorAll(".segment-group").forEach((groupElement) => {
    const rating = Number(groupElement.dataset.rating || 0);
    const isVisible = maxRating === null || rating <= maxRating;
    groupElement.hidden = !isVisible;
  });

  updateSummary();
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
  const visibleGroups = countVisibleGroups();
  const slokaSummary =
    activeRatingFilter === "all"
      ? `${segmentGroups.length} ślok`
      : `${visibleGroups}/${segmentGroups.length} ślok`;
  summary.textContent = `${slokaSummary} | ${padaCount} pāda | ${audioStatus}`;
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
      groupElement.dataset.slokaId = group.id;
      groupElement.dataset.rating = String(group.rating);

      const slokaButton = createSegmentButton(
        group.sloka,
        "",
        "sloka-button",
      );
      const slokaHeader = document.createElement("div");
      slokaHeader.className = "sloka-header";
      slokaHeader.replaceChildren(slokaButton, createRatingControl(group, groupElement));

      const padasElement = document.createElement("div");
      padasElement.className = "pada-list";

      padasElement.replaceChildren(...renderPadaPairs(group.padas));

      groupElement.replaceChildren(slokaHeader, padasElement);
      return groupElement;
    }),
  );
  applyRatingFilter();
}

function createRatingControl(group, groupElement) {
  const control = document.createElement("div");
  control.className = "rating-control";
  control.setAttribute("aria-label", "Ocena śloki");
  updateRatingControl(control, group.rating);

  for (let rating = 1; rating <= 3; rating += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "rating-star";
    button.dataset.rating = String(rating);
    button.addEventListener("click", () => {
      const nextRating = group.rating === rating ? 0 : rating;
      setSlokaRating(group, groupElement, control, nextRating);
    });
    control.appendChild(button);
  }

  updateRatingControl(control, group.rating);
  return control;
}

function updateRatingControl(control, rating) {
  control.dataset.rating = String(rating);

  [...control.querySelectorAll(".rating-star")].forEach((button) => {
    const starRating = Number(button.dataset.rating);
    const isFilled = starRating <= rating;
    button.textContent = isFilled ? "★" : "☆";
    button.classList.toggle("is-filled", isFilled);
    button.setAttribute("aria-label", `Ustaw ocenę ${starRating}`);
    button.setAttribute("aria-pressed", String(isFilled));
  });
}

function setSlokaRating(group, groupElement, control, rating) {
  group.rating = rating;
  groupElement.dataset.rating = String(rating);
  slokaRatings[group.id] = rating;
  saveSlokaRatings();
  updateRatingControl(control, rating);
  applyRatingFilter();
}

function renderPadaPairs(padas) {
  const rows = [];

  for (let index = 0; index < padas.length; index += 2) {
    const first = padas[index];
    const second = padas[index + 1];

    if (!second) {
      const singleButton = createSegmentButton(
        first,
        `Pāda ${index + 1}`,
        "pada-button",
      );

      rows.push(
        createPadaControl(singleButton, createRepeatButton(first, singleButton), "pada-single"),
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
      createPadaControl(firstButton, createRepeatButton(first, firstButton)),
      createPadaControl(secondButton, createRepeatButton(second, secondButton)),
    );

    const combinedInterval = {
      xmin: first.xmin,
      xmax: second.xmax,
      text: `${getIntervalText(first)}\n${getIntervalText(second)}`,
      texts: combineIntervalTexts(first, second),
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
    const combinedRepeatButton = createRepeatButton(combinedInterval, combinedButton);
    const combinedControl = createCombinedControl(combinedRepeatButton, combinedButton);

    row.replaceChildren(singleButtons, combinedControl);
    rows.push(row);
  }

  return rows;
}

function createPadaControl(segmentButton, repeatButton, extraClass = "") {
  const wrapper = document.createElement("div");
  wrapper.className = `pada-control ${extraClass}`.trim();
  wrapper.replaceChildren(segmentButton, repeatButton);
  return wrapper;
}

function createCombinedControl(repeatButton, segmentButton) {
  const wrapper = document.createElement("div");
  wrapper.className = "combined-control";
  wrapper.replaceChildren(repeatButton, segmentButton);
  return wrapper;
}

function combineIntervalTexts(first, second) {
  return TEXT_VARIANTS.reduce((texts, variant) => {
    const firstText = first.texts?.[variant] || "";
    const secondText = second.texts?.[variant] || "";
    texts[variant] = [firstText, secondText].filter(Boolean).join("\n");
    return texts;
  }, {});
}

function createRepeatButton(interval, segmentButton) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "repeat-button";
  button.textContent = formatRepeatCount();
  button.dataset.repeatButton = "true";
  button._interval = interval;
  button.dataset.repeatText = getIntervalText(interval);
  updateRepeatButtonLabel(button);
  button.addEventListener("click", () => playRepeatedInterval(interval, segmentButton, button));
  return button;
}

function createSegmentButton(interval, label, className, linkedParts = []) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `segment-button ${className}`;
  button.dataset.segmentLabel = "true";
  button._interval = interval;
  button._label = label;
  const timeLabel = label
    ? `${escapeHtml(label)}<br>${formatTime(interval.xmin)}-${formatTime(interval.xmax)}`
    : `${formatTime(interval.xmin)}-${formatTime(interval.xmax)}`;

  button.innerHTML = `
    <span class="segment-time">${timeLabel}</span>
    <span class="segment-text" data-segment-text></span>
  `;
  const textElement = button.querySelector("[data-segment-text]");
  textElement._interval = interval;
  textElement.textContent = getIntervalText(interval);
  button.addEventListener("click", () => playInterval(interval, button, linkedParts));
  button.setAttribute("aria-label", createSegmentAriaLabel(label, interval));
  return button;
}

function createSegmentAriaLabel(label, interval) {
  return label ? `${label}: ${getIntervalText(interval)}` : getIntervalText(interval);
}

async function playInterval(interval, button, linkedParts = []) {
  const selectedRate = playbackRate;
  const requestId = beginPlayback();

  if (activeButton) {
    activeButton.classList.remove("is-playing");
  }

  activeButton = button;
  button.classList.add("is-playing");
  activeProgressButtons = [button, ...linkedParts.map((part) => part.button)];
  linkedParts.forEach((part) => part.button.classList.add("is-linked-playing"));

  try {
    const selectedBuffer = await loadAudioBuffer(selectedRate);

    if (requestId !== playbackRequestId || selectedRate !== playbackRate) {
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

async function playRepeatedInterval(interval, segmentButton, repeatButton) {
  const selectedRate = playbackRate;
  const requestId = beginPlayback();

  activeButton = segmentButton;
  segmentButton.classList.add("is-playing");
  repeatButton.classList.add("is-playing");
  activeProgressButtons = [segmentButton, repeatButton];

  try {
    const selectedBuffer = await loadAudioBuffer(selectedRate);

    if (requestId !== playbackRequestId || selectedRate !== playbackRate) {
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
    const sources = playRepeatedSegment(
      context,
      selectedBuffer,
      start,
      playbackDuration,
      repeatCount,
      REPEAT_GAP_SECONDS,
    );
    const totalDuration =
      playbackDuration * repeatCount + REPEAT_GAP_SECONDS * (repeatCount - 1);

    activeSources = sources;
    activeTimer = window.setTimeout(() => {
      if (activeSources === sources) {
        stopPlayback();
      }
    }, totalDuration * 1000 + 80);
    animateRepeatedProgress(
      segmentButton,
      context.currentTime,
      playbackDuration,
      repeatCount,
      REPEAT_GAP_SECONDS,
    );
  } catch (error) {
    console.error(error);
    summary.textContent = error.message || "Nie udało się odtworzyć powtórki.";
    stopPlayback();
  }
}

function stopPlayback() {
  playbackRequestId += 1;
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

function beginPlayback() {
  stopPlayback();
  return playbackRequestId;
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

function playRepeatedSegment(context, audioBuffer, start, duration, repeatCount, gapSeconds) {
  const sources = [];
  const cycleDuration = duration + gapSeconds;

  for (let index = 0; index < repeatCount; index += 1) {
    const source = context.createBufferSource();

    source.buffer = audioBuffer;
    source.connect(context.destination);
    source.start(context.currentTime + index * cycleDuration, start, duration);
    sources.push(source);
  }

  return sources;
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

function animateRepeatedProgress(button, startedAt, playbackDuration, repeatCount, gapSeconds) {
  if (activeProgressFrame) {
    window.cancelAnimationFrame(activeProgressFrame);
  }

  const context = getAudioContext();
  const cycleDuration = playbackDuration + gapSeconds;
  const totalDuration = playbackDuration * repeatCount + gapSeconds * (repeatCount - 1);

  const draw = () => {
    if (button !== activeButton) {
      return;
    }

    const elapsed = context.currentTime - startedAt;
    const cycleIndex = Math.min(repeatCount - 1, Math.floor(elapsed / cycleDuration));
    const cycleElapsed = elapsed - cycleIndex * cycleDuration;
    const progress =
      cycleElapsed <= playbackDuration
        ? Math.min(1, Math.max(0, cycleElapsed / playbackDuration))
        : 0;

    button.style.setProperty("--progress", `${progress * 100}%`);

    if (elapsed < totalDuration) {
      activeProgressFrame = window.requestAnimationFrame(draw);
    }
  };

  button.style.setProperty("--progress", "0%");
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
  saveSettings();
  updatePlaybackRateButtons();

  updateSummary();
  loadAudioBuffer(playbackRate);
}

function setRepeatCount(count) {
  repeatCount = count;
  saveSettings();
  updateRepeatButtons();
  updateRepeatButtonLabels();
}

function updatePlaybackRateButtons() {
  [...tempoControls.querySelectorAll("button")].forEach((button) => {
    const isActive = Number(button.dataset.rate) === playbackRate;
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function togglePlaybackRate(rate) {
  setPlaybackRate(playbackRate === rate ? 1 : rate);
}

function updateRepeatButtons() {
  [...repeatControls.querySelectorAll("button")].forEach((button) => {
    const isActive = Number(button.dataset.repeat) === repeatCount;
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function updateRepeatButtonLabels() {
  document.querySelectorAll("[data-repeat-button='true']").forEach((button) => {
    updateRepeatButtonLabel(button);
  });
}

function updateRepeatButtonLabel(button) {
  button.textContent = formatRepeatCount();
  button.setAttribute("aria-label", `Powtórz ${formatRepeatCount()}: ${button.dataset.repeatText}`);
}

function setRatingFilter(filter) {
  activeRatingFilter = filter;
  saveSettings();
  updateFilterButtons();
  applyRatingFilter();
}

function updateFilterButtons() {
  [...filterControls.querySelectorAll("button")].forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === activeRatingFilter));
  });
}

function setTextVariant(variant) {
  activeTextVariant = TEXT_VARIANTS.includes(variant) ? variant : DEFAULT_TEXT_VARIANT;
  saveSettings();
  updateScriptButtons();
  refreshVisibleTexts();
}

function updateScriptButtons() {
  [...scriptControls.querySelectorAll("button")].forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.script === activeTextVariant));
  });
}

function resetProgress() {
  if (!window.confirm("Do you really want to reset your learning progress?")) {
    return;
  }

  slokaRatings = {};
  saveSlokaRatings();

  segmentGroups.forEach((group) => {
    group.rating = 0;
  });

  document.querySelectorAll(".segment-group").forEach((groupElement) => {
    groupElement.dataset.rating = "0";
  });

  document.querySelectorAll(".rating-control").forEach((control) => {
    updateRatingControl(control, 0);
  });

  applyRatingFilter();
}

function formatRate(rate) {
  return `${Math.round(rate * 100)}%`;
}

function formatRepeatCount() {
  return `x${repeatCount}`;
}

stopButton.addEventListener("click", stopPlayback);
tempoControls.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-rate]");

  if (!button) {
    return;
  }

  togglePlaybackRate(Number(button.dataset.rate));
});
repeatControls.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-repeat]");

  if (!button) {
    return;
  }

  setRepeatCount(Number(button.dataset.repeat));
});
filterControls.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]");

  if (!button) {
    return;
  }

  setRatingFilter(button.dataset.filter);
});
scriptControls.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-script]");

  if (!button) {
    return;
  }

  setTextVariant(button.dataset.script);
});
resetProgressButton.addEventListener("click", resetProgress);
