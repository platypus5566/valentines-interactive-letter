# 💌 Valentines Interactive Letter (情人節互動信)

這是一個動態且充滿互動感的情人節告白網頁模板。
設計上注重視覺體驗與驚喜感，包含星空打字機開場、漂浮記憶牆、粒子特效、煙火慶祝，以及專為行動裝置與電腦解析度最佳化的排版。

藉由這個模板，你可以輕鬆替換成自己的文字、照片與音樂，打造一份獨一無二的數位情書獻給特別的她/他。

---

## ✨ 網站特色
- **沉浸式場景切換**：精心設計的 8 個場景，流暢過場不突兀
- **自訂性高**：照片缺失時會自動以美觀的 Emoji 顯示，無需修改程式碼即可預覽
- **立體特效**：Canvas 粒子飄散背景、照片 Hover 動畫、點擊告白成功後的絢麗煙火
- **漂浮記憶牆**：隨機動態漂浮的照片牆，並會定時高亮指定回憶
- **背景音樂支援**：右上方帶有音樂播放/暫停的微互動按鈕
- **RWD 響應式設計**：完美適配手機與電腦螢幕

## 🚀 快速上手 (Quick Start)

### 1. 取得專案
```bash
git clone https://github.com/YourUsername/valentines-interactive-letter.git
cd valentines-interactive-letter
```

### 2. 預覽網頁
取得專案後，直接在資料夾中雙擊打開 `index.html`，即可在瀏覽器中預覽網頁效果。

---

## 🛠️ 如何客製化你的內容？

### 📝 1. 修改主要文案 (`index.html` 與 `script.js`)

**[⚠️ 必須修改] 告白對象名字**：
打開 `index.html`，尋找 `<h1 class="confession-name">`（大約在第 7 幕），並更改裡面的名字。

**[⚠️ 必須修改] 小細節標籤**：
打開 `index.html`，在第 4 幕（ Scene 4 ）中，有列出對方的小細節（如美甲、美睫、瑜伽）。
請搜尋 `<div class="detail-tag">` 來修改成屬於你們的專屬標籤，或不需要的話可以直接刪除整塊卡片 (`<div class="detail-card">`)。

**告白信內容**：
打開 `script.js`，在檔案最上方的設定區修改你的專屬告白內容：
```javascript
// 告白信內容（逐段顯示）
const LOVE_LETTER = [
  "不知道從什麼時候開始，你就成了我每天最期待的事。",
  "每次看到你的訊息，心裡都會偷偷開心好久。",
  // ... 替換成你想說的話
];

// 開場打字機文字
const OPENING_TEXT = "有些話⋯⋯\n我一直想對你說";
```

### 📸 2. 置換照片
照片的資料夾結構位於 `photos/`，你可以將自己的照片依照以下對應位置放入，並且支援 `.jpg`, `.jpeg`, `.png` 等主流格式：

- **`photos/together/`**: 存放合照 (如 `together.jpg`)
- **`photos/cute/`**: 存放對方可愛的照片 (如 `cute1.jpg`, `cute2.jpg`, `cute3.jpg`)
- **`photos/details/`**: 存放對方的特寫或細節 (如 `nails.jpg`, `lashes.jpg`, `yoga.jpg`)
- **`photos/ring.jpg`**: 第七幕（告白場景）的戒指圖
- **`photos/chats/`**: 第五幕（漂浮記憶牆）的聊天截圖或點滴照片，請命名為 `chat1.jpg` ~ `chat35.jpg`。
  *(可以在 `script.js` 改變 `const CHAT_COUNT = 35;` 來設定你有幾張)*

> **💡 小提示**：如果還沒有準備好照片也沒關係！找不到對應照片時，網頁會自動顯示成帶有 Emoji 的精美的預設佔位圖，不會破壞版面。

### 🎵 3. 置換背景音樂
將你的音樂重新命名為 `bgm.mp3`，並放入 `music/` 資料夾取代現有檔案即可。

---

## 📄 授權條款 (License)
本專案採用 [MIT License](LICENSE)，歡迎自由 Fork、修改及分享。祝福你告白成功！💕
