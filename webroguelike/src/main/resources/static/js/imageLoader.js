// imageLoader.js
import {
    PLAYER_IMAGE_PATH,
    GOLD_ICON_PATH,
    HEALING_BLOCK_IMAGE_PATH,
    MONSTER_TYPES,
    BIOMES // Import BIOMES to get base colors
} from './constants.js';

export let playerImage = new Image();
export let goldIconImage = new Image();
export let healingBlockImage = new Image();
export const monsterImageCache = {};
export const tileImageCache = {};

// Cache for biome-specific tile sets (activeTileSet passed to preloadGameAssets)
let currentActiveTileSet = null;

export function preloadGameAssets(activeTileSet) {
    return new Promise((resolve, reject) => {
        currentActiveTileSet = activeTileSet; // Store the active tile set

        // Clear existing caches
        Object.keys(monsterImageCache).forEach(key => delete monsterImageCache[key]);
        Object.keys(tileImageCache).forEach(key => delete tileImageCache[key]);

        
        let imagesToLoadCount = 0;

        // Count images that actually have a path
        Object.keys(activeTileSet.TILE_PROPERTIES).forEach(tileName => {
            const tileProp = activeTileSet.TILE_PROPERTIES[tileName];
            if (tileProp.path) {
                imagesToLoadCount++;
            }
        });
        
        // +3 for player, gold icon, healing block
        let totalToLoad = MONSTER_TYPES.length + imagesToLoadCount + 3;

        if (totalToLoad === 0) {
            resolve(); // No images to load, resolve immediately
            return;
        }

        let loadedCount = 0; // Initialize loadedCount after totalToLoad is calculated

        const imageLoadHandler = (e) => {
            // Check if the image is actually usable after loading
            if (e.target.naturalHeight === 0) {
                console.error(`Image loaded but is not usable (naturalHeight is 0): ${e.target.src}`);
            } else {
                // console.log(`Image loaded successfully: ${e.target.src}`); // Can be verbose
            }
            loadedCount++;
            if (loadedCount === totalToLoad) {
                console.log("All game assets loaded.");
                resolve();
            }
        };

        const imageErrorHandler = (e) => {
            console.error(`Error loading image: ${e.target.src}, Type: ${e.type}`);
            loadedCount++; // Still count as loaded to avoid blocking, but log error
            if (loadedCount === totalToLoad) {
                console.log("All game assets loaded with some errors.");
                resolve();
            }
        };

        // Load Player Image
        playerImage.onload = imageLoadHandler;
        playerImage.onerror = imageErrorHandler;
        playerImage.src = PLAYER_IMAGE_PATH;

        // Load Gold Icon
        goldIconImage.onload = imageLoadHandler;
        goldIconImage.onerror = imageErrorHandler;
        goldIconImage.src = GOLD_ICON_PATH;

        // Load Healing Block Image
        healingBlockImage.onload = imageLoadHandler;
        healingBlockImage.onerror = imageErrorHandler;
        healingBlockImage.src = HEALING_BLOCK_IMAGE_PATH;

        // Load Tile Images for the active biome
        Object.keys(activeTileSet.TILE_PROPERTIES).forEach(tileName => {
            const tileProp = activeTileSet.TILE_PROPERTIES[tileName];
            if (tileProp.path) { // Only load image if path is defined
                const img = new Image();
                const path = tileProp.path;
                img.onload = imageLoadHandler;
                img.onerror = imageErrorHandler;
                img.src = path;
                // 호스팅버전
                // img.src = new URL(`../img/${tileName}.png`, import.meta.url).href;
                tileImageCache[tileName] = img; // Use tileName as key
            } else {
                // If no path, it's a color-only tile, increment loadedCount immediately
                // and store null in cache, or handle as needed by rendering logic
                tileImageCache[tileName] = null; // Mark as loaded, but no image object
                loadedCount++; // This tile doesn't require an image to load
            }
        });

        // Load Monster Images (always load all, filtering will happen during generation)
        MONSTER_TYPES.forEach(monsterInfo => {
            const img = new Image();
            const monsterName = monsterInfo.name;
            const path = `/img/${monsterName}.png`; // Monsters are still in root /img/
            img.onload = imageLoadHandler; // Directly assign imageLoadHandler
            img.onerror = imageErrorHandler;
            img.src = path;
            // 호스팅버전
            // img.src = new URL(`../img/${monsterName}.png`, import.meta.url).href;

            monsterImageCache[monsterName] = img;
        });
    });
}

// Export currentActiveTileSet for external use (e.g., UI for getting base color)
export function getCurrentActiveTileSet() {
    return currentActiveTileSet;
}


