// main.js
import { gameState } from './gameState.js';
import { preloadGameAssets, tileImageCache } from './imageLoader.js';
import { recalculateDerivedStats, gainExperience, generateRandomItem, playerTurn, monsterTurn, setCombatButtonsEnabled, endCombat, toggleAutoAttack } from './gameLogic.js';
import { updateStatusDisplay, initUI, drawGame, updateSkillTreeButtonState } from './ui.js'; // Import drawGame, updateSkillTreeButtonState
import { SKILLS } from './skills.js'; // Import SKILLS for initial skill setup
import { transitionMap } from './map.js';
import { addEventListeners } from './eventHandlers.js';
import { startGameLoop } from './gameLoop.js'; // 게임 루프 추가
import { gameCanvas } from './domElements.js';
import { BIOMES } from './constants.js'; // Import BIOMES
import { forestTiles, iceTiles, caveTiles, volcanicTiles } from './tiles.js'; // Import all tile sets

// Map biome key to actual tile set object for initial load
const TILESETS_MAP = {
    FOREST: forestTiles,
    ICE: iceTiles,
    CAVE: caveTiles,
    VOLCANO: volcanicTiles,
};

window.onload = () => {
    initUI();

    gameCanvas.width = 850;
    gameCanvas.height = 850;
    
    addEventListeners();
    
    // Determine the initial biome (e.g., always FOREST for the first map)
    const initialBiomeKey = 'FOREST'; 
    gameState.currentBiome = initialBiomeKey; // Set initial biome in gameState
    const initialActiveTileSet = TILESETS_MAP[initialBiomeKey]; // Get the corresponding tile set object

    preloadGameAssets(initialActiveTileSet) // Pass the activeTileSet for initial load
        .then(() => {
            console.log("All game assets loaded. Starting game...");
            console.log("Tile Image Cache state:", tileImageCache);
            for(let i=0; i<3; i++) gameState.playerStats.inventory.push(generateRandomItem(1, 0, 'common'));
            recalculateDerivedStats();
            gameState.playerStats.base.hp = gameState.playerStats.derived.maxHp;
            gameState.playerStats.base.mp = gameState.playerStats.derived.maxMp;

            // Initial player skill setup is now handled in gameState.js
            // gameState.playerStats.base.learnedSkills[SKILLS.powerStrike.id] = 1; // Not needed if already in gameState.js

            
            updateStatusDisplay();
            updateSkillTreeButtonState(); // Initial call to update skill button state
            transitionMap('initial');
            drawGame(); // Initial draw after map generation and transition
            startGameLoop(); // 게임 루프 시작
        })
        .catch(error => {
            console.error("Failed to load game assets:", error);
        });
};
