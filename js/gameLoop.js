// gameLoop.js
import { gameState } from './gameState.js';
import { updateStatusDisplay } from './ui.js';

let gameLoopInterval = null;

function gameTick() {
    // 전투 중이 아닐 때만 마나 재생
    if (!gameState.isInCombat) {
        const playerStats = gameState.playerStats;
        const manaRegen = playerStats.derived.manaRegen || 0;
        const hpRegen = playerStats.derived.hpRegen || 0;

        if (manaRegen > 0 && playerStats.base.mp < playerStats.derived.maxMp) {
            playerStats.base.mp = Math.min(playerStats.derived.maxMp, playerStats.base.mp + manaRegen);
            updateStatusDisplay();
        }

        if (hpRegen > 0 && playerStats.base.hp < playerStats.derived.maxHp) {
            playerStats.base.hp = Math.min(playerStats.derived.maxHp, playerStats.base.hp + hpRegen);
            updateStatusDisplay();
        }
    }
}

export function startGameLoop() {
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
    }
    gameLoopInterval = setInterval(gameTick, 1000); // 1초마다 gameTick 실행
}

export function stopGameLoop() {
    clearInterval(gameLoopInterval);
    gameLoopInterval = null;
}
