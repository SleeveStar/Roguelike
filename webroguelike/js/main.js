// main.js
import { gameState } from './gameState.js';
import { preloadGameAssets } from './imageLoader.js';
import { recalculateDerivedStats, gainExperience, generateRandomItem } from './gameLogic.js';
import { updateStatusDisplay, initUI } from './ui.js';
import { transitionMap } from './map.js';
import { addEventListeners } from './eventHandlers.js';
import { gameCanvas } from './domElements.js';


window.onload = () => {
    initUI();

    gameCanvas.width = 800;
    gameCanvas.height = 800;
    
    addEventListeners();
    
    preloadGameAssets()
        .then(() => {
            console.log("All game assets loaded. Starting game...");
            for(let i=0; i<3; i++) gameState.playerStats.inventory.push(generateRandomItem(1, 0, 'common'));
            recalculateDerivedStats();
            gameState.playerStats.base.hp = gameState.playerStats.derived.maxHp;
            gameState.playerStats.base.mp = gameState.playerStats.derived.maxMp;

            updateStatusDisplay();
            transitionMap('initial');
        })
        .catch(error => {
            console.error("Failed to load game assets:", error);
        });
};
