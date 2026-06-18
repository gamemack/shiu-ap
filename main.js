// main.js
import { loadGameData, incrementView, addComment, toggleSaveGame, uploadNewGame } from './money.js';

// State
let currentGames = [];
let currentLang = 'zh';
let gameRunning = false;

// DOM Elements
const gameGrid = document.getElementById('gameGrid');
const commentContainer = document.getElementById('commentContainer');
const commentText = document.getElementById('commentText');
const commentUser = document.getElementById('commentUser');
const uploadForm = document.getElementById('uploadForm');
const gameModal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');

// ---- بارگذاری اولیه ----
async function init() {
  const data = await loadGameData();
  currentGames = data.games;
  renderGames();
  if (currentGames[0]) renderComments(currentGames[0].id);
}

// ---- رندر لیست بازی‌ها ----
function renderGames() {
  if (!gameGrid) return;
  gameGrid.innerHTML = currentGames.map(game => `
    <div class="game-card" data-id="${game.id}">
      ${game.isSaved ? '<span class="saved-badge">⭐ ذخیره شده</span>' : ''}
      <img src="\( {game.image}" alt=" \){game[`name_${currentLang}`]}" onerror="this.src='https://via.placeholder.com/150/444/FFF?text=Game'">
      <h3>\( {game[`name_ \){currentLang}`] || game.name_en}</h3>
      <p>\( {game[`desc_ \){currentLang}`] || game.desc_en}</p>
      <div class="meta">👁️ ${game.views || 0} بازدید | 👤 ${game.uploader}</div>
      <div class="actions">
        <button onclick="window.playGame(${game.id})" style="background:linear-gradient(90deg,#00ff88,#00cc66); font-weight:bold;">
          ▶ بازی کن
        </button>
        <button onclick="window.saveGame(\( {game.id})"> \){game.isSaved ? '❌ حذف' : '💾 ذخیره'}</button>
        <button onclick="window.showComments(${game.id})">💬 ${game.comments?.length || 0}</button>
      </div>
    </div>
  `).join('');
}

// توابع جهانی
window.playGame = (id) => {
  const game = currentGames.find(g => g.id === id);
  if (game) {
    currentGames = incrementView(currentGames, id);
    renderGames();
    
    modalTitle.textContent = game[`name_${currentLang}`] || 'SPACE SHOOTER';
    gameModal.style.display = 'flex';
    startSpaceShooter();
  }
};

window.saveGame = (id) => {
  currentGames = toggleSaveGame(currentGames, id);
  renderGames();
};

window.showComments = (id) => {
  renderComments(id);
  document.getElementById('commentSection').scrollIntoView({ behavior: 'smooth' });
};

window.closeGame = () => {
  gameModal.style.display = 'none';
  gameRunning = false;
};

// ---- کامنت‌ها ----
function renderComments(gameId) {
  if (!commentContainer) return;
  const game = currentGames.find(g => g.id === gameId);
  if (!game) return;

  commentContainer.innerHTML = (game.comments || []).map(c => `
    <div class="comment-item">
      <strong>\( {c.username}</strong> ( \){c.date})<br>
      ${c.text}
    </div>
  `).join('') || '<p style="color:#888;">هنوز کامنتی ثبت نشده است.</p>';

  commentContainer.dataset.gameId = gameId;
}

document.getElementById('submitComment')?.addEventListener('click', () => {
  const gameId = parseInt(commentContainer.dataset.gameId);
  const username = commentUser.value.trim() || 'کاربر مهمان';
  const text = commentText.value.trim();
  if (!text) return alert('لطفاً متن کامنت را وارد کنید.');
  
  currentGames = addComment(currentGames, gameId, username, text);
  renderComments(gameId);
  commentText.value = '';
  renderGames();
});

// ---- آپلود ----
uploadForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name_zh = document.getElementById('up_name_zh').value;
  const name_fa = document.getElementById('up_name_fa').value;
  const name_en = document.getElementById('up_name_en').value;
  const desc_zh = document.getElementById('up_desc_zh').value;
  const image = document.getElementById('up_image').value || 'https://via.placeholder.com/150/444/FFF?text=New';

  if (!name_zh && !name_fa && !name_en) return alert('حداقل یک نام وارد کنید.');

  const newGame = {
    name_zh: name_zh || name_en,
    name_fa: name_fa || name_en,
    name_en: name_en || name_zh,
    desc_zh: desc_zh || 'بازی جدید',
    desc_fa: desc_zh || 'بازی جدید',
    desc_en: desc_zh || 'New Game',
    image,
    uploader: 'کاربر'
  };
  currentGames = uploadNewGame(currentGames, newGame);
  renderGames();
  uploadForm.reset();
  alert('بازی با موفقیت آپلود شد!');
});

// ---- تغییر زبان ----
window.switchLang = (lang) => {
  currentLang = lang;
  document.body.className = `lang-${lang}`;
  document.documentElement.lang = lang === 'fa' ? 'fa' : (lang === 'en' ? 'en' : 'zh');
  
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  renderGames();
};

// ======================= SPACE SHOOTER GAME =======================
function startSpaceShooter() {
  if (gameRunning) return;
  gameRunning = true;

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score') || { textContent: '' }; // اگر score المنت داشتی

  let player = { x: 220, y: 550, width: 40, height: 40, speed: 10 };
  let bullets = [];
  let enemies = [];
  let particles = [];
  let score = 0;
  let keys = {};
  let targetX = player.x;

  // کنترل‌ها
  document.addEventListener('keydown', e => keys[e.key] = true);
  document.addEventListener('keyup', e => keys[e.key] = false);

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    targetX = e.clientX - rect.left - player.width / 2;
    shoot();
  });

  function shoot() {
    bullets.push({ 
      x: player.x + player.width/2 - 3, 
      y: player.y - 5, 
      width: 6, 
      height: 18, 
      speed: 14 
    });
  }

  setInterval(() => {
    if (gameRunning) {
      enemies.push({
        x: Math.random() * (canvas.width - 45),
        y: -40,
        width: 35,
        height: 35,
        speed: 3.5 + Math.random() * 2
      });
    }
  }, 650);

  function createExplosion(x, y) {
    for (let i = 0; i < 18; i++) {
      particles.push({
        x, y,
        vx: Math.random() * 9 - 4.5,
        vy: Math.random() * 9 - 4.5,
        life: 28,
        color: Math.random() > 0.5 ? '#ff0' : '#f80'
      });
    }
  }

  function update() {
    if (!gameRunning) return;

    if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) player.x += player.speed;

    if (Math.abs(player.x - targetX) > 5) {
      player.x += (targetX - player.x) * 0.28;
    }

    player.x = Math.max(10, Math.min(canvas.width - player.width - 10, player.x));

    // bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].y -= bullets[i].speed;
      if (bullets[i].y < -20) bullets.splice(i, 1);
    }

    // enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
      enemies[i].y += enemies[i].speed;

      // player collision
      if (
        player.x < enemies[i].x + enemies[i].width &&
        player.x + player.width > enemies[i].x &&
        player.y < enemies[i].y + enemies[i].height &&
        player.y + player.height > enemies[i].y
      ) {
        gameRunning = false;
        createExplosion(player.x + 20, player.y + 20);
        setTimeout(() => alert(`Game Over! امتیاز: ${score}`), 100);
        return;
      }

      // bullet collision
      for (let j = bullets.length - 1; j >= 0; j--) {
        if (
          bullets[j].x < enemies[i].x + enemies[i].width - 5 &&
          bullets[j].x + bullets[j].width > enemies[i].x + 5 &&
          bullets[j].y < enemies[i].y + enemies[i].height &&
          bullets[j].y + bullets[j].height > enemies[i].y
        ) {
          createExplosion(enemies[i].x + 17, enemies[i].y + 17);
          enemies.splice(i, 1);
          bullets.splice(j, 1);
          score += 15;
          break;
        }
      }

      if (enemies[i] && enemies[i].y > canvas.height) enemies.splice(i, 1);
    }

    // particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].x += particles[i].vx;
      particles[i].y += particles[i].vy;
      particles[i].life--;
      if (particles[i].life <= 0) particles.splice(i, 1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0a0011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 70; i++) {
      let x = (Date.now() * 0.01 + i * 40) % canvas.width;
      let y = (i * 31) % canvas.height;
      ctx.fillRect(x, y, 1.8, 1.8);
    }

    // player
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(player.x + 12, player.y, 16, 32);
    ctx.fillStyle = '#ff00aa';
    ctx.fillRect(player.x, player.y + 25, player.width, 14);

    // bullets
    ctx.fillStyle = '#ffff00';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    // enemies
    ctx.fillStyle = '#ff0044';
    enemies.forEach(e => {
      ctx.fillRect(e.x, e.y, e.width, e.height);
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(e.x + 8, e.y + 10, 20, 12);
      ctx.fillStyle = '#ff0044';
    });

    // particles
    particles.forEach(p => {
      ctx.globalAlpha = p.life / 28;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 7, 7);
    });
    ctx.globalAlpha = 1;
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  loop();
}

// راه‌اندازی
init();
