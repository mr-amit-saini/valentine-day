const gifStages = [
  "https://media1.tenor.com/m/85g3trJkuosAAAAC/love.gif",                 // 0 normal
  "https://media.tenor.com/cd-Tnw2IxD0AAAAi/hachiware-dance.gif",         // 1 dance
  "https://media.tenor.com/f_rkpJbH1s8AAAAj/somsom1012.gif",              // 2 pleading
  "https://media1.tenor.com/m/uDugCXK4vI4AAAAd/chiikawa-hachiware.gif",   // 3 confused
  "https://media.tenor.com/OGY9zdREsVAAAAAj/somsom1012.gif",              // 4 sad
  "https://media1.tenor.com/m/WGfra-Y_Ke0AAAAd/chiikawa-sad.gif",         // 5 sadder
  "https://media.tenor.com/CivArbX7NzQAAAAj/somsom1012.gif",              // 6 devastated
  "https://media.tenor.com/5_tv1HquZlcAAAAj/chiikawa.gif",                // 7 very devastated
  "https://media1.tenor.com/m/uDugCXK4vI4AAAAC/chiikawa-hachiware.gif"    // 8 crying runaway
];

const noMessages = [
  "No 🙈",
  "Are you suuure? 🥺",
  "Double sure? 🤨",
  "But I made this for you, Jasleen... 💌",
  "Pookie please... 🥹",
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

const yesTeasePokes = [
  "Hmm… that felt too easy 😏",
  "Are you sure you don’t want to tease me first? 👀",
  "You skipped the dramatic tension phase 😭",
  "Wait — build the suspense a little! 🎭",
  "That was suspiciously fast — more romance please 💘"
];

let yesTeasedCount = 0;
let noClickCount = 0;
let runawayEnabled = false;
let musicPlaying = true;

const catGif = document.getElementById('cat-gif');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const music = document.getElementById('bg-music');

// Autoplay: start muted (bypasses browser policy), then unmute if allowed
if (music) {
  music.muted = true;
  music.volume = 0.3;
  music.play().then(() => {
    music.muted = false;
  }).catch(() => {
    // Fallback: unmute on first interaction
    document.addEventListener('click', () => {
      music.muted = false;
      music.play().catch(() => {});
    }, { once: true });
  });
}

function toggleMusic() {
  if (!music) return;

  const toggleEl = document.getElementById('music-toggle');

  if (musicPlaying) {
    music.pause();
    musicPlaying = false;
    if (toggleEl) toggleEl.textContent = '🔇';
  } else {
    music.muted = false;
    music.play().catch(() => {});
    musicPlaying = true;
    if (toggleEl) toggleEl.textContent = '🔊';
  }
}

function handleYesClick() {
  if (!runawayEnabled) {
    // Tease her to try No first
    const msg = yesTeasePokes[Math.min(yesTeasedCount, yesTeasePokes.length - 1)];
    yesTeasedCount++;
    showTeaseMessage(msg);
    return;
  }
  window.location.href = 'yes.html';
}

function showTeaseMessage(msg) {
  const toast = document.getElementById('tease-toast');
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

function handleNoClick() {
  noClickCount++;

  // ✅ FIX: show ALL noMessages starting from index 0
  const msgIndex = Math.min(noClickCount - 1, noMessages.length - 1);
  noBtn.textContent = noMessages[msgIndex];

  // Grow the Yes button bigger each time
  const currentSize = parseFloat(window.getComputedStyle(yesBtn).fontSize);
  yesBtn.style.fontSize = `${currentSize * 1.35}px`;

  const padY = Math.min(18 + noClickCount * 5, 60);
  const padX = Math.min(45 + noClickCount * 10, 120);
  yesBtn.style.padding = `${padY}px ${padX}px`;

  // Shrink No button to contrast
  if (noClickCount >= 2) {
    const noSize = parseFloat(window.getComputedStyle(noBtn).fontSize);
    noBtn.style.fontSize = `${Math.max(noSize * 0.85, 10)}px`;
  }

  // ✅ FIX: show ALL gifStages starting from index 0
  if (catGif) {
    const gifIndex = Math.min(noClickCount - 1, gifStages.length - 1);
    swapGif(gifStages[gifIndex]);
  }

  // Runaway starts at click 8
  if (noClickCount >= 8 && !runawayEnabled) {
    enableRunaway();
    runawayEnabled = true;
  }
}

function swapGif(src) {
  if (!catGif) return;

  catGif.style.opacity = '0';
  setTimeout(() => {
    catGif.src = src;
    catGif.style.opacity = '1';
  }, 200);
}

function enableRunaway() {
  noBtn.addEventListener('mouseover', runAway);
  noBtn.addEventListener('touchstart', runAway, { passive: true });
}

function runAway() {
  const margin = 20;
  const btnW = noBtn.offsetWidth;
  const btnH = noBtn.offsetHeight;

  const maxX = window.innerWidth - btnW - margin;
  const maxY = window.innerHeight - btnH - margin;

  const randomX = Math.random() * Math.max(0, maxX) + margin / 2;
  const randomY = Math.random() * Math.max(0, maxY) + margin / 2;

  noBtn.style.position = 'fixed';
  noBtn.style.left = `${randomX}px`;
  noBtn.style.top = `${randomY}px`;
  noBtn.style.zIndex = '50';
}

// Attach handlers (in case your HTML uses addEventListener instead of inline onclick)
if (yesBtn) yesBtn.addEventListener('click', handleYesClick);
if (noBtn) noBtn.addEventListener('click', handleNoClick);

// If your HTML uses inline onclick="toggleMusic()", expose it:
window.toggleMusic = toggleMusic;
