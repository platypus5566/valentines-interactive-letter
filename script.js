/* ========================================
   情人節告白互動網頁 - 主要腳本
   ======================================== */

// ========== 設定區 (已移至 config.js) ==========

// ========== 全域狀態 ==========

let currentScene = 1;
const totalScenes = 8;
let isTransitioning = false;
let particlesCtx, particlesCanvas;
let fireworksCtx, fireworksCanvas;
let particles = [];
let fireworks = [];
let musicPlaying = false;
let memoryHighlightTimer = null;

// ========== 初始化 ==========

document.addEventListener('DOMContentLoaded', () => {
  initConfig();
  initParticles();
  initPhotoLoader();
  initMemoryWall();
  initSceneNavigation();
  initMusicControl();
  initTypewriter();
  initConfessionButtons();
});

function initConfig() {
  document.title = CONFIG.pageTitle || "給你的一封信 💌";
  const nameEl = document.getElementById('confession-name');
  if (nameEl) nameEl.textContent = CONFIG.personName || "王小美";

  const firstMeetEl = document.getElementById('first-meet-photo');
  if (firstMeetEl && CONFIG.photos.firstMeet) firstMeetEl.dataset.src = "photos/together/" + CONFIG.photos.firstMeet;

  const ringEl = document.getElementById('ring-photo');
  if (ringEl && CONFIG.photos.ring) ringEl.dataset.src = "photos/" + CONFIG.photos.ring;

  const finalEl = document.getElementById('final-photo');
  if (finalEl && CONFIG.photos.finalPhoto) finalEl.dataset.src = "photos/together/" + CONFIG.photos.finalPhoto;

  const cuteCards = document.getElementById('cute-cards');
  if (cuteCards && CONFIG.photos.cute) {
    cuteCards.innerHTML = '';
    CONFIG.photos.cute.forEach((photo, idx) => {
      cuteCards.innerHTML += `
        <div class="cute-card">
          <div class="photo-placeholder" data-src="photos/cute/${photo}">
            <span>🥰</span><small>可愛照 ${idx + 1}</small>
          </div>
          <div class="card-caption">好可愛 💕</div>
        </div>
      `;
    });
  }

  const detailCards = document.getElementById('detail-cards');
  if (detailCards && CONFIG.photos.details) {
    detailCards.innerHTML = '';
    CONFIG.photos.details.forEach((detail, idx) => {
      detailCards.innerHTML += `
        <div class="detail-card">
          <div class="detail-tag">${detail.tag}</div>
          <div class="photo-placeholder" data-src="photos/details/${detail.image}">
            <span>📸</span><small>特寫 ${idx + 1}</small>
          </div>
        </div>
      `;
    });
  }
}

// ========== 粒子系統 ==========

function initParticles() {
  particlesCanvas = document.getElementById('particles-canvas');
  particlesCtx = particlesCanvas.getContext('2d');

  resizeCanvas(particlesCanvas);
  window.addEventListener('resize', () => resizeCanvas(particlesCanvas));

  // 建立粒子
  for (let i = 0; i < 80; i++) {
    particles.push(createParticle());
  }

  animateParticles();
}

function resizeCanvas(canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticle() {
  // 隨機決定是星星還是愛心
  const isHeart = Math.random() < 0.3;
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 3 + 1,
    speedX: (Math.random() - 0.5) * 0.3,
    speedY: (Math.random() - 0.5) * 0.3,
    opacity: Math.random() * 0.5 + 0.1,
    opacityDir: Math.random() < 0.5 ? 1 : -1,
    isHeart,
    color: isHeart
      ? `hsla(${340 + Math.random() * 20}, 80%, 70%, `
      : `hsla(${240 + Math.random() * 60}, 60%, 80%, `
  };
}

function drawHeart(ctx, x, y, size) {
  const s = size * 2;
  ctx.beginPath();
  ctx.moveTo(x, y + s / 4);
  ctx.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + s / 4);
  ctx.bezierCurveTo(x - s / 2, y + s / 2, x, y + s * 0.7, x, y + s * 0.85);
  ctx.bezierCurveTo(x, y + s * 0.7, x + s / 2, y + s / 2, x + s / 2, y + s / 4);
  ctx.bezierCurveTo(x + s / 2, y, x, y, x, y + s / 4);
  ctx.fill();
}

function animateParticles() {
  particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

  particles.forEach(p => {
    // 更新位置
    p.x += p.speedX;
    p.y += p.speedY;

    // 閃爍效果
    p.opacity += p.opacityDir * 0.003;
    if (p.opacity > 0.6) p.opacityDir = -1;
    if (p.opacity < 0.1) p.opacityDir = 1;

    // 邊界回彈
    if (p.x < 0 || p.x > particlesCanvas.width) p.speedX *= -1;
    if (p.y < 0 || p.y > particlesCanvas.height) p.speedY *= -1;

    // 繪製
    particlesCtx.fillStyle = p.color + p.opacity + ')';
    if (p.isHeart) {
      drawHeart(particlesCtx, p.x, p.y, p.size);
    } else {
      particlesCtx.beginPath();
      particlesCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      particlesCtx.fill();
    }
  });

  requestAnimationFrame(animateParticles);
}

// ========== 照片載入系統 ==========

function initPhotoLoader() {
  // 嘗試載入所有照片佔位符
  document.querySelectorAll('.photo-placeholder').forEach(placeholder => {
    const src = placeholder.dataset.src;
    if (!src) return;
    tryLoadImage(placeholder, src);
  });
}

// 嘗試多種副檔名載入圖片（支援 .jpg / .png / .jpeg / .JPG / .PNG）
function tryLoadImage(placeholder, baseSrc) {
  // 如果已經有副檔名，先試原始路徑
  const extensions = ['.jpg', '.png', '.jpeg', '.JPG', '.PNG', '.JPEG'];
  const dotIndex = baseSrc.lastIndexOf('.');
  const basePath = dotIndex !== -1 ? baseSrc.substring(0, dotIndex) : baseSrc;

  // 建立嘗試清單：原始路徑優先，再嘗試其他副檔名
  const candidates = [baseSrc];
  extensions.forEach(ext => {
    const candidate = basePath + ext;
    if (candidate !== baseSrc) candidates.push(candidate);
  });

  let i = 0;
  function tryNext() {
    if (i >= candidates.length) return; // 全部失敗，保留佔位
    const img = new Image();
    img.onload = () => {
      placeholder.innerHTML = '';
      placeholder.appendChild(img);
      placeholder.classList.add('has-image');
    };
    img.onerror = () => {
      i++;
      tryNext();
    };
    img.src = candidates[i];
    img.alt = '照片';
  }
  tryNext();
}

// ========== 場景導航 ==========

function initSceneNavigation() {
  // 按鈕點擊切換場景
  document.querySelectorAll('.scene-next-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToNextScene();
    });
  });

  // 支援鍵盤操作
  document.addEventListener('keydown', (e) => {
    // 如果 lightbox 開著，按 Esc 關閉
    if (e.key === 'Escape') {
      closeLightbox();
      return;
    }
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (currentScene < 7) { // 排除告白場景的鍵盤跳轉
        goToNextScene();
      }
    }
    if (e.key === 'ArrowLeft' && currentScene > 1) {
      goToPrevScene();
    }
  });

  // 初始化 Lightbox
  initLightbox();
}

// ========== Lightbox 大圖檢視 ==========

function initLightbox() {
  const overlay = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');

  // 點擊有圖片的 placeholder 開啟 lightbox
  document.addEventListener('click', (e) => {
    const placeholder = e.target.closest('.photo-placeholder.has-image');
    if (!placeholder) return;

    const img = placeholder.querySelector('img');
    if (!img) return;

    e.stopPropagation();
    lightboxImg.src = img.src;
    overlay.classList.add('active');
  });

  // 關閉 lightbox
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === lightboxImg) {
      closeLightbox();
    }
  });
}

function closeLightbox() {
  const overlay = document.getElementById('lightbox');
  overlay.classList.remove('active');
}

function goToNextScene() {
  if (isTransitioning || currentScene >= totalScenes) return;
  switchScene(currentScene + 1);
}

function goToPrevScene() {
  if (isTransitioning || currentScene <= 1) return;
  switchScene(currentScene - 1);
}

function switchScene(targetScene) {
  if (isTransitioning || targetScene === currentScene) return;
  isTransitioning = true;

  const prevSceneEl = document.getElementById(`scene-${currentScene}`);
  const nextSceneEl = document.getElementById(`scene-${targetScene}`);

  if (!nextSceneEl) {
    isTransitioning = false;
    return;
  }

  prevSceneEl.classList.remove('active');

  setTimeout(() => {
    nextSceneEl.classList.add('active');
    currentScene = targetScene;

    // 場景特殊初始化
    if (targetScene === 5) {
      startMemoryHighlight();
    } else {
      stopMemoryHighlight();
    }
    if (targetScene === 6) {
      startLetterAnimation();
    }
    if (targetScene === 8) {
      startFireworks();
    }

    setTimeout(() => {
      isTransitioning = false;
    }, 800);
  }, 600);
}

// ========== 打字機效果 ==========

function initTypewriter() {
  const textEl = document.getElementById('opening-text');
  const hint = document.getElementById('hint-1');
  const chars = (CONFIG.openingText || "有些話⋯⋯\n我一直想對你說").split('');
  let index = 0;
  hint.style.opacity = '0';

  function typeChar() {
    if (index < chars.length) {
      const char = chars[index];
      if (char === '\n') {
        textEl.innerHTML += '<br>';
      } else {
        textEl.innerHTML += `<span style="animation: fadeInChar 0.5s ease forwards">${char}</span>`;
      }
      index++;
      const delay = char === '⋯' ? 400 : char === '\n' ? 600 : 120;
      setTimeout(typeChar, delay);
    } else {
      // 打完字後加上游標
      textEl.innerHTML += '<span class="cursor"></span>';
      // 顯示繼續提示
      setTimeout(() => {
        hint.style.opacity = '1';
        hint.style.transition = 'opacity 1s ease';
      }, 800);
    }
  }

  // 延遲開始打字
  setTimeout(typeChar, 1000);
}

// 字元淡入 CSS（動態注入）
const fadeInCharStyle = document.createElement('style');
fadeInCharStyle.textContent = `
  @keyframes fadeInChar {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(fadeInCharStyle);

// ========== 漂浮記憶牆 ==========

function initMemoryWall() {
  const wall = document.getElementById('memory-wall');
  if (!wall) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // 根據螢幕大小決定卡片尺寸
  const isMobile = vw < 600;
  const baseW = isMobile ? 110 : 170;
  const variance = isMobile ? 20 : 30;

  // 建立網格分佈，避免重疊太多
  // 將畫面分成 6 列 x 6 行的網格
  const cols = 6;
  const rows = 6;
  const cellW = vw / cols;
  const cellH = vh / rows;

  const memPhotos = CONFIG.photos.memoryWall || [];
  const memoryCount = memPhotos.length > 0 ? Math.max(36, memPhotos.length) : 36;

  for (let i = 0; i < memoryCount; i++) {
    const card = document.createElement('div');
    card.className = 'memory-card';

    // 在網格內隨機偏移
    const gridCol = i % cols;
    const gridRow = Math.floor(i / cols) % rows;
    const x = gridCol * cellW + Math.random() * (cellW - baseW);
    const y = gridRow * cellH + Math.random() * (cellH - baseW * 1.3);

    // 隨機旋轉角度 (-15° ~ 15°)
    const rot = (Math.random() - 0.5) * 30;

    // 隨機尺寸
    const w = baseW + Math.random() * variance;

    // 隨機漂浮參數
    const floatDuration = 5 + Math.random() * 5;
    const floatDelay = Math.random() * -10;
    const dx = (Math.random() - 0.5) * 14;
    const dy = (Math.random() - 0.5) * 14;
    const dx2 = (Math.random() - 0.5) * 10;
    const dy2 = (Math.random() - 0.5) * 10;
    const cardOpacity = 0.55 + Math.random() * 0.3;

    // 設定 CSS 變數
    card.style.cssText = `
      left: ${x}px;
      top: ${y}px;
      --rot: ${rot}deg;
      --card-w: ${w}px;
      --float-duration: ${floatDuration}s;
      --float-delay: ${floatDelay}s;
      --dx: ${dx}px;
      --dy: ${dy}px;
      --dx2: ${dx2}px;
      --dy2: ${dy2}px;
      --card-opacity: ${cardOpacity};
      transition-delay: ${0.03 * i}s;
    `;

    // 建立照片佔位
    const placeholder = document.createElement('div');
    placeholder.className = 'photo-placeholder';
    const photoName = memPhotos.length > 0 ? memPhotos[i % memPhotos.length] : `chat${i + 1}.jpg`;
    placeholder.dataset.src = `photos/chats/${photoName}`;
    placeholder.innerHTML = `<span>💬</span><small>${i + 1}</small>`;
    card.appendChild(placeholder);

    wall.appendChild(card);

    // 稍微延遲後加入漂浮動畫，讓進場和漂浮不衝突
    setTimeout(() => {
      card.classList.add('floating');
    }, 2000 + i * 50);
  }

  // 載入記憶牆的圖片
  wall.querySelectorAll('.photo-placeholder').forEach(placeholder => {
    const src = placeholder.dataset.src;
    if (!src) return;
    tryLoadImage(placeholder, src);
  });
}

// 自動高亮：每隔 3 秒隨機放大一張卡片
function startMemoryHighlight() {
  stopMemoryHighlight();
  const cards = document.querySelectorAll('.memory-card');
  if (cards.length === 0) return;

  let lastIndex = -1;

  function highlightRandom() {
    // 移除上一張的高亮
    cards.forEach(c => c.classList.remove('highlight'));

    // 隨機選一張（避免連續選到同一張）
    let idx;
    do {
      idx = Math.floor(Math.random() * cards.length);
    } while (idx === lastIndex && cards.length > 1);
    lastIndex = idx;

    cards[idx].classList.add('highlight');
  }

  // 1.5 秒後開始第一次
  memoryHighlightTimer = setTimeout(() => {
    highlightRandom();
    memoryHighlightTimer = setInterval(highlightRandom, 3000);
  }, 1500);
}

function stopMemoryHighlight() {
  if (memoryHighlightTimer) {
    clearInterval(memoryHighlightTimer);
    clearTimeout(memoryHighlightTimer);
    memoryHighlightTimer = null;
  }
  // 移除所有高亮
  document.querySelectorAll('.memory-card.highlight').forEach(c => {
    c.classList.remove('highlight');
  });
}

// ========== 信紙動畫 ==========

function startLetterAnimation() {
  const letterBody = document.getElementById('letter-body');
  letterBody.innerHTML = '';

  const letter = CONFIG.loveLetter || [];
  letter.forEach((text, i) => {
    const p = document.createElement('p');
    p.textContent = text;
    letterBody.appendChild(p);

    setTimeout(() => {
      p.classList.add('visible');
    }, 800 + i * 700);
  });
}

// ========== 告白按鈕 ==========

function initConfessionButtons() {
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');

  // 「我願意」按鈕 -> 慶祝場景
  btnYes.addEventListener('click', (e) => {
    e.stopPropagation();
    // 隱藏逃跑按鈕
    btnNo.classList.add('btn-no-hidden');
    switchScene(8);
  });

  // 「讓我想想」按鈕 -> 永遠在螢幕上跑但碰不到
  let escapeCount = 0;
  const funnyTexts = [
    "嘿嘿，抓不到我 😜",
    "再試試看～ 💨",
    "不給你按！ 🏃‍♀️",
    "你確定不要嗎？ 🥺",
    "最後一次機會喔 💕",
    "好啦其實只有一個選擇 😏",
    "放棄吧～ 😝",
    "你按不到的！ 🤭",
    "認輸吧 💖"
  ];

  btnNo.addEventListener('mouseenter', () => escapeButton(btnNo));
  btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    escapeButton(btnNo);
  });

  function escapeButton(btn) {
    // 第一次觸發時，將按鈕移到 body 層級
    // 避免父元素的 CSS transform 影響 position:fixed 座標
    if (!btn.classList.contains('escaping')) {
      btn.classList.add('escaping');
      document.body.appendChild(btn);
    }

    // 隨機移動到新位置（確保在可見範圍內）
    const btnRect = btn.getBoundingClientRect();
    const btnW = btnRect.width || 160;
    const btnH = btnRect.height || 50;
    const margin = 20;
    const maxX = window.innerWidth - btnW - margin;
    const maxY = window.innerHeight - btnH - margin;
    const newX = Math.max(margin, Math.random() * maxX);
    const newY = Math.max(margin, Math.random() * maxY);

    btn.style.left = newX + 'px';
    btn.style.top = newY + 'px';

    // 循環更新按鈕文字
    btn.textContent = funnyTexts[escapeCount % funnyTexts.length];
    escapeCount++;
  }
}

// ========== 煙火動畫 ==========

function startFireworks() {
  fireworksCanvas = document.getElementById('fireworks-canvas');
  fireworksCtx = fireworksCanvas.getContext('2d');

  resizeCanvas(fireworksCanvas);
  window.addEventListener('resize', () => resizeCanvas(fireworksCanvas));

  fireworks = [];
  animateFireworks();

  // 持續發射煙火
  setInterval(() => {
    launchFirework();
  }, 700);

  // 初始一波
  for (let i = 0; i < 3; i++) {
    setTimeout(launchFirework, i * 300);
  }
}

function launchFirework() {
  const x = Math.random() * fireworksCanvas.width;
  const y = Math.random() * fireworksCanvas.height * 0.5;
  const colors = [
    '#ff6b9d', '#ff9ecf', '#ffc3d0',
    '#f8b500', '#ffdd57',
    '#b8a9c9', '#7c73e6',
    '#ff6b6b', '#ee5a24'
  ];

  const particleCount = 40 + Math.floor(Math.random() * 30);
  const color = colors[Math.floor(Math.random() * colors.length)];

  // 決定是煙火還是愛心形狀
  const isHeart = Math.random() < 0.3;

  for (let i = 0; i < particleCount; i++) {
    let vx, vy;

    if (isHeart) {
      // 愛心形狀的粒子分佈
      const t = (i / particleCount) * Math.PI * 2;
      const heartX = 16 * Math.pow(Math.sin(t), 3);
      const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      const spread = 2 + Math.random();
      vx = heartX * spread * 0.15;
      vy = heartY * spread * 0.15;
    } else {
      // 普通放射狀
      const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.3;
      const speed = 2 + Math.random() * 4;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    }

    fireworks.push({
      x, y,
      vx, vy,
      alpha: 1,
      size: 2 + Math.random() * 2,
      color,
      decay: 0.012 + Math.random() * 0.01,
      gravity: 0.03
    });
  }
}

function animateFireworks() {
  fireworksCtx.fillStyle = 'rgba(10, 10, 26, 0.15)';
  fireworksCtx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

  fireworks = fireworks.filter(p => p.alpha > 0.01);

  fireworks.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= 0.99;
    p.alpha -= p.decay;

    fireworksCtx.beginPath();
    fireworksCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    fireworksCtx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
    fireworksCtx.fill();

    // 拖尾效果
    fireworksCtx.beginPath();
    fireworksCtx.arc(p.x - p.vx, p.y - p.vy, p.size * 0.5, 0, Math.PI * 2);
    fireworksCtx.fillStyle = p.color + Math.floor(p.alpha * 128).toString(16).padStart(2, '0');
    fireworksCtx.fill();
  });

  requestAnimationFrame(animateFireworks);
}

// ========== 背景音樂 ==========

function initMusicControl() {
  const btn = document.getElementById('music-toggle');
  const audio = document.getElementById('bgm');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();

    if (musicPlaying) {
      audio.pause();
      btn.classList.remove('playing');
      btn.classList.add('muted');
      musicPlaying = false;
    } else {
      audio.volume = 0.4;
      audio.play().then(() => {
        btn.classList.add('playing');
        btn.classList.remove('muted');
        musicPlaying = true;
      }).catch(() => {
        // 瀏覽器可能阻擋自動播放，靜默處理
      });
    }
  });

  // 在第一次使用者互動時嘗試播放音樂
  document.addEventListener('click', function autoplay() {
    if (!musicPlaying) {
      audio.volume = 0.4;
      audio.play().then(() => {
        btn.classList.add('playing');
        btn.classList.remove('muted');
        musicPlaying = true;
      }).catch(() => { });
    }
    document.removeEventListener('click', autoplay);
  }, { once: true });
}
