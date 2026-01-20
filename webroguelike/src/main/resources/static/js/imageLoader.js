// imageLoader.js
import {
    PLAYER_IMAGE_PATH,
    GOLD_ICON_PATH,
    HEALING_BLOCK_IMAGE_PATH,
    MONSTER_TYPES
} from './constants.js';
import { TILE_TYPES } from './tiles.js';

export let playerImage = new Image();
export let goldIconImage = new Image();
export let healingBlockImage = new Image();
export const monsterImageCache = {};
export const tileImageCache = {};

export function preloadGameAssets() {
    return new Promise((resolve, reject) => {
        const tileTypes = Object.values(TILE_TYPES);
        let loadedCount = 0;
        let totalToLoad = MONSTER_TYPES.length + tileTypes.length + 3; // +3 for player, gold icon, healing block

        if (totalToLoad === 0) {
            resolve(); // No images to load, resolve immediately
            return;
        }

        const imageLoadHandler = () => {
            loadedCount++;
            if (loadedCount === totalToLoad) {
                console.log("All game assets loaded.");
                resolve();
            }
        };

        const imageErrorHandler = (e) => {
            console.error(`Error loading image: ${e.target.src}`);
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

        // Load Tile Images
        tileTypes.forEach(tileName => {
            const img = new Image();
            const path = `/img/${tileName}.png`;
            img.onload = imageLoadHandler;
            img.onerror = imageErrorHandler;
            img.src = path;
            tileImageCache[tileName] = img;
        });

        // 호스팅버전
        // tileTypes.forEach(tileName => {
        //     const img = new Image();
        //     img.onload = imageLoadHandler;
        //     img.onerror = imageErrorHandler;
        //     img.src = new URL(`../img/${tileName}.png`, import.meta.url).href;
        //     tileImageCache[tileName] = img;
        // });

        // Load Monster Images
        MONSTER_TYPES.forEach(monsterInfo => {
            const img = new Image();
            const monsterName = monsterInfo.name;
            const path = `/img/${monsterName}.png`;
            img.onload = () => {
                console.log(`${monsterName}.png loaded successfully.`);
                imageLoadHandler();
            };
            img.onerror = imageErrorHandler;
            img.src = path;
            monsterImageCache[monsterName] = img;
        });

        // 호스팅버전
        // MONSTER_TYPES.forEach(monsterInfo => {
        //     const img = new Image();
        //     const monsterName = monsterInfo.name;
        //     img.onload = () => {
        //         console.log(`${monsterName}.png loaded successfully.`);
        //         imageLoadHandler();
        //     };
        //     img.onerror = imageErrorHandler;
        //     img.src = new URL(`../img/${monsterName}.png`, import.meta.url).href;
        //     monsterImageCache[monsterName] = img;
        // });
    });
}
