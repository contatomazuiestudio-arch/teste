let lastTime = 0;
window.currentActiveUpdate = null;

function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (window.currentActiveUpdate) {
        window.currentActiveUpdate(deltaTime);
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

let cameraX = 0;
let isDragging = false;
let startX = 0;
let currentTranslateX = 0;
let hasDragged = false;

function setCameraPosition(x) {
    const worldStage = document.getElementById('world-stage');
    const bgLayer = document.getElementById('bg-layer');
    if (!worldStage || !bgLayer) return;

    const minX = Math.min(0, -(2500 - window.innerWidth));
    cameraX = Math.max(minX, Math.min(0, x));
    
    worldStage.style.transform = `translateX(${cameraX}px)`;
    bgLayer.style.transform = `translateX(${cameraX * 0.3}px)`;
}

function initCameraControls() {
    const worldView = document.getElementById('world-view');
    if (!worldView) return;

    worldView.addEventListener('mousedown', startDrag);
    worldView.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('mousemove', drag);
    window.addEventListener('touchmove', drag, { passive: false });
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);
}

function startDrag(e) {
    isDragging = true;
    hasDragged = false;
    startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    currentTranslateX = cameraX;
}

function drag(e) {
    if (!isDragging) return;
    const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const diff = currentX - startX;
    
    if (Math.abs(diff) > 5) hasDragged = true;
    setCameraPosition(currentTranslateX + diff);
}

function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    
    if (!hasDragged && e.target.closest('#world-stage')) {
        let clickClientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        let stageClickX = clickClientX - cameraX;
        const pedro = document.getElementById('pedro');
        if (pedro) {
            pedro.style.left = Math.max(50, Math.min(stageClickX - 35, 2400)) + 'px';
        }
    }
}

function enterHouse(owner) {
    if (hasDragged) return;
    if (typeof switchView === 'function') {
        switchView('house');
    }
}

function changeWallColor() {
    const wallBox = document.getElementById('house-wall-box');
    if (!wallBox) return;
    const colors = ['#ffeaa7', '#fab1a0', '#74b9ff', '#55efc4', '#dfe6e9'];
    let nextColor = colors[Math.floor(Math.random() * colors.length)];
    wallBox.style.backgroundColor = nextColor;
}

window.addEventListener('DOMContentLoaded', () => {
    if (typeof loadGameData === 'function') loadGameData();
    initCameraControls();
});