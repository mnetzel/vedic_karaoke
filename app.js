const CHANTS = {
  "sri-suktam": {
    title: "Śri Suktam",
    folder: "input/sri-suktam",
    image: "input/sri-suktam/Sri_Suktam.jpg",
    textGrid: "input/sri-suktam/Sri_Suktam.TextGrid",
    audioCredit: {
      label: "Shantala Sriramaiah",
      url: "https://on.soundcloud.com/ifmZR7Az24mCGEZPSR",
    },
    translations: {
      pl: "input/sri-suktam/SriSuktam_translation_pl.md",
      eng: "input/sri-suktam/SriSuktam_translation_eng.md",
    },
    audio: {
      0: {
        1: "input/sri-suktam/Sri_Suktam.ogg",
        0.7: "input/sri-suktam/Sri_Suktam_tempo_70.ogg",
        1.25: "input/sri-suktam/Sri_Suktam_tempo_125.ogg",
      },
      1: {
        1: "input/sri-suktam/Sri_Suktam_pitch_up_1_semitone.ogg",
        0.7: "input/sri-suktam/Sri_Suktam_pitch_up_1_semitone_70.ogg",
        1.25: "input/sri-suktam/Sri_Suktam_pitch_up_1_semitone_tempo_125.ogg",
      },
      2: {
        1: "input/sri-suktam/Sri_Suktam_pitch_up_2_semitones.ogg",
        0.7: "input/sri-suktam/Sri_Suktam_pitch_up_2_semitones_70.ogg",
        1.25: "input/sri-suktam/Sri_Suktam_pitch_up_2_semitones_tempo_125.ogg",
      },
    },
  },
  "sri-rudram": {
    title: "Śri Rudram",
    folder: "input/sri-rudram",
    image: "input/sri-rudram/Sri_Rudram.jpg",
    textGrid: "input/sri-rudram/Sri_Rudram.TextGrid",
    audioCredit: null,
    translations: {
      pl: "input/sri-rudram/SriRudram_translation_pl.md",
      eng: "input/sri-rudram/SriRudram_translation_eng.md",
    },
    audio: {
      0: {
        1: "input/sri-rudram/Sri_Rudram.ogg",
        0.7: "input/sri-rudram/Sri_Rudram_tempo_70.ogg",
        1.25: "input/sri-rudram/Sri_Rudram_tempo_125.ogg",
      },
      1: {
        1: "input/sri-rudram/Sri_Rudram_pitch_up_1_semitone.ogg",
        0.7: "input/sri-rudram/Sri_Rudram_pitch_up_1_semitone_70.ogg",
        1.25: "input/sri-rudram/Sri_Rudram_pitch_up_1_semitone_tempo_125.ogg",
      },
      2: {
        1: "input/sri-rudram/Sri_Rudram_pitch_up_2_semitones.ogg",
        0.7: "input/sri-rudram/Sri_Rudram_pitch_up_2_semitones_70.ogg",
        1.25: "input/sri-rudram/Sri_Rudram_pitch_up_2_semitones_tempo_125.ogg",
      },
    },
  },
};
const DEFAULT_CHANT_ID = "sri-suktam";
const SETTINGS_STORAGE_KEY = "vedic-karaoke:settings";
const LEGACY_SETTINGS_STORAGE_KEY = "vedic-karaoke:settings:sri-suktam";
const FULL_CHANT_FAST_RATE = 1.25;
const TEXT_VARIANTS = ["Devanagari", "IAST", "PL"];
const DEFAULT_TEXT_VARIANT = "Devanagari";
const FALLBACK_TEXT_VARIANT = "IAST";
const TRANSLATION_LANGUAGES = {
  pl: {
    buttonLabel: "Tłumaczenie",
    title: "Tłumaczenie",
    missing: "Brak tłumaczenia dla tej śloki.",
  },
  eng: {
    buttonLabel: "Translation",
    title: "Translation",
    missing: "Translation not available for this śloka.",
  },
};
const DEFAULT_TRANSLATION_LANGUAGE = "pl";
const SLOKA_TIER_PREFIX = "sloka";
const PADA_TIER_PREFIX = "pada";
const GROUP_TIME_TOLERANCE = 0.08;
const DEFAULT_REPEAT_COUNT = 5;
const REPEAT_GAP_SECONDS = 1;

const chantChooser = document.querySelector("#chantChooser");
const karaokeView = document.querySelector("#karaokeView");
const chantChoiceButtons = [...document.querySelectorAll("[data-chant-id]")];
const chantTitle = document.querySelector("#chantTitle");
const chantImage = document.querySelector("#chantImage");
const audioCredit = document.querySelector("#audioCredit");
const audioCreditLink = document.querySelector("#audioCreditLink");
const changeChantButton = document.querySelector("#changeChantButton");
const summary = document.querySelector("#summary");
const segmentsRoot = document.querySelector("#segments");
const stopButton = document.querySelector("#stopButton");
const fullChantButton = document.querySelector("#fullChantButton");
const fullChantFastButton = document.querySelector("#fullChantFastButton");
const tempoControls = document.querySelector("#tempoControls");
const repeatControls = document.querySelector("#repeatControls");
const filterControls = document.querySelector("#filterControls");
const scriptControls = document.querySelector("#scriptControls");
const translationControls = document.querySelector("#translationControls");
const pitchControls = document.querySelector("#pitchControls");
const resetProgressButton = document.querySelector("#resetProgressButton");
const translationModal = document.querySelector("#translationModal");
const translationDialog = document.querySelector(".translation-dialog");
const translationTitle = document.querySelector("#translationTitle");
const translationBody = document.querySelector("#translationBody");
const translationCloseButton = document.querySelector("#translationCloseButton");

let tiers = [];
let segmentGroups = [];
let slokaTranslations = {};
let activeButton = null;
let audioContext = null;
const audioBuffers = new Map();
const audioLoadPromises = new Map();
let activeChantId = null;
let activeChant = null;
let activeSources = [];
let activeTimer = null;
let activeProgressFrame = null;
let activeProgressButtons = [];
let activeFullChantGroup = null;
let chantLoadRequestId = 0;
let savedSettings = loadSettings();
let playbackRate = savedSettings.playbackRate;
let pitchShift = savedSettings.pitchShift;
let playbackRequestId = 0;
let repeatCount = savedSettings.repeatCount;
let activeRatingFilter = savedSettings.ratingFilter;
let activeTextVariant = savedSettings.textVariant;
let activeTranslationLanguage = savedSettings.translationLanguage;
let slokaRatings = {};

init();

function init() {
  renderChantChooser();
  window.addEventListener("hashchange", handleRouteChange);
  handleRouteChange();
}

function handleRouteChange() {
  const chantId = getChantIdFromHash();

  if (!chantId) {
    showChantChooser();
    return;
  }

  loadChant(chantId);
}

function renderChantChooser() {
  chantChoiceButtons.forEach((button) => {
    const chant = CHANTS[button.dataset.chantId];

    if (!chant) {
      return;
    }

    const image = button.querySelector("[data-chant-image]");
    const title = button.querySelector("[data-chant-title]");

    if (image) {
      image.src = chant.image;
      image.alt = "";
    }

    if (title) {
      title.textContent = chant.title;
    }

    button.addEventListener("click", () => {
      window.location.hash = button.dataset.chantId;
    });
  });
}

function showChantChooser() {
  chantLoadRequestId += 1;
  stopPlayback();
  activeChantId = null;
  activeChant = null;
  document.body.classList.remove("has-active-chant");
  chantChooser.hidden = false;
  karaokeView.hidden = true;
}

async function loadChant(chantId) {
  const chant = CHANTS[chantId];
  const requestId = chantLoadRequestId + 1;

  if (!chant) {
    showChantChooser();
    return;
  }

  chantLoadRequestId = requestId;
  stopPlayback();
  activeChantId = chantId;
  activeChant = chant;
  tiers = [];
  segmentGroups = [];
  slokaTranslations = {};
  slokaRatings = loadSlokaRatings();
  audioBuffers.clear();
  audioLoadPromises.clear();
  activeFullChantGroup = null;
  document.body.classList.add("has-active-chant");
  chantChooser.hidden = true;
  karaokeView.hidden = false;
  updateChantHeader();
  segmentsRoot.innerHTML = "";
  summary.textContent = `Ładowanie ${chant.title}...`;

  try {
    const response = await fetch(chant.textGrid);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const textGrid = await readTextGridResponse(response);

    if (requestId !== chantLoadRequestId) {
      return;
    }

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
    slokaTranslations = await loadAllTranslationSections();

    if (requestId !== chantLoadRequestId) {
      return;
    }

    attachTranslations(segmentGroups, slokaTranslations);
    renderGroups(segmentGroups);
    applySavedControls();
    updateSummary();
    loadAudioBuffer(playbackRate, pitchShift);
  } catch (error) {
    console.error(error);
    summary.textContent = `Nie udało się załadować ${chant.textGrid}.`;
    segmentsRoot.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  }
}

function getChantIdFromHash() {
  const id = decodeURIComponent(window.location.hash.replace(/^#/, "").trim());
  return CHANTS[id] ? id : "";
}

function updateChantHeader() {
  chantTitle.textContent = activeChant.title;
  chantImage.src = activeChant.image;
  chantImage.alt = "";

  if (activeChant.audioCredit) {
    audioCredit.hidden = false;
    audioCreditLink.textContent = activeChant.audioCredit.label;
    audioCreditLink.href = activeChant.audioCredit.url;
  } else {
    audioCredit.hidden = true;
    audioCreditLink.removeAttribute("href");
    audioCreditLink.textContent = "";
  }

  document.title = `${activeChant.title} | Vedic Karaoke`;
}

async function loadAudioBuffer(rate, pitch = pitchShift) {
  const key = getAudioKey(rate, pitch);
  const audioFile = getAudioFile(rate, pitch);

  if (audioBuffers.has(key)) {
    return audioBuffers.get(key);
  }

  if (audioLoadPromises.has(key)) {
    return audioLoadPromises.get(key);
  }

  try {
    updateSummary();
    const promise = fetch(audioFile)
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
    summary.textContent = `Nie udało się załadować ${audioFile}.`;
    throw error;
  }
}

function getAudioKey(rate, pitch = pitchShift) {
  return `${activeChantId}:${pitch}:${getRateKey(rate)}`;
}

function getAudioFile(rate, pitch = pitchShift) {
  return getAudioFileForChant(activeChant, rate, pitch);
}

function getAudioFileForChant(chant, rate, pitch = 0) {
  if (!chant) {
    return "";
  }

  return chant.audio?.[pitch]?.[getRateKey(rate)] || chant.audio?.[0]?.[getRateKey(rate)] || "";
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

async function loadAllTranslationSections() {
  const entries = await Promise.all(
    Object.keys(TRANSLATION_LANGUAGES).map(async (language) => [
      language,
      await loadTranslationSections(language),
    ]),
  );

  return Object.fromEntries(entries);
}

async function loadTranslationSections(language) {
  const url = activeChant?.translations?.[language];

  if (!url) {
    return [];
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return parseTranslationMarkdown(await response.text());
  } catch (error) {
    console.warn(`Nie udało się załadować ${url}.`, error);
    return [];
  }
}

function parseTranslationMarkdown(source) {
  return source
    .replace(/\r\n?/g, "\n")
    .split(/^\s*---+\s*$/m)
    .map((section) => section.trim())
    .filter(Boolean);
}

function attachTranslations(groups, translations) {
  groups.forEach((group, index) => {
    group.translations = Object.keys(TRANSLATION_LANGUAGES).reduce((result, language) => {
      result[language] = translations[language]?.[index] || "";
      return result;
    }, {});
  });
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
    return JSON.parse(localStorage.getItem(getRatingsStorageKey())) || {};
  } catch (error) {
    console.warn("Nie udało się wczytać ocen ślok.", error);
    return {};
  }
}

function saveSlokaRatings() {
  try {
    localStorage.setItem(getRatingsStorageKey(), JSON.stringify(slokaRatings));
  } catch (error) {
    console.warn("Nie udało się zapisać ocen ślok.", error);
  }
}

function getRatingsStorageKey() {
  return `vedic-karaoke:ratings:${activeChantId || DEFAULT_CHANT_ID}`;
}

function getSlokaRating(id) {
  const rating = Number(slokaRatings[id] || 0);
  return Number.isInteger(rating) && rating >= 0 && rating <= 3 ? rating : 0;
}

function loadSettings() {
  const defaults = {
    playbackRate: 1,
    pitchShift: 0,
    repeatCount: DEFAULT_REPEAT_COUNT,
    ratingFilter: "all",
    textVariant: DEFAULT_TEXT_VARIANT,
    translationLanguage: DEFAULT_TRANSLATION_LANGUAGE,
  };

  try {
    const saved =
      JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_SETTINGS_STORAGE_KEY)) || {};
    const defaultChant = CHANTS[DEFAULT_CHANT_ID];
    const playbackRate = getAudioFileForChant(defaultChant, Number(saved.playbackRate), Number(saved.pitchShift || 0))
      ? Number(saved.playbackRate)
      : defaults.playbackRate;
    const pitchShift = defaultChant.audio[Number(saved.pitchShift)]
      ? Number(saved.pitchShift)
      : defaults.pitchShift;
    const repeatCount = [3, 4, 5].includes(Number(saved.repeatCount))
      ? Number(saved.repeatCount)
      : defaults.repeatCount;
    const ratingFilter = ["all", "1", "2"].includes(saved.ratingFilter)
      ? saved.ratingFilter
      : defaults.ratingFilter;
    const textVariant = TEXT_VARIANTS.includes(saved.textVariant)
      ? saved.textVariant
      : defaults.textVariant;
    const translationLanguage = TRANSLATION_LANGUAGES[saved.translationLanguage]
      ? saved.translationLanguage
      : defaults.translationLanguage;

    return { playbackRate, pitchShift, repeatCount, ratingFilter, textVariant, translationLanguage };
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
        pitchShift,
        repeatCount,
        ratingFilter: activeRatingFilter,
        textVariant: activeTextVariant,
        translationLanguage: activeTranslationLanguage,
      }),
    );
  } catch (error) {
    console.warn("Nie udało się zapisać ustawień.", error);
  }
}

function applySavedControls() {
  updatePlaybackRateButtons();
  updatePitchButtons();
  updateRepeatButtons();
  updateRepeatButtonLabels();
  updateFilterButtons();
  updateScriptButtons();
  updateTranslationLanguageButtons();
  updatePlaybackRateLabel();
  updateFullChantLabel();
  applyRatingFilter();
}

function countVisibleGroups() {
  if (document.body.classList.contains("full-chant-mode")) {
    return segmentGroups.length;
  }

  if (activeRatingFilter === "all") {
    return segmentGroups.length;
  }

  const maxRating = Number(activeRatingFilter);
  return segmentGroups.filter((group) => group.rating <= maxRating).length;
}

function applyRatingFilter() {
  if (document.body.classList.contains("full-chant-mode")) {
    document.querySelectorAll(".segment-group").forEach((groupElement) => {
      groupElement.hidden = false;
    });
    updateSummary();
    return;
  }

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

  const key = getAudioKey(playbackRate, pitchShift);
  const audioLabel = `${formatPitch(pitchShift)} ${formatRate(playbackRate)}`.trim();
  const audioStatus = audioBuffers.has(key)
    ? `audio ${audioLabel} gotowe`
    : `ładowanie audio ${audioLabel}...`;
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
      group.element = groupElement;
      group.slokaButton = slokaButton;
      const slokaHeader = document.createElement("div");
      slokaHeader.className = "sloka-header";
      const slokaActions = document.createElement("div");
      slokaActions.className = "sloka-actions";
      const translationButton = createTranslationButton(group);
      slokaActions.replaceChildren(
        ...[translationButton, createRatingControl(group, groupElement)].filter(Boolean),
      );
      slokaHeader.replaceChildren(slokaButton, slokaActions);

      const padasElement = document.createElement("div");
      padasElement.className = "pada-list";

      padasElement.replaceChildren(...renderPadaPairs(group.padas));

      groupElement.replaceChildren(slokaHeader, padasElement);
      return groupElement;
    }),
  );
  applyRatingFilter();
}

function createTranslationButton(group) {
  if (!hasAnyTranslation(group)) {
    return null;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "translation-button";
  button.dataset.translationButton = "true";
  button._group = group;
  updateTranslationButtonLabel(button);
  button.addEventListener("click", () => openTranslationModal(group));
  return button;
}

function hasAnyTranslation(group) {
  return Object.values(group.translations || {}).some(Boolean);
}

function updateTranslationButtonLabels() {
  document.querySelectorAll("[data-translation-button='true']").forEach((button) => {
    updateTranslationButtonLabel(button);
  });
}

function updateTranslationButtonLabel(button) {
  const config = getActiveTranslationConfig();
  button.textContent = config.buttonLabel;
  button.setAttribute("aria-label", `${config.buttonLabel}: ${getIntervalText(button._group.sloka)}`);
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
  const selectedPitchShift = pitchShift;
  const requestId = beginPlayback();

  if (activeButton) {
    activeButton.classList.remove("is-playing");
  }

  activeButton = button;
  button.classList.add("is-playing");
  activeProgressButtons = [button, ...linkedParts.map((part) => part.button)];
  linkedParts.forEach((part) => part.button.classList.add("is-linked-playing"));

  try {
    const selectedBuffer = await loadAudioBuffer(selectedRate, selectedPitchShift);

    if (
      requestId !== playbackRequestId ||
      selectedRate !== playbackRate ||
      selectedPitchShift !== pitchShift
    ) {
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
  const selectedPitchShift = pitchShift;
  const requestId = beginPlayback();

  activeButton = segmentButton;
  segmentButton.classList.add("is-playing");
  repeatButton.classList.add("is-playing");
  activeProgressButtons = [segmentButton, repeatButton];

  try {
    const selectedBuffer = await loadAudioBuffer(selectedRate, selectedPitchShift);

    if (
      requestId !== playbackRequestId ||
      selectedRate !== playbackRate ||
      selectedPitchShift !== pitchShift
    ) {
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

async function playFullChant(selectedRate = playbackRate, triggerButton = fullChantButton) {
  if (activeButton === triggerButton) {
    stopPlayback();
    return;
  }

  if (segmentGroups.length === 0) {
    return;
  }

  const selectedPitchShift = pitchShift;
  const requestId = beginPlayback();
  const firstSloka = segmentGroups[0].sloka;
  const lastSloka = segmentGroups[segmentGroups.length - 1].sloka;
  const chantStart = Math.max(0, firstSloka.xmin);
  const chantEnd = Math.max(chantStart + 0.01, lastSloka.xmax);

  activeButton = triggerButton;
  activeProgressButtons = [
    triggerButton,
    ...segmentGroups.map((group) => group.slokaButton).filter(Boolean),
  ];
  activeProgressButtons.forEach((button) => button.style.setProperty("--progress", "0%"));
  document.body.classList.add("full-chant-mode");
  triggerButton.classList.add("is-playing");
  triggerButton.setAttribute("aria-pressed", "true");
  segmentGroups.forEach((group) => {
    if (group.element) {
      group.element.hidden = false;
    }
  });

  try {
    const selectedBuffer = await loadAudioBuffer(selectedRate, selectedPitchShift);

    if (
      requestId !== playbackRequestId ||
      (triggerButton === fullChantButton && selectedRate !== playbackRate) ||
      selectedPitchShift !== pitchShift
    ) {
      stopPlayback();
      return;
    }

    const context = getAudioContext();

    if (context.state === "suspended") {
      await context.resume();
    }

    const start = chantStart / selectedRate;
    const playbackDuration = (chantEnd - chantStart) / selectedRate;
    const sources = playSegmentNormal(context, selectedBuffer, start, playbackDuration);

    activeSources = sources;
    activeTimer = window.setTimeout(() => {
      if (activeSources === sources) {
        stopPlayback();
      }
    }, playbackDuration * 1000 + 80);
    animateFullChantProgress(context.currentTime, chantStart, chantEnd, selectedRate, triggerButton);
  } catch (error) {
    console.error(error);
    summary.textContent = error.message || "Nie udało się odtworzyć całego chant.";
    stopPlayback();
  }
}

function stopPlayback() {
  const wasFullChantMode = document.body.classList.contains("full-chant-mode");
  playbackRequestId += 1;
  activeProgressButtons.forEach((button) => {
    button.classList.remove("is-playing", "is-linked-playing", "is-current-part");
    button.style.setProperty("--progress", "0%");
  });
  activeProgressButtons = [];
  activeButton = null;
  activeFullChantGroup = null;
  document.body.classList.remove("full-chant-mode");

  if (fullChantButton) {
    fullChantButton.setAttribute("aria-pressed", "false");
  }

  if (fullChantFastButton) {
    fullChantFastButton.setAttribute("aria-pressed", "false");
  }

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

  if (wasFullChantMode) {
    applyRatingFilter();
  }
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

function animateFullChantProgress(startedAt, chantStart, chantEnd, rate, button) {
  if (activeProgressFrame) {
    window.cancelAnimationFrame(activeProgressFrame);
  }

  const context = getAudioContext();
  const playbackDuration = Math.max(0.01, (chantEnd - chantStart) / rate);

  const draw = () => {
    if (activeButton !== button) {
      return;
    }

    const elapsed = context.currentTime - startedAt;
    const progress = Math.min(1, Math.max(0, elapsed / playbackDuration));
    const textGridTime = chantStart + elapsed * rate;

    button.style.setProperty("--progress", `${progress * 100}%`);
    updateFullChantSlokaProgress(textGridTime);

    if (progress < 1) {
      activeProgressFrame = window.requestAnimationFrame(draw);
    }
  };

  activeProgressFrame = window.requestAnimationFrame(draw);
}

function updateFullChantSlokaProgress(textGridTime) {
  const currentGroup = getFullChantFocusGroup(textGridTime);

  segmentGroups.forEach((group) => {
    const button = group.slokaButton;

    if (!button) {
      return;
    }

    const duration = Math.max(0.01, group.sloka.xmax - group.sloka.xmin);
    let progress = 0;

    if (textGridTime >= group.sloka.xmax) {
      progress = 1;
    } else if (textGridTime >= group.sloka.xmin) {
      progress = (textGridTime - group.sloka.xmin) / duration;
    }

    button.style.setProperty("--progress", `${Math.min(1, Math.max(0, progress)) * 100}%`);
    button.classList.toggle("is-current-part", currentGroup === group);
  });

  if (currentGroup && currentGroup !== activeFullChantGroup) {
    activeFullChantGroup = currentGroup;
    scrollFullChantGroupIntoView(currentGroup);
  }
}

function getFullChantFocusGroup(textGridTime) {
  for (let index = 0; index < segmentGroups.length; index += 1) {
    const group = segmentGroups[index];
    const previousGroup = segmentGroups[index - 1];
    const nextGroup = segmentGroups[index + 1];
    const focusStart = previousGroup
      ? previousGroup.sloka.xmax + Math.max(0, group.sloka.xmin - previousGroup.sloka.xmax) / 2
      : group.sloka.xmin;
    const focusEnd = nextGroup
      ? group.sloka.xmax + Math.max(0, nextGroup.sloka.xmin - group.sloka.xmax) / 2
      : group.sloka.xmax;

    if (textGridTime >= focusStart && textGridTime < focusEnd) {
      return group;
    }
  }

  return textGridTime < segmentGroups[0]?.sloka.xmin
    ? segmentGroups[0] || null
    : segmentGroups[segmentGroups.length - 1] || null;
}

function scrollFullChantGroupIntoView(group) {
  group.element?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
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
  loadAudioBuffer(playbackRate, pitchShift);
}

function setPitchShift(value) {
  stopPlayback();
  pitchShift = pitchShift === value ? 0 : value;
  saveSettings();
  updatePitchButtons();
  updateSummary();
  loadAudioBuffer(playbackRate, pitchShift);
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

function updatePlaybackRateLabel() {
  const slowButton = tempoControls.querySelector("button[data-rate='0.7']");

  if (slowButton) {
    slowButton.textContent = activeTranslationLanguage === "pl" ? "Wolniej" : "Slow";
  }
}

function updatePitchButtons() {
  [...pitchControls.querySelectorAll("button")].forEach((button) => {
    const isActive = Number(button.dataset.pitch) === pitchShift;
    button.textContent = formatPitchButtonLabel(Number(button.dataset.pitch));
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function formatPitchButtonLabel(value) {
  if (activeTranslationLanguage === "pl") {
    return value === 1 ? "Tonacja+" : "Tonacja++";
  }

  return value === 1 ? "Pitch+" : "Pitch++";
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
  updateTranslationButtonLabels();
}

function updateScriptButtons() {
  [...scriptControls.querySelectorAll("button")].forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.script === activeTextVariant));
  });
}

function setTranslationLanguage(language) {
  activeTranslationLanguage = TRANSLATION_LANGUAGES[language]
    ? language
    : DEFAULT_TRANSLATION_LANGUAGE;
  saveSettings();
  updateTranslationLanguageButtons();
  updateTranslationButtonLabels();
  updatePlaybackRateLabel();
  updatePitchButtons();
  updateChangeChantLabel();
  updateFullChantLabel();
}

function updateTranslationLanguageButtons() {
  [...translationControls.querySelectorAll("button")].forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.translationLanguage === activeTranslationLanguage),
    );
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

function openTranslationModal(group) {
  const config = getActiveTranslationConfig();
  const markdown = group.translations?.[activeTranslationLanguage] || config.missing;

  translationTitle.textContent = config.title;
  translationBody.innerHTML = renderMarkdown(markdown);
  translationModal.hidden = false;
  document.body.classList.add("modal-open");
  translationDialog.focus();
}

function getActiveTranslationConfig() {
  return TRANSLATION_LANGUAGES[activeTranslationLanguage] ||
    TRANSLATION_LANGUAGES[DEFAULT_TRANSLATION_LANGUAGE];
}

function closeTranslationModal() {
  translationModal.hidden = true;
  translationBody.replaceChildren();
  document.body.classList.remove("modal-open");
}

function renderMarkdown(markdown) {
  if (window.marked?.parse) {
    return window.marked.parse(markdown);
  }

  return `<p>${escapeHtml(markdown)
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br>")}</p>`;
}

function formatRate(rate) {
  return `${Math.round(rate * 100)}%`;
}

function formatPitch(value) {
  return value > 0 ? `+${value}` : "";
}

function formatRepeatCount() {
  return `x${repeatCount}`;
}

function updateFullChantLabel() {
  fullChantButton.textContent = activeTranslationLanguage === "pl" ? "Cały tekst" : "Full chant";
  fullChantFastButton.textContent = activeTranslationLanguage === "pl"
    ? "Cały tekst szybciej"
    : "Full chant faster";
}

function updateChangeChantLabel() {
  changeChantButton.textContent = activeTranslationLanguage === "pl" ? "Strona główna" : "Main page";
}

fullChantButton.addEventListener("click", () => playFullChant());
fullChantFastButton.addEventListener("click", () => playFullChant(
  FULL_CHANT_FAST_RATE,
  fullChantFastButton,
));
changeChantButton.addEventListener("click", () => {
  window.location.hash = "";
  showChantChooser();
});
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
pitchControls.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-pitch]");

  if (!button) {
    return;
  }

  setPitchShift(Number(button.dataset.pitch));
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
translationControls.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-translation-language]");

  if (!button) {
    return;
  }

  setTranslationLanguage(button.dataset.translationLanguage);
});
resetProgressButton.addEventListener("click", resetProgress);
translationCloseButton.addEventListener("click", closeTranslationModal);
translationModal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-translation]")) {
    closeTranslationModal();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !translationModal.hidden) {
    closeTranslationModal();
  }
});
