/* yes-script.js — celebration page personalized for Jasleen
   - reads ?name=... (falls back to sessionStorage or DEFAULT)
   - dynamic title/subtext with cute generator
   - confetti launcher + music toggle
*/

const DEFAULT_NAME = 'Jasleen';
let musicPlaying = false;

function queryParam(name) {
  try {
    return new URLSearchParams(window.location.search).get(name) || '';
  } catch {
    return '';
  }
}

const yesTitles = [
  "SHE SAID YES!!! 💖",
  "Best Decision Ever 💘",
  "Valentine Secured 🥰",
  "My Favorite Person Said Yes 😭",
  "Officially the Luckiest Human Alive ✨",
  "Mission Successful 💌"
];

const yesSubtexts = [
  "Let's go make the cutest memories.",
  "Cuddles scheduled: now + forever.",
  "You make my days unbelievably bright.",
  "Tiny victory dance — repeat forever.",
  "Hold my hand? I promise snacks afterward."
];

function generateCuteMessage(name = "") {
  const messages = [
    `I get to love you forever now ${name} 💞`,
    `${name} + Me = Best Love Story Ever 📖✨`,
    `You just unlocked unlimited cuddles, ${name} 🥹`,
    `Forever starts now, ${name} 💍💘`,
    `${name}, you make my world ridiculously better 🌎💕`,
    `I would click yes to you every lifetime, ${name} ♾️`
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

window.addEventListener('load', () => {
  const nameParam = queryParam('name') || sessionStorage.getItem('valentine_name') || DEFAULT_NAME;
  const safeName = decodeURIComponent(nameParam);

  // Title update
  const titleEl = document.querySelector('.yes-title');
  if (titleEl) {
    const randomTitle = yesTitles[Math.floor(Math.random() * yesTitles.length)];
    titleEl.textContent = `${randomTitle}`;
  }

  // Personalized subtext
  const subEl = document.querySelector('.yes-subtext');
  if (subEl) {
    subEl.textContent = generateCuteMessage(safeName);
  }

  // Footer personalization (append signature)
  const footer = document.querySelector('footer');
  if (footer) {
    // avoid repeating signature if present
    if (!/—/.test(footer.textContent)) {
      footer.textContent = (footer.textContent || '').trim() + ` — ${safeName}`;
    }
  }

  // launch confetti (if available)
  launchConfetti();

  // music play attempt
  const music = document.getElementById('bg-music');
  if (music) {
    music.volume = 0.32;
    music.play().then(() => {
      musicPlaying = true;
      updateMusicToggleUI();
    }).catch(() => {
      // play on first interaction if audio blocked
      document.addEventListener('click', function onFirstPlay() {
        music.play().catch(()=>{});
        musicPlaying = true;
        updateMusicToggleUI();
        document.removeEventListener('click', onFirstPlay);
      });
    });
  }
});

/* confetti routine (safe if library missing) */
function launchConfetti() {
  if (typeof confetti !== 'function') return;
  const colors = ['#ff69b4', '#ff1493', '#ff85a2', '#ffb3c1', '#fff', '#ffd700'];
  const totalDuration = 7000;
  const end = Date.now() + totalDuration;

  confetti({
    particleCount: 160,
    spread: 160,
    origin: { x: 0.5, y: 0.15 },
    colors
  });

  const timer = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(timer);
      return;
    }
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 50,
      origin: { x: 0, y: 0.6 },
      colors
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 50,
      origin: { x: 1, y: 0.6 },
      colors
    });
  }, 300);
}

/* music toggle helpers */
function updateMusicToggleUI() {
  const t = document.getElementById('music-toggle');
  if (!t) return;
  t.textContent = musicPlaying ? '🔊' : '🔇';
}
function toggleMusic() {
  const music = document.getElementById('bg-music');
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
