// main.js
import { gameState } from './gameState.js';
import { preloadGameAssets, tileImageCache } from './imageLoader.js';
import { recalculateDerivedStats, gainExperience, generateRandomItem } from './gameLogic.js';
import { updateStatusDisplay, initUI, drawGame } from './ui.js'; // Import drawGame
import { transitionMap } from './map.js';
import { addEventListeners } from './eventHandlers.js';
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

    gameCanvas.width = 800;
    gameCanvas.height = 800;
    
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

            updateStatusDisplay();
            transitionMap('initial');
            drawGame(); // Initial draw after map generation and transition
        })
        .catch(error => {
            console.error("Failed to load game assets:", error);
        });
};
