// ==================== EMOJI KITCHEN PRO - MAIN APP ====================

// ---------- DATA ----------
const emojiList = [
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
];

const trendingCombos = [
  { code1:"1f602", code2:"2764" },
  { code1:"1f60d", code2:"1f525" },
  { code1:"1f970", code2:"1f618" },
  { code1:"1f389", code2:"1f382" },
];

// ---------- GLOBAL STATE ----------
const emojiCache = {};
let mixSel1 = emojiList[0], mixSel2 = emojiList[1];
let currentVoteCombo = null, votes = 0;
let storyPairs = [];
let gameAnswer = {}, gameScore = 0;

// ---------- DOM ELEMENTS (Safe Getters) ----------
const getEl = (id) => document.getElementById(id);

// ---------- UTILITY FUNCTIONS ----------
async function fetchEmojiMix(code1, code2) {
  const key = code1 + "_" + code2;
  if (emojiCache[key]) return emojiCache[key];

  const url = `https://emojik.vercel.app/s/${code1}_${code2}?size=256`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Not available');
  const blob = await res.blob();
  const objUrl = URL.createObjectURL(blob);
  emojiCache[key] = objUrl;
  return objUrl;
}

function playSound() {
  const sound = getEl('mixSound');
  if (sound) sound.play().catch(() => {});
}

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('emojifavs') || '[]');
  } catch (e) {
    return [];
  }
}

function saveFavorite(code1, code2) {
  const favs = getFavorites();
  if (!favs.find(f => (f.code1===code1 && f.code2===code2) || (f.code1===code2 && f.code2===code1))) {
    favs.push({ code1, code2, date: Date.now() });
    localStorage.setItem('emojifavs', JSON.stringify(favs));
    renderFavorites();
  }
}

function removeFavorite(code1, code2) {
  let favs = getFavorites().filter(f => !((f.code1===code1 && f.code2===code2) || (f.code1===code2 && f.code2===code1)));
  localStorage.setItem('emojifavs', JSON.stringify(favs));
  renderFavorites();
}

function toggleDarkMode() {
  document.body.classList.toggle('neon-dark');
  const btn = getEl('themeToggleFloat');
  if (btn) btn.textContent = document.body.classList.contains('neon-dark') ? '☀️' : '🌓';
}

// ---------- GRID RENDERING ----------
function renderGrid(containerId, selected, onClick, searchQuery = '') {
  const container = getEl(containerId);
  if (!container) return;
  container.innerHTML = '';
  const filtered = emojiList.filter(e => e.emoji.includes(searchQuery) || e.code.includes(searchQuery));
  filtered.forEach(e => {
    const div = document.createElement('div');
    div.className = 'emoji-item';
    if (selected && e.code === selected.code) div.classList.add('selected');
    div.textContent = e.emoji;
    div.addEventListener('click', () => onClick(e));
    container.appendChild(div);
  });
}

function select1(e) {
  mixSel1 = e;
  const el = getEl('mixSelected1');
  if (el) el.textContent = e.emoji;
  renderGrid('mixGrid1', mixSel1, select1);
  renderMix();
}

function select2(e) {
  mixSel2 = e;
  const el = getEl('mixSelected2');
  if (el) el.textContent = e.emoji;
  renderGrid('mixGrid2', mixSel2, select2);
  renderMix();
}

// Expose filterGrid for HTML inline calls (if any remain)
window.filterGrid = (id, query) => {
  if (id === 'mixGrid1') renderGrid('mixGrid1', mixSel1, select1, query);
  else if (id === 'mixGrid2') renderGrid('mixGrid2', mixSel2, select2, query);
};

// ---------- MIX MODE ----------
async function renderMix() {
  const img = getEl('mixResultImg'), spinner = getEl('mixSpinner');
  const error = getEl('mixError');
  const down = getEl('mixDownload'), downCard = getEl('mixDownloadCard');
  const copy = getEl('mixCopy'), whatsapp = getEl('mixWhatsapp');
  const save = getEl('mixSave');

  if (!img) return;
  
  img.classList.remove('show');
  if (error) error.style.display = 'none';
  if (spinner) spinner.classList.add('active');
  
  [down, downCard, copy, whatsapp, save].forEach(btn => { if (btn) btn.disabled = true; });
  
  try {
    const objUrl = await fetchEmojiMix(mixSel1.code, mixSel2.code);
    img.src = objUrl;
    img.onload = () => {
      img.classList.add('show');
      if (spinner) spinner.classList.remove('active');
      [down, downCard, copy, whatsapp, save].forEach(btn => { if (btn) btn.disabled = false; });
      currentVoteCombo = { code1: mixSel1.code, code2: mixSel2.code };
      playSound();
    };
    if (img.complete) {
      img.classList.add('show');
      if (spinner) spinner.classList.remove('active');
      [down, downCard, copy, whatsapp, save].forEach(btn => { if (btn) btn.disabled = false; });
    }
  } catch(e) {
    if (spinner) spinner.classList.remove('active');
    if (error) error.style.display = 'block';
  }
}

function randomMix() {
  mixSel1 = emojiList[Math.floor(Math.random() * emojiList.length)];
  mixSel2 = emojiList[Math.floor(Math.random() * emojiList.length)];
  const el1 = getEl('mixSelected1'), el2 = getEl('mixSelected2');
  if (el1) el1.textContent = mixSel1.emoji;
  if (el2) el2.textContent = mixSel2.emoji;
  renderGrid('mixGrid1', mixSel1, select1);
  renderGrid('mixGrid2', mixSel2, select2);
  renderMix();
}

// ---------- BATTLE MODE ----------
function generateBattle() {
  const e1 = emojiList[Math.floor(Math.random() * emojiList.length)];
  let e2 = emojiList[Math.floor(Math.random() * emojiList.length)];
  while (e2.code === e1.code) e2 = emojiList[Math.floor(Math.random() * emojiList.length)];
  
  const spinner = getEl('battleSpinner'), img = getEl('battleImg');
  const caption = getEl('battleCaption');
  if (spinner) spinner.classList.add('active');
  if (img) img.classList.remove('show');
  
  fetchEmojiMix(e1.code, e2.code).then(objUrl => {
    if (img) {
      img.src = objUrl;
      img.onload = () => {
        img.classList.add('show');
        if (spinner) spinner.classList.remove('active');
        if (caption) caption.textContent = `${e1.emoji} vs ${e2.emoji} – who wins?`;
        playSound();
      };
    }
  }).catch(() => generateBattle());
}

// ---------- STORY MODE ----------
function initStoryMode() {
  const selector = getEl('storySelector');
  if (!selector) return;
  selector.innerHTML = `
    <select id="storySel1">${emojiList.map(e => `<option value="${e.code}">${e.emoji}</option>`).join('')}</select>
    <select id="storySel2">${emojiList.map(e => `<option value="${e.code}">${e.emoji}</option>`).join('')}</select>
    <button class="btn" id="storyAdd">➕ Add</button>
  `;
  
  const addBtn = getEl('storyAdd');
  if (addBtn) addBtn.onclick = async () => {
    if (storyPairs.length >= 3) return alert('Max 3 panels');
    const sel1 = getEl('storySel1'), sel2 = getEl('storySel2');
    const c1 = sel1?.value, c2 = sel2?.value;
    if (!c1 || !c2) return;
    try {
      const objUrl = await fetchEmojiMix(c1, c2);
      storyPairs.push({ code1: c1, code2: c2, objUrl });
      renderStoryStrip();
      const downBtn = getEl('storyDownload');
      if (downBtn) downBtn.disabled = false;
      playSound();
    } catch(e) { alert('Combo not available'); }
  };
  renderStoryStrip();
}

function renderStoryStrip() {
  const strip = getEl('storyStrip');
  if (strip) strip.innerHTML = storyPairs.map(p => `<img src="${p.objUrl}" style="max-width:120px;border-radius:12px;">`).join('');
}

// ---------- DAILY CHALLENGE ----------
function initDailyChallenge() {
  const today = new Date().toDateString();
  const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const e1 = emojiList[seed % emojiList.length];
  const e2 = emojiList[(seed * 7) % emojiList.length];
  
  const setText = (id, text) => { const el = getEl(id); if (el) el.textContent = text; };
  setText('challengeEmoji1', e1.emoji);
  setText('challengeEmoji2', e2.emoji);
  setText('challengeDisplay1', e1.emoji);
  setText('challengeDisplay2', e2.emoji);
  
  const mixBtn = getEl('challengeMixBtn');
  if (mixBtn) {
    mixBtn.onclick = async () => {
      const sp = getEl('challengeSpinner'), img = getEl('challengeImg');
      if (sp) sp.classList.add('active');
      if (img) img.classList.remove('show');
      try {
        const objUrl = await fetchEmojiMix(e1.code, e2.code);
        if (img) {
          img.src = objUrl;
          img.onload = () => {
            img.classList.add('show');
            if (sp) sp.classList.remove('active');
            playSound();
          };
        }
      } catch(e) {
        if (sp) sp.classList.remove('active');
        const err = getEl('challengeError');
        if (err) err.style.display = 'block';
      }
    };
  }
  
  const shareBtn = getEl('challengeShare');
  if (shareBtn) shareBtn.onclick = () => window.open('https://twitter.com/intent/tweet?text=My%20%23EmojiKitchenDaily%20entry!');
}

// ---------- WALL MODE ----------
function loadWall() {
  const wall = getEl('wallGrid');
  if (!wall) return;
  wall.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const e1 = emojiList[Math.floor(Math.random() * emojiList.length)];
    const e2 = emojiList[Math.floor(Math.random() * emojiList.length)];
    const div = document.createElement('div');
    div.className = 'wall-item';
    const img = document.createElement('img');
    fetchEmojiMix(e1.code, e2.code).then(objUrl => img.src = objUrl).catch(() => {});
    div.appendChild(img);
    wall.appendChild(div);
  }
}

// ---------- GAME MODE ----------
async function newGamePuzzle() {
  const e1 = emojiList[Math.floor(Math.random() * emojiList.length)];
  const e2 = emojiList[Math.floor(Math.random() * emojiList.length)];
  gameAnswer = { code1: e1.code, code2: e2.code };
  try {
    const objUrl = await fetchEmojiMix(e1.code, e2.code);
    const blurImg = getEl('gameBlurImg');
    if (blurImg) blurImg.src = objUrl;
    const s1 = getEl('gameGuess1'), s2 = getEl('gameGuess2');
    const options = emojiList.map(e => `<option value="${e.code}">${e.emoji}</option>`).join('');
    if (s1) s1.innerHTML = options;
    if (s2) s2.innerHTML = options;
    const fb = getEl('gameFeedback');
    if (fb) fb.textContent = '';
  } catch(e) { newGamePuzzle(); }
}

// ---------- AI MODE ----------
async function aiGenerate() {
  const prompt = getEl('aiPrompt')?.value.trim();
  if (!prompt) return alert("Please describe a feeling or mood!");

  const sp = getEl('aiSpinner'), img = getEl('aiImg');
  if (sp) sp.classList.add('active');
  if (img) img.classList.remove('show');

  try {
    const response = await fetch("/api/ai-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    
    const objUrl = await fetchEmojiMix(data.code1, data.code2);
    if (img) {
      img.src = objUrl;
      img.onload = () => {
        img.classList.add('show');
        if (sp) sp.classList.remove('active');
        playSound();
      };
    }
  } catch (e) {
    console.log("OpenAI failed, using smart fallback...", e.message);
    await aiFallback(prompt, sp, img);
  }
}

async function aiFallback(prompt, sp, img) {
  try {
    const moodMap = [
      { keys: ["happy", "joy", "fun", "excited", "great", "awesome"], emoji: "😊" },
      { keys: ["sad", "cry", "crying", "unhappy", "depressed", "upset"], emoji: "😭" },
      { keys: ["love", "heart", "romance", "romantic", "valentine", "kiss"], emoji: "❤️" },
      { keys: ["fire", "hot", "flame", "lit", "burning", "blazing"], emoji: "🔥" },
      { keys: ["party", "celebrate", "birthday", "dance", "festival", "fun"], emoji: "🎉" },
      { keys: ["cool", "ice", "chill", "cold", "frozen", "winter"], emoji: "😎" },
      { keys: ["crazy", "wild", "insane", "mad", "goofy", "silly"], emoji: "🤪" },
      { keys: ["sleep", "tired", "sleepy", "lazy", "boring", "dull"], emoji: "😴" },
      { keys: ["angry", "mad", "rage", "furious", "annoyed", "frustrated"], emoji: "😡" },
      { keys: ["scared", "fear", "horror", "spooky", "creepy", "terrified"], emoji: "😱" },
      { keys: ["food", "hungry", "pizza", "burger", "eat", "tasty"], emoji: "🍕" },
      { keys: ["animal", "dog", "cat", "pet", "cute animal", "puppy"], emoji: "🐶" }
    ];

    const promptLower = prompt.toLowerCase();
    let e1 = emojiList[0];
    moodMap.forEach(m => {
      if (m.keys.some(k => promptLower.includes(k))) {
        const found = emojiList.find(e => e.emoji === m.emoji);
        if (found) e1 = found;
      }
    });

    const e2 = emojiList[Math.floor(Math.random() * emojiList.length)];
    const objUrl = await fetchEmojiMix(e1.code, e2.code);
    if (img) {
      img.src = objUrl;
      img.onload = () => {
        img.classList.add('show');
        if (sp) sp.classList.remove('active');
        playSound();
      };
    }
  } catch (fallbackError) {
    if (sp) sp.classList.remove('active');
    alert("AI mix failed, try a different description!");
    console.error("AI Error:", fallbackError);
  }
}

// ---------- TRENDING ----------
function loadTrending() {
  const container = getEl('trendingList');
  if (!container) return;
  container.innerHTML = '';
  trendingCombos.forEach(async c => {
    const div = document.createElement('div');
    div.className = 'trending-item';
    try {
      const objUrl = await fetchEmojiMix(c.code1, c.code2);
      const img = document.createElement('img');
      img.src = objUrl;
      img.style.width = '60px';
      img.style.borderRadius = '12px';
      div.appendChild(img);
    } catch(e) {}
    container.appendChild(div);
  });
}

// ---------- FAVORITES ----------
function renderFavorites() {
  const container = getEl('favoritesList');
  if (!container) return;
  container.innerHTML = '';
  getFavorites().forEach(async f => {
    const div = document.createElement('div');
    div.className = 'fav-item';
    try {
      const objUrl = await fetchEmojiMix(f.code1, f.code2);
      const img = document.createElement('img');
      img.src = objUrl;
      const del = document.createElement('button');
      del.textContent = 'x';
      del.onclick = () => removeFavorite(f.code1, f.code2);
      div.appendChild(img);
      div.appendChild(del);
      container.appendChild(div);
    } catch(e) {}
  });
}

// ---------- SHARE FUNCTIONS ----------
async function shareComboCard(imgUrl, e1, e2) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 500;
  canvas.height = 500;
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, 500, 500);
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imgUrl;
  img.onload = () => {
    ctx.drawImage(img, 100, 120, 300, 300);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px Inter, Arial";
    ctx.textAlign = "center";
    ctx.fillText("Emoji Kitchen Pro", 250, 40);
    ctx.font = "30px Inter, Arial";
    ctx.fillText(e1 + " + " + e2, 250, 460);
    const link = document.createElement("a");
    link.download = "emoji-card.png";
    link.href = canvas.toDataURL();
    link.click();
  };
}

function shareSite() {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({
      title: "Emoji Kitchen Pro",
      text: "Check this fun emoji mixer!",
      url: url
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => alert("Link copied! Share it anywhere 🚀"));
  }
}

function scrollToTool() {
  const tool = getEl('tool');
  if (tool) tool.scrollIntoView({ behavior: 'smooth' });
}

function voteCombo(up) {
  if (currentVoteCombo) {
    votes += up ? 1 : -1;
    const vc = getEl('voteCount');
    if (vc) vc.textContent = votes;
  }
}

// ---------- TAB SWITCHING ----------
function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
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
  });
}

// ---------- EVENT LISTENERS ----------
function setupEventListeners() {
  const scrollBtn = getEl('scrollToToolBtn');
  if (scrollBtn) scrollBtn.addEventListener('click', scrollToTool);

  const darkBtn = getEl('toggleDarkModeBtn');
  if (darkBtn) darkBtn.addEventListener('click', toggleDarkMode);
  
  const themeFloat = getEl('themeToggleFloat');
  if (themeFloat) themeFloat.addEventListener('click', toggleDarkMode);

  const randomBtn = getEl('randomMixBtn');
  if (randomBtn) randomBtn.addEventListener('click', randomMix);

  const mixDownload = getEl('mixDownload');
  if (mixDownload) mixDownload.addEventListener('click', () => {
    const img = getEl('mixResultImg');
    if (img?.src) {
      const a = document.createElement('a');
      a.href = img.src;
      a.download = `emojimix-${mixSel1.emoji}-${mixSel2.emoji}.png`;
      a.click();
    }
  });

  const mixCard = getEl('mixDownloadCard');
  if (mixCard) mixCard.addEventListener('click', () => {
    const img = getEl('mixResultImg');
    if (img?.src) shareComboCard(img.src, mixSel1.emoji, mixSel2.emoji);
  });

  const mixCopy = getEl('mixCopy');
  if (mixCopy) mixCopy.addEventListener('click', () => navigator.clipboard.writeText(window.location.href));

  const mixWA = getEl('mixWhatsapp');
  if (mixWA) mixWA.addEventListener('click', () => {
    window.open(`https://wa.me/?text=Check%20this%20emoji%20mix!%20${encodeURIComponent(window.location.href)}`);
  });

  const mixSave = getEl('mixSave');
  if (mixSave) mixSave.addEventListener('click', () => saveFavorite(mixSel1.code, mixSel2.code));

  const voteUp = getEl('voteUpBtn'), voteDown = getEl('voteDownBtn');
  if (voteUp) voteUp.addEventListener('click', () => voteCombo(true));
  if (voteDown) voteDown.addEventListener('click', () => voteCombo(false));

  const battleAgain = getEl('battleAgain');
  if (battleAgain) battleAgain.addEventListener('click', generateBattle);
  
  const battleShare = getEl('battleShare');
  if (battleShare) battleShare.addEventListener('click', () => {
    window.open(`https://twitter.com/intent/tweet?text=Emoji%20battle!%20${encodeURIComponent(window.location.href)}`);
  });

  const storyReset = getEl('storyReset');
  if (storyReset) storyReset.addEventListener('click', () => {
    storyPairs = [];
    renderStoryStrip();
    const sd = getEl('storyDownload');
    if (sd) sd.disabled = true;
  });
  
  const storyDownload = getEl('storyDownload');
  if (storyDownload) storyDownload.addEventListener('click', () => alert('Story download coming soon'));

  const wallRefresh = getEl('wallRefresh');
  if (wallRefresh) wallRefresh.addEventListener('click', loadWall);

  const gameSubmit = getEl('gameSubmit');
  if (gameSubmit) gameSubmit.addEventListener('click', () => {
    const g1 = getEl('gameGuess1')?.value, g2 = getEl('gameGuess2')?.value;
    const fb = getEl('gameFeedback'), gs = getEl('gameScore');
    if (g1 && g2 && ((g1===gameAnswer.code1 && g2===gameAnswer.code2) || (g1===gameAnswer.code2 && g2===gameAnswer.code1))) {
      gameScore += 10;
      if (fb) fb.textContent = '✅ Correct! +10';
    } else {
      if (fb) fb.textContent = '❌ Try again';
    }
    if (gs) gs.textContent = gameScore;
    playSound();
  });
  
  const gameNew = getEl('gameNew');
  if (gameNew) gameNew.addEventListener('click', newGamePuzzle);

  const aiBtn = getEl('aiGenerate');
  if (aiBtn) aiBtn.addEventListener('click', aiGenerate);

  const search1 = getEl('mixSearch1'), search2 = getEl('mixSearch2');
  if (search1) search1.addEventListener('input', (e) => window.filterGrid('mixGrid1', e.target.value));
  if (search2) search2.addEventListener('input', (e) => window.filterGrid('mixGrid2', e.target.value));

  const clearFav = getEl('clearFavorites');
  if (clearFav) clearFav.addEventListener('click', () => {
    localStorage.removeItem('emojifavs');
    renderFavorites();
  });

  const shareTool = getEl('shareToolBtn');
  if (shareTool) shareTool.addEventListener('click', shareSite);
}

// ---------- PWA ----------
function setupPWA() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js")
        .then(() => console.log("PWA Ready"))
        .catch(err => console.log("SW Error:", err));
    });
  }
}

// ---------- INITIALIZATION ----------
function init() {
  renderGrid('mixGrid1', mixSel1, select1);
  renderGrid('mixGrid2', mixSel2, select2);
  const el1 = getEl('mixSelected1'), el2 = getEl('mixSelected2');
  if (el1) el1.textContent = mixSel1.emoji;
  if (el2) el2.textContent = mixSel2.emoji;
  renderMix();

  setupTabs();
  setupEventListeners();
  setupPWA();

  loadWall();
  initDailyChallenge();
  loadTrending();
  renderFavorites();
}

document.addEventListener('DOMContentLoaded', init);