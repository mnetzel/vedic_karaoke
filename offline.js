(() => {
  const serviceWorker = navigator.serviceWorker;
  if (!serviceWorker) return;

  const panel = document.querySelector('#offlineStatus');
  const message = document.querySelector('#offlineMessage');
  const download = document.querySelector('#offlineDownload');
  const progress = document.querySelector('#offlineProgress');
  const amount = document.querySelector('#offlineAmount');
  const retry = document.querySelector('#offlineRetry');
  const watched = new WeakSet();
  let registration;
  let registering;
  let current;
  let pending;
  let lastUpdateCheck = 0;
  let stallTimer;

  function render() {
    const state = pending || current || { phase: 'checking' };
    const labels = {
      checking: 'Checking offline storage…',
      download: state.update ? 'Downloading offline update…' : 'Downloading for offline use…',
      ready: 'Ready for offline use',
      prepared: 'Offline update ready. Close all Vedic Karaoke tabs, then reopen.',
      error: state.error === 'quota'
        ? 'Not enough browser storage. Free some space, then retry.'
        : 'Offline download interrupted. Reconnect or retry.',
    };
    const label = labels[state.phase];
    if (message.textContent !== label) message.textContent = label;
    panel.hidden = false;
    retry.hidden = state.phase !== 'error';
    download.hidden = !state.total || !['download', 'error'].includes(state.phase);
    if (!download.hidden) {
      const percent = Math.min(99, Math.floor(state.bytes / state.total * 100));
      progress.value = percent;
      amount.textContent = `${percent}% · ${(state.bytes / 1e6).toFixed(1)} / ${(state.total / 1e6).toFixed(1)} MB`;
    }
    clearTimeout(stallTimer);
    if (state.phase === 'download') {
      // Some browsers can stop a worker without sending a final error message.
      stallTimer = setTimeout(() => {
        const interrupted = { ...state, phase: 'error' };
        if (state.update) pending = interrupted;
        else current = interrupted;
        render();
      }, 45000);
    }
  }

  function watch(worker) {
    if (!worker || watched.has(worker)) return;
    watched.add(worker);
    const isUpdate = Boolean(registration.active);
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed' && isUpdate) {
        pending = { phase: 'prepared' };
        render();
      }
      if (worker.state === 'redundant' && !registration.waiting) {
        if (isUpdate) {
          if (pending?.phase !== 'error') pending = { phase: 'error', update: true };
        } else if (!serviceWorker.controller) {
          current = { phase: 'error' };
        }
        render();
      }
    });
  }

  function requestPersistence() {
    void navigator.storage?.persist?.().catch(() => {});
  }

  async function check(force = false) {
    try {
      if (!registration) {
        registering ||= serviceWorker.register('./sw.js', { updateViaCache: 'none' });
        registration = await registering;
        if (registration.waiting) pending = { phase: 'prepared' };
        watch(registration.installing);
        registration.addEventListener('updatefound', () => watch(registration.installing));
        render();
      }
      serviceWorker.controller?.postMessage('offline-check');
      if (navigator.onLine && (force || Date.now() - lastUpdateCheck > 60000)) {
        lastUpdateCheck = Date.now();
        // Registration itself already checked on the initial visit.
        if (force || serviceWorker.controller) await registration.update().catch(() => {});
      }
    } catch {
      registering = null;
      current = { phase: 'error' };
      render();
    }
  }

  serviceWorker.addEventListener('message', (event) => {
    const state = event.data;
    if (state?.type !== 'offline-status') return;
    if (state.update) pending = state;
    else if (event.source === serviceWorker.controller) current = state;
    render();
  });

  serviceWorker.addEventListener('controllerchange', () => {
    pending = null;
    void check();
  });
  retry.addEventListener('click', () => {
    pending = null;
    if (current?.phase === 'error') current = null;
    render();
    requestPersistence();
    void check(true);
  });
  window.addEventListener('online', () => void check(true));
  window.addEventListener('pageshow', (event) => { if (event.persisted) void check(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void check();
  });

  requestPersistence();
  void check();
})();
