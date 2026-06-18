// main.js
import { loadGameData, incrementView, addComment, toggleSaveGame, uploadNewGame } from './money.js';

let currentGames = [];
let currentLang = 'zh';
let gameRunning = false;

const gameGrid = document.getElementById('gameGrid');
const commentContainer = document.getElementById('commentContainer');
const commentText = document.getElementById('commentText');
const commentUser = document.getElementById('commentUser');
const uploadForm = document.getElementById('uploadForm');
const gameModal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');

async function init() {
  const data = await loadGameData();
  currentGames = data.games;
  renderGames();
  if (currentGames[0]) renderComments(currentGames[0].id);
}

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
        <button onclick="playGame(${game.id})" style="background:linear-gradient(90deg,#00ff88,#00cc66);font-weight:bold;">
          ▶ بازی کن
        </button>
        <button onclick="saveGame(\( {game.id})"> \){game.isSaved ? '❌ حذف' : '💾 ذخیره'}</button>
        <button onclick="showComments(${game.id})">💬 ${game.comments?.length || 0}</button>
      </div>
    </div>
  `).join('');
}

// توابع جهانی ساده
window.playGame = (id) => {
  const game = currentGames.find(g => g.id === id);
  if (!game) return;
  
  currentGames = incrementView(currentGames, id);
  renderGames();
  
  modalTitle.textContent = game[`name_${currentLang}`] || 'SPACE SHOOTER';
  gameModal.style.display = 'flex';
  startSpaceShooter();
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

// بقیه توابع (رندر کامنت، آپلود، زبان، بازی) مثل پیام قبلی هستن...
// برای کامل بودن، کد کامل بازی رو هم داخل startSpaceShooter نگه دار (از پیام قبل کپی کن)

renderComments, submitComment, uploadForm, switchLang و startSpaceShooter رو از پیام قبلی کپی کن.
