// 极速触点 · 射击游戏 JavaScript
// 游戏变量
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let width, height;
let gameActive = false;
let gamePaused = false;
let score = 0;
let time = 60;
let combo = 0;
let maxCombo = 0;
let targets = [];
let particles = [];
let animFrame = null;
let gameTimer = null;
let totalClicks = 0;
let hitClicks = 0;
let targetsHit = 0;

// 鼠标位置跟踪
let mouseX = 0;
let mouseY = 0;

// 音效控制
let soundEnabled = true;

// 粒子类
class Particle {
    constructor(x, y, color, velocity) {
        this.x = x;
        this.y = y;
        this.vx = velocity.x;
        this.vy = velocity.y;
        this.color = color;
        this.life = 1.0;
        this.decay = 0.02 + Math.random() * 0.02;
        this.size = 2 + Math.random() * 3;
        this.gravity = 0.15;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life -= this.decay;
        this.vx *= 0.98;
        this.size *= 0.99;
        return this.life > 0;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 难度配置
const difficultyConfig = {
    newbie: {
        name: '新手',
        details: '巨大目标 · 超慢速度\n初学者友好',
        targetCount: 2,
        speed: 0.5,
        radius: 45,
        colors: ['#ff6b6b', '#4fc3f7'],
        timeLimit: 90
    },
    beginner: {
        name: '入门',
        details: '超大目标 · 慢速移动\n适合初次体验',
        targetCount: 3,
        speed: 0.8,
        radius: 35,
        colors: ['#ff6b6b', '#4fc3f7'],
        timeLimit: 60
    },
    easy: {
        name: '简单',
        details: '大目标 · 慢速移动\n轻松上手',
        targetCount: 4,
        speed: 1.2,
        radius: 30,
        colors: ['#ff6b6b', '#4fc3f7', '#66bb6a'],
        timeLimit: 60
    },
    normal: {
        name: '普通',
        details: '中等目标 · 正常移动\n标准挑战',
        targetCount: 5,
        speed: 1.8,
        radius: 25,
        colors: ['#ff6b6b', '#4fc3f7', '#66bb6a', '#ffa726'],
        timeLimit: 60
    },
    hard: {
        name: '困难',
        details: '小目标 · 快速移动\n考验反应',
        targetCount: 6,
        speed: 2.5,
        radius: 20,
        colors: ['#ff6b6b', '#4fc3f7', '#66bb6a', '#ffa726', '#ab47bc'],
        timeLimit: 60
    },
    expert: {
        name: '专家',
        details: '微小目标 · 极速移动\n专家级挑战',
        targetCount: 8,
        speed: 3.2,
        radius: 18,
        colors: ['#ff6b6b', '#4fc3f7', '#66bb6a', '#ffa726', '#ab47bc', '#26c6da'],
        timeLimit: 60
    },
    master: {
        name: '大师',
        details: '迷你目标 · 超高速度\n大师级考验',
        targetCount: 10,
        speed: 4.0,
        radius: 15,
        colors: ['#ff6b6b', '#4fc3f7', '#66bb6a', '#ffa726', '#ab47bc', '#26c6da', '#ff9800'],
        timeLimit: 45
    },
    nightmare: {
        name: '噩梦',
        details: '极小目标 · 疯狂速度\n噩梦级挑战',
        targetCount: 12,
        speed: 5.0,
        radius: 12,
        colors: ['#ff6b6b', '#4fc3f7', '#66bb6a', '#ffa726', '#ab47bc', '#26c6da', '#ff9800', '#e91e63'],
        timeLimit: 30
    },
    insane: {
        name: '疯狂',
        details: '微粒目标 · 闪电速度\n只有疯子才能完成',
        targetCount: 15,
        speed: 6.5,
        radius: 10,
        colors: ['#ff6b6b', '#4fc3f7', '#66bb6a', '#ffa726', '#ab47bc', '#26c6da', '#ff9800', '#e91e63', '#9c27b0'],
        timeLimit: 30
    },
    godlike: {
        name: '神级',
        details: '尘埃目标 · 光速移动\n传说中的神级挑战',
        targetCount: 20,
        speed: 8.0,
        radius: 8,
        colors: ['#ff6b6b', '#4fc3f7', '#66bb6a', '#ffa726', '#ab47bc', '#26c6da', '#ff9800', '#e91e63', '#9c27b0', '#3f51b5'],
        timeLimit: 20
    }
};

let currentDifficulty = 'normal';
let bestScores = JSON.parse(localStorage.getItem('speedTouchBestScores') || '{}');

// 初始化画布
function initCanvas() {
    // 计算可用空间，填满绿框区域
    const gameArea = document.querySelector('.game-area');
    const gameAreaRect = gameArea.getBoundingClientRect();
    
    // 减去padding和border的空间
    width = gameAreaRect.width - 20; // 减去padding
    height = gameAreaRect.height - 20; // 减去padding
    
    // 确保最小尺寸
    width = Math.max(width, 400);
    height = Math.max(height, 300);
    
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
}

// 简单的音效实现
function playSound(type) {
    if (!soundEnabled) return;
    
    // 使用Web Audio API创建简单音效
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const frequencies = {
            hit: 440,
            combo: 550,
            start: 523,
            end: 220
        };
        
        oscillator.frequency.setValueAtTime(frequencies[type] || 440, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        // 如果音效失败，静默处理
        console.log('音效播放失败');
    }
}

// 创建爆破粒子效果
function createExplosion(x, y, color, intensity = 15) {
    for (let i = 0; i < intensity; i++) {
        const angle = (Math.PI * 2 * i) / intensity + Math.random() * 0.5;
        const speed = 3 + Math.random() * 4;
        const velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        
        // 创建不同大小和颜色的粒子
        const particleColor = Math.random() > 0.3 ? color : '#ffffff';
        particles.push(new Particle(x, y, particleColor, velocity));
    }
    
    // 添加一些火花效果
    for (let i = 0; i < 8; i++) {
        const velocity = {
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 10 - 2
        };
        particles.push(new Particle(x, y, '#ffff00', velocity));
    }
}

// 创建目标
function createTarget() {
    const config = difficultyConfig[currentDifficulty];
    const colors = config.colors;
    
    return {
        x: config.radius + Math.random() * (width - 2 * config.radius),
        y: config.radius + Math.random() * (height - 2 * config.radius),
        vx: (Math.random() - 0.5) * config.speed * 2,
        vy: (Math.random() - 0.5) * config.speed * 2,
        radius: config.radius + Math.random() * 8 - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        score: Math.floor(Math.random() * 20) + 10
    };
}

// 初始化目标
function initTargets() {
    targets = [];
    const config = difficultyConfig[currentDifficulty];
    for (let i = 0; i < config.targetCount; i++) {
        targets.push(createTarget());
    }
}

// 绘制瞄准镜
function drawCrosshair(x, y) {
    ctx.save();
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 8;
    
    // 外圆
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.stroke();
    
    // 内圆
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.stroke();
    
    // 十字线
    ctx.beginPath();
    // 上
    ctx.moveTo(x, y - 30);
    ctx.lineTo(x, y - 22);
    // 下
    ctx.moveTo(x, y + 22);
    ctx.lineTo(x, y + 30);
    // 左
    ctx.moveTo(x - 30, y);
    ctx.lineTo(x - 22, y);
    // 右
    ctx.moveTo(x + 22, y);
    ctx.lineTo(x + 30, y);
    ctx.stroke();
    
    // 刻度标记
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const x1 = x + Math.cos(angle) * 25;
        const y1 = y + Math.sin(angle) * 25;
        const x2 = x + Math.cos(angle) * 28;
        const y2 = y + Math.sin(angle) * 28;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    ctx.restore();
}

// 绘制场景
function drawScene() {
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 绘制背景网格
    ctx.strokeStyle = '#253644';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    for (let i = 0; i <= width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
    }
    for (let i = 0; i <= height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
    
    // 绘制目标
    targets.forEach(target => {
        // 外发光
        ctx.shadowColor = target.color;
        ctx.shadowBlur = 15;
        
        // 主圆
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
        ctx.fillStyle = target.color;
        ctx.fill();
        
        // 内圈高光
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(target.x - target.radius * 0.3, target.y - target.radius * 0.3, target.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fill();
        
        // 边框
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
        ctx.stroke();
    });
    
    // 绘制粒子效果
    particles.forEach(particle => {
        particle.draw(ctx);
    });
    
    // 如果没有游戏进行，显示提示
    if (!gameActive) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('点击画面开始游戏', width / 2, height / 2);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('使用瞄准镜击中彩色圆球获得分数', width / 2, height / 2 + 40);
    }
    
    // 绘制瞄准镜（在游戏活动时）
    if (gameActive && !gamePaused) {
        drawCrosshair(mouseX, mouseY);
    }
}

// 更新目标位置
function updateTargets() {
    targets.forEach(target => {
        target.x += target.vx;
        target.y += target.vy;
        
        // 边界反弹
        if (target.x <= target.radius || target.x >= width - target.radius) {
            target.vx = -target.vx;
            target.x = Math.max(target.radius, Math.min(width - target.radius, target.x));
        }
        if (target.y <= target.radius || target.y >= height - target.radius) {
            target.vy = -target.vy;
            target.y = Math.max(target.radius, Math.min(height - target.radius, target.y));
        }
    });
}

// 游戏循环
function gameLoop() {
    if (gameActive && !gamePaused) {
        updateTargets();
    }
    
    // 更新粒子
    particles = particles.filter(particle => particle.update());
    
    drawScene();
    animFrame = requestAnimationFrame(gameLoop);
}

// 处理点击
function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 如果游戏未开始，显示难度选择
    if (!gameActive) {
        showDifficultyModal();
        return;
    }
    
    // 如果游戏暂停，不处理点击
    if (gamePaused) {
        return;
    }
    
    totalClicks++;
    
    // 检查是否击中目标
    let hitCount = 0;
    targets = targets.filter(target => {
        const distance = Math.sqrt((x - target.x) ** 2 + (y - target.y) ** 2);
        if (distance <= target.radius) {
            // 创建爆破效果
            createExplosion(target.x, target.y, target.color);
            
            score += target.score;
            combo++;
            hitCount++;
            hitClicks++;
            targetsHit++;
            return false;
        }
        return true;
    });
    
    // 补充新目标
    for (let i = 0; i < hitCount; i++) {
        targets.push(createTarget());
    }
    
    // 如果击中了目标
    if (hitCount > 0) {
        maxCombo = Math.max(maxCombo, combo);
        playSound(combo >= 5 ? 'combo' : 'hit');
    } else {
        // 没击中，重置连击
        combo = 0;
    }
    
    updateUI();
}

// 生成难度选择按钮
function generateDifficultyButtons() {
    const grid = document.getElementById('difficultyGrid');
    grid.innerHTML = '';
    
    Object.entries(difficultyConfig).forEach(([key, config]) => {
        const btn = document.createElement('div');
        btn.className = 'difficulty-btn';
        btn.setAttribute('data-difficulty', key);
        btn.onclick = () => startGame(key);
        
        const colorsHTML = config.colors.map(color => 
            `<div class="color-dot" style="background-color: ${color}"></div>`
        ).join('');
        
        const bestScore = bestScores[key] || 0;
        
        // 添加特殊标记
        let specialMark = '';
        if (key === 'master') specialMark = ' 🏆';
        else if (key === 'nightmare') specialMark = ' 💀';
        else if (key === 'insane') specialMark = ' 🔥';
        else if (key === 'godlike') specialMark = ' ⚡';
        
        btn.innerHTML = `
            <div class="difficulty-name">${config.name}${specialMark}</div>
            <div class="difficulty-details">${config.details}</div>
            <div class="difficulty-colors">${colorsHTML}</div>
            <div class="difficulty-stats">最佳: ${bestScore} 分 | 时间: ${config.timeLimit}s</div>
        `;
        
        grid.appendChild(btn);
    });
}

// 显示难度选择
function showDifficultyModal() {
    generateDifficultyButtons();
    document.getElementById('difficultyModal').style.display = 'block';
}

// 隐藏难度选择
function hideDifficultyModal() {
    document.getElementById('difficultyModal').style.display = 'none';
}

// 开始游戏
function startGame(difficulty) {
    currentDifficulty = difficulty;
    hideDifficultyModal();
    
    // 重置游戏状态
    score = 0;
    time = difficultyConfig[difficulty].timeLimit;
    combo = 0;
    maxCombo = 0;
    totalClicks = 0;
    hitClicks = 0;
    targetsHit = 0;
    gameActive = true;
    gamePaused = false;
    
    // 初始化目标
    initTargets();
    
    // 播放开始音效
    playSound('start');
    
    // 启用自定义瞄准镜
    canvas.classList.add('custom-crosshair');
    
    // 开始计时器
    gameTimer = setInterval(() => {
        if (!gamePaused) {
            time--;
            if (time <= 0) {
                endGame();
            }
            updateUI();
        }
    }, 1000);
    
    updateUI();
}

// 结束游戏
function endGame() {
    gameActive = false;
    gamePaused = false;
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
    
    // 禁用自定义瞄准镜
    canvas.classList.remove('custom-crosshair');
    
    playSound('end');
    
    // 更新最佳成绩
    if (!bestScores[currentDifficulty] || score > bestScores[currentDifficulty]) {
        bestScores[currentDifficulty] = score;
        localStorage.setItem('speedTouchBestScores', JSON.stringify(bestScores));
    }
    
    // 显示结果
    showResultModal();
}

// 显示结果模态框
function showResultModal() {
    document.getElementById('finalScore').textContent = score;
    document.getElementById('resultCombo').textContent = maxCombo;
    document.getElementById('resultHitRate').textContent = totalClicks > 0 ? Math.round((hitClicks / totalClicks) * 100) + '%' : '0%';
    document.getElementById('resultTargetsHit').textContent = targetsHit;
    document.getElementById('resultBestScore').textContent = bestScores[currentDifficulty] || 0;
    
    document.getElementById('resultModal').style.display = 'block';
}

// 重新开始游戏
function restartGame() {
    document.getElementById('resultModal').style.display = 'none';
    startGame(currentDifficulty);
}

// 返回主菜单
function backToMenu() {
    document.getElementById('resultModal').style.display = 'none';
    // 重置显示目标
    targets = [];
    initTargets();
}

// 暂停游戏
function pauseGame() {
    if (!gameActive || gamePaused) return;
    gamePaused = true;
    document.getElementById('pauseModal').style.display = 'block';
    playSound('start'); // 暂停音效
}

// 继续游戏
function resumeGame() {
    if (!gameActive || !gamePaused) return;
    gamePaused = false;
    document.getElementById('pauseModal').style.display = 'none';
    playSound('start'); // 继续音效
}

// 退出游戏
function quitGame() {
    gamePaused = false;
    gameActive = false;
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
    
    // 禁用自定义瞄准镜
    canvas.classList.remove('custom-crosshair');
    
    document.getElementById('pauseModal').style.display = 'none';
    // 重置显示目标
    targets = [];
    particles = []; // 清除粒子
    initTargets();
}

// 更新UI
function updateUI() {
    document.getElementById('scoreDisplay').textContent = score;
    document.getElementById('timerDisplay').textContent = time;
    document.getElementById('comboDisplay').textContent = combo;
    
    const hitRate = totalClicks > 0 ? Math.round((hitClicks / totalClicks) * 100) : 0;
    document.getElementById('hitRateDisplay').textContent = hitRate + '%';
}

// 音效控制
function toggleSound() {
    soundEnabled = !soundEnabled;
    const icon = document.getElementById('audioIcon');
    const text = document.getElementById('audioText');
    const btn = document.getElementById('audioToggle');
    
    if (soundEnabled) {
        icon.textContent = '🔊';
        text.textContent = '音效';
        btn.classList.remove('disabled');
    } else {
        icon.textContent = '🔇';
        text.textContent = '静音';
        btn.classList.add('disabled');
    }
    
    localStorage.setItem('speedTouchSound', soundEnabled.toString());
}

// 初始化
function init() {
    // 延迟一帧确保DOM完全渲染
    requestAnimationFrame(() => {
        initCanvas();
        initTargets();
    
        // 加载音效设置
        const savedSound = localStorage.getItem('speedTouchSound');
        if (savedSound !== null) {
            soundEnabled = savedSound === 'true';
            toggleSound();
            toggleSound(); // 调用两次来设置正确状态
        }
        
        // 绑定事件
        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleClick(e.touches[0]);
        });
        
        // 鼠标移动跟踪
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });
        
        // 鼠标进入游戏区域时隐藏默认光标
        canvas.addEventListener('mouseenter', () => {
            if (gameActive) {
                canvas.classList.add('custom-crosshair');
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
            canvas.classList.remove('custom-crosshair');
        });
        
        document.getElementById('audioToggle').addEventListener('click', toggleSound);
        
        // 窗口大小改变时重新调整
        window.addEventListener('resize', () => {
            requestAnimationFrame(() => {
                initCanvas();
            });
        });
        
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (document.getElementById('difficultyModal').style.display === 'block') {
                    hideDifficultyModal();
                } else if (document.getElementById('resultModal').style.display === 'block') {
                    backToMenu();
                } else if (document.getElementById('pauseModal').style.display === 'block') {
                    resumeGame();
                } else if (gameActive && !gamePaused) {
                    pauseGame();
                }
            }
        });
        
        // 开始游戏循环
        gameLoop();
    });
}

// 页面加载完成后初始化
window.addEventListener('load', init);