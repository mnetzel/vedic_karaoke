const CHANTS = {
  "sri-suktam": {
    title: "Śri Suktam",
    layout: "single",
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
    layout: "collection",
    combinePhrasePairs: false,
    folder: "input/sri-rudram",
    image: "input/sri-rudram/Sri_Rudram.jpg",
    audioCredit: null,
    sections: {
      namakam: {
        title: "Namakam",
        dataSource: "chapterExport",
        chapterExport: {
          folder: "input/sri-rudram/namakam-export",
          manifest: "input/sri-rudram/namakam-export/manifest.json",
        },
        translations: {
          pl: "input/sri-rudram/Namakam_translation_pl.md",
          eng: "input/sri-rudram/Namakam_translation_eng.md",
        },
        audioVariants: {
          default: {
            label: "Audio 1",
            exportAudioId: "audio_mpn28w6y_21szfb",
            supportsPitch: false,
          },
          challakere: {
            label: "Audio 2",
            exportAudioId: "audio_mpn2fso9_2oov2x",
            supportsPitch: false,
          },
        },
      },
      camakam: {
        title: "Camakam",
        textGrid: "input/sri-rudram/Camakam.TextGrid",
        anuvakaTier: "anuvaka",
        translations: {
          pl: "input/sri-rudram/Camakam_translation_pl.md",
          eng: "input/sri-rudram/Camakam_translation_eng.md",
        },
        audio: {
          0: {
            1: "input/sri-rudram/Camakam.ogg",
            0.7: "input/sri-rudram/Camakam_tempo_70.ogg",
            1.25: "input/sri-rudram/Camakam_tempo_125.ogg",
          },
          1: {
            1: "input/sri-rudram/Camakam_pitch_up_1_semitone.ogg",
            0.7: "input/sri-rudram/Camakam_pitch_up_1_semitone_70.ogg",
            1.25: "input/sri-rudram/Camakam_pitch_up_1_semitone_tempo_125.ogg",
          },
          2: {
            1: "input/sri-rudram/Camakam_pitch_up_2_semitones.ogg",
            0.7: "input/sri-rudram/Camakam_pitch_up_2_semitones_70.ogg",
            1.25: "input/sri-rudram/Camakam_pitch_up_2_semitones_tempo_125.ogg",
          },
        },
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
const DEFAULT_AUDIO_VARIANT_ID = "default";
const SLOKA_TIER_PREFIX = "sloka";
const PHRASE_TIER_PREFIX = "phrase";
const LEGACY_PADA_TIER_PREFIX = "pada";
const PHRASE_TIER_KEY = "pada";
const GROUP_TIME_TOLERANCE = 0.08;
const DEFAULT_REPEAT_COUNT = 5;
const REPEAT_GAP_SECONDS = 1;
const ORIENTATION_SCROLL_STORAGE_KEY = "vedic-karaoke:orientation-scroll";

const chantChooser = document.querySelector("#chantChooser");
const collectionChooser = document.querySelector("#collectionChooser");
const karaokeView = document.querySelector("#karaokeView");
const chantChoiceButtons = [...document.querySelectorAll("[data-chant-id]")];
const collectionTitle = document.querySelector("#collectionTitle");
const collectionImage = document.querySelector("#collectionImage");
const collectionHomeButton = document.querySelector("#collectionHomeButton");
const anuvakaNavigation = document.querySelector("#anuvakaNavigation");
const previousAnuvakaButton = document.querySelector("#previousAnuvakaButton");
const collectionBackButton = document.querySelector("#collectionBackButton");
const nextAnuvakaButton = document.querySelector("#nextAnuvakaButton");
const sectionChooserPanel = document.querySelector("#sectionChooserPanel");
const sectionOptions = document.querySelector("#sectionOptions");
const anuvakaChooserPanel = document.querySelector("#anuvakaChooserPanel");
const sectionBackButton = document.querySelector("#sectionBackButton");
const sectionTitle = document.querySelector("#sectionTitle");
const anuvakaOptions = document.querySelector("#anuvakaOptions");
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
const textSizeButton = document.querySelector("#textSizeButton");
const hidePadasButton = document.querySelector("#hidePadasButton");
const audioVariantButton = document.querySelector("#audioVariantButton");
const repeatControls = document.querySelector("#repeatControls");
const filterControls = document.querySelector("#filterControls");
const scriptControls = document.querySelector("#scriptControls");
const translationControls = document.querySelector("#translationControls");
const pitchControls = document.querySelector("#pitchControls");
const pitchButton = document.querySelector("#pitchButton");
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
let activeSectionId = null;
let activeSection = null;
let activeAnuvaka = null;
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
let textSizeLevel = savedSettings.textSizeLevel;
let padasHidden = savedSettings.padasHidden;
let activeAudioVariantId = savedSettings.audioVariantId;
let slokaRatings = {};
let viewportOrientation = getViewportOrientation();
let orientationReloadPending = false;

init();

function init() {
  setupOrientationReload();
  renderChantChooser();
  window.addEventListener("hashchange", handleRouteChange);
  handleRouteChange();
}

function setupOrientationReload() {
  window.addEventListener("resize", () => {
    if (orientationReloadPending) {
      return;
    }

    const nextOrientation = getViewportOrientation();

    if (nextOrientation === viewportOrientation) {
      return;
    }

    // Mobile browsers can leave the dense karaoke layout broken after rotation.
    orientationReloadPending = true;
    saveOrientationScrollTarget();
    location.reload();
  });
}

function getViewportOrientation() {
  return window.innerHeight >= window.innerWidth ? "portrait" : "landscape";
}

function handleRouteChange() {
  const route = getRouteFromHash();

  if (!route.chantId) {
    showChantChooser();
    return;
  }

  const chant = CHANTS[route.chantId];

  if (chant.layout === "collection") {
    if (!route.sectionId || !route.anuvakaId) {
      showCollectionChooser(route.chantId);
      return;
    }

    loadChant(route.chantId, route.sectionId, route.anuvakaId);
    return;
  }

  loadChant(route.chantId);
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
  activeSectionId = null;
  activeSection = null;
  activeAnuvaka = null;
  document.body.classList.remove("has-active-chant");
  chantChooser.hidden = false;
  collectionChooser.hidden = true;
  karaokeView.hidden = true;
  document.title = "Vedic Karaoke";
}

function showCollectionChooser(chantId) {
  const chant = CHANTS[chantId];

  if (!chant) {
    showChantChooser();
    return;
  }

  chantLoadRequestId += 1;
  stopPlayback();
  activeChantId = chantId;
  activeChant = chant;
  activeSectionId = null;
  activeSection = null;
  activeAnuvaka = null;
  document.body.classList.remove("has-active-chant");
  chantChooser.hidden = true;
  collectionChooser.hidden = false;
  karaokeView.hidden = true;
  collectionTitle.textContent = chant.title;
  collectionImage.src = chant.image;
  updateChangeChantLabel();
  sectionChooserPanel.hidden = false;
  anuvakaChooserPanel.hidden = true;
  renderCollectionAnuvakaOptions(chantId);
  document.title = `${chant.title} | Vedic Karaoke`;
}

async function renderCollectionAnuvakaOptions(chantId) {
  const chant = CHANTS[chantId];
  const requestId = chantLoadRequestId;
  const panels = Object.entries(chant.sections || {}).map(([sectionId, section]) => {
    const panel = document.createElement("section");
    panel.className = "section-anuvaka-panel";
    panel.innerHTML = `
      <h2 class="section-title">${escapeHtml(section.title)}</h2>
      <div class="anuvaka-options">
        <p class="empty-state">Ładowanie anuvak...</p>
      </div>
    `;
    loadSectionAnuvakaButtons(chantId, sectionId, section, panel, requestId);
    return panel;
  });

  sectionOptions.replaceChildren(...panels);
}

async function loadSectionAnuvakaButtons(chantId, sectionId, section, panel, requestId) {
  const options = panel.querySelector(".anuvaka-options");

  try {
    const effectiveSection = getEffectiveUnit(section);
    const anuvakas = usesChapterExport(effectiveSection)
      ? getChapterExportAnuvakas(await loadChapterExportManifest(effectiveSection))
      : getAnuvakaIntervals((await loadTextGridData(effectiveSection)).tiers, effectiveSection);

    if (requestId !== chantLoadRequestId) {
      return;
    }

    if (anuvakas.length === 0) {
      throw new Error("Brak anuvak.");
    }

    options.replaceChildren(...createAnuvakaButtons(chantId, sectionId, anuvakas));
  } catch (error) {
    console.error(error);

    if (requestId === chantLoadRequestId) {
      options.innerHTML = `<p class="empty-state">Nie udało się załadować ${escapeHtml(section.title)}: ${escapeHtml(error.message)}</p>`;
    }
  }
}

function getAudioVariantEntries(unit = activeSection || activeChant) {
  return Object.entries(unit?.audioVariants || {});
}

function getActiveAudioVariantConfig(unit = activeSection || activeChant) {
  const variants = unit?.audioVariants;

  if (!variants) {
    return null;
  }

  return variants[activeAudioVariantId] ||
    variants[DEFAULT_AUDIO_VARIANT_ID] ||
    Object.values(variants)[0] ||
    null;
}

function normalizeAudioVariantForUnit(unit) {
  const variants = unit?.audioVariants;

  if (!variants) {
    activeAudioVariantId = DEFAULT_AUDIO_VARIANT_ID;
    return;
  }

  if (!variants[activeAudioVariantId]) {
    activeAudioVariantId = variants[DEFAULT_AUDIO_VARIANT_ID]
      ? DEFAULT_AUDIO_VARIANT_ID
      : Object.keys(variants)[0];
  }
}

function getEffectiveUnit(unit) {
  const variant = getActiveAudioVariantConfig(unit);

  if (!variant) {
    return unit;
  }

  return {
    ...unit,
    ...variant,
    audioVariants: unit.audioVariants,
    translations: unit.translations || variant.translations,
    anuvakaTier: variant.anuvakaTier || unit.anuvakaTier,
  };
}

function usesChapterExport(unit) {
  return unit?.dataSource === "chapterExport" && Boolean(unit.chapterExport);
}

function getChapterExportFolder(unit) {
  return unit.chapterExport.folder.replace(/\/$/, "");
}

async function loadChapterExportManifest(unit) {
  const response = await fetch(unit.chapterExport.manifest);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

function getChapterExportAnuvakas(manifest) {
  return (manifest.chapters || []).map((chapter) => {
    const label = String(chapter.index + 1);
    return {
      id: `anuvaka-${label}`,
      label,
      xmin: 0,
      xmax: 0,
      title: chapter.title,
      exportFile: chapter.file,
      exportFolder: chapter.folder,
      audioFiles: Object.fromEntries((chapter.audio || []).map((audio) => [audio.id, audio.file])),
    };
  });
}

async function loadChapterExportChapter(unit, anuvaka) {
  const response = await fetch(`${getChapterExportFolder(unit)}/${anuvaka.exportFile}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

function getActiveExportAudioId(unit = getEffectiveUnit(activeSection || activeChant)) {
  const audioId = unit?.exportAudioId;

  if (audioId) {
    return audioId;
  }

  const variant = getActiveAudioVariantConfig(activeSection || activeChant);
  return variant?.exportAudioId || "";
}

async function showAnuvakaChooser(chantId, sectionId) {
  const chant = CHANTS[chantId];
  const section = chant?.sections?.[sectionId];
  const requestId = chantLoadRequestId + 1;

  if (!chant || !section) {
    showCollectionChooser(chantId);
    return;
  }

  chantLoadRequestId = requestId;
  stopPlayback();
  activeChantId = chantId;
  activeChant = chant;
  activeSectionId = sectionId;
  activeSection = section;
  activeAnuvaka = null;
  normalizeAudioVariantForUnit(section);
  document.body.classList.remove("has-active-chant");
  chantChooser.hidden = true;
  collectionChooser.hidden = false;
  karaokeView.hidden = true;
  collectionTitle.textContent = chant.title;
  collectionImage.src = chant.image;
  updateChangeChantLabel();
  sectionChooserPanel.hidden = true;
  anuvakaChooserPanel.hidden = false;
  sectionTitle.textContent = section.title;
  anuvakaOptions.innerHTML = '<p class="empty-state">Ładowanie anuvak...</p>';
  document.title = `${section.title} | ${chant.title} | Vedic Karaoke`;

  try {
    const data = await loadTextGridData(getEffectiveUnit(section));

    if (requestId !== chantLoadRequestId) {
      return;
    }

    const effectiveSection = getEffectiveUnit(section);
    const anuvakas = getAnuvakaIntervals(data.tiers, effectiveSection);

    if (anuvakas.length === 0) {
      throw new Error("TextGrid nie zawiera warstwy anuvaka.");
    }

    renderAnuvakaOptions(chantId, sectionId, anuvakas);
  } catch (error) {
    console.error(error);
    anuvakaOptions.innerHTML = `<p class="empty-state">Nie udało się załadować ${escapeHtml(getEffectiveUnit(section).textGrid)}: ${escapeHtml(error.message)}</p>`;
  }
}

function renderAnuvakaOptions(chantId, sectionId, anuvakas) {
  anuvakaOptions.replaceChildren(...createAnuvakaButtons(chantId, sectionId, anuvakas));
}

function createAnuvakaButtons(chantId, sectionId, anuvakas) {
  return anuvakas.map((anuvaka) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "anuvaka-button";
    button.textContent = formatAnuvakaLabel(anuvaka);
    button.addEventListener("click", () => {
      window.location.hash = `${chantId}/${sectionId}/${anuvaka.id}`;
    });
    return button;
  });
}

function withAnuvakaNavigation(anuvaka, anuvakas) {
  if (!anuvaka) {
    return null;
  }

  const index = anuvakas.findIndex((candidate) => candidate.id === anuvaka.id);
  const previous = index > 0 ? anuvakas[index - 1] : null;
  const next = index >= 0 && index < anuvakas.length - 1 ? anuvakas[index + 1] : null;

  return {
    ...anuvaka,
    previousAnuvaka: previous
      ? { id: previous.id, label: previous.label, title: previous.title }
      : null,
    nextAnuvaka: next
      ? { id: next.id, label: next.label, title: next.title }
      : null,
  };
}

async function loadChapterExportChant(effectiveUnit, anuvakaId, requestId) {
  const manifest = await loadChapterExportManifest(effectiveUnit);

  if (requestId !== chantLoadRequestId) {
    return;
  }

  const anuvakas = getChapterExportAnuvakas(manifest);
  const anuvaka = anuvakas.find((interval) => interval.id === anuvakaId);

  if (anuvakaId && !anuvaka) {
    throw new Error(`Nie znaleziono ${anuvakaId}.`);
  }

  if (!anuvaka) {
    throw new Error("Brak wybranej anuvaki.");
  }

  const chapter = await loadChapterExportChapter(effectiveUnit, anuvaka);

  if (requestId !== chantLoadRequestId) {
    return;
  }

  const audioId = getActiveExportAudioId(effectiveUnit);
  activeAnuvaka = {
    ...withAnuvakaNavigation(anuvaka, anuvakas),
    xmin: 0,
    xmax: getChapterExportAudioDuration(chapter, audioId),
  };
  padasHidden = false;
  normalizePlaybackSettingsForActiveAudio();
  updateChantHeader();
  slokaRatings = loadSlokaRatings();
  segmentGroups = buildSegmentGroupsFromChapterExport(chapter, audioId);
  slokaTranslations = await loadAllTranslationSections();

  if (requestId !== chantLoadRequestId) {
    return;
  }

  attachTranslations(segmentGroups, slokaTranslations);
  renderGroups(segmentGroups);
  applySavedControls();
  restoreOrientationScrollTarget();
  updateSummary();
  loadAudioBuffer(playbackRate, pitchShift);
}

async function loadChant(chantId, sectionId = "", anuvakaId = "") {
  const chant = CHANTS[chantId];
  const section = sectionId ? chant?.sections?.[sectionId] : null;
  const unit = section || chant;
  const requestId = chantLoadRequestId + 1;

  if (!chant || !unit) {
    showChantChooser();
    return;
  }

  chantLoadRequestId = requestId;
  stopPlayback();
  activeChantId = chantId;
  activeChant = chant;
  activeSectionId = sectionId || null;
  activeSection = section;
  normalizeAudioVariantForUnit(unit);
  activeAnuvaka = null;
  tiers = [];
  segmentGroups = [];
  slokaTranslations = {};
  slokaRatings = {};
  audioBuffers.clear();
  audioLoadPromises.clear();
  activeFullChantGroup = null;
  document.body.classList.add("has-active-chant");
  chantChooser.hidden = true;
  collectionChooser.hidden = true;
  karaokeView.hidden = false;
  updateChantHeader();
  segmentsRoot.innerHTML = "";
  summary.textContent = `Ładowanie ${getActiveTitle()}...`;

  try {
    const effectiveUnit = getEffectiveUnit(unit);

    if (usesChapterExport(effectiveUnit)) {
      await loadChapterExportChant(effectiveUnit, anuvakaId, requestId);
      return;
    }

    const data = await loadTextGridData(effectiveUnit);

    if (requestId !== chantLoadRequestId) {
      return;
    }

    tiers = data.tiers;

    if (tiers.length === 0) {
      throw new Error("Brak niepustych segmentów w TextGridzie.");
    }

    const tierSet = data.tierSet;
    const slokaTier = getVariantTier(tierSet.sloka, activeTextVariant);
    const padaTier = getVariantTier(tierSet.pada, activeTextVariant);

    if (!slokaTier) {
      throw new Error("TextGrid musi zawierać warstwy sloka-*.");
    }

    const anuvakas = getAnuvakaIntervals(tiers, effectiveUnit);
    const anuvaka = anuvakaId
      ? anuvakas.find((interval) => interval.id === anuvakaId)
      : null;

    if (anuvakaId && !anuvaka) {
      throw new Error(`Nie znaleziono ${anuvakaId}.`);
    }

    activeAnuvaka = withAnuvakaNavigation(anuvaka, anuvakas);
    normalizePlaybackSettingsForActiveAudio();
    updateChantHeader();
    slokaRatings = loadSlokaRatings();
    const slokaIntervals = filterIntervalsForRange(withSourceIndexes(slokaTier.intervals), anuvaka);
    const padaIntervals = filterIntervalsForRange(withSourceIndexes(padaTier?.intervals || []), anuvaka);

    segmentGroups = buildSegmentGroups(tierSet, slokaIntervals, padaIntervals);
    slokaTranslations = await loadAllTranslationSections();

    if (requestId !== chantLoadRequestId) {
      return;
    }

    attachTranslations(segmentGroups, slokaTranslations);
    renderGroups(segmentGroups);
    applySavedControls();
    restoreOrientationScrollTarget();
    updateSummary();
    loadAudioBuffer(playbackRate, pitchShift);
  } catch (error) {
    console.error(error);
    const failedSource = getEffectiveUnit(unit).textGrid ||
      getEffectiveUnit(unit).chapterExport?.manifest ||
      getActiveTitle();
    summary.textContent = `Nie udało się załadować ${failedSource}.`;
    segmentsRoot.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  }
}

function getRouteFromHash() {
  const parts = decodeURIComponent(window.location.hash.replace(/^#/, "").trim())
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  const [chantId, sectionId, anuvakaId] = parts;

  return {
    chantId: CHANTS[chantId] ? chantId : "",
    sectionId: sectionId || "",
    anuvakaId: anuvakaId || "",
  };
}

function updateChantHeader() {
  chantTitle.textContent = getActiveTitle();
  chantImage.src = activeChant.image;
  chantImage.alt = "";
  updateAnuvakaNavigation();

  if (activeChant.audioCredit) {
    audioCredit.hidden = false;
    audioCreditLink.textContent = activeChant.audioCredit.label;
    audioCreditLink.href = activeChant.audioCredit.url;
  } else {
    audioCredit.hidden = true;
    audioCreditLink.removeAttribute("href");
    audioCreditLink.textContent = "";
  }

  document.title = `${getActiveTitle()} | Vedic Karaoke`;
}

function updateAnuvakaNavigation() {
  const shouldShow = activeChant?.layout === "collection" && activeAnuvaka;

  anuvakaNavigation.hidden = !shouldShow;

  if (!shouldShow) {
    return;
  }

  updateAnuvakaNavigationButton(previousAnuvakaButton, activeAnuvaka.previousAnuvaka, "previous");
  updateAnuvakaNavigationButton(nextAnuvakaButton, activeAnuvaka.nextAnuvaka, "next");
}

function updateAnuvakaNavigationButton(button, anuvaka, direction) {
  button.disabled = !anuvaka;
  button.classList.toggle("is-placeholder", !anuvaka);

  if (!anuvaka) {
    button.removeAttribute("data-anuvaka-id");
    button.textContent = "";
    return;
  }

  button.dataset.anuvakaId = anuvaka.id;
  button.textContent = direction === "previous"
    ? `← ${formatAnuvakaLabel(anuvaka)}`
    : `${formatAnuvakaLabel(anuvaka)} →`;
}

function getActiveTitle() {
  return [
    activeChant?.title,
    activeSection?.title,
    activeAnuvaka ? formatAnuvakaLabel(activeAnuvaka) : "",
  ].filter(Boolean).join(" · ");
}

async function loadTextGridData(unit) {
  const response = await fetch(unit.textGrid);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const textGrid = await readTextGridResponse(response);
  const parsedTiers = parseTextGrid(textGrid).filter((tier) => tier.intervals.length > 0);
  return {
    tiers: parsedTiers,
    tierSet: buildTierSet(parsedTiers),
  };
}

function getAnuvakaIntervals(sourceTiers, unit) {
  const tierName = normalizeLabel(unit.anuvakaTier || "anuvaka");
  const tier = sourceTiers.find((candidate) => normalizeLabel(candidate.name) === tierName);

  if (!tier) {
    return [];
  }

  return tier.intervals
    .map((interval, index) => {
      const label = String(interval.text || index + 1).trim() || String(index + 1);
      const number = label.match(/\d+/)?.[0] || String(index + 1);

      return {
        ...interval,
        id: `anuvaka-${number}`,
        label: number,
        index,
      };
    })
    .filter((interval) => interval.xmax > interval.xmin);
}

function formatAnuvakaLabel(anuvaka) {
  return `Anuvaka ${anuvaka.label}`;
}

function withSourceIndexes(intervals) {
  return intervals.map((interval, index) => ({ ...interval, sourceIndex: index }));
}

function filterIntervalsForRange(intervals, range) {
  if (!range) {
    return intervals;
  }

  return intervals.filter((interval) => isInsideInterval(interval, range));
}

async function loadAudioBuffer(rate, pitch = pitchShift) {
  const key = getAudioKey(rate, pitch);
  const audioFile = getAudioFile(rate, pitch);

  if (!audioFile) {
    throw new Error("Brak skonfigurowanego pliku audio.");
  }

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
  return `${[
    activeChantId,
    activeSectionId,
    getActiveAudioVariantStorageKey(),
    activeAnuvaka?.id,
    pitch,
    getRateKey(rate),
  ].filter(Boolean).join(":")}`;
}

function getAudioFile(rate, pitch = pitchShift) {
  const effectiveUnit = getEffectiveUnit(activeSection || activeChant);

  if (activeAnuvaka && usesChapterExport(effectiveUnit)) {
    return getChapterExportAudioFile(effectiveUnit, activeAnuvaka, rate, pitch);
  }

  if (activeAnuvaka && effectiveUnit?.anuvakaAudio) {
    return getAnuvakaAudioFile(effectiveUnit.anuvakaAudio, activeAnuvaka, rate, pitch);
  }

  return getAudioFileFromMap(getActiveAudioMap(), rate, pitch);
}

function getAudioFileForChant(chant, rate, pitch = 0) {
  return getAudioFileFromMap(chant?.audio, rate, pitch);
}

function getAudioFileFromMap(audioMap, rate, pitch = 0) {
  if (!audioMap) {
    return "";
  }

  return audioMap[pitch]?.[getRateKey(rate)] || audioMap[0]?.[getRateKey(rate)] || "";
}

function getActiveAudioMap() {
  const effectiveUnit = getEffectiveUnit(activeSection || activeChant);
  return effectiveUnit?.audio || activeSection?.audio || activeChant?.audio || null;
}

function getRateKey(rate) {
  return String(rate);
}

function getActiveAudioVariantStorageKey() {
  return getAudioVariantEntries().length > 0 ? activeAudioVariantId : "";
}

function getActiveSlowRate() {
  const effectiveUnit = getEffectiveUnit(activeSection || activeChant);
  return effectiveUnit?.anuvakaAudio?.slowRate || effectiveUnit?.slowRate || 0.7;
}

function activeAudioSupportsPitch() {
  const effectiveUnit = getEffectiveUnit(activeSection || activeChant);
  return effectiveUnit?.supportsPitch !== false &&
    effectiveUnit?.anuvakaAudio?.supportsPitch !== false;
}

function normalizePlaybackSettingsForActiveAudio() {
  const slowRate = getActiveSlowRate();

  if (playbackRate !== 1 && playbackRate !== FULL_CHANT_FAST_RATE) {
    playbackRate = slowRate;
  }

  if (pitchShift > 0 && !activeAudioSupportsPitch()) {
    pitchShift = 0;
  }

  if (playbackRate !== 1 && !getAudioFile(playbackRate, pitchShift)) {
    playbackRate = 1;
  }

  if (pitchShift > 0 && !getAudioFile(playbackRate, pitchShift)) {
    pitchShift = 0;
  }
}

function getAnuvakaAudioFile(audioConfig, anuvaka, rate, pitch = 0) {
  const suffix = getAudioVariantSuffix(rate, pitch, audioConfig);

  if (suffix === null) {
    return "";
  }

  const number = String(anuvaka.label).padStart(2, "0");
  return `${audioConfig.folder}/${audioConfig.prefix}${number}${suffix}.ogg`;
}

function getChapterExportAudioFile(unit, anuvaka, rate, pitch = 0) {
  if (Number(rate) !== 1 || Number(pitch) !== 0) {
    return "";
  }

  const audioId = getActiveExportAudioId(unit);
  const file = anuvaka.audioFiles?.[audioId];

  return file ? `${getChapterExportFolder(unit)}/${file}` : "";
}

function getChapterExportAudioDuration(chapter, audioId) {
  return Number((chapter.audio || []).find((audio) => audio.id === audioId)?.duration) ||
    Number(chapter.chapter?.duration) ||
    0;
}

function getAudioVariantSuffix(rate, pitch = 0, audioConfig = null) {
  if (audioConfig?.rateSuffixes) {
    const suffix = audioConfig.rateSuffixes[getRateKey(rate)];

    if (suffix === undefined || (pitch > 0 && audioConfig.supportsPitch === false)) {
      return null;
    }

    return suffix;
  }

  const pitchSuffix = pitch > 0 ? `_pitch_up_${pitch}_semitone${pitch > 1 ? "s" : ""}` : "";

  if (Number(rate) === 0.7) {
    return `${pitchSuffix}${pitch > 0 ? "_70" : "_tempo_70"}`;
  }

  if (Number(rate) === FULL_CHANT_FAST_RATE) {
    return `${pitchSuffix}_tempo_125`;
  }

  return pitchSuffix;
}

function getActiveAudioOffset() {
  const effectiveUnit = getEffectiveUnit(activeSection || activeChant);
  return activeAnuvaka && effectiveUnit?.anuvakaAudio ? activeAnuvaka.xmin : 0;
}

function getAudioStartForInterval(interval, rate) {
  return Math.max(0, interval.xmin - getActiveAudioOffset()) * getAudioTimingScale(rate);
}

function getAudioDurationForInterval(interval, rate) {
  return Math.max(0.01, interval.xmax - interval.xmin) * getAudioTimingScale(rate);
}

function getAudioTimingScale(rate) {
  const effectiveUnit = getEffectiveUnit(activeSection || activeChant);
  const audioConfig = effectiveUnit?.anuvakaAudio;
  const configuredScale = audioConfig?.timeScaleByRate?.[getRateKey(rate)];

  if (configuredScale !== undefined) {
    return Number(configuredScale);
  }

  return 1 / Number(rate || 1);
}

function getTextGridRateForAudio(rate) {
  return 1 / getAudioTimingScale(rate);
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

  if (!variant) {
    return null;
  }

  if (normalizedKind === SLOKA_TIER_PREFIX) {
    return { kind: SLOKA_TIER_PREFIX, variant };
  }

  if ([PHRASE_TIER_PREFIX, LEGACY_PADA_TIER_PREFIX].includes(normalizedKind)) {
    return { kind: PHRASE_TIER_KEY, variant };
  }

  return null;
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
    const sourceIndex = Number.isInteger(sloka.sourceIndex) ? sloka.sourceIndex : index;

    return {
      id,
      slokaNumber: sourceIndex + 1,
      sloka: createVariantInterval(sloka, tierSet.sloka, sourceIndex),
      rating: getSlokaRating(id),
      padas: basePadaIntervals
        .map((pada, padaIndex) => {
          const padaSourceIndex = Number.isInteger(pada.sourceIndex) ? pada.sourceIndex : padaIndex;
          return createVariantInterval(pada, tierSet.pada, padaSourceIndex);
        })
        .filter((pada) => isInsideInterval(pada, sloka)),
    };
  }).filter((group) => getIntervalText(group.sloka));
}

function buildSegmentGroupsFromChapterExport(chapter, audioId) {
  let slokaNumber = 0;

  return (chapter.verses || []).reduce((groups, verse) => {
    const texts = mapExportTexts(verse.texts);
    const timing = verse.timings?.[audioId];

    if (!hasAnyText(texts) || !isValidTiming(timing)) {
      return groups;
    }

    slokaNumber += 1;
    const id = `export:${chapter.chapter?.index ?? 0}:${verse.id || verse.index}`;
    const sloka = createExportInterval(timing, texts);
    const padas = (verse.phrases || [])
      .map((phrase) => createExportInterval(phrase.timings?.[audioId], mapExportTexts(phrase.texts)))
      .filter((phrase) => hasAnyText(phrase.texts) && phrase.xmax > phrase.xmin);

    groups.push({
      id,
      slokaNumber,
      sloka,
      rating: getSlokaRating(id),
      padas,
    });

    return groups;
  }, []);
}

function mapExportTexts(texts = {}) {
  return {
    Devanagari: texts.devanagari || "",
    IAST: texts.iast || "",
    PL: texts.polish || "",
  };
}

function createExportInterval(timing, texts) {
  return {
    xmin: Number(timing?.start || 0),
    xmax: Number(timing?.end || 0),
    text: resolveVariantText(texts),
    texts,
  };
}

function hasAnyText(texts = {}) {
  return Object.values(texts).some(Boolean);
}

function isValidTiming(timing) {
  return Number.isFinite(Number(timing?.start)) &&
    Number.isFinite(Number(timing?.end)) &&
    Number(timing.end) > Number(timing.start);
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
  const url = activeSection?.translations?.[language] || activeChant?.translations?.[language];

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
  return `vedic-karaoke:ratings:${[
    activeChantId || DEFAULT_CHANT_ID,
    activeSectionId,
    activeAnuvaka?.id,
  ].filter(Boolean).join(":")}`;
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
    textSizeLevel: 0,
    padasHidden: false,
    audioVariantId: DEFAULT_AUDIO_VARIANT_ID,
  };

  try {
    const saved =
      JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_SETTINGS_STORAGE_KEY)) || {};
    const playbackRate = [1, 0.7, 0.8].includes(Number(saved.playbackRate))
      ? Number(saved.playbackRate)
      : defaults.playbackRate;
    const defaultChant = CHANTS[DEFAULT_CHANT_ID];
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
    const textSizeLevel = [0, 1, 2].includes(Number(saved.textSizeLevel))
      ? Number(saved.textSizeLevel)
      : defaults.textSizeLevel;
    const padasHidden = Boolean(saved.padasHidden);
    const audioVariantId = typeof saved.audioVariantId === "string" && saved.audioVariantId
      ? saved.audioVariantId
      : defaults.audioVariantId;

    return {
      playbackRate,
      pitchShift,
      repeatCount,
      ratingFilter,
      textVariant,
      translationLanguage,
      textSizeLevel,
      padasHidden,
      audioVariantId,
    };
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
        textSizeLevel,
        padasHidden,
        audioVariantId: activeAudioVariantId,
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
  updateTextSizeButton();
  updateHidePadasButton();
  updateAudioVariantButton();
  updatePhraseButtonLabels();
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
  const phraseCount = segmentGroups.reduce((count, group) => count + group.padas.length, 0);
  const phraseLabel = activeTranslationLanguage === "pl" ? "fraz" : "phrases";
  const visibleGroups = countVisibleGroups();
  const slokaSummary =
    activeRatingFilter === "all"
      ? `${segmentGroups.length} ślok`
      : `${visibleGroups}/${segmentGroups.length} ślok`;
  summary.textContent = `${slokaSummary} | ${phraseCount} ${phraseLabel} | ${audioStatus}`;
}

function saveOrientationScrollTarget() {
  const group = getCenteredSlokaGroupElement();

  if (!group?.dataset.slokaId) {
    return;
  }

  try {
    sessionStorage.setItem(
      ORIENTATION_SCROLL_STORAGE_KEY,
      JSON.stringify({
        hash: window.location.hash,
        slokaId: group.dataset.slokaId,
      }),
    );
  } catch (error) {
    console.warn("Nie udało się zapisać pozycji przed zmianą orientacji.", error);
  }
}

function getCenteredSlokaGroupElement() {
  const viewportMiddle = window.innerHeight / 2;
  const groups = [...document.querySelectorAll(".segment-group[data-sloka-id]")]
    .filter((group) => !group.hidden);

  return groups.reduce((closest, group) => {
    const rect = group.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height / 2 - viewportMiddle);

    if (!closest || distance < closest.distance) {
      return { group, distance };
    }

    return closest;
  }, null)?.group || null;
}

function restoreOrientationScrollTarget() {
  let saved = null;

  try {
    saved = JSON.parse(sessionStorage.getItem(ORIENTATION_SCROLL_STORAGE_KEY) || "null");
    sessionStorage.removeItem(ORIENTATION_SCROLL_STORAGE_KEY);
  } catch (error) {
    return;
  }

  if (!saved || saved.hash !== window.location.hash || !saved.slokaId) {
    return;
  }

  window.requestAnimationFrame(() => {
    [...document.querySelectorAll(".segment-group[data-sloka-id]")]
      .find((group) => group.dataset.slokaId === saved.slokaId)
      ?.scrollIntoView({ block: "center" });
  });
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
      updateSlokaNumberBadge(slokaButton, group.slokaNumber);
      group.element = groupElement;
      group.slokaButton = slokaButton;
      const slokaHeader = document.createElement("div");
      slokaHeader.className = "sloka-header";
      const slokaActions = document.createElement("div");
      slokaActions.className = "sloka-actions";
      const translationButton = createTranslationButton(group);
      const slokaRepeatButton = createRepeatButton(group.sloka, slokaButton);
      slokaActions.replaceChildren(
        ...[
          translationButton,
          createRatingControl(group, groupElement),
          slokaRepeatButton,
        ].filter(Boolean),
      );
      slokaHeader.replaceChildren(slokaButton, slokaActions);

      const padasElement = document.createElement("div");
      padasElement.className = "pada-list";

      padasElement.replaceChildren(...renderPadaPairs(group.padas, shouldCombinePhrasePairs()));

      groupElement.replaceChildren(
        ...[slokaHeader, group.padas.length > 0 ? padasElement : null].filter(Boolean),
      );
      return groupElement;
    }),
  );
  applyRatingFilter();
}

function shouldCombinePhrasePairs() {
  return activeSection?.combinePhrasePairs ?? activeChant?.combinePhrasePairs ?? true;
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

function renderPadaPairs(padas, combinePhrasePairs = true) {
  if (!combinePhrasePairs) {
    return padas.map((phrase, index) => {
      const button = createSegmentButton(
        phrase,
        formatPhraseLabel(index + 1),
        "pada-button",
      );

      return createPadaControl(button, createRepeatButton(phrase, button));
    });
  }

  const rows = [];

  for (let index = 0; index < padas.length; index += 2) {
    const first = padas[index];
    const second = padas[index + 1];

    if (!second) {
      const singleButton = createSegmentButton(
        first,
        formatPhraseLabel(index + 1),
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
    const firstButton = createSegmentButton(first, formatPhraseLabel(index + 1), "pada-button");
    const secondButton = createSegmentButton(second, formatPhraseLabel(index + 2), "pada-button");

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
      formatPhraseRangeLabel(index + 1, index + 2),
      "pada-button pada-combined",
      [
        { interval: first, button: firstButton },
        { interval: second, button: secondButton },
      ],
    );
    combinedButton.dataset.phraseStart = String(index + 1);
    combinedButton.dataset.phraseEnd = String(index + 2);
    const combinedRepeatButton = createRepeatButton(combinedInterval, combinedButton);
    const combinedControl = createCombinedControl(combinedRepeatButton, combinedButton);

    row.replaceChildren(singleButtons, combinedControl);
    rows.push(row);
  }

  return rows;
}

function formatPhraseLabel(index) {
  return `${activeTranslationLanguage === "pl" ? "Fraza" : "Phrase"} ${index}`;
}

function formatPhraseRangeLabel(start, end) {
  return `${activeTranslationLanguage === "pl" ? "Frazy" : "Phrases"} ${start}+${end}`;
}

function updatePhraseButtonLabels() {
  document.querySelectorAll("[data-phrase-start][data-phrase-end]").forEach((button) => {
    const label = formatPhraseRangeLabel(button.dataset.phraseStart, button.dataset.phraseEnd);
    const labelElement = button.querySelector(".segment-time");

    button._label = label;

    if (labelElement) {
      labelElement.textContent = label;
    }

    button.setAttribute("aria-label", createSegmentAriaLabel(label, button._interval));
  });
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
  button.addEventListener("click", () => playRepeatedInterval(button._interval, segmentButton, button));
  return button;
}

function createSegmentButton(interval, label, className, linkedParts = []) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `segment-button ${className}`;
  button.dataset.segmentLabel = "true";
  button._interval = interval;
  button._label = label;
  button._linkedParts = linkedParts;
  const visibleLabel = className.includes("pada-combined") ? label : "";

  if (visibleLabel) {
    button.classList.add("has-segment-meta");
  }

  button.innerHTML = `
    ${visibleLabel ? `<span class="segment-time">${escapeHtml(visibleLabel)}</span>` : ""}
    <span class="segment-text" data-segment-text></span>
  `;
  const textElement = button.querySelector("[data-segment-text]");
  textElement._interval = interval;
  textElement.textContent = getIntervalText(interval);
  button.addEventListener("click", () => playInterval(button._interval, button, button._linkedParts));
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

    const start = getAudioStartForInterval(interval, selectedRate);
    const playbackDuration = getAudioDurationForInterval(interval, selectedRate);
    const sources = playSegmentNormal(context, selectedBuffer, start, playbackDuration);

    activeSources = sources;
    activeTimer = window.setTimeout(() => {
      if (activeSources === sources) {
        stopPlayback();
      }
    }, playbackDuration * 1000 + 80);
    animateProgress(
      button,
      context.currentTime,
      interval,
      linkedParts,
      getTextGridRateForAudio(selectedRate),
    );
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

    const start = getAudioStartForInterval(interval, selectedRate);
    const playbackDuration = getAudioDurationForInterval(interval, selectedRate);
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
  const textGridStart = activeAnuvaka ? activeAnuvaka.xmin : 0;

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

    const start = getActiveAudioOffset() > 0
      ? 0
      : textGridStart * getAudioTimingScale(selectedRate);
    const playbackDuration = usesChapterExport(getEffectiveUnit(activeSection || activeChant))
      ? selectedBuffer.duration
      : activeAnuvaka
      ? getAudioDurationForInterval(activeAnuvaka, selectedRate)
      : selectedBuffer.duration;
    const sources = playSegmentNormal(context, selectedBuffer, start, playbackDuration);

    activeSources = sources;
    activeTimer = window.setTimeout(() => {
      if (activeSources === sources) {
        stopPlayback();
      }
    }, playbackDuration * 1000 + 80);
    animateFullChantProgress(
      context.currentTime,
      textGridStart,
      playbackDuration,
      getTextGridRateForAudio(selectedRate),
      triggerButton,
    );
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

function animateFullChantProgress(startedAt, textGridStart, playbackDuration, rate, button) {
  if (activeProgressFrame) {
    window.cancelAnimationFrame(activeProgressFrame);
  }

  const context = getAudioContext();
  const duration = Math.max(0.01, playbackDuration);

  const draw = () => {
    if (activeButton !== button) {
      return;
    }

    const elapsed = context.currentTime - startedAt;
    const progress = Math.min(1, Math.max(0, elapsed / duration));
    const textGridTime = textGridStart + elapsed * rate;

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
  normalizePlaybackSettingsForActiveAudio();
  saveSettings();
  updatePlaybackRateButtons();
  updatePlaybackRateLabel();

  updateSummary();
  loadAudioBuffer(playbackRate, pitchShift);
}

function setPitchShift(value) {
  if (!activeAudioSupportsPitch()) {
    return;
  }

  stopPlayback();
  pitchShift = value;
  saveSettings();
  updatePitchButtons();
  updateSummary();
  loadAudioBuffer(playbackRate, pitchShift);
}

function cyclePitchShift() {
  setPitchShift((pitchShift + 1) % 3);
}

function cycleTextSize() {
  textSizeLevel = (textSizeLevel + 1) % 3;
  saveSettings();
  updateTextSizeButton();
}

function togglePadasVisibility() {
  padasHidden = !padasHidden;
  saveSettings();
  updateHidePadasButton();
}

function cycleAudioVariant() {
  const variants = getAudioVariantEntries();

  if (variants.length < 2 || !activeChantId) {
    return;
  }

  const currentIndex = Math.max(0, variants.findIndex(([id]) => id === activeAudioVariantId));
  const [nextId] = variants[(currentIndex + 1) % variants.length];
  const anuvakaId = activeAnuvaka?.id || "";
  const previousId = activeAudioVariantId;
  const previousRate = playbackRate;
  const previousSlowRate = getActiveSlowRate();

  activeAudioVariantId = nextId;

  if (previousId === DEFAULT_AUDIO_VARIANT_ID && nextId !== DEFAULT_AUDIO_VARIANT_ID && previousRate === 1) {
    playbackRate = getActiveSlowRate();
  } else if (
    previousId !== DEFAULT_AUDIO_VARIANT_ID &&
    nextId === DEFAULT_AUDIO_VARIANT_ID &&
    previousRate === previousSlowRate
  ) {
    playbackRate = 1;
  }

  normalizePlaybackSettingsForActiveAudio();
  saveSettings();
  refreshAudioVariant(anuvakaId);
}

async function refreshAudioVariant(anuvakaId = activeAnuvaka?.id || "") {
  const unit = activeSection || activeChant;
  const requestId = chantLoadRequestId + 1;

  chantLoadRequestId = requestId;
  stopPlayback();
  updateAudioVariantButton();
  updatePlaybackRateLabel();
  updatePitchButtons();
  updateFullChantLabel();
  updateSummary();

  try {
    const effectiveUnit = getEffectiveUnit(unit);

    if (usesChapterExport(effectiveUnit)) {
      const manifest = await loadChapterExportManifest(effectiveUnit);

      if (requestId !== chantLoadRequestId) {
        return;
      }

      const anuvakas = getChapterExportAnuvakas(manifest);
      const anuvaka = anuvakaId
        ? anuvakas.find((interval) => interval.id === anuvakaId)
        : null;

      if (anuvakaId && !anuvaka) {
        throw new Error(`Nie znaleziono ${anuvakaId}.`);
      }

      const chapter = await loadChapterExportChapter(effectiveUnit, anuvaka);

      if (requestId !== chantLoadRequestId) {
        return;
      }

      const audioId = getActiveExportAudioId(effectiveUnit);
      activeAnuvaka = {
        ...withAnuvakaNavigation(anuvaka, anuvakas),
        xmin: 0,
        xmax: getChapterExportAudioDuration(chapter, audioId),
      };
      normalizePlaybackSettingsForActiveAudio();
      const nextGroups = buildSegmentGroupsFromChapterExport(chapter, audioId);

      attachTranslations(nextGroups, slokaTranslations);

      if (!patchRenderedGroups(nextGroups)) {
        segmentGroups = nextGroups;
        renderGroups(segmentGroups);
      }

      updateChantHeader();
      applySavedControls();
      updateSummary();
      loadAudioBuffer(playbackRate, pitchShift);
      return;
    }

    const data = await loadTextGridData(effectiveUnit);

    if (requestId !== chantLoadRequestId) {
      return;
    }

    tiers = data.tiers;
    const tierSet = data.tierSet;
    const slokaTier = getVariantTier(tierSet.sloka, activeTextVariant);
    const padaTier = getVariantTier(tierSet.pada, activeTextVariant);

    if (!slokaTier) {
      throw new Error("TextGrid musi zawierać warstwy sloka-*.");
    }

    const anuvakas = getAnuvakaIntervals(tiers, effectiveUnit);
    const anuvaka = anuvakaId
      ? anuvakas.find((interval) => interval.id === anuvakaId)
      : null;

    if (anuvakaId && !anuvaka) {
      throw new Error(`Nie znaleziono ${anuvakaId}.`);
    }

    activeAnuvaka = withAnuvakaNavigation(anuvaka, anuvakas);
    normalizePlaybackSettingsForActiveAudio();
    const slokaIntervals = filterIntervalsForRange(withSourceIndexes(slokaTier.intervals), anuvaka);
    const padaIntervals = filterIntervalsForRange(withSourceIndexes(padaTier?.intervals || []), anuvaka);
    const nextGroups = buildSegmentGroups(tierSet, slokaIntervals, padaIntervals);

    attachTranslations(nextGroups, slokaTranslations);

    if (!patchRenderedGroups(nextGroups)) {
      segmentGroups = nextGroups;
      renderGroups(segmentGroups);
    }

    updateChantHeader();
    applySavedControls();
    updateSummary();
    loadAudioBuffer(playbackRate, pitchShift);
  } catch (error) {
    console.error(error);
    summary.textContent = `Nie udało się przełączyć audio: ${error.message}`;
  }
}

function patchRenderedGroups(nextGroups) {
  if (
    nextGroups.length !== segmentGroups.length ||
    nextGroups.some((group, index) => group.padas.length !== segmentGroups[index]?.padas.length)
  ) {
    return false;
  }

  nextGroups.forEach((nextGroup, index) => {
    const group = segmentGroups[index];

    group.sloka = nextGroup.sloka;
    group.slokaNumber = nextGroup.slokaNumber;
    group.padas = nextGroup.padas;
    group.translations = nextGroup.translations;
    updateSegmentButtonInterval(group.slokaButton, group.sloka, "");
    updateSlokaNumberBadge(group.slokaButton, group.slokaNumber);
    updateRepeatButtonInterval(
      group.element?.querySelector(".sloka-actions [data-repeat-button='true']"),
      group.sloka,
    );

    const controls = [...(group.element?.querySelectorAll(".pada-list .pada-control") || [])];

    controls.forEach((control, phraseIndex) => {
      const phrase = group.padas[phraseIndex];

      updateSegmentButtonInterval(
        control.querySelector(".segment-button"),
        phrase,
        formatPhraseLabel(phraseIndex + 1),
      );
      updateRepeatButtonInterval(control.querySelector("[data-repeat-button='true']"), phrase);
    });
  });

  return true;
}

function updateSegmentButtonInterval(button, interval, label = button?._label || "") {
  if (!button || !interval) {
    return;
  }

  button._interval = interval;
  button._label = label;

  const textElement = button.querySelector("[data-segment-text]");

  if (textElement) {
    textElement._interval = interval;
    textElement.textContent = getIntervalText(interval);
  }

  button.setAttribute("aria-label", createSegmentAriaLabel(label, interval));
}

function updateSlokaNumberBadge(button, number) {
  if (!button) {
    return;
  }

  let badge = button.querySelector(".sloka-number");

  if (!badge) {
    badge = document.createElement("span");
    badge.className = "sloka-number";
    badge.setAttribute("aria-hidden", "true");
    button.append(badge);
  }

  badge.textContent = String(number);
}

function updateRepeatButtonInterval(button, interval) {
  if (!button || !interval) {
    return;
  }

  button._interval = interval;
  button.dataset.repeatText = getIntervalText(interval);
  updateRepeatButtonLabel(button);
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
  const slowButton = tempoControls.querySelector("button[data-rate]");

  if (slowButton) {
    slowButton.dataset.rate = String(getActiveSlowRate());
    slowButton.textContent = activeTranslationLanguage === "pl" ? "Wolniej" : "Slow";
    slowButton.setAttribute("aria-pressed", String(Number(slowButton.dataset.rate) === playbackRate));
  }
}

function updatePitchButtons() {
  pitchButton.textContent = formatPitchButtonLabel(pitchShift);
  pitchButton.setAttribute("aria-pressed", String(pitchShift > 0));
  pitchButton.disabled = !activeAudioSupportsPitch();
}

function formatPitchButtonLabel(value) {
  if (activeTranslationLanguage === "pl") {
    return value === 0 ? "Tonacja" : `Tonacja${"+".repeat(value)}`;
  }

  return value === 0 ? "Pitch" : `Pitch${"+".repeat(value)}`;
}

function updateTextSizeButton() {
  document.body.classList.toggle("text-size-medium", textSizeLevel === 1);
  document.body.classList.toggle("text-size-large", textSizeLevel === 2);
  textSizeButton.dataset.textSize = String(textSizeLevel);
  textSizeButton.setAttribute("aria-pressed", String(textSizeLevel > 0));
  textSizeButton.setAttribute("aria-label", formatTextSizeLabel());
  [...textSizeButton.querySelectorAll(".size-a")].forEach((letter, index) => {
    letter.classList.toggle("is-active", index <= textSizeLevel);
  });
}

function formatTextSizeLabel() {
  if (activeTranslationLanguage === "pl") {
    return ["Standardowy tekst", "Większy tekst", "Największy tekst"][textSizeLevel];
  }

  return ["Standard text", "Larger text", "Largest text"][textSizeLevel];
}

function updateHidePadasButton() {
  document.body.classList.toggle("padas-hidden", padasHidden);
  hidePadasButton.textContent = formatHidePadasLabel();
  hidePadasButton.setAttribute("aria-pressed", String(padasHidden));
}

function formatHidePadasLabel() {
  if (activeTranslationLanguage === "pl") {
    return padasHidden ? "Pokaż frazy" : "Ukryj frazy";
  }

  return padasHidden ? "Show phrases" : "Hide phrases";
}

function updateAudioVariantButton() {
  const variants = getAudioVariantEntries();
  const activeVariant = getActiveAudioVariantConfig();

  audioVariantButton.hidden = variants.length < 2;

  if (variants.length < 2 || !activeVariant) {
    audioVariantButton.textContent = "Audio";
    audioVariantButton.setAttribute("aria-pressed", "false");
    return;
  }

  audioVariantButton.textContent = activeVariant.label || "Audio";
  audioVariantButton.setAttribute(
    "aria-pressed",
    String(activeAudioVariantId !== DEFAULT_AUDIO_VARIANT_ID),
  );
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
  updateTextSizeButton();
  updateHidePadasButton();
  updateAudioVariantButton();
  updatePhraseButtonLabels();
  updateFullChantLabel();
  updateSummary();
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
  fullChantFastButton.hidden = !getAudioFile(FULL_CHANT_FAST_RATE, activeAudioSupportsPitch() ? pitchShift : 0);
}

function updateChangeChantLabel() {
  changeChantButton.textContent = activeTranslationLanguage === "pl" ? "Strona główna" : "Main page";
  collectionHomeButton.textContent = activeTranslationLanguage === "pl" ? "Strona główna" : "Main page";
  sectionBackButton.textContent = activeChant?.title || "Śri Rudram";
  collectionBackButton.textContent = activeChant?.title || "Śri Rudram";
  updateAnuvakaNavigation();
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
collectionHomeButton.addEventListener("click", () => {
  window.location.hash = "";
  showChantChooser();
});
collectionBackButton.addEventListener("click", () => {
  if (activeChantId) {
    window.location.hash = activeChantId;
  }
});
[previousAnuvakaButton, nextAnuvakaButton].forEach((button) => {
  button.addEventListener("click", () => {
    if (activeChantId && activeSectionId && button.dataset.anuvakaId) {
      window.location.hash = `${activeChantId}/${activeSectionId}/${button.dataset.anuvakaId}`;
    }
  });
});
sectionBackButton.addEventListener("click", () => {
  if (activeChantId) {
    window.location.hash = activeChantId;
  }
});
stopButton.addEventListener("click", stopPlayback);
hidePadasButton.addEventListener("click", togglePadasVisibility);
audioVariantButton.addEventListener("click", cycleAudioVariant);
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
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  cyclePitchShift();
});
textSizeButton.addEventListener("click", cycleTextSize);
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
