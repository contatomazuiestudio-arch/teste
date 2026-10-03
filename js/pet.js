const gameState = {
    coins: 200,
    xp: 0,
    level: 1,
    hunger: 80,
    hygiene: 70,
    happiness: 90,
    currentHat: '',
    stats: {
        fedCount: 0,
        gamesPlayed: 0
    },
    achievements: [],
    settings: {
        soundEnabled: true
    }
};

// Lista Expandida de 14 Conquistas
const ACHIEVEMENTS_LIST = [
    { id: 'first_game', title: '🎮 Gamer de Vila', desc: 'Jogue seu primeiro minigame', reward: 20, check: () => gameState.stats.gamesPlayed >= 1 },
    { id: 'arcade_master', title: '🕹️ Viciado em Arcade', desc: 'Jogue 5 minigames', reward: 50, check: () => gameState.stats.gamesPlayed >= 5 },
    { id: 'rich_pet', title: '💰 Milionário de Ossos', desc: 'Acumule 100 moedas', reward: 40, check: () => gameState.coins >= 100 },
    { id: 'wealthy_king', title: '💎 Magnata de Mazique', desc: 'Acumule 500 moedas', reward: 100, check: () => gameState.coins >= 500 },
    { id: 'fashion_icon', title: '👑 Estiloso', desc: 'Compre seu primeiro chapéu', reward: 30, check: () => gameState.currentHat !== '' },
    { id: 'caretaker', title: '❤️ Amigo dos Pets', desc: 'Alimente o Pedro 3 vezes', reward: 15, check: () => gameState.stats.fedCount >= 3 },
    { id: 'chef_master', title: '🍔 Banquete Canino', desc: 'Alimente o Pedro 10 vezes', reward: 60, check: () => gameState.stats.fedCount >= 10 },
    { id: 'clean_pet', title: '🧼 Limpinho e Cheiroso', desc: 'De 5 banhos no Pedro', reward: 30, check: () => gameState.hygiene >= 95 },
    { id: 'happy_dog', title: '😄 Coração Alegre', desc: 'Deixe a felicidade acima de 90%', reward: 30, check: () => gameState.happiness >= 90 },
    { id: 'level_five', title: '⭐ Veterano Nível 5', desc: 'Alcance o Nível 5', reward: 80, check: () => gameState.level >= 5 },
    { id: 'level_ten', title: '🌟 Lenda de Mazique', desc: 'Alcance o Nível 10', reward: 150, check: () => gameState.level >= 10 },
    { id: 'interior_decorator', title: '🎨 Arquiteto', desc: 'Mude a cor da parede da casa', reward: 25, check: () => window.wallCustomized === true },
    { id: 'early_bird', title: '🌅 Aventureiro Matinal', desc: 'Visite todos os lotes da rua', reward: 40, check: () => window.visitedAllLots === true },
    { id: 'jump_king', title: '🦘 Rei do Pulo', desc: 'Jogue o PugJump', reward: 50, check: () => window.playedJump === true }
];

function loadGameData() {
    const saved = localStorage.getItem('mazique_save');
    if (saved) {
        Object.assign(gameState, JSON.parse(saved));
        if (gameState.currentHat) {
            const hatSlot = document.getElementById('pedro-hat-slot');
            if (hatSlot) {
                hatSlot.innerText = gameState.currentHat;
                hatSlot.style.display = 'block';
            }
        }
    }
    updateUI();
    checkAllAchievements();
}

function saveGameData() {
    localStorage.setItem('mazique_save', JSON.stringify(gameState));
}

setInterval(() => {
    gameState.hunger = Math.max(0, gameState.hunger - 1);
    gameState.hygiene = Math.max(0, gameState.hygiene - 1);
    gameState.happiness = Math.max(0, gameState.happiness - 1);
    updateUI();
    saveGameData();
    checkAllAchievements();
}, 4000);

function updateUI() {
    if (document.getElementById('coin-count')) document.getElementById('coin-count').innerText = gameState.coins;
    if (document.getElementById('xp-count')) document.getElementById('xp-count').innerText = gameState.xp;
    if (document.getElementById('level-count')) document.getElementById('level-count').innerText = gameState.level;

    if (document.getElementById('fill-hunger')) document.getElementById('fill-hunger').style.width = gameState.hunger + '%';
    if (document.getElementById('fill-hygiene')) document.getElementById('fill-hygiene').style.width = gameState.hygiene + '%';
    if (document.getElementById('fill-happy')) document.getElementById('fill-happy').style.width = gameState.happiness + '%';
}

function addReward(coins, xp) {
    gameState.coins += coins;
    gameState.xp += xp;
    
    if ((coins > 0 || xp > 0) && gameState.settings.soundEnabled && typeof AudioEngine !== 'undefined') {
        AudioEngine.playCoin();
    }

    if (gameState.xp >= gameState.level * 100) {
        gameState.level++;
        alert(`🎉 PARABÉNS! Nível ${gameState.level} Atingido!`);
    }
    updateUI();
    saveGameData();
    checkAllAchievements();
}

function feedPet() {
    if (gameState.coins < 5) return alert("Moedas insuficientes!");
    gameState.coins -= 5;
    gameState.hunger = Math.min(100, gameState.hunger + 30);
    gameState.stats.fedCount++;
    addReward(0, 5);
}

function cleanPet() {
    gameState.hygiene = Math.min(100, gameState.hygiene + 40);
    addReward(0, 5);
}

function playPet() {
    gameState.happiness = Math.min(100, gameState.happiness + 35);
    addReward(0, 5);
}

function buyHat(hatIcon, price) {
    if (gameState.coins < price) return alert("Moedas insuficientes!");
    gameState.coins -= price;
    gameState.currentHat = hatIcon;
    
    const hatSlot = document.getElementById('pedro-hat-slot');
    if (hatSlot) {
        hatSlot.innerText = hatIcon;
        hatSlot.style.display = 'block';
    }

    updateUI();
    saveGameData();
    checkAllAchievements();
    alert(`Equipado: ${hatIcon}`);
}

function checkAllAchievements() {
    ACHIEVEMENTS_LIST.forEach(ach => {
        if (!gameState.achievements.includes(ach.id) && ach.check()) {
            gameState.achievements.push(ach.id);
            gameState.coins += ach.reward;
            showAchievementPopup(ach.title, ach.desc, ach.reward);
        }
    });
    renderAchievementsUI();
}

function showAchievementPopup(title, desc, reward) {
    let popup = document.getElementById('achievement-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'achievement-popup';
        popup.style.cssText = "position: fixed; bottom: 20px; right: 20px; background: #2ed573; color: #fff; padding: 15px; border-radius: 8px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-family: sans-serif;";
        document.body.appendChild(popup);
    }
    popup.innerHTML = `<strong>🏆 Conquista Desbloqueada!</strong><br><em>${title}</em><br><small>${desc} (+🪙${reward})</small>`;
    setTimeout(() => { if(popup) popup.remove(); }, 4500);
}

function renderAchievementsUI() {
    const listContainer = document.getElementById('achievements-dynamic-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    ACHIEVEMENTS_LIST.forEach(ach => {
        const unlocked = gameState.achievements.includes(ach.id);
        const card = document.createElement('div');
        card.style.cssText = `background: ${unlocked ? '#1e222d' : '#14171f'}; border: 1px solid ${unlocked ? '#2ed573' : '#2f3542'}; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; opacity: ${unlocked ? '1' : '0.7'};`;
        card.innerHTML = `
            <div>
                <h3 style="margin:0; font-size:1rem; color:#fff;">${ach.title}</h3>
                <p style="margin:4px 0 0 0; font-size: 0.8rem; color: #a4b0be;">${ach.desc} (Recompensa: 🪙${ach.reward})</p>
            </div>
            <span style="font-size:0.85rem; font-weight:bold; color: ${unlocked ? '#2ed573' : '#a4b0be;'}">
                ${unlocked ? '✅ Concluído' : '⏳ Pendente'}
            </span>
        `;
        listContainer.appendChild(card);
    });
}

function switchView(viewName) {
    ['world', 'arcade', 'shop', 'house', 'achievements', 'settings'].forEach(v => {
        const el = document.getElementById(v + '-view');
        if (el) el.style.display = (v === viewName) ? 'block' : 'none';
    });

    document.querySelectorAll('.nav-buttons button').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById('btn-nav-' + viewName);
    if (activeBtn) activeBtn.classList.add('active');

    if (viewName === 'achievements') {
        renderAchievementsUI();
    }
}

function enterHouse(owner) {
    document.getElementById('world-view').style.display = 'none';
    document.getElementById('house-view').style.display = 'block';
    if (document.getElementById('house-title')) {
        document.getElementById('house-title').innerText = `🏠 Casa do ${owner.charAt(0).toUpperCase() + owner.slice(1)}`;
    }
}

function changeWallColor() {
    const colors = ['#2f3542', '#3742fa', '#ff4757', '#2ed573', '#ffa502'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const wallBox = document.getElementById('house-wall-box');
    if (wallBox) wallBox.style.background = randomColor;
    window.wallCustomized = true;
    checkAllAchievements();
    addReward(5, 10);
    alert('Parede pintada com sucesso!');
}

function toggleSound() {
    gameState.settings.soundEnabled = !gameState.settings.soundEnabled;
    alert(`Som do jogo: ${gameState.settings.soundEnabled ? 'Ligado 🔊' : 'Desligado 🔇'}`);
    saveGameData();
}

function resetGameData() {
    if (confirm("Tem certeza que deseja apagar todo o progresso?")) {
        localStorage.removeItem('mazique_save');
        location.reload();
    }
}

window.onload = () => {
    loadGameData();
};