// ==================== EMOJI KITCHEN PRO - PRODUCTION APP (STABILITY PATCH) ====================

// ---------- CONFIGURATION ----------
const CONFIG = {
  EMOJI_API_BASE: 'https://emojik.vercel.app/s',
  EMOJI_SIZE: 256,
  MAX_STORY_PANELS: 3,
  WALL_ITEMS: 8,
  VOTE_INCREMENT: 1,
  GAME_SCORE_INCREMENT: 10,
  AI_MODEL: 'gpt-4o-mini',
  AI_MAX_TOKENS: 50,
  AI_TEMPERATURE: 0.9,
  FALLBACK_MIN_SCORE: 3,
  CACHE_PREFIX: 'emoji_kitchen_',
  STORAGE_KEYS: {
    FAVORITES: 'emojifavs',
    THEME: 'theme',
    VOTES: 'votes'
  },
  AI_TIMEOUT_MS: 15000,
  CACHE_MAX_AGE_MS: 600000, // 10 minutes
  CACHE_MAX_SIZE: 250,
  RENDER_DEBOUNCE_MS: 50
};

// ---------- DATA ----------
const emojiList = Object.freeze([
  { emoji:"😊", code:"1f60a" },{ emoji:"😂", code:"1f602" },{ emoji:"🥰", code:"1f970" },
  { emoji:"😍", code:"1f60d" },{ emoji:"😘", code:"1f618" },{ emoji:"😭", code:"1f62d" },
  { emoji:"😡", code:"1f621" },{ emoji:"😱", code:"1f631" },{ emoji:"🤗", code:"1f917" },
  { emoji:"🤔", code:"1f914" },{ emoji:"😎", code:"1f60e" },{ emoji:"🥳", code:"1f973" },
  { emoji:"😴", code:"1f634" },{ emoji:"🤩", code:"1f929" },{ emoji:"😇", code:"1f607" },
  { emoji:"🤯", code:"1f92f" },{ emoji:"❤️", code:"2764" },{ emoji:"🔥", code:"1f525" },
  { emoji:"👍", code:"1f44d" },{ emoji:"👎", code:"1f44e" },{ emoji:"🎉", code:"1f389" },
  { emoji:"💯", code:"1f4af" },{ emoji:"🌈", code:"1f308" },{ emoji:"⭐", code:"2b50" },
  { emoji:"🍕", code:"1f355" },{ emoji:"🍔", code:"1f354" },{ emoji:"🐶", code:"1f436" },
  { emoji:"🐱", code:"1f431" },{ emoji:"🦊", code:"1f98a" },{ emoji:"🐼", code:"1f43c" },
  { emoji:"🌻", code:"1f33b" },{ emoji:"🌸", code:"1f338" },{ emoji:"🎸", code:"1f3b8" },
  { emoji:"⚽", code:"26bd" },{ emoji:"🚀", code:"1f680" },{ emoji:"💡", code:"1f4a1" },
  { emoji:"🎂", code:"1f382" },{ emoji:"☕", code:"2615" },{ emoji:"🍦", code:"1f366" },
  { emoji:"👻", code:"1f47b" }
]);

const trendingCombos = Object.freeze([
  { code1:"1f602", code2:"2764" },
  { code1:"1f60d", code2:"1f525" },
  { code1:"1f970", code2:"1f618" },
  { code1:"1f389", code2:"1f382" },
]);

// ---------- PRODUCTION LOGGER ----------
const logger = {
  info: (msg, data) => {
    if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) return;
    console.info(`[EmojiKitchen] ${msg}`, data || '');
  },
  warn: (msg, data) => console.warn(`[EmojiKitchen] ${msg}`, data || ''),
  error: (msg, error) => console.error(`[EmojiKitchen] ${msg}`, error?.message || error)
};

// ---------- GLOBAL STATE ----------
const state = {
  mixSel1: emojiList[0],
  mixSel2: emojiList[1],
  currentVoteCombo: null,
  votes: parseInt(localStorage.getItem(CONFIG.STORAGE_KEYS.VOTES) || '0', 10),
  storyPairs: [],
  gameAnswer: {},
  gameScore: 0,
  isRendering: false,
  aiRequestInFlight: false,
  renderToken: 0
};

// ---------- MEMORY & PERFORMANCE MANAGEMENT ----------
const emojiCache = new Map();
const pendingFetches = new Map();
const moodCache = new Map();
const objectURLs = new Set();
const globalCleanupTasks = [];

function createSafeObjectURL(blob) {
  const url = URL.createObjectURL(blob);
  objectURLs.add(url);
  return url;
}

function revokeObjectURLSafe(url) {
  if (url && objectURLs.has(url)) {
    URL.revokeObjectURL(url);
    objectURLs.delete(url);
  }
}

function cleanupAllObjectURLs() {
  objectURLs.forEach(url => {
    try { URL.revokeObjectURL(url); } catch (e) {}
  });
  objectURLs.clear();
}

// Timestamp-based cache eviction
function evictStaleCache() {
  const now = Date.now();
  const toDelete = [];
  for (const [key, entry] of emojiCache.entries()) {
    if (now - entry.timestamp > CONFIG.CACHE_MAX_AGE_MS) {
      toDelete.push(key);
    }
  }
  // If still over limit, remove oldest first
  if (emojiCache.size - toDelete.length > CONFIG.CACHE_MAX_SIZE) {
    const sorted = [...emojiCache.entries()]
      .filter(([key]) => !toDelete.includes(key))
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    const extraDelete = sorted.slice(0, sorted.length - CONFIG.CACHE_MAX_SIZE);
    extraDelete.forEach(([key]) => toDelete.push(key));
  }
  toDelete.forEach(key => {
    const entry = emojiCache.get(key);
    if (entry?.url) revokeObjectURLSafe(entry.url);
    emojiCache.delete(key);
  });
}

const cacheCleanupInterval = setInterval(evictStaleCache, 300000);
globalCleanupTasks.push(() => clearInterval(cacheCleanupInterval));

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    evictStaleCache();
    moodCache.clear();
  }
});

// ---------- DOM UTILITIES ----------
const domCache = new Map();

const getEl = (id) => {
  if (!domCache.has(id)) {
    const el = document.getElementById(id);
    if (el) domCache.set(id, el);
    return el;
  }
  const cached = domCache.get(id);
  if (cached && cached.isConnected) return cached;
  const el = document.getElementById(id);
  if (el) domCache.set(id, el);
  return el;
};

const setButtonStates = (buttons, disabled) => {
  buttons.forEach(id => {
    const btn = getEl(id);
    if (btn) btn.disabled = disabled;
  });
};

const setText = (id, text) => {
  const el = getEl(id);
  if (el) el.textContent = text;
};

const setDisplay = (id, display) => {
  const el = getEl(id);
  if (el) el.style.display = display;
};

// ---------- SAFE STORAGE ----------
const storage = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(`${CONFIG.CACHE_PREFIX}${key}`);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`${CONFIG.CACHE_PREFIX}${key}`, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(`${CONFIG.CACHE_PREFIX}${key}`);
      return true;
    } catch {
      return false;
    }
  }
};

// ---------- API UTILITIES ----------
async function fetchEmojiMix(code1, code2) {
  const cacheKey = `${code1}_${code2}`;
  
  // Check cache first
  if (emojiCache.has(cacheKey)) {
    const entry = emojiCache.get(cacheKey);
    entry.timestamp = Date.now(); // Refresh access time
    return entry.url;
  }

  // Return pending promise if already in flight
  if (pendingFetches.has(cacheKey)) {
    return pendingFetches.get(cacheKey);
  }

  const url = `${CONFIG.EMOJI_API_BASE}/${code1}_${code2}?size=${CONFIG.EMOJI_SIZE}`;
  
  const fetchPromise = (async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Not available`);
      }
      
      const blob = await res.blob();
      const objUrl = createSafeObjectURL(blob);
      
      emojiCache.set(cacheKey, {
        url: objUrl,
        timestamp: Date.now()
      });
      
      return objUrl;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    } finally {
      pendingFetches.delete(cacheKey);
    }
  })();

  pendingFetches.set(cacheKey, fetchPromise);
  return fetchPromise;
}

async function fetchWithRetry(fn, maxRetries = 2) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// ---------- AUDIO ----------
function playSound() {
  const sound = getEl('mixSound');
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}

// ---------- FAVORITES MANAGEMENT ----------
function getFavorites() {
  return storage.get(CONFIG.STORAGE_KEYS.FAVORITES, []);
}

function saveFavorite(code1, code2) {
  const favs = getFavorites();
  const exists = favs.some(f => 
    (f.code1 === code1 && f.code2 === code2) || 
    (f.code1 === code2 && f.code2 === code1)
  );
  
  if (!exists) {
    favs.push({ code1, code2, date: Date.now() });
    storage.set(CONFIG.STORAGE_KEYS.FAVORITES, favs);
    renderFavorites();
  }
}

function removeFavorite(code1, code2) {
  const favs = getFavorites().filter(f => 
    !((f.code1 === code1 && f.code2 === code2) || 
      (f.code1 === code2 && f.code2 === code1))
  );
  storage.set(CONFIG.STORAGE_KEYS.FAVORITES, favs);
  renderFavorites();
}

// ---------- THEME ----------
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('neon-dark');
  const btn = getEl('themeToggleFloat');
  if (btn) {
    btn.textContent = isDark ? '☀️' : '🌓';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  storage.set(CONFIG.STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
}

function loadTheme() {
  const saved = storage.get(CONFIG.STORAGE_KEYS.THEME, 'dark');
  if (saved === 'light') {
    document.body.classList.remove('neon-dark');
    const btn = getEl('themeToggleFloat');
    if (btn) {
      btn.textContent = '🌓';
      btn.setAttribute('aria-label', 'Switch to dark mode');
    }
  }
}

// ---------- GRID RENDERING (Optimized with partial updates) ----------
function renderGrid(containerId, selected, onClick, searchQuery = '') {
  const container = getEl(containerId);
  if (!container) return;

  const query = searchQuery.toLowerCase();
  const filtered = query 
    ? emojiList.filter(e => e.emoji.includes(query) || e.code.includes(query))
    : emojiList;

  // Build new HTML string for faster rendering
  let html = '';
  filtered.forEach(e => {
    const selectedClass = (selected && e.code === selected.code) ? ' selected' : '';
    const ariaSelected = (selected && e.code === selected.code) ? ' aria-selected="true"' : '';
    html += `<div class="emoji-item${selectedClass}" role="button" tabindex="0" aria-label="Select ${e.emoji} emoji"${ariaSelected} data-code="${e.code}">${e.emoji}</div>`;
  });

  container.innerHTML = html;

  // Attach event listeners using event delegation
  if (!container._hasDelegation) {
    container.addEventListener('click', (e) => {
      const item = e.target.closest('.emoji-item');
      if (!item) return;
      const code = item.dataset.code;
      const emojiObj = emojiList.find(e => e.code === code);
      if (emojiObj) onClick(emojiObj);
    });
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const item = e.target.closest('.emoji-item');
        if (!item) return;
        e.preventDefault();
        const code = item.dataset.code;
        const emojiObj = emojiList.find(e => e.code === code);
        if (emojiObj) onClick(emojiObj);
      }
    });
    container._hasDelegation = true;
  }
}

function select1(e) {
  state.mixSel1 = e;
  setText('mixSelected1', e.emoji);
  renderGrid('mixGrid1', state.mixSel1, select1);
  renderMix();
}

function select2(e) {
  state.mixSel2 = e;
  setText('mixSelected2', e.emoji);
  renderGrid('mixGrid2', state.mixSel2, select2);
  renderMix();
}

window.filterGrid = (id, query) => {
  if (id === 'mixGrid1') renderGrid('mixGrid1', state.mixSel1, select1, query);
  else if (id === 'mixGrid2') renderGrid('mixGrid2', state.mixSel2, select2, query);
};

// ========== SEO SYSTEM ==========

const EMOJI_NAME_MAP = {
  "1f525":"fire","2764":"heart","1f602":"laugh","1f60d":"love","1f970":"smile",
  "1f618":"kiss","1f436":"dog","1f431":"cat","1f389":"party","1f382":"cake",
  "1f47b":"ghost","1f680":"rocket","1f60a":"smile","1f62d":"cry","1f621":"angry",
  "1f631":"scared","1f917":"hug","1f914":"think","1f60e":"cool","1f973":"party",
  "1f634":"sleep","1f929":"star","1f607":"angel","1f92f":"explode","1f44d":"like",
  "1f44e":"dislike","1f4af":"100","1f308":"rainbow","2b50":"star","1f355":"pizza",
  "1f354":"burger","1f98a":"fox","1f43c":"panda","1f33b":"flower","1f338":"cherry",
  "1f3b8":"guitar","26bd":"soccer","1f4a1":"idea","2615":"coffee","1f366":"icecream"
};

const SEO_CACHE = {};

function getEmojiName(code) {
  if (!SEO_CACHE[code]) {
    SEO_CACHE[code] = EMOJI_NAME_MAP[code] || code;
  }
  return SEO_CACHE[code];
}

let lastSEOUpdate = '';

function updateSEOUrl() {
  const slug1 = getEmojiName(state.mixSel1.code);
  const slug2 = getEmojiName(state.mixSel2.code);
  const newUrl = `/emoji-mix/${slug1}-${slug2}`;
  
  const cacheKey = `${slug1}_${slug2}`;
  if (lastSEOUpdate === cacheKey) return;
  lastSEOUpdate = cacheKey;

  history.replaceState(
    { emoji1: state.mixSel1.code, emoji2: state.mixSel2.code },
    '',
    newUrl
  );

  requestAnimationFrame(() => {
    document.title = `${slug1} + ${slug2} Emoji Mix | Emoji Kitchen Pro`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', `Mix ${slug1} and ${slug2} emojis online with Emoji Kitchen Pro. Create unique emoji mashups, download PNG stickers, and share with friends.`);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', `${slug1} + ${slug2} Emoji Mix | Emoji Kitchen Pro`);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', `Mix ${slug1} and ${slug2} emojis online. Create unique emoji mashups with Emoji Kitchen Pro.`);
  });
}

// ---------- POPSTATE HANDLER ----------
let popstateDebounce = null;
window.addEventListener('popstate', (event) => {
  if (popstateDebounce) clearTimeout(popstateDebounce);
  popstateDebounce = setTimeout(() => {
    if (event.state?.emoji1 && event.state?.emoji2) {
      const found1 = emojiList.find(e => e.code === event.state.emoji1);
      const found2 = emojiList.find(e => e.code === event.state.emoji2);
      if (found1) state.mixSel1 = found1;
      if (found2) state.mixSel2 = found2;
      setText('mixSelected1', state.mixSel1.emoji);
      setText('mixSelected2', state.mixSel2.emoji);
      renderGrid('mixGrid1', state.mixSel1, select1);
      renderGrid('mixGrid2', state.mixSel2, select2);
      renderMix();
    }
  }, 100);
});

// ---------- RENDER TOKEN SYSTEM ----------
function generateRenderToken() {
  return ++state.renderToken;
}

function isRenderValid(token) {
  return token === state.renderToken;
}

// ---------- IMAGE HELPER ----------
function clearImageHandlers(img) {
  if (!img) return;
  img.onload = null;
  img.onerror = null;
}

// ---------- MIX MODE (Stable) ----------
async function renderMix() {
  if (state.isRendering) return;
  state.isRendering = true;
  const token = generateRenderToken();

  const img = getEl('mixResultImg');
  if (!img) {
    state.isRendering = false;
    return;
  }
  
  const spinner = getEl('mixSpinner');
  const buttons = ['mixDownload', 'mixDownloadCard', 'mixCopy', 'mixWhatsapp', 'mixSave'];
  
  // Clear previous handlers
  clearImageHandlers(img);
  
  img.classList.remove('show');
  setDisplay('mixError', 'none');
  if (spinner) spinner.classList.add('active');
  setButtonStates(buttons, true);
  
  try {
    const objUrl = await fetchWithRetry(() => 
      fetchEmojiMix(state.mixSel1.code, state.mixSel2.code)
    );
    
    if (!isRenderValid(token)) {
      state.isRendering = false;
      return;
    }
    
    img.src = objUrl;
    
    img.onload = () => {
      if (!isRenderValid(token)) return;
      img.classList.add('show');
      if (spinner) spinner.classList.remove('active');
      setButtonStates(buttons, false);
      state.currentVoteCombo = { 
        code1: state.mixSel1.code, 
        code2: state.mixSel2.code 
      };
      playSound();
      updateSEOUrl();
      state.isRendering = false;
    };
    
    img.onerror = () => {
      state.isRendering = false;
      if (!isRenderValid(token)) return;
      if (spinner) spinner.classList.remove('active');
      setDisplay('mixError', 'block');
    };
    
    if (img.complete) {
      img.onload();
    }
  } catch(e) {
    if (!isRenderValid(token)) return;
    if (spinner) spinner.classList.remove('active');
    setDisplay('mixError', 'block');
    logger.error('Mix render error:', e);
    state.isRendering = false;
  }
}

function randomMix() {
  state.mixSel1 = emojiList[Math.floor(Math.random() * emojiList.length)];
  state.mixSel2 = emojiList[Math.floor(Math.random() * emojiList.length)];
  setText('mixSelected1', state.mixSel1.emoji);
  setText('mixSelected2', state.mixSel2.emoji);
  renderGrid('mixGrid1', state.mixSel1, select1);
  renderGrid('mixGrid2', state.mixSel2, select2);
  renderMix();
}

// ---------- BATTLE MODE ----------
function generateBattle() {
  const e1 = emojiList[Math.floor(Math.random() * emojiList.length)];
  let e2;
  do {
    e2 = emojiList[Math.floor(Math.random() * emojiList.length)];
  } while (e2.code === e1.code);
  
  const spinner = getEl('battleSpinner');
  const img = getEl('battleImg');
  const caption = getEl('battleCaption');
  
  clearImageHandlers(img);
  
  if (spinner) spinner.classList.add('active');
  if (img) img.classList.remove('show');
  
  fetchEmojiMix(e1.code, e2.code)
    .then(objUrl => {
      if (!img || !img.isConnected) return;
      img.src = objUrl;
      img.onload = () => {
        if (!img.isConnected) return;
        img.classList.add('show');
        if (spinner && spinner.isConnected) spinner.classList.remove('active');
        if (caption && caption.isConnected) caption.textContent = `${e1.emoji} vs ${e2.emoji} – who wins?`;
        playSound();
      };
      img.onerror = () => {
        if (spinner && spinner.isConnected) spinner.classList.remove('active');
      };
    })
    .catch(() => {
      setTimeout(() => generateBattle(), 500);
    });
}

// ---------- STORY MODE ----------
function initStoryMode() {
  const selector = getEl('storySelector');
  if (!selector) return;
  
  const options = emojiList.map(e => `<option value="${e.code}">${e.emoji}</option>`).join('');
  selector.innerHTML = `
    <select id="storySel1" aria-label="Select first emoji">${options}</select>
    <select id="storySel2" aria-label="Select second emoji">${options}</select>
    <button class="btn" id="storyAdd">➕ Add</button>
  `;
  
  const addBtn = getEl('storyAdd');
  if (addBtn) {
    addBtn.onclick = async () => {
      if (state.storyPairs.length >= CONFIG.MAX_STORY_PANELS) {
        return alert(`Max ${CONFIG.MAX_STORY_PANELS} panels allowed`);
      }
      const sel1 = getEl('storySel1'), sel2 = getEl('storySel2');
      const c1 = sel1?.value, c2 = sel2?.value;
      if (!c1 || !c2) return;
      try {
        const objUrl = await fetchWithRetry(() => fetchEmojiMix(c1, c2));
        state.storyPairs.push({ code1: c1, code2: c2, objUrl });
        renderStoryStrip();
        const downBtn = getEl('storyDownload');
        if (downBtn?.isConnected) downBtn.disabled = false;
        playSound();
      } catch(e) {
        alert('This combo is not available. Try different emojis!');
      }
    };
  }
  renderStoryStrip();
}

function renderStoryStrip() {
  const strip = getEl('storyStrip');
  if (!strip?.isConnected) return;
  strip.innerHTML = state.storyPairs.map(p => `<img src="${p.objUrl}" style="max-width:120px;border-radius:12px;" alt="Story panel" loading="lazy">`).join('');
}

// ---------- DAILY CHALLENGE ----------
function initDailyChallenge() {
  const today = new Date().toDateString();
  const seed = [...today].reduce((a, b) => a + b.charCodeAt(0), 0);
  const e1 = emojiList[seed % emojiList.length];
  const e2 = emojiList[(seed * 7) % emojiList.length];
  
  setText('challengeEmoji1', e1.emoji);
  setText('challengeEmoji2', e2.emoji);
  setText('challengeDisplay1', e1.emoji);
  setText('challengeDisplay2', e2.emoji);
  
  const mixBtn = getEl('challengeMixBtn');
  if (mixBtn) {
    mixBtn.onclick = async () => {
      const sp = getEl('challengeSpinner');
      const img = getEl('challengeImg');
      clearImageHandlers(img);
      if (sp?.isConnected) sp.classList.add('active');
      if (img?.isConnected) img.classList.remove('show');
      try {
        const objUrl = await fetchWithRetry(() => fetchEmojiMix(e1.code, e2.code));
        if (img?.isConnected) {
          img.src = objUrl;
          img.onload = () => {
            if (!img.isConnected) return;
            img.classList.add('show');
            if (sp?.isConnected) sp.classList.remove('active');
            playSound();
          };
          img.onerror = () => {
            if (sp?.isConnected) sp.classList.remove('active');
            setDisplay('challengeError', 'block');
          };
        }
      } catch(e) {
        if (sp?.isConnected) sp.classList.remove('active');
        setDisplay('challengeError', 'block');
      }
    };
  }
  
  const shareBtn = getEl('challengeShare');
  if (shareBtn) {
    shareBtn.onclick = () => {
      window.open('https://twitter.com/intent/tweet?text=My%20%23EmojiKitchenDaily%20entry!', '_blank', 'noopener,noreferrer');
    };
  }
}

// ---------- WALL MODE (Stable) ----------
let wallRenderToken = 0;

async function loadWall() {
  const token = ++wallRenderToken;
  const wall = getEl('wallGrid');
  if (!wall?.isConnected) return;
  
  const fragment = document.createDocumentFragment();
  
  for (let i = 0; i < CONFIG.WALL_ITEMS; i++) {
    if (token !== wallRenderToken) return; // Cancel if new render started
    const e1 = emojiList[Math.floor(Math.random() * emojiList.length)];
    const e2 = emojiList[Math.floor(Math.random() * emojiList.length)];
    const div = document.createElement('div');
    div.className = 'wall-item';
    const img = document.createElement('img');
    img.alt = `Emoji mix ${e1.emoji} + ${e2.emoji}`;
    img.loading = 'lazy';
    try {
      const objUrl = await fetchEmojiMix(e1.code, e2.code);
      if (token !== wallRenderToken) break;
      img.src = objUrl;
    } catch(e) { continue; }
    div.appendChild(img);
    fragment.appendChild(div);
  }
  
  if (token === wallRenderToken && wall.isConnected) {
    wall.innerHTML = '';
    wall.appendChild(fragment);
  }
}

// ---------- GAME MODE ----------
async function newGamePuzzle() {
  const e1 = emojiList[Math.floor(Math.random() * emojiList.length)];
  const e2 = emojiList[Math.floor(Math.random() * emojiList.length)];
  state.gameAnswer = { code1: e1.code, code2: e2.code };
  try {
    const objUrl = await fetchWithRetry(() => fetchEmojiMix(e1.code, e2.code));
    const blurImg = getEl('gameBlurImg');
    if (blurImg?.isConnected) blurImg.src = objUrl;
    const options = emojiList.map(e => `<option value="${e.code}">${e.emoji}</option>`).join('');
    const s1 = getEl('gameGuess1'), s2 = getEl('gameGuess2');
    if (s1?.isConnected) s1.innerHTML = options;
    if (s2?.isConnected) s2.innerHTML = options;
    setText('gameFeedback', '');
  } catch(e) {
    setTimeout(() => newGamePuzzle(), 300);
  }
}

// ========== AI MOOD DETECTION ==========
const MOOD_CATEGORIES = Object.freeze([
  { name: "happy", emojis: ["😊","😄","😃","🥳","🎉","⭐","🌈","🤩","😇","💯"], keywords: new Map([["happy",10],["joy",10],["glad",9],["cheerful",9],["delighted",9],["excited",8],["great",7],["awesome",7],["wonderful",7],["fantastic",7],["smile",8],["laugh",8],["fun",6],["positive",5],["good",4],["nice",3],["blessed",6],["grateful",5]]) },
  { name: "sad", emojis: ["😭","😢","😞","😔","😩","😿","💔","🥺"], keywords: new Map([["sad",10],["cry",10],["crying",10],["unhappy",9],["depressed",9],["upset",8],["sorrow",9],["grief",9],["lonely",8],["heartbreak",9],["pain",6],["hurt",6],["miss",5]]) },
  { name: "angry", emojis: ["😡","🤬","😤","💢","👿","😠","💥"], keywords: new Map([["angry",10],["mad",10],["rage",10],["furious",10],["annoyed",8],["frustrated",8],["hate",9],["irritated",8],["fuming",9]]) },
  { name: "funny", emojis: ["😂","🤣","😆","😜","🤪","😹","💀","🤡"], keywords: new Map([["funny",10],["lol",10],["haha",10],["joke",9],["hilarious",10],["silly",8],["goofy",8],["crazy",6],["wild",5],["meme",8],["rofl",10]]) },
  { name: "party", emojis: ["🎉","🥳","🎂","🎈","🎊","🍾","💃","🕺","🎶"], keywords: new Map([["party",10],["celebrate",10],["birthday",10],["dance",9],["festival",9],["fun",7],["weekend",7],["event",6],["cheers",8]]) },
  { name: "scary", emojis: ["😱","👻","💀","🎃","😨","😰"], keywords: new Map([["scary",10],["fear",10],["horror",10],["spooky",10],["creepy",10],["terrified",10],["ghost",10],["haunted",9],["nightmare",9]]) },
  { name: "food", emojis: ["🍕","🍔","🍦","🍩","🌮","🍿","☕","🍪","🎂"], keywords: new Map([["food",10],["hungry",10],["pizza",10],["burger",10],["eat",9],["tasty",9],["delicious",9],["yummy",9],["meal",8],["snack",8],["ice cream",10],["coffee",9],["cake",9]]) },
  { name: "animals", emojis: ["🐶","🐱","🐼","🦊","🐨","🐸","🦁","🐯","🐰"], keywords: new Map([["animal",10],["dog",10],["cat",10],["pet",9],["puppy",10],["kitten",10],["cute animal",9],["wild",7],["zoo",8],["panda",10],["fox",10]]) }
]);

function detectMood(prompt) {
  const cacheKey = prompt.slice(0, 30);
  if (moodCache.has(cacheKey)) return moodCache.get(cacheKey);
  const promptLower = prompt.toLowerCase();
  let bestCategory = MOOD_CATEGORIES[0], bestScore = 0;
  for (const category of MOOD_CATEGORIES) {
    let categoryScore = 0;
    for (const [keyword, weight] of category.keywords) {
      if (promptLower.includes(keyword)) categoryScore += weight;
    }
    if (categoryScore > bestScore) { bestScore = categoryScore; bestCategory = category; }
  }
  const result = bestScore >= CONFIG.FALLBACK_MIN_SCORE ? bestCategory : MOOD_CATEGORIES[0];
  moodCache.set(cacheKey, result);
  return result;
}

function getRandomEmojiFromCategory(category) {
  const emojiChar = category.emojis[Math.floor(Math.random() * category.emojis.length)];
  return emojiList.find(e => e.emoji === emojiChar) || emojiList[0];
}

function getSecondEmoji(firstEmoji, prompt) {
  const promptLower = prompt.toLowerCase();
  const allMatches = [];
  for (const category of MOOD_CATEGORIES) {
    let score = 0;
    for (const [keyword, weight] of category.keywords) {
      if (promptLower.includes(keyword)) score += weight;
    }
    if (score >= CONFIG.FALLBACK_MIN_SCORE) allMatches.push({ category, score });
  }
  allMatches.sort((a, b) => b.score - a.score);
  if (allMatches.length >= 2 && allMatches[1].category.name !== allMatches[0].category.name) {
    const secondCat = allMatches[1].category;
    const emojiChar = secondCat.emojis[Math.floor(Math.random() * secondCat.emojis.length)];
    const found = emojiList.find(e => e.emoji === emojiChar);
    if (found && found.code !== firstEmoji.code) return found;
  }
  const firstCat = allMatches[0]?.category || MOOD_CATEGORIES[0];
  const otherEmojis = firstCat.emojis.filter(e => e !== firstEmoji.emoji);
  if (otherEmojis.length > 0) {
    const emojiChar = otherEmojis[Math.floor(Math.random() * otherEmojis.length)];
    const found = emojiList.find(e => e.emoji === emojiChar);
    if (found) return found;
  }
  return emojiList.filter(e => e.code !== firstEmoji.code)[Math.floor(Math.random() * (emojiList.length - 1))] || emojiList[0];
}

// ---------- AI MODE ----------
async function aiGenerate() {
  if (state.aiRequestInFlight) return;
  const prompt = getEl('aiPrompt')?.value.trim();
  if (!prompt) return alert("Please describe a feeling or mood!");
  state.aiRequestInFlight = true;
  const sp = getEl('aiSpinner'), img = getEl('aiImg');
  clearImageHandlers(img);
  if (sp?.isConnected) sp.classList.add('active');
  if (img?.isConnected) img.classList.remove('show');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.AI_TIMEOUT_MS);
  try {
    const response = await fetch("/api/ai-generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }), signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    const objUrl = await fetchEmojiMix(data.code1, data.code2);
    if (img?.isConnected) {
      img.src = objUrl;
      img.onload = () => { if (img.isConnected) { img.classList.add('show'); if (sp?.isConnected) sp.classList.remove('active'); playSound(); } };
      img.onerror = () => { if (sp?.isConnected) sp.classList.remove('active'); };
    }
  } catch (e) {
    logger.warn("OpenAI failed, using smart fallback...");
    await aiSmartFallback(prompt, sp, img);
  } finally {
    clearTimeout(timeoutId);
    state.aiRequestInFlight = false;
  }
}

async function aiSmartFallback(prompt, sp, img) {
  try {
    const category = detectMood(prompt);
    const e1 = getRandomEmojiFromCategory(category);
    const e2 = getSecondEmoji(e1, prompt);
    const objUrl = await fetchEmojiMix(e1.code, e2.code);
    if (img?.isConnected) {
      img.src = objUrl;
      img.onload = () => { if (img.isConnected) { img.classList.add('show'); if (sp?.isConnected) sp.classList.remove('active'); playSound(); } };
      img.onerror = () => { if (sp?.isConnected) sp.classList.remove('active'); };
    }
  } catch (error) {
    if (sp?.isConnected) sp.classList.remove('active');
    alert("AI mix failed, try a different description!");
    logger.error("AI Fallback Error:", error);
  }
}

// ---------- TRENDING (Stable) ----------
let trendingRenderToken = 0;

async function loadTrending() {
  const token = ++trendingRenderToken;
  const container = getEl('trendingList');
  if (!container?.isConnected) return;
  const fragment = document.createDocumentFragment();
  for (const c of trendingCombos) {
    if (token !== trendingRenderToken) return;
    const div = document.createElement('div');
    div.className = 'trending-item';
    try {
      const objUrl = await fetchEmojiMix(c.code1, c.code2);
      if (token !== trendingRenderToken) break;
      const img = document.createElement('img');
      img.src = objUrl;
      img.alt = `Trending emoji mix`;
      img.loading = 'lazy';
      img.style.cssText = 'width:60px;border-radius:12px;';
      div.appendChild(img);
      fragment.appendChild(div);
    } catch(e) {}
  }
  if (token === trendingRenderToken && container.isConnected) {
    container.innerHTML = '';
    container.appendChild(fragment);
  }
}

// ---------- FAVORITES (Stable) ----------
let favoritesRenderToken = 0;

async function renderFavorites() {
  const token = ++favoritesRenderToken;
  const container = getEl('favoritesList');
  if (!container?.isConnected) return;
  const favs = getFavorites();
  if (favs.length === 0) {
    if (token === favoritesRenderToken && container.isConnected) {
      container.innerHTML = '<p style="color:var(--subtext);text-align:center;">No saved combos yet. Mix and save your favorites! ❤️</p>';
    }
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const f of favs) {
    if (token !== favoritesRenderToken) return;
    const div = document.createElement('div');
    div.className = 'fav-item';
    try {
      const objUrl = await fetchEmojiMix(f.code1, f.code2);
      if (token !== favoritesRenderToken) break;
      const img = document.createElement('img');
      img.src = objUrl;
      img.alt = 'Saved combo';
      img.loading = 'lazy';
      const del = document.createElement('button');
      del.textContent = '×';
      del.setAttribute('aria-label', 'Remove from favorites');
      del.onclick = () => removeFavorite(f.code1, f.code2);
      div.appendChild(img);
      div.appendChild(del);
      fragment.appendChild(div);
    } catch(e) {}
  }
  if (token === favoritesRenderToken && container.isConnected) {
    container.innerHTML = '';
    container.appendChild(fragment);
  }
}

// ---------- SHARE FUNCTIONS ----------
async function shareComboCard(imgUrl, e1, e2) {
  const canvas = document.createElement("canvas");
  canvas.width = 500; canvas.height = 500;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, 500, 500);
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = imgUrl; });
    ctx.drawImage(img, 100, 120, 300, 300);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px Inter, Arial";
    ctx.textAlign = "center";
    ctx.fillText("Emoji Kitchen Pro", 250, 40);
    ctx.font = "30px Inter, Arial";
    ctx.fillText(`${e1} + ${e2}`, 250, 460);
    canvas.toBlob((blob) => {
      const url = createSafeObjectURL(blob);
      const link = document.createElement("a");
      link.download = "emoji-card.png";
      link.href = url;
      link.click();
      setTimeout(() => revokeObjectURLSafe(url), 1000);
    }, 'image/png');
  } catch (e) {
    logger.error('Card generation failed:', e);
    alert('Could not generate card. Please try again.');
  }
}

function shareSite() {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title: "Emoji Kitchen Pro", text: "Check this fun emoji mixer!", url: url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => alert("Link copied! Share it anywhere 🚀")).catch(() => alert("Could not copy link."));
  }
}

function scrollToTool() {
  const tool = getEl('tool');
  if (tool) tool.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function voteCombo(up) {
  if (state.currentVoteCombo) {
    state.votes += up ? CONFIG.VOTE_INCREMENT : -CONFIG.VOTE_INCREMENT;
    setText('voteCount', state.votes);
    storage.set(CONFIG.STORAGE_KEYS.VOTES, state.votes);
  }
}

// ---------- TAB SWITCHING ----------
function setupTabs() {
  const tabContainer = getEl('tabNav');
  if (!tabContainer) return;
  tabContainer.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    document.querySelectorAll('.tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const mode = tab.dataset.mode;
    document.querySelectorAll('.mode-content').forEach(m => m.classList.remove('active'));
    const modeEl = getEl(`mode-${mode}`);
    if (modeEl) modeEl.classList.add('active');
    switch(mode) {
      case 'battle': generateBattle(); break;
      case 'wall': loadWall(); break;
      case 'challenge': initDailyChallenge(); break;
      case 'game': newGamePuzzle(); break;
      case 'story': initStoryMode(); break;
      case 'trending': loadTrending(); break;
      case 'favorites': renderFavorites(); break;
    }
  });
}

// ---------- EVENT LISTENERS ----------
function setupEventListeners() {
  document.addEventListener('click', (e) => {
    const target = e.target;
    const id = target.id || target.closest('[id]')?.id;
    if (!id) return;
    const handledIds = ['scrollToToolBtn','toggleDarkModeBtn','themeToggleFloat','randomMixBtn','mixDownload','mixDownloadCard','mixCopy','mixWhatsapp','mixSave','voteUpBtn','voteDownBtn','battleAgain','battleShare','storyReset','storyDownload','wallRefresh','gameSubmit','gameNew','aiGenerate','clearFavorites','shareToolBtn'];
    if (handledIds.includes(id)) {
      e.preventDefault();
      handleButtonClick(id);
    }
  });

  ['mixSearch1','mixSearch2'].forEach((inputId, i) => {
    const input = getEl(inputId);
    if (!input) return;
    let debounceTimer;
    const gridId = i === 0 ? 'mixGrid1' : 'mixGrid2';
    input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => window.filterGrid(gridId, e.target.value), 150);
    });
  });
}

function handleButtonClick(id) {
  switch(id) {
    case 'scrollToToolBtn': scrollToTool(); break;
    case 'toggleDarkModeBtn': case 'themeToggleFloat': toggleDarkMode(); break;
    case 'randomMixBtn': randomMix(); break;
    case 'mixDownload': { const img = getEl('mixResultImg'); if (img?.src) { const a = document.createElement('a'); a.href = img.src; a.download = `emojimix-${state.mixSel1.emoji}-${state.mixSel2.emoji}.png`; a.click(); } break; }
    case 'mixDownloadCard': { const img = getEl('mixResultImg'); if (img?.src) shareComboCard(img.src, state.mixSel1.emoji, state.mixSel2.emoji); break; }
    case 'mixCopy': navigator.clipboard.writeText(window.location.href); break;
    case 'mixWhatsapp': window.open(`https://wa.me/?text=Check%20this%20emoji%20mix!%20${encodeURIComponent(window.location.href)}`, '_blank', 'noopener,noreferrer'); break;
    case 'mixSave': saveFavorite(state.mixSel1.code, state.mixSel2.code); break;
    case 'voteUpBtn': voteCombo(true); break;
    case 'voteDownBtn': voteCombo(false); break;
    case 'battleAgain': generateBattle(); break;
    case 'battleShare': window.open(`https://twitter.com/intent/tweet?text=Emoji%20battle!%20${encodeURIComponent(window.location.href)}`, '_blank', 'noopener,noreferrer'); break;
    case 'storyReset': state.storyPairs = []; renderStoryStrip(); const sd = getEl('storyDownload'); if (sd?.isConnected) sd.disabled = true; break;
    case 'storyDownload': alert('Story download coming soon! 🚀'); break;
    case 'wallRefresh': loadWall(); break;
    case 'gameSubmit': {
      const g1 = getEl('gameGuess1')?.value, g2 = getEl('gameGuess2')?.value;
      if (g1 && g2 && ((g1 === state.gameAnswer.code1 && g2 === state.gameAnswer.code2) || (g1 === state.gameAnswer.code2 && g2 === state.gameAnswer.code1))) {
        state.gameScore += CONFIG.GAME_SCORE_INCREMENT;
        setText('gameFeedback', '✅ Correct! +10');
      } else setText('gameFeedback', '❌ Try again');
      setText('gameScore', state.gameScore);
      playSound();
      break;
    }
    case 'gameNew': newGamePuzzle(); break;
    case 'aiGenerate': aiGenerate(); break;
    case 'clearFavorites': storage.remove(CONFIG.STORAGE_KEYS.FAVORITES); renderFavorites(); break;
    case 'shareToolBtn': shareSite(); break;
  }
}

// ---------- PWA ----------
function setupPWA() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js")
      .then(registration => {
        logger.info("PWA Ready:", registration.scope);
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              logger.info('New version available!');
            }
          });
        });
      })
      .catch(err => logger.warn("SW registration failed:", err));
  });
}

// ---------- ACCESSIBILITY ----------
function setupAccessibility() {
  const skipLink = document.createElement('a');
  skipLink.href = '#tool';
  skipLink.style.cssText = 'position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;';
  skipLink.textContent = 'Skip to main content';
  document.body.insertBefore(skipLink, document.body.firstChild);
}

// ---------- MEMORY MANAGEMENT ----------
function setupMemoryManagement() {
  window.addEventListener('beforeunload', () => {
    cleanupAllObjectURLs();
    moodCache.clear();
    emojiCache.forEach(entry => revokeObjectURLSafe(entry.url));
    emojiCache.clear();
    globalCleanupTasks.forEach(fn => fn());
    globalCleanupTasks.length = 0;
  });
}

// ---------- LAZY INITIALIZATION ----------
function scheduleLazyTask(fn, delay = 0) {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => setTimeout(fn, delay), { timeout: 2000 });
  } else {
    setTimeout(fn, delay + 100);
  }
}

// ---------- INITIALIZATION ----------
function init() {
  loadTheme();
  
  renderGrid('mixGrid1', state.mixSel1, select1);
  renderGrid('mixGrid2', state.mixSel2, select2);
  setText('mixSelected1', state.mixSel1.emoji);
  setText('mixSelected2', state.mixSel2.emoji);
  
  renderMix();

  setupTabs();
  setupEventListeners();
  setupPWA();
  setupAccessibility();
  setupMemoryManagement();

  setText('voteCount', state.votes);

  // Stagger heavy startup tasks
  scheduleLazyTask(() => loadWall(), 0);
  scheduleLazyTask(() => initDailyChallenge(), 50);
  scheduleLazyTask(() => loadTrending(), 100);
  scheduleLazyTask(() => renderFavorites(), 150);
  
  logger.info('Emoji Kitchen Pro initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}