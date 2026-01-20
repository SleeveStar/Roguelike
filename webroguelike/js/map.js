// map.js
import { gameState } from './gameState.js';
import { TILE_SIZE, MONSTER_SPAWN_COUNT, HEALING_BLOCK_CHANCE, WANDERING_MERCHANT_CHANCE, MERCHANT_STOCK_SIZE, MERCHANT_ITEMS, RARITY_CONFIG } from './constants.js';
import { getRandomEmptyTile, findWalkableTileOnEdge } from './utils.js';
import { generateMonster, generateRandomItem, calculateSellPrice } from './gameLogic.js';
import { generateWfcMap } from './wfc.js';
import { drawGame, logCombatMessage } from './ui.js';
import { gameCanvas } from './domElements.js';

export function generateMap() {
    const gridWidth = gameCanvas.width / TILE_SIZE;
    const gridHeight = gameCanvas.height / TILE_SIZE;
    gameState.mapGrid = generateWfcMap(gridWidth, gridHeight);

    gameState.activeMonsters = [];
    gameState.healingBlocks = [];
    gameState.wanderingMerchant = null;

    if (gameState.mapGrid) { // Ensure mapGrid exists before spawning
        for (let i = 0; i < MONSTER_SPAWN_COUNT; i++) generateMonster(gameState.mapGrid);
    }
    
    const tileCount = (gameCanvas.width / TILE_SIZE) * (gameCanvas.height / TILE_SIZE);
    for (let i = 0; i < tileCount * 0.05; i++) {
        if (Math.random() < HEALING_BLOCK_CHANCE) {
            const { x, y } = getRandomEmptyTile(gameState.mapGrid);
            gameState.healingBlocks.push({ x, y, id: Date.now() + Math.random() });
        }
        if (!gameState.wanderingMerchant && Math.random() < WANDERING_MERCHANT_CHANCE) {
            const { x, y } = getRandomEmptyTile(gameState.mapGrid);
            const merchantStock = [];
            MERCHANT_ITEMS.forEach(item => merchantStock.push({ ...item })); 

            const playerLevel = gameState.playerStats.base.level;
            for (let j = merchantStock.length; j < MERCHANT_STOCK_SIZE; j++) {
                // Give the merchant a high magic find bonus to generate better items
                const merchantMagicFind = 150 + (playerLevel * 10); 
                
                // Determine a desired rarity with a weighted chance
                let desiredRarity = 'uncommon';
                const rarityRoll = Math.random();
                if (rarityRoll < 0.15) { // 15% chance for Unique or better
                    desiredRarity = 'unique';
                } else if (rarityRoll < 0.5) { // 35% chance for Rare (total 50%)
                    desiredRarity = 'rare';
                }

                const item = generateRandomItem(playerLevel, merchantMagicFind, desiredRarity);
                item.price = Math.max(50, calculateSellPrice(item) * 2 + Math.floor(Math.random() * 100)); // Increased price variance
                merchantStock.push(item);
            }
            gameState.wanderingMerchant = { x, y, id: 'merchant', stock: merchantStock };
        }
    }
    drawGame();
}

export function transitionMap(direction) {
    if (direction !== 'stay') { // Only generate a new map if actually transitioning to a new map
        logCombatMessage(`Transitioning map...`);
        generateMap(); 
        
        let newPos;
        if (direction === 'initial') {
            newPos = getRandomEmptyTile(gameState.mapGrid);
        } else {
            switch (direction) {
                case 'up': 
                    newPos = findWalkableTileOnEdge(gameState.mapGrid, 'down');
                    break;
                case 'down': 
                    newPos = findWalkableTileOnEdge(gameState.mapGrid, 'up');
                    break;
                case 'left': 
                    newPos = findWalkableTileOnEdge(gameState.mapGrid, 'right');
                    break;
                case 'right': 
                    newPos = findWalkableTileOnEdge(gameState.mapGrid, 'left');
                    break;
            }
        }
        gameState.player.x = newPos.x;
        gameState.player.y = newPos.y;
    }
    // If direction is 'stay' (or any other case where map generation is not needed), just redraw
    drawGame();
}
