// main.js
import { loadGameData, incrementView, addComment, toggleSaveGame, uploadNewGame } from './money.js';

// State
let currentGames = [];
let currentLang = 'zh';

const gameGrid = document.getElementById('gameGrid');
const commentContainer = document.getElementById('commentContainer');
const commentText = document.getElementById('commentText');
const commentUser = document.getElementById('commentUser');
const uploadForm = document.getElementById('uploadForm');

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
      <h3>\( {game[`name_ \){currentLang}`]}</h3>
      <p>\( {game[`desc_ \){currentLang}`]}</p>
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

  window.playGame = (id) => {
    const game = currentGames.find(g => g.id === id);
    if (game) {
      currentGames = incrementView(currentGames, id); // بازدید رو ثبت کن
      renderGames();
      
      // هدایت به صفحه بازی (Space Shooter)
      window.location.href = `space-shooter.html?id=${id}`;
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
}

// بقیه کد (رندر کامنت، آپلود، تغییر زبان) بدون تغییر بمونه...
// (برای کوتاه شدن کپی نکردم، فقط همون قبلی رو نگه دار)
