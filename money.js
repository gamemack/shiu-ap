// money.js
const STORAGE_KEY = 'chenshups_data';

// تابع برای بارگذاری دیتا از data.json + ادغام با localStorage
export async function loadGameData() {
  // 1. دریافت دیتای استاتیک از فایل JSON
  const response = await fetch('./data.json');
  const staticData = await response.json();
  
  // 2. دریافت دیتای ذخیره شده در مرورگر
  let savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    savedData = JSON.parse(savedData);
  } else {
    // اگر چیزی ذخیره نشده، همان دیتای اولیه را با ساختار مناسب سیو کن
    savedData = { games: staticData.games.map(g => ({ ...g, views: 0, comments: [] })) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
  }

  // 3. ادغام: برای هر بازی در دیتای استاتیک، اطلاعات به‌روز را از savedData بگیر
  const mergedGames = staticData.games.map(staticGame => {
    const savedGame = savedData.games.find(g => g.id === staticGame.id);
    return savedGame ? { ...staticGame, ...savedGame } : { ...staticGame, views: 0, comments: [] };
  });

  // بازی‌های آپلود شده توسط کاربر را هم اضافه کن (آنهایی که در static نیستند)
  const uploadedGames = savedData.games.filter(g => !staticData.games.some(sg => sg.id === g.id));
  const allGames = [...mergedGames, ...uploadedGames];

  return { games: allGames };
}

// ذخیره کل دیتا در localStorage
function saveToLocal(games) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ games }));
}

// ---- توابع درخواستی شما ----

// 1. افزایش بازدید
export function incrementView(games, gameId) {
  const game = games.find(g => g.id === gameId);
  if (game) {
    game.views = (game.views || 0) + 1;
    saveToLocal(games);
  }
  return games;
}

// 2. افزودن کامنت
export function addComment(games, gameId, username, text) {
  const game = games.find(g => g.id === gameId);
  if (game) {
    if (!game.comments) game.comments = [];
    game.comments.push({ username, text, date: new Date().toLocaleString() });
    saveToLocal(games);
  }
  return games;
}

// 3. ذخیره کردن بازی (لیست علاقه‌مندی‌ها)
export function toggleSaveGame(games, gameId) {
  const game = games.find(g => g.id === gameId);
  if (game) {
    game.isSaved = !game.isSaved; // یک پرچم ساده
    saveToLocal(games);
  }
  return games;
}

// 4. آپلود بازی جدید توسط کاربر
export function uploadNewGame(games, newGame) {
  // تولید ID جدید
  const maxId = games.reduce((max, g) => Math.max(max, g.id), 0);
  newGame.id = maxId + 1;
  newGame.views = 0;
  newGame.comments = [];
  newGame.isSaved = false;
  newGame.uploader = 'user';
  
  games.push(newGame);
  saveToLocal(games);
  return games;
}

// تابع کمکی برای دریافت یک بازی خاص
export function getGameById(games, id) {
  return games.find(g => g.id === id);
}