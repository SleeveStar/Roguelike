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
    findSafeWalkableTileOnEdge,
    sanitizeMapGrid,
    validateMapGrid
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

    // ======================================================
    // ✅ FOREST 전용 reroll: "도배/올바닥/거의 올워크" 맵이면 재생성
    // ======================================================
    const MAX_REROLL_TRIES = 10;
    let finalGrid = null;
    let lastStats = null;

    for (let attempt = 1; attempt <= MAX_REROLL_TRIES; attempt++) {
        const candidateGrid = generateWfcMap(gridWidth, gridHeight, activeTileSet);

        if (!candidateGrid) {
            console.warn(`[WFC] generateWfcMap returned null/undefined (attempt ${attempt}/${MAX_REROLL_TRIES})`);
            continue;
        }

        // 생성 직후 sanitize/validate (이후 로직과 동일한 조건에서 판단하기 위해)
        sanitizeMapGrid(candidateGrid);

        const stats = analyzeMapGridForReroll(candidateGrid, activeTileSet);
        lastStats = stats;

        // 디버그(원하면 주석 처리)
        // console.log(`[RerollStats:${gameState.currentBiome}] attempt=${attempt}`, stats);

        // FOREST만 품질 검사해서 reroll
        if (gameState.currentBiome === 'FOREST') {
            if (shouldRerollForestMap(stats)) {
                console.warn(
                    `[WFC REROLL:FOREST] attempt ${attempt}/${MAX_REROLL_TRIES} rejected ` +
                    `(walkable=${stats.walkable}/${stats.total}=${stats.walkableRatio.toFixed(3)}, ` +
                    `dominant=${stats.dominantTile}:${stats.dominantCount}=${stats.dominantRatio.toFixed(3)}, ` +
                    `unique=${stats.unique})`
                );
                continue;
            }
        }

        // 통과
        finalGrid = candidateGrid;
        break;
    }

    // 최종 grid 결정 (끝까지 실패해도 마지막 후보를 쓰되 경고)
    if (!finalGrid) {
        console.warn(
            `[WFC] Failed to generate acceptable map after ${MAX_REROLL_TRIES} tries. ` +
            `Using last candidate. lastStats=${lastStats ? JSON.stringify(lastStats) : 'null'}`
        );
        // 마지막 시도에서 candidateGrid가 null일 수도 있으니 안전하게 한번 더 생성
        finalGrid = generateWfcMap(gridWidth, gridHeight, activeTileSet);
        if (finalGrid) sanitizeMapGrid(finalGrid);
    }

    gameState.mapGrid = finalGrid;

    // 여기서 한 번 더 검증 로그
    if (gameState.mapGrid) {
        validateMapGrid(gameState.mapGrid, gameState.currentBiome);
    }

    // ======================================================
    // 기존 로직 그대로
    // ======================================================
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


function analyzeMapGridForReroll(mapGrid, tileSet) {
    const props = tileSet?.TILE_PROPERTIES;
    if (!mapGrid || !props) {
        return {
            total: 0,
            walkable: 0,
            nonWalkable: 0,
            unique: 0,
            dominantTile: null,
            dominantCount: 0,
            dominantRatio: 0,
            walkableRatio: 0
        };
    }

    const counts = new Map();
    let total = 0;
    let walkable = 0;

    for (let y = 0; y < mapGrid.length; y++) {
        for (let x = 0; x < mapGrid[y].length; x++) {
            const name = mapGrid[y]?.[x]?.name;
            if (!name) continue;
            total++;

            counts.set(name, (counts.get(name) || 0) + 1);

            const p = props[name];
            if (p?.walkable) walkable++;
        }
    }

    let dominantTile = null;
    let dominantCount = 0;
    for (const [name, c] of counts.entries()) {
        if (c > dominantCount) {
            dominantCount = c;
            dominantTile = name;
        }
    }

    const nonWalkable = total - walkable;
    const dominantRatio = total > 0 ? dominantCount / total : 0;
    const walkableRatio = total > 0 ? walkable / total : 0;

    return {
        total,
        walkable,
        nonWalkable,
        unique: counts.size,
        dominantTile,
        dominantCount,
        dominantRatio,
        walkableRatio
    };
}

function shouldRerollForestMap(stats) {
    // ✅ 튜닝 포인트 (현재는 "바닥 도배/거의 전부 walkable"을 강하게 차단)
    // 정상(예: walkable≈277/394=0.70)은 통과, 문제(예: walkable≈394/394=1.0)는 reroll

    const MAX_WALKABLE_RATIO = 0.86;   // 이것보다 높으면 "너무 텅 빈 숲"으로 간주
    const MAX_DOMINANT_RATIO = 0.90;   // 한 타일이 전체의 92% 이상이면 "도배"로 간주

    // 맵이 너무 작으면 판단이 흔들리니 안전장치
    if (stats.total < 50) return false;

    if (stats.walkableRatio > MAX_WALKABLE_RATIO) return true;
    if (stats.dominantRatio > MAX_DOMINANT_RATIO) return true;

    return false;
}


function debugSpawnableCounts(mapGrid, tileSet, biome) {
    const props = tileSet?.TILE_PROPERTIES;
    if (!mapGrid || !props) return;

    let walkable = 0, spawnable = 0, both = 0;

    for (let y = 0; y < mapGrid.length; y++) {
        for (let x = 0; x < mapGrid[y].length; x++) {
            const name = mapGrid[y]?.[x]?.name;
            const p = name ? props[name] : null;
            if (!p) continue;

            if (p.walkable) walkable++;
            if (p.spawnable) spawnable++;
            if (p.walkable && p.spawnable) both++;
        }
    }

    console.log(`[SpawnCheck:${biome}] walkable=${walkable} spawnable=${spawnable} walkable&spawnable=${both}`);
}

function debugTileHistogram(mapGrid, tileSet, biome) {
    const props = tileSet?.TILE_PROPERTIES;
    if (!mapGrid || !props) return;

    const counts = new Map();
    let nonWalkable = 0;

    for (let y = 0; y < mapGrid.length; y++) {
        for (let x = 0; x < mapGrid[y].length; x++) {
            const name = mapGrid[y]?.[x]?.name;
            if (!name) continue;
            counts.set(name, (counts.get(name) || 0) + 1);

            if (props[name] && props[name].walkable === false) nonWalkable++;
        }
    }

    const top = [...counts.entries()]
        .sort((a,b) => b[1]-a[1])
        .slice(0, 10)
        .map(([k,v]) => `${k}:${v}`)
        .join(', ');

    console.log(`[TileHist:${biome}] unique=${counts.size}, nonWalkable=${nonWalkable}, top=${top}`);
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
