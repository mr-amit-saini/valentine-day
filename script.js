/* script.js — personalized for Jasleen
   - updated cute messages / easter eggs
   - accessibility, runaway logic, music toggle, personalization
   - redirects to yes.html?name=Jasleen unless overwritten by user prompt
*/

const DEFAULT_NAME = 'Jasleen';

/* ---------- message pools (personalized + unique) ---------- */
// No-button messages (escalating but playful + personal)
const noMessages = [
  "No 🙈",
  "Are you suuure? 🥺",
  "Double sure? 🤨",
  "Pookie please... 🥹",
  "But I made this for you, Jasleen... 💌",
  "That tugged at my imaginary heartstrings 😭",
  "My heart did a little sad boop 💔",
  "The cat is judging you now (and so am I) 🐱",
  "I already told the moon you're maybe saying no 🌙",
  "I planned our tiny candlelit picnic in my head 🕯️✨",
  "This is not very Valentine-y of you 😤",
  "You’re breaking the Valentine algorithm 🤖💘",
  "Okay but like… what if you said yes? 👀",
  "The 'No' button is starting to feel guilty 😬",
  "Last chance before I deploy maximum cuteness 😳",
  "I am dramatically collapsing (on the couch) 😵",
  "Fine… but I’ll keep asking until you laugh 💞"
];

// Yes-button first-click pokes (teasing before acceptance)
const yesTeasePokes = [
  "Hmm… that felt too easy 😏",
  "Are you sure you don’t want to tease me first? 👀",
  "You skipped the dramatic tension phase 😭",
  "Wait — build the suspense a little! 🎭",
  "That was suspiciously fast — more romance please 💘"
];

// Extra cute encouragements shown after a No click (randomized)
const cuteEncouragements = [
  "I still adore you though 💕",
  "You’re my favorite human anyway, Jasleen 🥰",
  "Even your no’s are cute (true story) 😤",
  "You look extra adorable right now 😳",
  "Plot twist: I love you more now 💘",
  "The universe says try again (it oligates romance) 🌙✨",
  "That 'No' didn’t convince me — yet 😌",
  "If sweetness were a sport, you'd win gold 🥇"
];

/* --- yes page titles / fallback messages (a few used locally here for toast) --- */
const quickLoveLines = [
  "You + Me = Forever",
  "My favorite yes is yours",
  "Heart stolen. Case closed. 💘",
  "Mission: Love — Completed",
  "Jasleen, you make everything brighter ✨"
];

/* ---------- visual / state variables ---------- */
let yesTeasedCount = 0;
let noClickCount = 0;
let runawayStage = 0; // 0 none, 1 shy, 2 runaway
let teasingEnabled = true;
let musicPlaying = false;

/* ---------- DOM refs ---------- */
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const catGif = document.getElementById('cat-gif'); // optional image element
const toast = document.getElementById('tease-toast');
const music = document.getElementById('bg-music');

/* ---------- small click sound (optional) ---------- */
// If you have a small mp3/ogg hosted, replace this with a URL for a better sound.
// For now we try a short beep via WebAudio fallback for cross-browser safety.
function playTinyBlip() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    g.gain.value = 0.02;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(()=>{ o.stop(); ctx.close().catch(()=>{}); }, 80);
  } catch {}
}

/* ---------- MUSIC: attempt autoplay/unmute behavior ---------- */
if (music) {
  music.volume = 0.28;
  // try autoplay muted then unmute on first user gesture
  music.muted = true;
  music.play().then(() => {
    music.muted = false;
    musicPlaying = true;
    updateMusicToggleUI();
  }).catch(()=> {
    // will set up on-first-interaction below
  });
  document.addEventListener('click', function unlockMusicOnce() {
    if (!musicPlaying) {
      music.muted = false;
      music.play().catch(()=>{});
      musicPlaying = true;
      updateMusicToggleUI();
    }
    document.removeEventListener('click', unlockMusicOnce);
  }, { once: true });
}

/* ---------- helpers ---------- */
function updateMusicToggleUI() {
  const t = document.getElementById('music-toggle');
  if (!t) return;
  t.textContent = musicPlaying ? '🔊' : '🔇';
}
function toggleMusic() {
  if (!music) return;
  if (musicPlaying) {
    music.pause();
    musicPlaying = false;
  } else {
    music.play().catch(()=>{});
    musicPlaying = true;
  }
  updateMusicToggleUI();
}
window.toggleMusic = toggleMusic;

/* Accessible toast */
function showTeaseMessage(msg, timeout = 2600) {
  if (!toast) {
    // fallback: alert (very last resort)
    console.log('TEASE:', msg);
    return;
  }
  toast.textContent = msg;
  toast.setAttribute('role', 'status');
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
    toast.removeAttribute('role');
  }, timeout);
}

/* keyboard support for buttons (Enter / Space triggers) */
function keyButtonHandler(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    e.target.click();
  }
}
if (yesBtn) {
  yesBtn.setAttribute('tabindex','0');
  yesBtn.addEventListener('keydown', keyButtonHandler);
}
if (noBtn) {
  noBtn.setAttribute('tabindex','0');
  noBtn.addEventListener('keydown', keyButtonHandler);
}

/* small personalization getter: prefer stored name or default to Jasleen */
function getPreferredName() {
  try {
    const stored = sessionStorage.getItem('valentine_name');
    if (stored) return stored;
  } catch {}
  return DEFAULT_NAME;
}

/* Yes button behavior */
function handleYesClick(e) {
  e && e.preventDefault && e.preventDefault();
  playTinyBlip();
  // if teasing disabled — go straight to yes
  if (!teasingEnabled) { finalizeYes(); return; }

  // first click: tease, second click: accept
  if (yesTeasedCount < 1) {
    const poke = yesTeasePokes[Math.floor(Math.random() * yesTeasePokes.length)];
    showTeaseMessage(poke);
    yesTeasedCount++;
    // little scale jiggle
    yesBtn.animate([{ transform: 'scale(1)' },{ transform: 'scale(1.08)' },{ transform: 'scale(1)' }], { duration: 420 });
    return;
  }
  // accepted
  finalizeYes();
}

function finalizeYes() {
  // brief celebration then navigate
  const name = encodeURIComponent(getPreferredName());
  // small confetti if canvas-confetti loaded
  try {
    if (typeof confetti === 'function') {
      confetti({ particleCount: 90, spread: 110, origin: { x:0.5, y:0.2 } });
    }
  } catch {}
  if (music) { music.muted = false; music.play().catch(()=>{}); }
  setTimeout(() => {
    const url = name ? `yes.html?name=${name}` : 'yes.html';
    window.location.href = url;
  }, 520);
}

/* No button behavior */
function handleNoClick(e) {
  e && e.preventDefault && e.preventDefault();
  noClickCount++;
  playTinyBlip();

  if (!teasingEnabled) {
    showTeaseMessage("It's okay — I still love you 💗");
    return;
  }

  // rotate through the noMessages
  const idx = Math.min(noClickCount, noMessages.length) - 1;
  noBtn.textContent = noMessages[Math.min(idx, noMessages.length - 1)];

  // scale the Yes button to make it extra tempting (clamped)
  const scale = Math.min(1 + noClickCount * 0.16, 4.0);
  yesBtn.style.transform = `scale(${scale})`;

  // if there's an image, cycle playful GIFs / lines (lightweight)
  if (catGif) {
    const fallback = quickLoveLines[Math.floor(Math.random() * quickLoveLines.length)];
    catGif.alt = fallback;
  }

  // escalate runaway behaviour
  if (noClickCount >= 3 && runawayStage < 1) runawayStage = 1;
  if (noClickCount >= 7 && runawayStage < 2) runawayStage = 2;
  if (runawayStage >= 1) enableRunaway();

  // show a randomized encouraging/cute message
  const encouragement = cuteEncouragements[Math.floor(Math.random() * cuteEncouragements.length)];
  showTeaseMessage(encouragement, 2400);

  // easter eggs at milestones
  if (noClickCount === 10) {
    showTeaseMessage("Okay wow you're committed to this bit 😂", 3200);
  }
  if (noClickCount === 15) {
    showTeaseMessage("Fine… I’ll marry you instead 💍", 3200);
  }
}

/* RUNAWAY mechanics: move the No button to a random, on-screen safe location */
function enableRunaway() {
  noBtn.style.transition = 'left 280ms ease, top 280ms ease';
  noBtn.addEventListener('mouseenter', maybeRunAway);
  noBtn.addEventListener('touchstart', maybeRunAway, { passive: true });
}
function maybeRunAway() {
  if (!teasingEnabled) return;
  const margin = 10;
  const btnW = noBtn.offsetWidth;
  const btnH = noBtn.offsetHeight;
  const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  const maxX = Math.max(margin, vw - btnW - margin);
  const maxY = Math.max(margin, vh - btnH - margin);

  // randomness stronger at higher stage
  const factor = runawayStage === 1 ? 0.28 : 0.62;
  const randX = Math.floor(Math.random() * maxX);
  const randY = Math.floor(Math.random() * maxY);

  noBtn.style.position = 'fixed';
  noBtn.style.left = `${Math.max(margin, Math.min(randX, maxX))}px`;
  noBtn.style.top = `${Math.max(margin, Math.min(randY, maxY))}px`;
  noBtn.style.zIndex = '60';

  // small vibration for mobile on full runaway
  if (navigator.vibrate && runawayStage >= 2) navigator.vibrate(30);
}

/* ensure button isn't offscreen on resize */
window.addEventListener('resize', () => {
  const rect = noBtn.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = 8;
  let left = parseFloat(noBtn.style.left) || rect.left;
  let top = parseFloat(noBtn.style.top) || rect.top;
  let changed = false;
  if (rect.right > vw) { left = Math.max(margin, vw - rect.width - margin); changed = true; }
  if (rect.bottom > vh) { top = Math.max(margin, vh - rect.height - margin); changed = true; }
  if (rect.left < 0) { left = margin; changed = true; }
  if (rect.top < 0) { top = margin; changed = true; }
  if (changed) {
    noBtn.style.left = `${left}px`;
    noBtn.style.top = `${top}px`;
  }
});

/* small UI: playful toggle (create if not present) */
(function ensurePlayfulToggle() {
  if (document.getElementById('tease-toggle')) return;
  const toggle = document.createElement('button');
  toggle.id = 'tease-toggle';
  toggle.title = 'Toggle playful mode';
  toggle.innerText = '🙂 Playful';
  Object.assign(toggle.style, {
    position: 'fixed',
    left: '16px',
    bottom: '18px',
    zIndex: 150,
    padding: '8px 12px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700
  });
  document.body.appendChild(toggle);
  toggle.addEventListener('click', () => {
    teasingEnabled = !teasingEnabled;
    toggle.innerText = teasingEnabled ? '🙂 Playful' : '🤝 Nice';
    if (!teasingEnabled) {
      noBtn.style.position = '';
      noBtn.style.left = '';
      noBtn.style.top = '';
      noBtn.style.transform = '';
    }
  });
})();

/* attach click handlers (guard if elements missing) */
if (yesBtn) yesBtn.addEventListener('click', handleYesClick);
if (noBtn) noBtn.addEventListener('click', handleNoClick);

/* also allow Enter key on focused buttons to trigger (extra safety) */
if (yesBtn) yesBtn.addEventListener('keyup', (e) => { if (e.key === 'Enter') handleYesClick(); });
if (noBtn) noBtn.addEventListener('keyup', (e) => { if (e.key === 'Enter') handleNoClick(); });

/* friendly hint: prompt once to let you set a different signer name (optional) */
(function maybeAskForSigner() {
  try {
    if (!sessionStorage.getItem('valentine_name')) {
      // ask once after small delay so it doesn't pop immediately
      setTimeout(() => {
        const name = prompt("Would you like to sign the card with a different name? (Leave blank to use Jasleen)", "");
        if (name && name.trim()) sessionStorage.setItem('valentine_name', name.trim());
      }, 1200);
    }
  } catch {}
})();
