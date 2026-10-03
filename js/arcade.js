let activeInterval = null;

function closeGameModal() {
    document.getElementById('game-modal').style.display = 'none';
    if (activeInterval) clearInterval(activeInterval);
    window.currentActiveUpdate = null;
}

// Helper para registrar estatística de minigames para as Conquistas
function recordGamePlayed() {
    if (typeof gameState !== 'undefined' && gameState.stats) {
        gameState.stats.gamesPlayed++;
        if (typeof checkAllAchievements === 'function') checkAllAchievements();
    }
}

// 1. PugRunner
function startRunner() {
    recordGamePlayed();
    document.getElementById('modal-game-title').innerText = "🏃 PugRunner";
    document.getElementById('game-instruction').innerText = "Clique/Toque para PULAR!";
    const container = document.getElementById('game-canvas-container');
    container.innerHTML = '<canvas id="runnerCanvas" width="340" height="170"></canvas>';
    document.getElementById('game-modal').style.display = 'flex';

    const canvas = document.getElementById('runnerCanvas');
    const ctx = canvas.getContext('2d');
    let pugY = 110, velocityY = 0, isJumping = false;
    let obstacleX = 340, score = 0;

    function jump() {
        if (!isJumping) { 
            velocityY = -9; 
            isJumping = true; 
            if (typeof AudioEngine !== 'undefined') AudioEngine.playJump();
        }
    }

    document.onkeydown = (e) => { if (e.code === 'Space') jump(); };
    canvas.onclick = jump;

    if (activeInterval) clearInterval(activeInterval);
    activeInterval = setInterval(() => {
        velocityY += 0.55;
        pugY += velocityY;
        if (pugY >= 110) { pugY = 110; isJumping = false; }

        obstacleX -= 4;
        if (obstacleX < -20) { obstacleX = 340; score += 10; }

        if (obstacleX < 60 && obstacleX > 30 && pugY > 85) {
            closeGameModal();
            alert(`Fim de jogo! Pontos: ${score}. Recompensa: ${Math.floor(score/2)} moedas!`);
            addReward(Math.floor(score/2), score);
            return;
        }

        ctx.fillStyle = '#70a1ff'; ctx.fillRect(0, 0, 340, 170);
        ctx.fillStyle = '#2ed573'; ctx.fillRect(0, 140, 340, 30);
        ctx.fillStyle = '#ff4757'; ctx.fillRect(35, pugY, 26, 26);
        ctx.fillStyle = '#ffa502'; ctx.fillRect(obstacleX, 112, 16, 28);
        ctx.fillStyle = '#fff'; ctx.font = '14px sans-serif';
        ctx.fillText(`Pontos: ${score}`, 10, 20);
    }, 1000/60);
}

// 2. PugSnake
function startSnake() {
    recordGamePlayed();
    document.getElementById('modal-game-title').innerText = "🐍 PugSnake";
    document.getElementById('game-instruction').innerText = "Use as Setas do teclado!";
    const container = document.getElementById('game-canvas-container');
    container.innerHTML = '<canvas id="snakeCanvas" width="260" height="260"></canvas>';
    document.getElementById('game-modal').style.display = 'flex';

    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    let snake = [{x: 8, y: 8}], dir = {x: 1, y: 0};
    let food = {x: 4, y: 4}, score = 0;

    document.onkeydown = (e) => {
        if (e.key === 'ArrowUp' && dir.y === 0) dir = {x: 0, y: -1};
        if (e.key === 'ArrowDown' && dir.y === 0) dir = {x: 0, y: 1};
        if (e.key === 'ArrowLeft' && dir.x === 0) dir = {x: -1, y: 0};
        if (e.key === 'ArrowRight' && dir.x === 0) dir = {x: 1, y: 0};
    };

    if (activeInterval) clearInterval(activeInterval);
    activeInterval = setInterval(() => {
        let head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

        if (head.x < 0 || head.x >= 17 || head.y < 0 || head.y >= 17) {
            closeGameModal();
            alert(`Fim de jogo! Pontos: ${score}`);
            addReward(score * 2, score * 2);
            return;
        }

        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            if (typeof AudioEngine !== 'undefined') AudioEngine.playCoin();
            food = {x: Math.floor(Math.random()*17), y: Math.floor(Math.random()*17)};
        } else {
            snake.pop();
        }

        ctx.fillStyle = '#1e1e24'; ctx.fillRect(0, 0, 260, 260);
        ctx.fillStyle = '#eccc68'; ctx.fillRect(food.x*15, food.y*15, 13, 13);
        ctx.fillStyle = '#ff4757';
        snake.forEach(s => ctx.fillRect(s.x*15, s.y*15, 13, 13));
    }, 140);
}

// 3. PugMiner
function startMiner() {
    recordGamePlayed();
    document.getElementById('modal-game-title').innerText = "⛏️ PugMiner";
    document.getElementById('game-instruction').innerText = "Clique rápido!";
    const container = document.getElementById('game-canvas-container');
    container.innerHTML = `
        <div style="padding: 15px;">
            <div id="bone-clicker" onclick="clickMiner()" style="font-size: 4rem; cursor: pointer;">🦴</div>
            <h3>Minerado: <span id="miner-count">0</span></h3>
        </div>
    `;
    document.getElementById('game-modal').style.display = 'flex';
    window.minerScore = 0;
}

function clickMiner() {
    window.minerScore += 1;
    document.getElementById('miner-count').innerText = window.minerScore;
    addReward(1, 1);
}

// 4. PugJump
function startJumpGame() {
    recordGamePlayed();
    window.playedJump = true;
    if (typeof checkAllAchievements === 'function') checkAllAchievements();

    document.getElementById('modal-game-title').innerText = "🦘 PugJump";
    document.getElementById('game-instruction').innerText = "Setas Esquerda/Direita para mover!";
    const container = document.getElementById('game-canvas-container');
    container.innerHTML = '<canvas id="jumpCanvas" width="280" height="320"></canvas>';
    document.getElementById('game-modal').style.display = 'flex';

    const canvas = document.getElementById('jumpCanvas');
    const ctx = canvas.getContext('2d');
    let pug = { x: 125, y: 220, vx: 0, vy: -6, width: 25, height: 25 };
    let platforms = [
        { x: 110, y: 260, w: 60, h: 10 },
        { x: 50, y: 180, w: 60, h: 10 },
        { x: 160, y: 100, w: 60, h: 10 },
        { x: 90, y: 30, w: 60, h: 10 }
    ];
    let score = 0;

    document.onkeydown = (e) => {
        if (e.key === 'ArrowLeft') pug.vx = -4;
        if (e.key === 'ArrowRight') pug.vx = 4;
    };
    document.onkeyup = (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') pug.vx = 0;
    };

    if (activeInterval) clearInterval(activeInterval);
    activeInterval = setInterval(() => {
        pug.x += pug.vx;
        pug.vy += 0.3;
        pug.y += pug.vy;

        if (pug.x < 0) pug.x = 280;
        if (pug.x > 280) pug.x = 0;

        platforms.forEach(p => {
            if (pug.vy > 0 && pug.x + pug.width > p.x && pug.x < p.x + p.w &&
                pug.y + pug.height >= p.y && pug.y + pug.height <= p.y + p.h + 5) {
                pug.vy = -7;
                score += 5;
            }
        });

        if (pug.y < 120) {
            let diff = 120 - pug.y;
            pug.y = 120;
            platforms.forEach(p => {
                p.y += diff;
                if (p.y > 320) {
                    p.y = 0;
                    p.x = Math.floor(Math.random() * 220);
                }
            });
        }

        if (pug.y > 320) {
            closeGameModal();
            alert(`Fim de jogo! Pontos: ${score}`);
            addReward(Math.floor(score / 2), score);
            return;
        }

        ctx.fillStyle = '#0f1117'; ctx.fillRect(0, 0, 280, 320);
        ctx.fillStyle = '#43a047';
        platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));
        ctx.fillStyle = '#ff4757'; ctx.fillRect(pug.x, pug.y, pug.width, pug.height);
        ctx.fillStyle = '#fff'; ctx.font = '14px sans-serif';
        ctx.fillText(`Score: ${score}`, 10, 20);
    }, 1000/60);
}

// 5. PugMemory (Jogo da Memória)
function startMemoryGame() {
    recordGamePlayed();
    document.getElementById('modal-game-title').innerText = "🧠 PugMemory";
    document.getElementById('game-instruction').innerText = "Encontre os pares de emojis!";
    const container = document.getElementById('game-canvas-container');
    
    let emojis = ['🐶', '🐶', '🦴', '🦴', '🍔', '🍔', '⭐', '⭐'];
    emojis.sort(() => Math.random() - 0.5);

    let html = '<div style="display: grid; grid-template-columns: repeat(4, 55px); gap: 10px; justify-content: center; padding: 15px;">';
    emojis.forEach((emoji, index) => {
        html += `<div class="memory-card" onclick="flipMemoryCard(this, '${emoji}')" style="width: 55px; height: 55px; background: #263238; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; cursor: pointer; border-radius: 6px;">❓</div>`;
    });
    html += '</div>';
    container.innerHTML = html;
    document.getElementById('game-modal').style.display = 'flex';
    window.firstCard = null;
    window.lockMemoryBoard = false;
    window.matchedPairs = 0;
}

function flipMemoryCard(card, emoji) {
    if (window.lockMemoryBoard || card.innerText !== '❓' || card.classList.contains('matched')) return;

    card.innerText = emoji;
    card.style.background = '#1e88e5';

    if (!window.firstCard) {
        window.firstCard = card;
        return;
    }

    let secondCard = card;
    if (window.firstCard.innerText === secondCard.innerText) {
        window.firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        window.firstCard = null;
        window.matchedPairs += 1;

        if (window.matchedPairs === 4) {
            setTimeout(() => {
                alert("Parabéns! Você venceu o PugMemory e ganhou 20 moedas!");
                addReward(20, 20);
                closeGameModal();
            }, 300);
        }
    } else {
        window.lockMemoryBoard = true;
        setTimeout(() => {
            window.firstCard.innerText = '❓';
            window.firstCard.style.background = '#263238';
            secondCard.innerText = '❓';
            secondCard.style.background = '#263238';
            window.firstCard = null;
            window.lockMemoryBoard = false;
        }, 700);
    }
}


// --- FLAPPY DOG ---
let flappyInterval = null;
function startFlappyDog() {
    recordGamePlayed();
    // Esconde a grade principal do arcade e exibe a vista dedicada do flappy
    const arcadeGrid = document.querySelector('.arcade-grid');
    if (arcadeGrid) arcadeGrid.style.display = 'none';
    document.getElementById('flappy-view').style.display = 'block';
    
    const canvas = document.getElementById('flappy-canvas');
    const ctx = canvas.getContext('2d');
    
    let birdY = 130;
    let gravity = 0.6;
    let lift = -8;
    let velocity = 0;
    let pipes = [];
    let score = 0;
    let gameOver = false;

    const jumpHandler = (e) => {
        if (e.code === 'Space' || e.type === 'click' || e.type === 'touchstart') {
            velocity = lift;
        }
    };
    window.addEventListener('keydown', jumpHandler);
    canvas.addEventListener('click', jumpHandler);
    canvas.addEventListener('touchstart', jumpHandler);

    pipes.push({ x: canvas.width, top: 70, bottom: 70 });

    function loop() {
        if (gameOver) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        velocity += gravity;
        birdY += velocity;
        
        ctx.font = '24px sans-serif';
        ctx.fillText('🐶', 40, birdY);
        
        for (let i = 0; i < pipes.length; i++) {
            ctx.fillStyle = '#73bf2e';
            ctx.fillRect(pipes[i].x, 0, 35, pipes[i].top);
            ctx.fillRect(pipes[i].x, canvas.height - pipes[i].bottom, 35, pipes[i].bottom);
            
            pipes[i].x -= 2;
            
            if (40 + 20 > pipes[i].x && 40 < pipes[i].x + 35) {
                if (birdY < pipes[i].top || birdY > canvas.height - pipes[i].bottom) {
                    gameOver = true;
                    endFlappyGame(score);
                }
            }
            
            if (pipes[i].x === 140) {
                pipes.push({ x: canvas.width, top: Math.random() * 100 + 40, bottom: Math.random() * 100 + 40 });
            }
        }
        
        if (birdY > canvas.height || birdY < 0) {
            gameOver = true;
            endFlappyGame(score);
        }
        
        score++;
        ctx.fillStyle = '#000';
        ctx.font = '14px sans-serif';
        ctx.fillText(`Pontos: ${Math.floor(score / 10)}`, 10, 20);
        
        flappyInterval = requestAnimationFrame(loop);
    }
    
    loop();
    
    window.exitFlappyDog = function() {
        cancelAnimationFrame(flappyInterval);
        window.removeEventListener('keydown', jumpHandler);
        document.getElementById('flappy-view').style.display = 'none';
        if (arcadeGrid) arcadeGrid.style.display = 'grid';
    };
}

function endFlappyGame(score) {
    const finalScore = Math.floor(score / 10);
    alert(`Fim de jogo! Você fez ${finalScore} pontos.`);
    
    if (typeof gameState !== 'undefined') {
        addReward(finalScore * 2, finalScore);
    }
    exitFlappyDog();
}


// --- WHACK-A-BONE (Acerte o Osso) ---
let whackTimer = null;
let activeBoneInterval = null;

function startWhackBone() {
    recordGamePlayed();
    // Esconde a grade principal do arcade e exibe a vista dedicada do Whack
    const arcadeGrid = document.querySelector('.arcade-grid');
    if (arcadeGrid) arcadeGrid.style.display = 'none';
    document.getElementById('whack-view').style.display = 'block';
    const grid = document.getElementById('whack-grid');
    grid.innerHTML = '';
    
    let score = 0;
    document.getElementById('whack-score').innerText = score;

    let holes = [];
    for (let i = 0; i < 9; i++) {
        const hole = document.createElement('div');
        hole.style.cssText = "width: 65px; height: 65px; background: #1e222d; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; cursor: pointer; border: 2px solid #4b4b4b; margin: 0 auto;";
        
        hole.addEventListener('click', () => {
            if (hole.innerText === '🦴') {
                score += 10;
                document.getElementById('whack-score').innerText = score;
                hole.innerText = '';
            }
        });
        
        grid.appendChild(hole);
        holes.push(hole);
    }

    activeBoneInterval = setInterval(() => {
        holes.forEach(h => h.innerText = '');
        const randomHole = holes[Math.floor(Math.random() * holes.length)];
        randomHole.innerText = '🦴';
    }, 750);

    whackTimer = setTimeout(() => {
        clearInterval(activeBoneInterval);
        holes.forEach(h => h.innerText = '');
        alert(`Tempo esgotado! Você conseguiu ${score} pontos.`);
        
        if (typeof gameState !== 'undefined') {
            addReward(score, Math.floor(score / 2));
        }
        exitWhackBone();
    }, 20000);

    window.exitWhackBone = function() {
        clearTimeout(whackTimer);
        clearInterval(activeBoneInterval);
        document.getElementById('whack-view').style.display = 'none';
        if (arcadeGrid) arcadeGrid.style.display = 'grid';
    };
}