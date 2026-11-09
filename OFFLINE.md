# Offline releases

After changing any site asset, run `node scripts/generate-offline-manifest.mjs` and publish the generated `offline-manifest.js` together with those changes. Run the generator in the exact checkout you intend to publish. `node scripts/generate-offline-manifest.mjs --check` detects a stale manifest. No build is needed to serve the resulting files. GitHub Pages serves the files directly with `.nojekyll`.

The generator scans the root HTML, CSS, JavaScript, icons and web manifests, plus the `input/` and `vendor/` trees. Keep any new runtime assets in those locations. Marked 12.0.2 is bundled with its license in `vendor/`. The SoundCloud credit link is external and requires a connection.

Use HTTPS or localhost. On the first visit, keep the site open until it says **Ready for offline use**. The browser can pause or stop downloads when a tab closes or goes into the background. On reopening, reconnecting, or selecting **Retry**, already verified files are reused. A partially downloaded file restarts from the beginning. Progress counts decoded asset bytes, so HTTP compression and newline conversion can make it differ from network transfer totals.

An update verifies the complete new set while existing tabs use the old release. When the update is ready, close all Vedic Karaoke tabs and reopen the site to activate it. The new version can then remove data no longer needed. If the browser clears cached data, reconnect and the site will repair the cache. Storage estimates are approximate, and the browser may decline persistence or evict site data. Private browsing may discard it when the session ends.

The recordings use Ogg Vorbis. On iOS and iPadOS, use version 18.4 or later for playback. On macOS, Ogg support starts with Safari 18.4 on macOS 15.4.
