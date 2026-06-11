# Praat Replacement Chapter Export Format

Version: 1

The export is organized for network-friendly playback. Each chapter is a separate folder with its own clipped mono OGG files and one JSON metadata file.

When `Export JSON only` is enabled, only `manifest.json`, `EXPORT_FORMAT.md`, and chapter JSON files are rewritten. Existing audio files are left untouched and no new OGG clips are generated.

## Files

- `manifest.json`: export-level index of all chapters and audio files.
- `EXPORT_FORMAT.md`: this document.
- `<chapter-folder>/chapter.json`: metadata for one chapter.
- `<chapter-folder>/audio/<audio-name>.ogg`: mono OGG audio clipped to that chapter for one performance/audio tab.

## Time Model

All times inside `chapter.json` are relative to the beginning of that chapter's audio clip. The source project may contain 20-minute audio, but every exported chapter starts at time 0.

Each audio tab can have different marker times. Logical pairing is done by marker IDs, not by absolute time. A verse with marker IDs `12:18` is the same logical verse on every audio tab, even if marker 12 and marker 18 occur at different seconds.

## chapter.json

- `audio[]`: exported OGG clips for this chapter.
- `verses[]`: logical verse segments included in the chapter.
- `verses[].texts`: exported text fields such as `iast`, `polish`, `sandhi`, and `devanagari`.
- `verses[].phrases[].texts.devanagari`: a compatibility copy of the matching IAST phrase fragment; full Devanagari verse text remains in `verses[].texts.devanagari`.
- `verses[].timings[audioId]`: verse start/end and phrase boundary times for a specific audio clip.
- `verses[].phraseTextBoundaries`: character indexes used to split the verse text into phrases.
- `verses[].phrases[]`: convenience phrase list with text fragments and per-audio start/end times.

## Playback Recommendation

Use `manifest.json` to list chapters. Load only the selected chapter's JSON and OGG file(s). Use `audio[].id` to switch performance/audio version while keeping the same logical verse and phrase indexes.
