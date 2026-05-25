// ==================== EMOJI KITCHEN PRO - PRODUCTION APP ====================

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
  STORAGE_KEYS: { FAVORITES: 'emojifavs', THEME: 'theme', VOTES: 'votes' },
  AI_TIMEOUT_MS: 15000,
  CACHE_MAX_AGE_MS: 600000,
  CACHE_MAX_SIZE: 250
};

// ---------- DATA (250+ Emojis) ----------
const emojiList = Object.freeze([
  { emoji:"😀", code:"1f600" },{ emoji:"😃", code:"1f603" },{ emoji:"😄", code:"1f604" },
  { emoji:"😁", code:"1f601" },{ emoji:"😅", code:"1f605" },{ emoji:"🤣", code:"1f923" },
  { emoji:"😂", code:"1f602" },{ emoji:"😊", code:"1f60a" },{ emoji:"😇", code:"1f607" },
  { emoji:"🥰", code:"1f970" },{ emoji:"😍", code:"1f60d" },{ emoji:"🤩", code:"1f929" },
  { emoji:"😘", code:"1f618" },{ emoji:"😗", code:"1f617" },{ emoji:"😚", code:"1f61a" },
  { emoji:"😋", code:"1f60b" },{ emoji:"😛", code:"1f61b" },{ emoji:"😜", code:"1f61c" },
  { emoji:"🤪", code:"1f92a" },{ emoji:"😝", code:"1f61d" },{ emoji:"🤑", code:"1f911" },
  { emoji:"🤗", code:"1f917" },{ emoji:"🤭", code:"1f92d" },{ emoji:"🤫", code:"1f92b" },
  { emoji:"🤔", code:"1f914" },{ emoji:"🤐", code:"1f910" },{ emoji:"🤨", code:"1f928" },
  { emoji:"😐", code:"1f610" },{ emoji:"😑", code:"1f611" },{ emoji:"😶", code:"1f636" },
  { emoji:"😏", code:"1f60f" },{ emoji:"😒", code:"1f612" },{ emoji:"🙄", code:"1f644" },
  { emoji:"😬", code:"1f62c" },{ emoji:"🤥", code:"1f925" },{ emoji:"😌", code:"1f60c" },
  { emoji:"😔", code:"1f614" },{ emoji:"😪", code:"1f62a" },{ emoji:"🤤", code:"1f924" },
  { emoji:"😴", code:"1f634" },{ emoji:"😷", code:"1f637" },{ emoji:"🤒", code:"1f912" },
  { emoji:"🤕", code:"1f915" },{ emoji:"🤢", code:"1f922" },{ emoji:"🤮", code:"1f92e" },
  { emoji:"🤧", code:"1f927" },{ emoji:"🥵", code:"1f975" },{ emoji:"🥶", code:"1f976" },
  { emoji:"🥴", code:"1f974" },{ emoji:"😵", code:"1f635" },{ emoji:"🤯", code:"1f92f" },
  { emoji:"🤠", code:"1f920" },{ emoji:"🥳", code:"1f973" },{ emoji:"😎", code:"1f60e" },
  { emoji:"🤓", code:"1f913" },{ emoji:"🧐", code:"1f9d0" },{ emoji:"😕", code:"1f615" },
  { emoji:"😟", code:"1f61f" },{ emoji:"🙁", code:"1f641" },{ emoji:"😮", code:"1f62e" },
  { emoji:"😯", code:"1f62f" },{ emoji:"😲", code:"1f632" },{ emoji:"😳", code:"1f633" },
  { emoji:"🥺", code:"1f97a" },{ emoji:"😦", code:"1f626" },{ emoji:"😧", code:"1f627" },
  { emoji:"😨", code:"1f628" },{ emoji:"😰", code:"1f630" },{ emoji:"😥", code:"1f625" },
  { emoji:"😢", code:"1f622" },{ emoji:"😭", code:"1f62d" },{ emoji:"😱", code:"1f631" },
  { emoji:"😖", code:"1f616" },{ emoji:"😣", code:"1f623" },{ emoji:"😞", code:"1f61e" },
  { emoji:"😓", code:"1f613" },{ emoji:"😩", code:"1f629" },{ emoji:"😫", code:"1f62b" },
  { emoji:"🥱", code:"1f971" },{ emoji:"😤", code:"1f624" },{ emoji:"😡", code:"1f621" },
  { emoji:"😠", code:"1f620" },{ emoji:"🤬", code:"1f92c" },{ emoji:"👿", code:"1f47f" },
  { emoji:"💀", code:"1f480" },{ emoji:"☠️", code:"2620" },{ emoji:"💩", code:"1f4a9" },
  { emoji:"🤡", code:"1f921" },{ emoji:"👹", code:"1f479" },{ emoji:"👺", code:"1f47a" },
  { emoji:"👻", code:"1f47b" },{ emoji:"👽", code:"1f47d" },{ emoji:"👾", code:"1f47e" },
  { emoji:"🤖", code:"1f916" },{ emoji:"😺", code:"1f63a" },{ emoji:"😸", code:"1f638" },
  { emoji:"😹", code:"1f639" },{ emoji:"😻", code:"1f63b" },{ emoji:"😼", code:"1f63c" },
  { emoji:"😽", code:"1f63d" },{ emoji:"🙀", code:"1f640" },{ emoji:"😿", code:"1f63f" },
  { emoji:"😾", code:"1f63e" },
  { emoji:"💌", code:"1f48c" },{ emoji:"💘", code:"1f498" },{ emoji:"💝", code:"1f49d" },
  { emoji:"💖", code:"1f496" },{ emoji:"💗", code:"1f497" },{ emoji:"💓", code:"1f493" },
  { emoji:"💞", code:"1f49e" },{ emoji:"💕", code:"1f495" },{ emoji:"💟", code:"1f49f" },
  { emoji:"❤️", code:"2764" },{ emoji:"🧡", code:"1f9e1" },{ emoji:"💛", code:"1f49b" },
  { emoji:"💚", code:"1f49a" },{ emoji:"💙", code:"1f499" },{ emoji:"💜", code:"1f49c" },
  { emoji:"🤎", code:"1f90e" },{ emoji:"🖤", code:"1f5a4" },{ emoji:"🤍", code:"1f90d" },
  { emoji:"💔", code:"1f494" },{ emoji:"❣️", code:"2763" },
  { emoji:"🐶", code:"1f436" },{ emoji:"🐱", code:"1f431" },{ emoji:"🐭", code:"1f42d" },
  { emoji:"🐹", code:"1f439" },{ emoji:"🐰", code:"1f430" },{ emoji:"🦊", code:"1f98a" },
  { emoji:"🐻", code:"1f43b" },{ emoji:"🐼", code:"1f43c" },{ emoji:"🐨", code:"1f428" },
  { emoji:"🐯", code:"1f42f" },{ emoji:"🦁", code:"1f981" },{ emoji:"🐮", code:"1f42e" },
  { emoji:"🐷", code:"1f437" },{ emoji:"🐸", code:"1f438" },{ emoji:"🐵", code:"1f435" },
  { emoji:"🐔", code:"1f414" },{ emoji:"🐧", code:"1f427" },{ emoji:"🐦", code:"1f426" },
  { emoji:"🐤", code:"1f424" },{ emoji:"🦆", code:"1f986" },{ emoji:"🦅", code:"1f985" },
  { emoji:"🦉", code:"1f989" },{ emoji:"🦇", code:"1f987" },{ emoji:"🐺", code:"1f43a" },
  { emoji:"🐗", code:"1f417" },{ emoji:"🐴", code:"1f434" },{ emoji:"🦄", code:"1f984" },
  { emoji:"🐝", code:"1f41d" },{ emoji:"🐛", code:"1f41b" },{ emoji:"🦋", code:"1f98b" },
  { emoji:"🐌", code:"1f40c" },{ emoji:"🐞", code:"1f41e" },{ emoji:"🐜", code:"1f41c" },
  { emoji:"🦟", code:"1f99f" },{ emoji:"🦗", code:"1f997" },{ emoji:"🕷️", code:"1f577" },
  { emoji:"🦂", code:"1f982" },{ emoji:"🐢", code:"1f422" },{ emoji:"🐍", code:"1f40d" },
  { emoji:"🦎", code:"1f98e" },{ emoji:"🦖", code:"1f996" },{ emoji:"🦕", code:"1f995" },
  { emoji:"🐙", code:"1f419" },{ emoji:"🦑", code:"1f991" },{ emoji:"🦐", code:"1f990" },
  { emoji:"🦞", code:"1f99e" },{ emoji:"🐠", code:"1f420" },{ emoji:"🐟", code:"1f41f" },
  { emoji:"🐡", code:"1f421" },{ emoji:"🦈", code:"1f988" },{ emoji:"🐳", code:"1f433" },
  { emoji:"🐋", code:"1f40b" },{ emoji:"🐬", code:"1f42c" },
  { emoji:"🍕", code:"1f355" },{ emoji:"🍔", code:"1f354" },{ emoji:"🍟", code:"1f35f" },
  { emoji:"🌭", code:"1f32d" },{ emoji:"🍿", code:"1f37f" },{ emoji:"🥓", code:"1f953" },
  { emoji:"🥚", code:"1f95a" },{ emoji:"🥞", code:"1f95e" },{ emoji:"🍞", code:"1f35e" },
  { emoji:"🥐", code:"1f950" },{ emoji:"🥨", code:"1f968" },{ emoji:"🧀", code:"1f9c0" },
  { emoji:"🥗", code:"1f957" },{ emoji:"🌮", code:"1f32e" },{ emoji:"🌯", code:"1f32f" },
  { emoji:"🥪", code:"1f96a" },{ emoji:"🍜", code:"1f35c" },{ emoji:"🍝", code:"1f35d" },
  { emoji:"🍣", code:"1f363" },{ emoji:"🍤", code:"1f364" },{ emoji:"🍚", code:"1f35a" },
  { emoji:"🍱", code:"1f371" },{ emoji:"🍛", code:"1f35b" },{ emoji:"🍲", code:"1f372" },
  { emoji:"🍖", code:"1f356" },{ emoji:"🍗", code:"1f357" },{ emoji:"🥩", code:"1f969" },
  { emoji:"🍦", code:"1f366" },{ emoji:"🍧", code:"1f367" },{ emoji:"🍨", code:"1f368" },
  { emoji:"🍩", code:"1f369" },{ emoji:"🍪", code:"1f36a" },{ emoji:"🎂", code:"1f382" },
  { emoji:"🍰", code:"1f370" },{ emoji:"🧁", code:"1f9c1" },{ emoji:"🥧", code:"1f967" },
  { emoji:"🍫", code:"1f36b" },{ emoji:"🍬", code:"1f36c" },{ emoji:"🍭", code:"1f36d" },
  { emoji:"🍮", code:"1f36e" },{ emoji:"🍯", code:"1f36f" },
  { emoji:"⚽", code:"26bd" },{ emoji:"🏀", code:"1f3c0" },{ emoji:"🏈", code:"1f3c8" },
  { emoji:"⚾", code:"26be" },{ emoji:"🎾", code:"1f3be" },{ emoji:"🎱", code:"1f3b1" },
  { emoji:"🎯", code:"1f3af" },{ emoji:"🎮", code:"1f3ae" },{ emoji:"🎸", code:"1f3b8" },
  { emoji:"🎹", code:"1f3b9" },{ emoji:"🥁", code:"1f941" },{ emoji:"🎷", code:"1f3b7" },
  { emoji:"🎺", code:"1f3ba" },{ emoji:"🎻", code:"1f3bb" },{ emoji:"🎤", code:"1f3a4" },
  { emoji:"🎧", code:"1f3a7" },{ emoji:"📷", code:"1f4f7" },{ emoji:"📸", code:"1f4f8" },
  { emoji:"💻", code:"1f4bb" },{ emoji:"📱", code:"1f4f1" },{ emoji:"💡", code:"1f4a1" },
  { emoji:"💰", code:"1f4b0" },{ emoji:"💎", code:"1f48e" },{ emoji:"🔑", code:"1f511" },
  { emoji:"🎁", code:"1f381" },{ emoji:"🎈", code:"1f388" },{ emoji:"🎉", code:"1f389" },
  { emoji:"🎊", code:"1f38a" },{ emoji:"💯", code:"1f4af" },{ emoji:"🔥", code:"1f525" },
  { emoji:"⭐", code:"2b50" },{ emoji:"🌟", code:"1f31f" },{ emoji:"✨", code:"2728" },
  { emoji:"🌈", code:"1f308" },{ emoji:"☀️", code:"2600" },{ emoji:"🌙", code:"1f319" },
  { emoji:"⚡", code:"26a1" },{ emoji:"💧", code:"1f4a7" },
  { emoji:"👍", code:"1f44d" },{ emoji:"👎", code:"1f44e" },{ emoji:"👏", code:"1f44f" },
  { emoji:"🙌", code:"1f64c" },{ emoji:"👊", code:"1f44a" },{ emoji:"✋", code:"270b" },
  { emoji:"👌", code:"1f44c" },{ emoji:"👉", code:"1f449" },{ emoji:"👆", code:"1f446" },
  { emoji:"👇", code:"1f447" },{ emoji:"✌️", code:"270c" },{ emoji:"🤘", code:"1f918" },
  { emoji:"🚗", code:"1f697" },{ emoji:"🚕", code:"1f695" },{ emoji:"🚓", code:"1f693" },
  { emoji:"🚑", code:"1f691" },{ emoji:"🚒", code:"1f692" },{ emoji:"🚜", code:"1f69c" },
  { emoji:"🛵", code:"1f6f5" },{ emoji:"🚲", code:"1f6b2" },{ emoji:"🚁", code:"1f681" },
  { emoji:"✈️", code:"2708" },{ emoji:"🚀", code:"1f680" },{ emoji:"⛵", code:"26f5" },
  { emoji:"🚢", code:"1f6a2" },
  { emoji:"🌻", code:"1f33b" },{ emoji:"🌸", code:"1f338" },{ emoji:"🌹", code:"1f339" },
  { emoji:"🌺", code:"1f33a" },{ emoji:"🌷", code:"1f337" },{ emoji:"💐", code:"1f490" },
  { emoji:"🌿", code:"1f33f" },{ emoji:"🍀", code:"1f340" },{ emoji:"🌵", code:"1f335" },
  { emoji:"🌴", code:"1f334" },{ emoji:"🌳", code:"1f333" },{ emoji:"🍁", code:"1f341" },
  { emoji:"🍂", code:"1f342" },{ emoji:"🍃", code:"1f343" },{ emoji:"☁️", code:"2601" },
  { emoji:"❄️", code:"2744" },{ emoji:"☃️", code:"2603" },{ emoji:"🌊", code:"1f30a" }
]);

const trendingCombos = Object.freeze([
  { code1:"1f602", code2:"2764" },{ code1:"1f60d", code2:"1f525" },
  { code1:"1f970", code2:"1f618" },{ code1:"1f389", code2:"1f382" }
]);

// ---------- LOGGER ----------
const logger = {
  info: (m,d) => { if(window.location.hostname.includes('localhost')) console.info(`[EK] ${m}`,d||''); },
  warn: (m,d) => console.warn(`[EK] ${m}`,d||''),
  error: (m,e) => console.error(`[EK] ${m}`,e?.message||e)
};

// ---------- STATE ----------
const state = {
  mixSel1: emojiList[0], mixSel2: emojiList[1],
  currentVoteCombo: null,
  votes: parseInt(localStorage.getItem('emoji_kitchen_votes')||'0',10),
  storyPairs: [], gameAnswer: {}, gameScore: 0,
  isRendering: false, aiRequestInFlight: false, renderToken: 0
};

// ---------- MEMORY ----------
const emojiCache = new Map(), pendingFetches = new Map(), moodCache = new Map();
const objectURLs = new Set();

function createSafeObjectURL(b) { const u=URL.createObjectURL(b); objectURLs.add(u); return u; }
function revokeObjectURLSafe(u) { if(u&&objectURLs.has(u)){URL.revokeObjectURL(u);objectURLs.delete(u);} }
function cleanupAllObjectURLs() { objectURLs.forEach(u=>{try{URL.revokeObjectURL(u)}catch(e){}}); objectURLs.clear(); }

function evictStaleCache() {
  const now=Date.now(), toDelete=[];
  for(const [k,e] of emojiCache) if(now-e.t>600000) toDelete.push(k);
  if(emojiCache.size-toDelete.length>250){
    const s=[...emojiCache].filter(([k])=>!toDelete.includes(k)).sort((a,b)=>a[1].t-b[1].t);
    s.slice(0,s.length-250).forEach(([k])=>toDelete.push(k));
  }
  toDelete.forEach(k=>{ const e=emojiCache.get(k); if(e?.u) revokeObjectURLSafe(e.u); emojiCache.delete(k); });
}
setInterval(evictStaleCache,300000);
document.addEventListener('visibilitychange',()=>{if(document.hidden){evictStaleCache();moodCache.clear();}});

// ---------- DOM ----------
const domCache=new Map();
const getEl=(id)=>{if(domCache.has(id)){const c=domCache.get(id);if(c&&c.isConnected)return c;}const e=document.getElementById(id);if(e)domCache.set(id,e);return e;};
const setText=(id,t)=>{const e=getEl(id);if(e)e.textContent=t;};
const setDisplay=(id,d)=>{const e=getEl(id);if(e)e.style.display=d;};
const setBtns=(ids,d)=>{ids.forEach(i=>{const b=getEl(i);if(b)b.disabled=d;});};

// ---------- STORAGE ----------
const storage={
  get(k,f=null){try{const v=localStorage.getItem('emoji_kitchen_'+k);return v?JSON.parse(v):f;}catch{return f;}},
  set(k,v){try{localStorage.setItem('emoji_kitchen_'+k,JSON.stringify(v));return true;}catch{return false;}},
  remove(k){try{localStorage.removeItem('emoji_kitchen_'+k);return true;}catch{return false;}}
};

// ---------- API ----------
async function fetchEmojiMix(c1,c2){
  const key=`${c1}_${c2}`;
  if(emojiCache.has(key)){const e=emojiCache.get(key);e.t=Date.now();return e.u;}
  if(pendingFetches.has(key))return pendingFetches.get(key);
  const url=`https://emojik.vercel.app/s/${c1}_${c2}?size=256`;
  const fp=(async()=>{
    const ac=new AbortController(),tid=setTimeout(()=>ac.abort(),8000);
    try{
      const r=await fetch(url,{signal:ac.signal});clearTimeout(tid);
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      const b=await r.blob(),u=createSafeObjectURL(b);
      emojiCache.set(key,{u,t:Date.now()});return u;
    }catch(e){if(e.name==='AbortError')throw new Error('Timeout');throw e;}
    finally{pendingFetches.delete(key);}
  })();
  pendingFetches.set(key,fp);return fp;
}

async function fetchWithRetry(fn,n=2){for(let i=0;i<=n;i++){try{return await fn();}catch(e){if(i===n)throw e;await new Promise(r=>setTimeout(r,1000*(i+1)));}}}

// ---------- AUDIO ----------
function playSound(){const s=getEl('mixSound');if(s){s.currentTime=0;s.play().catch(()=>{});}}

// ---------- FAVORITES ----------
function getFavs(){return storage.get('emojifavs',[]);}
function saveFav(c1,c2){const f=getFavs();if(!f.some(x=>(x.c1===c1&&x.c2===c2)||(x.c1===c2&&x.c2===c1))){f.push({c1,c2,date:Date.now()});storage.set('emojifavs',f);renderFavorites();}}
function removeFav(c1,c2){const f=getFavs().filter(x=>!((x.c1===c1&&x.c2===c2)||(x.c1===c2&&x.c2===c1)));storage.set('emojifavs',f);renderFavorites();}

// ---------- THEME ----------
function toggleDark(){const d=document.body.classList.toggle('neon-dark');const b=getEl('themeToggleFloat');if(b){b.textContent=d?'☀️':'🌓';b.setAttribute('aria-label',d?'Switch to light':'Switch to dark');}storage.set('theme',d?'dark':'light');}
function loadTheme(){if(storage.get('theme','dark')==='light'){document.body.classList.remove('neon-dark');const b=getEl('themeToggleFloat');if(b){b.textContent='🌓';b.setAttribute('aria-label','Switch to dark');}}}

// ---------- GRID ----------
function renderGrid(cid,sel,onClick,q=''){
  const c=getEl(cid);if(!c)return;
  const f=q?emojiList.filter(e=>e.emoji.includes(q.toLowerCase())||e.code.includes(q.toLowerCase())):emojiList;
  let h='';f.forEach(e=>{const s=(sel&&e.code===sel.code)?' selected':'';h+=`<div class="emoji-item${s}" role="button" tabindex="0" aria-label="Select ${e.emoji}" data-code="${e.code}">${e.emoji}</div>`;});
  c.innerHTML=h;
  if(!c._d){c.addEventListener('click',ev=>{const i=ev.target.closest('.emoji-item');if(i){const cd=i.dataset.code;const eo=emojiList.find(e=>e.code===cd);if(eo)onClick(eo);}});c._d=true;}
}

function sel1(e){state.mixSel1=e;setText('mixSelected1',e.emoji);renderGrid('mixGrid1',state.mixSel1,sel1);renderMix();}
function sel2(e){state.mixSel2=e;setText('mixSelected2',e.emoji);renderGrid('mixGrid2',state.mixSel2,sel2);renderMix();}
window.filterGrid=(id,q)=>{if(id==='mixGrid1')renderGrid('mixGrid1',state.mixSel1,sel1,q);else renderGrid('mixGrid2',state.mixSel2,sel2,q);};

// ---------- SEO ----------
const ENM={"1f525":"fire","2764":"heart","1f602":"laugh","1f60d":"love","1f970":"smile","1f618":"kiss","1f436":"dog","1f431":"cat","1f389":"party","1f382":"cake","1f47b":"ghost","1f680":"rocket","1f60a":"smile","1f62d":"cry","1f621":"angry","1f631":"scared","1f917":"hug","1f914":"think","1f60e":"cool","1f973":"party","1f634":"sleep","1f929":"star","1f607":"angel","1f92f":"explode","1f44d":"like","1f44e":"dislike","1f4af":"100","1f308":"rainbow","2b50":"star","1f355":"pizza","1f354":"burger","1f98a":"fox","1f43c":"panda","1f33b":"flower","1f338":"cherry","1f3b8":"guitar","26bd":"soccer","1f4a1":"idea","2615":"coffee","1f366":"icecream"};
const SC={};function geN(c){if(!SC[c])SC[c]=ENM[c]||c;return SC[c];}
let lSU='';
function updateSEO(){
  const s1=geN(state.mixSel1.code),s2=geN(state.mixSel2.code),nu=`/emoji-mix/${s1}-${s2}`;
  if(lSU===`${s1}_${s2}`)return;lSU=`${s1}_${s2}`;
  history.replaceState({e1:state.mixSel1.code,e2:state.mixSel2.code},'',nu);
  requestAnimationFrame(()=>{
    document.title=`${s1} + ${s2} Emoji Mix | Emoji Kitchen Pro`;
    const md=document.querySelector('meta[name="description"]');if(md)md.setAttribute('content',`Mix ${s1} and ${s2} emojis online with Emoji Kitchen Pro.`);
    const ot=document.querySelector('meta[property="og:title"]');if(ot)ot.setAttribute('content',`${s1} + ${s2} Emoji Mix | Emoji Kitchen Pro`);
    const od=document.querySelector('meta[property="og:description"]');if(od)od.setAttribute('content',`Mix ${s1} and ${s2} emojis online.`);
  });
}

// ---------- POPSTATE ----------
let pd=null;window.addEventListener('popstate',ev=>{if(pd)clearTimeout(pd);pd=setTimeout(()=>{if(ev.state?.e1&&ev.state?.e2){const f1=emojiList.find(e=>e.code===ev.state.e1),f2=emojiList.find(e=>e.code===ev.state.e2);if(f1)state.mixSel1=f1;if(f2)state.mixSel2=f2;setText('mixSelected1',state.mixSel1.emoji);setText('mixSelected2',state.mixSel2.emoji);renderGrid('mixGrid1',state.mixSel1,sel1);renderGrid('mixGrid2',state.mixSel2,sel2);renderMix();}},100);});

// ---------- RENDER TOKEN ----------
function gRT(){return ++state.renderToken;}function iRV(t){return t===state.renderToken;}
function clrIH(img){if(!img)return;img.onload=null;img.onerror=null;}

// ---------- MIX ----------
async function renderMix(){
  if(state.isRendering)return;state.isRendering=true;const tk=gRT();
  const img=getEl('mixResultImg');if(!img){state.isRendering=false;return;}
  const sp=getEl('mixSpinner'),btns=['mixDownload','mixDownloadCard','mixCopy','mixWhatsapp','mixSave'];
  clrIH(img);img.classList.remove('show');setDisplay('mixError','none');if(sp)sp.classList.add('active');setBtns(btns,true);
  try{
    const u=await fetchWithRetry(()=>fetchEmojiMix(state.mixSel1.code,state.mixSel2.code));
    if(!iRV(tk)){state.isRendering=false;return;}
    img.src=u;
    img.onload=()=>{if(!iRV(tk))return;img.classList.add('show');if(sp)sp.classList.remove('active');setBtns(btns,false);state.currentVoteCombo={c1:state.mixSel1.code,c2:state.mixSel2.code};playSound();updateSEO();state.isRendering=false;};
    img.onerror=()=>{state.isRendering=false;if(!iRV(tk))return;if(sp)sp.classList.remove('active');setDisplay('mixError','block');};
    if(img.complete)img.onload();
  }catch(e){if(!iRV(tk))return;if(sp)sp.classList.remove('active');setDisplay('mixError','block');logger.error('Mix error',e);state.isRendering=false;}
}
function randomMix(){state.mixSel1=emojiList[Math.floor(Math.random()*emojiList.length)];state.mixSel2=emojiList[Math.floor(Math.random()*emojiList.length)];setText('mixSelected1',state.mixSel1.emoji);setText('mixSelected2',state.mixSel2.emoji);renderGrid('mixGrid1',state.mixSel1,sel1);renderGrid('mixGrid2',state.mixSel2,sel2);renderMix();}

// ---------- BATTLE ----------
function genBattle(){const e1=emojiList[Math.floor(Math.random()*emojiList.length)];let e2;do{e2=emojiList[Math.floor(Math.random()*emojiList.length)];}while(e2.code===e1.code);const sp=getEl('battleSpinner'),img=getEl('battleImg'),cap=getEl('battleCaption');clrIH(img);if(sp)sp.classList.add('active');if(img)img.classList.remove('show');fetchEmojiMix(e1.code,e2.code).then(u=>{if(!img?.isConnected)return;img.src=u;img.onload=()=>{if(!img.isConnected)return;img.classList.add('show');if(sp?.isConnected)sp.classList.remove('active');if(cap?.isConnected)cap.textContent=`${e1.emoji} vs ${e2.emoji} – who wins?`;playSound();};img.onerror=()=>{if(sp?.isConnected)sp.classList.remove('active');};}).catch(()=>{setTimeout(()=>genBattle(),500);});}

// ---------- STORY ----------
function initStory(){const s=getEl('storySelector');if(!s)return;const o=emojiList.map(e=>`<option value="${e.code}">${e.emoji}</option>`).join('');s.innerHTML=`<select id="storySel1" aria-label="First emoji">${o}</select><select id="storySel2" aria-label="Second emoji">${o}</select><button class="btn" id="storyAdd">➕ Add</button>`;const ab=getEl('storyAdd');if(ab)ab.onclick=async()=>{if(state.storyPairs.length>=3)return alert('Max 3 panels');const s1=getEl('storySel1'),s2=getEl('storySel2'),c1=s1?.value,c2=s2?.value;if(!c1||!c2)return;try{const u=await fetchWithRetry(()=>fetchEmojiMix(c1,c2));state.storyPairs.push({c1,c2,u});renderStoryStrip();const db=getEl('storyDownload');if(db?.isConnected)db.disabled=false;playSound();}catch(e){alert('Combo not available');}};renderStoryStrip();}
function renderStoryStrip(){const s=getEl('storyStrip');if(!s?.isConnected)return;s.innerHTML=state.storyPairs.map(p=>`<img src="${p.u}" style="max-width:120px;border-radius:12px;" alt="Story panel" loading="lazy">`).join('');}

// ---------- DAILY ----------
function initDaily(){const td=new Date().toDateString(),sd=[...td].reduce((a,b)=>a+b.charCodeAt(0),0),e1=emojiList[sd%emojiList.length],e2=emojiList[(sd*7)%emojiList.length];setText('challengeEmoji1',e1.emoji);setText('challengeEmoji2',e2.emoji);setText('challengeDisplay1',e1.emoji);setText('challengeDisplay2',e2.emoji);const mb=getEl('challengeMixBtn');if(mb)mb.onclick=async()=>{const sp=getEl('challengeSpinner'),img=getEl('challengeImg');clrIH(img);if(sp?.isConnected)sp.classList.add('active');if(img?.isConnected)img.classList.remove('show');try{const u=await fetchWithRetry(()=>fetchEmojiMix(e1.code,e2.code));if(img?.isConnected){img.src=u;img.onload=()=>{if(!img.isConnected)return;img.classList.add('show');if(sp?.isConnected)sp.classList.remove('active');playSound();};img.onerror=()=>{if(sp?.isConnected)sp.classList.remove('active');setDisplay('challengeError','block');};}}catch(e){if(sp?.isConnected)sp.classList.remove('active');setDisplay('challengeError','block');}};const sb=getEl('challengeShare');if(sb)sb.onclick=()=>{window.open('https://twitter.com/intent/tweet?text=My%20%23EmojiKitchenDaily%20entry!','_blank','noopener,noreferrer');};}

// ---------- WALL ----------
let wRT=0;async function loadWall(){const tk=++wRT,w=getEl('wallGrid');if(!w?.isConnected)return;const f=document.createDocumentFragment();for(let i=0;i<8;i++){if(tk!==wRT)return;const e1=emojiList[Math.floor(Math.random()*emojiList.length)],e2=emojiList[Math.floor(Math.random()*emojiList.length)],d=document.createElement('div');d.className='wall-item';const img=document.createElement('img');img.alt=`Emoji mix`;img.loading='lazy';try{const u=await fetchEmojiMix(e1.code,e2.code);if(tk!==wRT)break;img.src=u;}catch(e){continue;}d.appendChild(img);f.appendChild(d);}if(tk===wRT&&w.isConnected){w.innerHTML='';w.appendChild(f);}}

// ---------- GAME ----------
async function newPuzzle(){const e1=emojiList[Math.floor(Math.random()*emojiList.length)],e2=emojiList[Math.floor(Math.random()*emojiList.length)];state.gameAnswer={c1:e1.code,c2:e2.code};try{const u=await fetchWithRetry(()=>fetchEmojiMix(e1.code,e2.code)),bi=getEl('gameBlurImg');if(bi?.isConnected)bi.src=u;const o=emojiList.map(e=>`<option value="${e.code}">${e.emoji}</option>`).join(''),s1=getEl('gameGuess1'),s2=getEl('gameGuess2');if(s1?.isConnected)s1.innerHTML=o;if(s2?.isConnected)s2.innerHTML=o;setText('gameFeedback','');}catch(e){setTimeout(()=>newPuzzle(),300);}}

// ---------- AI MOOD ----------
const MC=Object.freeze([
  {n:"happy",e:["😊","😄","😃","🥳","🎉","⭐","🌈","🤩","😇","💯"],k:new Map([["happy",10],["joy",10],["glad",9],["cheerful",9],["delighted",9],["excited",8],["great",7],["awesome",7],["wonderful",7],["fantastic",7],["smile",8],["laugh",8],["fun",6],["positive",5],["good",4],["nice",3],["blessed",6],["grateful",5]])},
  {n:"sad",e:["😭","😢","😞","😔","😩","😿","💔","🥺"],k:new Map([["sad",10],["cry",10],["crying",10],["unhappy",9],["depressed",9],["upset",8],["sorrow",9],["grief",9],["lonely",8],["heartbreak",9],["pain",6],["hurt",6],["miss",5]])},
  {n:"angry",e:["😡","🤬","😤","💢","👿","😠","💥"],k:new Map([["angry",10],["mad",10],["rage",10],["furious",10],["annoyed",8],["frustrated",8],["hate",9],["irritated",8],["fuming",9]])},
  {n:"funny",e:["😂","🤣","😆","😜","🤪","😹","💀","🤡"],k:new Map([["funny",10],["lol",10],["haha",10],["joke",9],["hilarious",10],["silly",8],["goofy",8],["crazy",6],["wild",5],["meme",8],["rofl",10]])},
  {n:"party",e:["🎉","🥳","🎂","🎈","🎊","🍾","💃","🕺","🎶"],k:new Map([["party",10],["celebrate",10],["birthday",10],["dance",9],["festival",9],["fun",7],["weekend",7],["event",6],["cheers",8]])},
  {n:"scary",e:["😱","👻","💀","🎃","😨","😰"],k:new Map([["scary",10],["fear",10],["horror",10],["spooky",10],["creepy",10],["terrified",10],["ghost",10],["haunted",9],["nightmare",9]])},
  {n:"food",e:["🍕","🍔","🍦","🍩","🌮","🍿","☕","🍪","🎂"],k:new Map([["food",10],["hungry",10],["pizza",10],["burger",10],["eat",9],["tasty",9],["delicious",9],["yummy",9],["meal",8],["snack",8],["ice cream",10],["coffee",9],["cake",9]])},
  {n:"animals",e:["🐶","🐱","🐼","🦊","🐨","🐸","🦁","🐯","🐰"],k:new Map([["animal",10],["dog",10],["cat",10],["pet",9],["puppy",10],["kitten",10],["cute animal",9],["wild",7],["zoo",8],["panda",10],["fox",10]])}
]);

function dtM(p){const ck=p.slice(0,30);if(moodCache.has(ck))return moodCache.get(ck);const pl=p.toLowerCase();let bc=MC[0],bs=0;for(const c of MC){let cs=0;for(const[k,w]of c.k){if(pl.includes(k))cs+=w;}if(cs>bs){bs=cs;bc=c;}}const r=bs>=3?bc:MC[0];moodCache.set(ck,r);return r;}
function gREFC(c){const ec=c.e[Math.floor(Math.random()*c.e.length)];return emojiList.find(e=>e.emoji===ec)||emojiList[0];}
function gSE(fe,p){const pl=p.toLowerCase(),am=[];for(const c of MC){let s=0;for(const[k,w]of c.k){if(pl.includes(k))s+=w;}if(s>=3)am.push({c,s});}am.sort((a,b)=>b.s-a.s);if(am.length>=2&&am[1].c.n!==am[0].c.n){const sc=am[1].c,ec=sc.e[Math.floor(Math.random()*sc.e.length)],fd=emojiList.find(e=>e.emoji===ec);if(fd&&fd.code!==fe.code)return fd;}const fc=am[0]?.c||MC[0],oe=fc.e.filter(e=>e!==fe.emoji);if(oe.length>0){const ec=oe[Math.floor(Math.random()*oe.length)],fd=emojiList.find(e=>e.emoji===ec);if(fd)return fd;}return emojiList.filter(e=>e.code!==fe.code)[Math.floor(Math.random()*(emojiList.length-1))]||emojiList[0];}

// ---------- AI ----------
async function aiGen(){if(state.aiRequestInFlight)return;const p=getEl('aiPrompt')?.value.trim();if(!p)return alert("Please describe a feeling or mood!");state.aiRequestInFlight=true;const sp=getEl('aiSpinner'),img=getEl('aiImg');clrIH(img);if(sp?.isConnected)sp.classList.add('active');if(img?.isConnected)img.classList.remove('show');const ac=new AbortController(),tid=setTimeout(()=>ac.abort(),15000);try{const r=await fetch("/api/ai-generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:p}),signal:ac.signal});clearTimeout(tid);if(!r.ok)throw new Error(`API ${r.status}`);const d=await r.json();if(d.error)throw new Error(d.error);const u=await fetchEmojiMix(d.code1,d.code2);if(img?.isConnected){img.src=u;img.onload=()=>{if(img.isConnected){img.classList.add('show');if(sp?.isConnected)sp.classList.remove('active');playSound();}};img.onerror=()=>{if(sp?.isConnected)sp.classList.remove('active');};}}catch(e){logger.warn("AI failed, fallback");await aiFB(p,sp,img);}finally{clearTimeout(tid);state.aiRequestInFlight=false;}}
async function aiFB(p,sp,img){try{const c=dtM(p),e1=gREFC(c),e2=gSE(e1,p),u=await fetchEmojiMix(e1.code,e2.code);if(img?.isConnected){img.src=u;img.onload=()=>{if(img.isConnected){img.classList.add('show');if(sp?.isConnected)sp.classList.remove('active');playSound();}};img.onerror=()=>{if(sp?.isConnected)sp.classList.remove('active');};}}catch(e){if(sp?.isConnected)sp.classList.remove('active');alert("AI mix failed, try again!");logger.error("AI FB error",e);}}

// ---------- TRENDING ----------
let tRT=0;async function loadTrending(){const tk=++tRT,c=getEl('trendingList');if(!c?.isConnected)return;const f=document.createDocumentFragment();for(const x of trendingCombos){if(tk!==tRT)return;const d=document.createElement('div');d.className='trending-item';try{const u=await fetchEmojiMix(x.code1,x.code2);if(tk!==tRT)break;const img=document.createElement('img');img.src=u;img.alt='Trending';img.loading='lazy';img.style.cssText='width:60px;border-radius:12px;';d.appendChild(img);f.appendChild(d);}catch(e){}}if(tk===tRT&&c.isConnected){c.innerHTML='';c.appendChild(f);}}

// ---------- FAVORITES ----------
let fRT=0;async function renderFavorites(){const tk=++fRT,c=getEl('favoritesList');if(!c?.isConnected)return;const fv=getFavs();if(fv.length===0){if(tk===fRT&&c.isConnected)c.innerHTML='<p style="color:var(--subtext);text-align:center;">No saved combos yet. ❤️</p>';return;}const f=document.createDocumentFragment();for(const x of fv){if(tk!==fRT)return;const d=document.createElement('div');d.className='fav-item';try{const u=await fetchEmojiMix(x.c1,x.c2);if(tk!==fRT)break;const img=document.createElement('img');img.src=u;img.alt='Saved';img.loading='lazy';const del=document.createElement('button');del.textContent='×';del.setAttribute('aria-label','Remove');del.onclick=()=>removeFav(x.c1,x.c2);d.appendChild(img);d.appendChild(del);f.appendChild(d);}catch(e){}}if(tk===fRT&&c.isConnected){c.innerHTML='';c.appendChild(f);}}

// ---------- SHARE ----------
async function shareCard(u,e1,e2){const cv=document.createElement("canvas");cv.width=500;cv.height=500;const cx=cv.getContext("2d");cx.fillStyle="#111";cx.fillRect(0,0,500,500);try{const img=new Image();img.crossOrigin="anonymous";await new Promise((rs,rj)=>{img.onload=rs;img.onerror=rj;img.src=u;});cx.drawImage(img,100,120,300,300);cx.fillStyle="#fff";cx.font="bold 20px Inter,Arial";cx.textAlign="center";cx.fillText("Emoji Kitchen Pro",250,40);cx.font="30px Inter,Arial";cx.fillText(`${e1} + ${e2}`,250,460);cv.toBlob((b)=>{const url=createSafeObjectURL(b),a=document.createElement("a");a.download="emoji-card.png";a.href=url;a.click();setTimeout(()=>revokeObjectURLSafe(url),1000);},'image/png');}catch(e){alert('Card failed. Try again.');}}
function shareSite(){const u=window.location.href;if(navigator.share)navigator.share({title:"Emoji Kitchen Pro",text:"Check this fun emoji mixer!",url:u}).catch(()=>{});else navigator.clipboard.writeText(u).then(()=>alert("Link copied! 🚀")).catch(()=>alert("Could not copy."));}
function scrollToTool(){const t=getEl('tool');if(t)t.scrollIntoView({behavior:'smooth',block:'start'});}
function vote(up){if(state.currentVoteCombo){state.votes+=up?1:-1;setText('voteCount',state.votes);storage.set('votes',state.votes);}}

// ---------- TABS ----------
function setupTabs(){const tc=getEl('tabNav');if(!tc)return;tc.addEventListener('click',(e)=>{const t=e.target.closest('.tab');if(!t)return;document.querySelectorAll('.tab').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-selected','false');});t.classList.add('active');t.setAttribute('aria-selected','true');const m=t.dataset.mode;document.querySelectorAll('.mode-content').forEach(x=>x.classList.remove('active'));const me=getEl(`mode-${m}`);if(me)me.classList.add('active');switch(m){case'battle':genBattle();break;case'wall':loadWall();break;case'challenge':initDaily();break;case'game':newPuzzle();break;case'story':initStory();break;case'trending':loadTrending();break;case'favorites':renderFavorites();break;}});}

// ---------- EVENTS ----------
function setupEvents(){
  document.addEventListener('click',(e)=>{const t=e.target,id=t.id||t.closest('[id]')?.id;if(!id)return;const ids=['scrollToToolBtn','toggleDarkModeBtn','themeToggleFloat','randomMixBtn','mixDownload','mixDownloadCard','mixCopy','mixWhatsapp','mixSave','voteUpBtn','voteDownBtn','battleAgain','battleShare','storyReset','storyDownload','wallRefresh','gameSubmit','gameNew','aiGenerate','clearFavorites','shareToolBtn'];if(ids.includes(id)){e.preventDefault();handleBtn(id);}});
  
  // SEARCH - DIRECT EVENT LISTENERS (FIXED)
  const s1=getEl('mixSearch1');if(s1)s1.addEventListener('input',(e)=>{const q=e.target.value;renderGrid('mixGrid1',state.mixSel1,sel1,q);});
  const s2=getEl('mixSearch2');if(s2)s2.addEventListener('input',(e)=>{const q=e.target.value;renderGrid('mixGrid2',state.mixSel2,sel2,q);});
}

function handleBtn(id){
  switch(id){
    case'scrollToToolBtn':scrollToTool();break;
    case'toggleDarkModeBtn':case'themeToggleFloat':toggleDark();break;
    case'randomMixBtn':randomMix();break;
    case'mixDownload':{const i=getEl('mixResultImg');if(i?.src){const a=document.createElement('a');a.href=i.src;a.download=`emojimix-${state.mixSel1.emoji}-${state.mixSel2.emoji}.png`;a.click();}}break;
    case'mixDownloadCard':{const i=getEl('mixResultImg');if(i?.src)shareCard(i.src,state.mixSel1.emoji,state.mixSel2.emoji);}break;
    case'mixCopy':navigator.clipboard.writeText(window.location.href);break;
    case'mixWhatsapp':window.open(`https://wa.me/?text=Check%20this%20emoji%20mix!%20${encodeURIComponent(window.location.href)}`,'_blank','noopener,noreferrer');break;
    case'mixSave':saveFav(state.mixSel1.code,state.mixSel2.code);break;
    case'voteUpBtn':vote(true);break;case'voteDownBtn':vote(false);break;
    case'battleAgain':genBattle();break;
    case'battleShare':window.open(`https://twitter.com/intent/tweet?text=Emoji%20battle!%20${encodeURIComponent(window.location.href)}`,'_blank','noopener,noreferrer');break;
    case'storyReset':state.storyPairs=[];renderStoryStrip();const sd=getEl('storyDownload');if(sd?.isConnected)sd.disabled=true;break;
    case'storyDownload':alert('Story download coming soon! 🚀');break;
    case'wallRefresh':loadWall();break;
    case'gameSubmit':{const g1=getEl('gameGuess1')?.value,g2=getEl('gameGuess2')?.value;if(g1&&g2&&((g1===state.gameAnswer.c1&&g2===state.gameAnswer.c2)||(g1===state.gameAnswer.c2&&g2===state.gameAnswer.c1))){state.gameScore+=10;setText('gameFeedback','✅ Correct! +10');}else setText('gameFeedback','❌ Try again');setText('gameScore',state.gameScore);playSound();}break;
    case'gameNew':newPuzzle();break;
    case'aiGenerate':aiGen();break;
    case'clearFavorites':storage.remove('emojifavs');renderFavorites();break;
    case'shareToolBtn':shareSite();break;
  }
}

// ---------- PWA ----------
function setupPWA(){if(!("serviceWorker"in navigator))return;window.addEventListener("load",()=>{navigator.serviceWorker.register("/service-worker.js").then(r=>{logger.info("PWA Ready");r.addEventListener('updatefound',()=>{const nw=r.installing;nw?.addEventListener('statechange',()=>{if(nw.state==='installed'&&navigator.serviceWorker.controller)logger.info('New version!');});});}).catch(e=>logger.warn("SW failed",e));});}

// ---------- ACCESSIBILITY ----------
function setupA11y(){const sl=document.createElement('a');sl.href='#tool';sl.style.cssText='position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;';sl.textContent='Skip to main content';document.body.insertBefore(sl,document.body.firstChild);}

// ---------- MEMORY ----------
function setupMem(){window.addEventListener('beforeunload',()=>{cleanupAllObjectURLs();moodCache.clear();emojiCache.forEach(e=>revokeObjectURLSafe(e.u));emojiCache.clear();});}

// ---------- INIT ----------
function init(){
  loadTheme();
  renderGrid('mixGrid1',state.mixSel1,sel1);renderGrid('mixGrid2',state.mixSel2,sel2);
  setText('mixSelected1',state.mixSel1.emoji);setText('mixSelected2',state.mixSel2.emoji);
  renderMix();
  setupTabs();setupEvents();setupPWA();setupA11y();setupMem();
  setText('voteCount',state.votes);
  setTimeout(()=>loadWall(),0);setTimeout(()=>initDaily(),50);
  setTimeout(()=>loadTrending(),100);setTimeout(()=>renderFavorites(),150);
  logger.info('Emoji Kitchen Pro ready');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();