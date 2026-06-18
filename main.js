// main.js
import { loadGameData, incrementView, addComment, toggleSaveGame, uploadNewGame } from './money.js';

// State
let currentGames = [];
let currentLang = 'zh'; // پیش‌فرض چینی
const langMap = { zh: 'chinese', fa: 'persian', en: 'english' };

// عناصر DOM
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
  renderComments(currentGames[0]?.id); // پیش‌فرض اولین بازی
}

// ---- رندر لیست بازی‌ها ----
function renderGames() {
  if (!gameGrid) return;
  gameGrid.innerHTML = currentGames.map(game => `
    <div class="game-card" data-id="${game.id}">
      ${game.isSaved ? '<span class="saved-badge">⭐ ذخیره شده</span>' : ''}
      <img src="${game.image}" alt="${game[`name_${currentLang}`]}" onerror="this.src='https://via.placeholder.com/150/444/FFF?text=Game'">
      <h3>${game[`name_${currentLang}`]}</h3>
      <p>${game[`desc_${currentLang}`]}</p>
      <div class="meta">👁️ ${game.views || 0} | 👤 ${game.uploader}</div>
      <div class="actions">
        <button onclick="window.viewGame(${game.id})">▶ بازی</button>
        <button onclick="window.saveGame(${game.id})">${game.isSaved ? '❌ حذف' : '💾 ذخیره'}</button>
        <button onclick="window.showComments(${game.id})">💬 ${game.comments?.length || 0}</button>
      </div>
    </div>
  `).join('');

  // اتصال توابع به Window تا در onclick کار کنند
  window.viewGame = (id) => {
    currentGames = incrementView(currentGames, id);
    renderGames();
    alert('بازدید ثبت شد! (برای بازی چینی)');
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

// ---- رندر کامنت‌ها ----
function renderComments(gameId) {
  if (!commentContainer) return;
  const game = currentGames.find(g => g.id === gameId);
  if (!game) return;

  commentContainer.innerHTML = (game.comments || []).map(c => `
    <div class="comment-item">
      <strong>${c.username}</strong> (${c.date})<br>
      ${c.text}
    </div>
  `).join('') || '<p style="color:#888;">هنوز کامنتی ثبت نشده است.</p>';

  // ذخیره gameId جاری برای ارسال کامنت
  commentContainer.dataset.gameId = gameId;
}

// ---- ارسال کامنت جدید ----
document.getElementById('submitComment')?.addEventListener('click', () => {
  const gameId = parseInt(commentContainer.dataset.gameId);
  const username = commentUser.value.trim() || 'کاربر مهمان';
  const text = commentText.value.trim();
  if (!text) return alert('لطفاً متن کامنت را وارد کنید.');
  
  currentGames = addComment(currentGames, gameId, username, text);
  renderComments(gameId);
  commentText.value = '';
  renderGames(); // برای به‌روزرسانی تعداد کامنت‌ها
});

// ---- آپلود بازی جدید ----
uploadForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name_zh = document.getElementById('up_name_zh').value;
  const name_fa = document.getElementById('up_name_fa').value;
  const name_en = document.getElementById('up_name_en').value;
  const desc_zh = document.getElementById('up_desc_zh').value;
  const image = document.getElementById('up_image').value || 'https://via.placeholder.com/150/444/FFF?text=New';

  if (!name_zh) return alert('حداقل نام چینی را وارد کنید.');

  const newGame = {
    name_zh, name_fa, name_en,
    desc_zh, desc_fa: desc_zh, desc_en: desc_zh,
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
  // به‌روزرسانی دکمه‌های فعال
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  renderGames();
  // دوباره کامنت‌ها را با بازی انتخاب‌شده رندر کن
  const firstGame = currentGames[0];
  if (firstGame) renderComments(firstGame.id);
};

// راه‌اندازی
init();