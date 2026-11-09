/* global OFFLINE_ASSETS */
importScripts('./offline-manifest.js');

const { version, total, files } = OFFLINE_ASSETS;
const scope = self.registration.scope;
const scopePath = new URL(scope).pathname;
const prefix = `vedic-offline:${scope}:`;
const assetCache = `${prefix}assets`;
const snapshotCache = `${prefix}version:${version}`;
const snapshotKey = new URL('offline-manifest.js', scope).href;
const inFlight = new Map();
let syncTask;
let status;

// Snapshots refer to immutable bodies. Old and new releases share unchanged files.
function keyFor(file) {
  return new URL(`.offline-cache/${file.hash}`, scope).href;
}

async function broadcast(message) {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clients) {
    if (client.url.startsWith(scope)) client.postMessage(message);
  }
}

async function getAsset(path, file, onBytes) {
  const key = keyFor(file);
  const cache = await caches.open(assetCache).catch(() => null);
  const cached = await cache?.match(key);
  if (cached) return { response: cached };

  if (!inFlight.has(key)) {
    const transfer = { bytes: 0, listeners: new Set() };
    inFlight.set(key, transfer);
    transfer.task = download(path, file, cache, key, transfer)
      .finally(() => inFlight.delete(key));
  }
  const transfer = inFlight.get(key);
  if (onBytes) {
    transfer.listeners.add(onBytes);
    onBytes(transfer.bytes);
  }
  try {
    const { blob, headers, storageError } = await transfer.task;
    return { response: new Response(blob, { headers }), storageError };
  } finally {
    if (onBytes) transfer.listeners.delete(onBytes);
  }
}

async function download(path, file, cache, key, transfer) {
  const controller = new AbortController();
  let timeout;
  function resetTimeout() {
    clearTimeout(timeout);
    timeout = setTimeout(() => controller.abort(), 30000);
  }

  resetTimeout();
  try {
    const response = await fetch(new URL(path, scope), {
      cache: 'no-cache', redirect: 'error', signal: controller.signal,
    });
    if (response.status !== 200) throw new Error(`HTTP ${response.status}: ${path}`);
    const chunks = [];
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        resetTimeout();
        chunks.push(value);
        transfer.bytes += value.byteLength;
        const limit = file.text ? file.bytes * 2 + 3 : file.bytes;
        if (transfer.bytes > limit) {
          await reader.cancel();
          throw new Error(`Unexpected file size: ${path}`);
        }
        for (const listener of transfer.listeners) listener(transfer.bytes);
      }
    } else {
      chunks.push(await response.arrayBuffer());
    }

    let blob = new Blob(chunks);
    if (file.text) {
      // Git and local Windows servers may use CRLF. Hash the published LF form.
      const decoder = new TextDecoder('utf-8', { ignoreBOM: true });
      blob = new Blob([decoder.decode(await blob.arrayBuffer()).replace(/\r\n/g, '\n')]);
    }
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()));
    const hex = Array.from(hash, (byte) => byte.toString(16).padStart(2, '0')).join('');
    if (blob.size !== file.bytes || hex !== file.hash) {
      throw new Error(`Asset differs from the published manifest: ${path}`);
    }

    const headers = new Headers({ 'Content-Length': String(blob.size) });
    const type = response.headers.get('Content-Type');
    if (type) headers.set('Content-Type', type);
    let storageError;
    try {
      if (!cache) throw new Error('Cache Storage is unavailable');
      await cache.put(key, new Response(blob, { headers }));
    } catch (error) {
      storageError = error;
    }
    return { blob, headers, storageError };
  } finally {
    clearTimeout(timeout);
  }
}

function prepare(update) {
  if (syncTask) return syncTask;
  syncTask = (async () => {
    let bytes = 0;
    let lastReport = 0;
    const report = (phase, amount = bytes, error = '') => {
      status = { type: 'offline-status', phase, update, bytes: amount, total, error };
      return broadcast(status).catch(() => {});
    };
    try {
      const cache = await caches.open(assetCache);
      const present = new Set((await cache.keys()).map((request) => request.url));
      const entries = Object.entries(files);
      const missing = entries.filter(([, file]) => !present.has(keyFor(file)));
      bytes = total - missing.reduce((sum, [, file]) => sum + file.bytes, 0);
      if (missing.length) {
        await report('download');
        const estimate = await navigator.storage?.estimate?.().catch(() => null);
        if (estimate && estimate.quota - estimate.usage < total - bytes) {
          throw new DOMException('Insufficient space for offline assets', 'QuotaExceededError');
        }
      }

      for (const [path, file] of missing) {
        const result = await getAsset(path, file, (loaded) => {
          if (Date.now() - lastReport < 200) return;
          lastReport = Date.now();
          void report('download', bytes + Math.min(file.bytes, loaded));
        });
        if (result.storageError) throw result.storageError;
        bytes += file.bytes;
      }

      const verified = new Set((await cache.keys()).map((request) => request.url));
      if (entries.some(([, file]) => !verified.has(keyFor(file)))) {
        throw new Error('Offline cache is incomplete');
      }
      const snapshot = await caches.open(snapshotCache);
      if (!await snapshot.match(snapshotKey)) {
        await snapshot.put(snapshotKey, new Response(version));
      }
      await report(update ? 'prepared' : 'ready', total);
    } catch (error) {
      console.warn('Offline preparation failed:', error);
      await report('error', bytes, error.name === 'QuotaExceededError' ? 'quota' : 'download');
      throw error;
    }
  })().finally(() => { syncTask = null; });
  return syncTask;
}

self.addEventListener('install', (event) => {
  // First visits can use the app as soon as the worker starts. Updates must finish
  // before installation can succeed, even if all tabs close during the download.
  if (self.registration.active) event.waitUntil(prepare(true));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const snapshot = await caches.match(snapshotKey, { cacheName: snapshotCache });
      if (snapshot) {
        const cache = await caches.open(assetCache);
        const keep = new Set(Object.values(files).map(keyFor));
        const requests = await cache.keys();
        const present = new Set(requests.map((request) => request.url));
        if ([...keep].every((key) => present.has(key))) {
          for (const request of requests) {
            if (!keep.has(request.url)) await cache.delete(request);
          }
          for (const name of await caches.keys()) {
            if (name.startsWith(`${prefix}version:`) && name !== snapshotCache) {
              await caches.delete(name);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Offline cache cleanup failed:', error);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data !== 'offline-check') return;
  if (syncTask && status) event.source?.postMessage(status);
  event.waitUntil(prepare(false).catch(() => {}));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(scope)) return;
  const url = new URL(event.request.url);
  const path = url.pathname.slice(scopePath.length) || 'index.html';
  if (!Object.hasOwn(files, path)) return;
  // The app's audio loader requests complete files with fetch(), not media ranges.
  event.respondWith(getAsset(path, files[path]).then(({ response }) => response));
});
