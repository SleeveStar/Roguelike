// map.js
import { gameState } from './gameState.js';
import {
    TILE_SIZE,
    MONSTER_SPAWN_COUNT,
    HEALING_BLOCK_CHANCE,
    WANDERING_MERCHANT_CHANCE,
    MERCHANT_STOCK_SIZE,
    MERCHANT_ITEMS,
    RARITY_CONFIG,
    BIOMES
} from './constants.js';

import {
    getRandomEmptyTile,
    findWalkableTileOnEdge,
    getSafeEmptyTile,
    findSafeWalkableTileOnEdge
} from './utils.js';

import { generateMonster, generateRandomItem, calculateSellPrice } from './gameLogic.js';
import { generateWfcMap } from './wfc.js';
import { drawGame, logCombatMessage } from './ui.js';
import { gameCanvas } from './domElements.js';
import { forestTiles, iceTiles, caveTiles, volcanicTiles } from './tiles.js';
import { preloadGameAssets, getCurrentActiveTileSet } from './imageLoader.js';

const TILESETS_MAP = {
    FOREST: forestTiles,
    ICE: iceTiles,
    CAVE: caveTiles,
    VOLCANO: volcanicTiles,
};

function pickByWeights(keys, weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;

    for (let i = 0; i < keys.length; i++) {
        r -= weights[i];
        if (r <= 0) return keys[i];
    }
    return keys[keys.length - 1];
}

function chooseNextBiome(biomeKeys, currentBiome, repeatStreak) {
    const BASE_SAME_PROB = 0.70;
    const DECAY_PER_STREAK = 0.10;
    const MIN_SAME_PROB = 0.15;

    if (!currentBiome || !biomeKeys.includes(currentBiome) || biomeKeys.length <= 1) {
        return biomeKeys[Math.floor(Math.random() * biomeKeys.length)];
    }

    const sameProb = Math.max(
        MIN_SAME_PROB,
        BASE_SAME_PROB - (repeatStreak * DECAY_PER_STREAK)
    );

    const otherKeys = biomeKeys.filter(k => k !== currentBiome);
    const otherProbEach = (1 - sameProb) / otherKeys.length;

    const keys = [currentBiome, ...otherKeys];
    const weights = [sameProb, ...otherKeys.map(() => otherProbEach)];

    return pickByWeights(keys, weights);
}

function oppositeEdge(direction) {
    switch (direction) {
        case 'up': return 'down';
        case 'down': return 'up';
        case 'left': return 'right';
        case 'right': return 'left';
        default: return null;
    }
}

/**
 * (기존) 출구 고정 저장 - 유지
 */
function buildAndStoreMapExits(mapGrid) {
    const SAFE_OPTS = { minReachableTiles: 20, maxTries: 30 };

    const pickEdge = (edge) => {
        if (typeof findSafeWalkableTileOnEdge === 'function') {
            return findSafeWalkableTileOnEdge(mapGrid, edge, SAFE_OPTS);
        }
        return findWalkableTileOnEdge(mapGrid, edge);
    };

    const exits = {
        up: pickEdge('up'),
        down: pickEdge('down'),
        left: pickEdge('left'),
        right: pickEdge('right'),
    };

    gameState.mapExits = exits;
    gameState.exitTiles = [
        { ...exits.up, id: 'exit_up' },
        { ...exits.down, id: 'exit_down' },
        { ...exits.left, id: 'exit_left' },
        { ...exits.right, id: 'exit_right' },
    ];
}

/**
 * ✅ 핵심 추가:
 * 특정 edge(새 맵의 반대쪽)에서 targetIndex에 가장 가까운 walkable+spawnable 타일을 찾는다.
 * - up/down이면 targetIndex는 x 타일 인덱스
 * - left/right이면 targetIndex는 y 타일 인덱스
 */
function findClosestSpawnableOnEdge(mapGrid, edge, targetIndex) {
    const activeTileSet = getCurrentActiveTileSet?.();
    const TILE_PROPERTIES = activeTileSet?.TILE_PROPERTIES;

    if (!mapGrid || !TILE_PROPERTIES) return null;

    const height = mapGrid.length;
    const width = mapGrid[0].length;

    let candidates = [];

    if (edge === 'up' || edge === 'down') {
        const y = (edge === 'up') ? 0 : (height - 1);
        for (let x = 0; x < width; x++) {
            const tile = mapGrid[y][x];
            const props = tile ? TILE_PROPERTIES[tile.name] : null;
            if (props?.walkable && props?.spawnable) {
                candidates.push({ x, y });
            }
        }
        if (candidates.length === 0) return null;

        candidates.sort((a, b) => Math.abs(a.x - targetIndex) - Math.abs(b.x - targetIndex));
        const best = candidates[0];
        return { x: best.x * TILE_SIZE, y: best.y * TILE_SIZE };
    }

    if (edge === 'left' || edge === 'right') {
        const x = (edge === 'left') ? 0 : (width - 1);
        for (let y = 0; y < height; y++) {
            const tile = mapGrid[y][x];
            const props = tile ? TILE_PROPERTIES[tile.name] : null;
            if (props?.walkable && props?.spawnable) {
                candidates.push({ x, y });
            }
        }
        if (candidates.length === 0) return null;

        candidates.sort((a, b) => Math.abs(a.y - targetIndex) - Math.abs(b.y - targetIndex));
        const best = candidates[0];
        return { x: best.x * TILE_SIZE, y: best.y * TILE_SIZE };
    }

    return null;
}

export async function generateMap() {
    const gridWidth = gameCanvas.width / TILE_SIZE;
    const gridHeight = gameCanvas.height / TILE_SIZE;

    const biomeKeys = Object.keys(BIOMES);

    const nextBiomeKey = chooseNextBiome(
        biomeKeys,
        gameState.currentBiome,
        gameState.biomeRepeatStreak || 0
    );

    if (nextBiomeKey === gameState.currentBiome) {
        gameState.biomeRepeatStreak = (gameState.biomeRepeatStreak || 0) + 1;
    } else {
        gameState.biomeRepeatStreak = 0;
    }

    gameState.currentBiome = nextBiomeKey;
    const activeTileSet = TILESETS_MAP[nextBiomeKey];

    await preloadGameAssets(activeTileSet);

    gameState.mapGrid = generateWfcMap(gridWidth, gridHeight, activeTileSet);

    gameState.activeMonsters = [];
    gameState.healingBlocks = [];
    gameState.wanderingMerchant = null;

    if (gameState.mapGrid) {
        buildAndStoreMapExits(gameState.mapGrid);
    } else {
        gameState.mapExits = { up: null, down: null, left: null, right: null };
        gameState.exitTiles = [];
    }

    if (gameState.mapGrid) {
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
                const merchantMagicFind = 150 + (playerLevel * 10);

                let desiredRarity = 'uncommon';
                const rarityRoll = Math.random();
                if (rarityRoll < 0.15) {
                    desiredRarity = 'unique';
                } else if (rarityRoll < 0.5) {
                    desiredRarity = 'rare';
                }

                const item = generateRandomItem(playerLevel, merchantMagicFind, desiredRarity);
                item.price = Math.max(
                    50,
                    calculateSellPrice(item) * 2 + Math.floor(Math.random() * 100)
                );
                merchantStock.push(item);
            }
            gameState.wanderingMerchant = { x, y, id: 'merchant', stock: merchantStock };
        }
    }

    drawGame();
}

export async function transitionMap(direction) {
    if (direction !== 'stay') {
        logCombatMessage(`Transitioning map...`);

        // ✅ 전환 "직전"에 플레이어가 어디로 나갔는지 anchor 저장
        // up/down이면 x를, left/right이면 y를 유지시키는 방식
        const anchorX = Math.floor(gameState.player.x / TILE_SIZE);
        const anchorY = Math.floor(gameState.player.y / TILE_SIZE);

        await generateMap();

        const SAFE_SPAWN_OPTIONS = { minReachableTiles: 20, maxTries: 30 };

        let newPos;

        if (direction === 'initial') {
            newPos = getSafeEmptyTile(gameState.mapGrid, SAFE_SPAWN_OPTIONS);
        } else {
            const entryEdge = oppositeEdge(direction);

            // ✅ 핵심: 나간 위치(anchor)에 맞춰, 반대쪽 edge에서 가장 가까운 타일로 입장
            let targetIndex = 0;
            if (entryEdge === 'up' || entryEdge === 'down') {
                targetIndex = anchorX; // x 유지
            } else {
                targetIndex = anchorY; // y 유지
            }

            newPos = findClosestSpawnableOnEdge(gameState.mapGrid, entryEdge, targetIndex);

            // fallback
            if (!newPos) {
                // 그래도 안 나오면 기존 방식(안전 엣지)로 fallback
                if (typeof findSafeWalkableTileOnEdge === 'function') {
                    newPos = findSafeWalkableTileOnEdge(gameState.mapGrid, entryEdge, SAFE_SPAWN_OPTIONS);
                } else {
                    newPos = findWalkableTileOnEdge(gameState.mapGrid, entryEdge);
                }
            }
        }

        gameState.player.x = newPos.x;
        gameState.player.y = newPos.y;
    }

    drawGame();
}
