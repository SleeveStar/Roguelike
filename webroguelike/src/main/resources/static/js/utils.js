// utils.js
import { TILE_SIZE } from './constants.js';
import { gameState } from './gameState.js';
import { getCurrentActiveTileSet } from './imageLoader.js';

/* =========================================================
   맵 검증/복구 유틸 (추천: generateMap 직후 1회 호출)
   ========================================================= */

export function validateMapGrid(mapGrid, biomeName = 'UNKNOWN', maxLog = 20) {
    const tileSet = getCurrentActiveTileSet();
    const props = tileSet?.TILE_PROPERTIES;

    if (!mapGrid || mapGrid.length === 0) {
        console.warn(`[MapValidate:${biomeName}] mapGrid is empty or missing.`);
        return { missingName: 0, missingProps: 0 };
    }

    let missingName = 0;
    let missingProps = 0;
    let logged = 0;

    for (let y = 0; y < mapGrid.length; y++) {
        for (let x = 0; x < mapGrid[y].length; x++) {
            const tile = mapGrid[y][x];
            const name = tile?.name;

            if (!name) {
                missingName++;
                if (logged < maxLog) {
                    console.warn(`[MapValidate] tile.name missing at (${x},${y})`, tile);
                    logged++;
                }
                continue;
            }

            if (props && !props[name]) {
                missingProps++;
                if (logged < maxLog) {
                    console.warn(`[MapValidate] TILE_PROPERTIES missing for '${name}' at (${x},${y})`, tile);
                    logged++;
                }
            }
        }
    }

    console.log(`[MapValidate:${biomeName}] missingName=${missingName}, missingProps=${missingProps}`);
    return { missingName, missingProps };
}

export function sanitizeMapGrid(mapGrid) {
    const tileSet = getCurrentActiveTileSet();
    if (!tileSet || !mapGrid || mapGrid.length === 0) return mapGrid;

    const fallbackName =
        tileSet.walkableTileNames?.[0] ||
        Object.keys(tileSet.TILE_PROPERTIES)?.[0];

    if (!fallbackName) return mapGrid;

    for (let y = 0; y < mapGrid.length; y++) {
        for (let x = 0; x < mapGrid[y].length; x++) {
            const tile = mapGrid[y][x];
            if (!tile || !tile.name) {
                mapGrid[y][x] = { name: fallbackName };
            }
        }
    }
    return mapGrid;
}

/* =========================================================
   빈 타일 / 엣지 타일 찾기
   ========================================================= */

export function getRandomEmptyTile(mapGrid) {
    if (!mapGrid) {
        console.error("Map grid is not available to find an empty tile.");
        return { x: 0, y: 0 };
    }

    const activeTileSet = getCurrentActiveTileSet();
    if (!activeTileSet) {
        console.error("No active tile set found. Cannot determine tile properties.");
        return { x: 0, y: 0 };
    }
    const TILE_PROPERTIES = activeTileSet.TILE_PROPERTIES;

    const emptyTiles = [];
    for (let y = 0; y < mapGrid.length; y++) {
        for (let x = 0; x < mapGrid[y].length; x++) {
            const tile = mapGrid[y][x];
            const name = tile?.name;
            if (!name) continue;

            const tileProps = TILE_PROPERTIES[name];
            if (tileProps && tileProps.walkable && tileProps.spawnable) {
                let isOccupied = false;

                const px = x * TILE_SIZE;
                const py = y * TILE_SIZE;

                if (gameState.player.x === px && gameState.player.y === py) isOccupied = true;
                if (gameState.activeMonsters.some(m => m.x === px && m.y === py)) isOccupied = true;
                if (gameState.healingBlocks.some(b => b.x === px && b.y === py)) isOccupied = true;
                if (gameState.wanderingMerchant && gameState.wanderingMerchant.x === px && gameState.wanderingMerchant.y === py) isOccupied = true;
                if (gameState.exitTiles?.some(e => e.x === px && e.y === py)) isOccupied = true;

                if (!isOccupied) {
                    emptyTiles.push({ x: px, y: py });
                }
            }
        }
    }

    if (emptyTiles.length === 0) {
        console.warn("No empty tiles found for spawning.");
        return { x: 1 * TILE_SIZE, y: 1 * TILE_SIZE };
    }

    return emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
}

/**
 * "엣지(inset 적용 라인)"에서 walkable 타일 후보를 찾고,
 * 후보가 없으면 null 반환 (fallback은 상위에서 처리)
 */
export function findWalkableTileOnEdge(mapGrid, edge, inset = 1) {
    if (!mapGrid || mapGrid.length === 0) return null;

    const activeTileSet = getCurrentActiveTileSet();
    const TILE_PROPERTIES = activeTileSet?.TILE_PROPERTIES;
    if (!TILE_PROPERTIES) return null;

    const height = mapGrid.length;
    const width = mapGrid[0].length;

    // inset만큼 안쪽 라인을 edge로 취급
    let startX = inset, startY = inset, endX = width - 1 - inset, endY = height - 1 - inset;

    switch(edge) {
        case 'up':    startY = inset; endY = inset; break;
        case 'down':  startY = height - 1 - inset; endY = height - 1 - inset; break;
        case 'left':  startX = inset; endX = inset; break;
        case 'right': startX = width - 1 - inset; endX = width - 1 - inset; break;
        default: break;
    }

    const candidates = [];
    for (let y = startY; y <= endY; y++) {
        for (let x = startX; x <= endX; x++) {
            const tile = mapGrid[y]?.[x];
            const name = tile?.name;
            if (!name) continue;

            if (TILE_PROPERTIES[name]?.walkable) {
                candidates.push({ x: x * TILE_SIZE, y: y * TILE_SIZE });
            }
        }
    }

    if (candidates.length) {
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    return null;
}

/**
 * inset=1이 막혀있을 수 있으므로 inset을 늘려가며(edge 두께 대응) 찾기
 */
export function findWalkableTileOnEdgeFlexible(mapGrid, edge, maxInset = 4) {
    for (let inset = 1; inset <= maxInset; inset++) {
        const candidate = findWalkableTileOnEdge(mapGrid, edge, inset);
        if (candidate) return { candidate, usedInset: inset };
    }
    return { candidate: null, usedInset: null };
}

/* =========================================================
   A* Pathfinding
   ========================================================= */

export function findPath(start, end, grid) {
    const activeTileSet = getCurrentActiveTileSet();
    if (!activeTileSet) {
        console.error("No active tile set found in findPath. Cannot determine tile properties.");
        return [];
    }
    const TILE_PROPERTIES = activeTileSet.TILE_PROPERTIES;
    const openSet = [];
    const closedSet = [];
    const path = [];
    const gridHeight = grid.length;
    const gridWidth = grid[0].length;

    function AStarNode(x, y, parent = null, g = 0, h = 0) {
        this.x = x;
        this.y = y;
        this.parent = parent;
        this.g = g;
        this.h = h;
        this.f = g + h;
    }

    function heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    const startNode = new AStarNode(start.x, start.y, null, 0, heuristic(start, end));
    openSet.push(startNode);

    while (openSet.length > 0) {
        let lowestIndex = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[lowestIndex].f) {
                lowestIndex = i;
            }
        }
        const currentNode = openSet[lowestIndex];

        if (currentNode.x === end.x && currentNode.y === end.y) {
            let temp = currentNode;
            while (temp.parent) {
                path.unshift({ x: temp.x, y: temp.y });
                temp = temp.parent;
            }
            return path;
        }

        openSet.splice(lowestIndex, 1);
        closedSet.push(currentNode);

        const neighbors = [];
        const { x, y } = currentNode;
        if (x > 0) neighbors.push({ x: x - 1, y: y });
        if (x < gridWidth - 1) neighbors.push({ x: x + 1, y: y });
        if (y > 0) neighbors.push({ x: x, y: y - 1 });
        if (y < gridHeight - 1) neighbors.push({ x: x, y: y + 1 });

        for (const neighborPos of neighbors) {
            const neighborTile = grid[neighborPos.y]?.[neighborPos.x];
            const neighborName = neighborTile?.name;
            if (!neighborName) continue;

            if (!TILE_PROPERTIES[neighborName]?.walkable) continue;
            if (closedSet.some(node => node.x === neighborPos.x && node.y === neighborPos.y)) continue;

            const gScore = currentNode.g + 1;

            const neighborNodeInOpen = openSet.find(node => node.x === neighborPos.x && node.y === neighborPos.y);
            if (!neighborNodeInOpen) {
                const hScore = heuristic(neighborPos, end);
                const newNode = new AStarNode(neighborPos.x, neighborPos.y, currentNode, gScore, hScore);
                openSet.push(newNode);
            } else if (gScore < neighborNodeInOpen.g) {
                neighborNodeInOpen.parent = currentNode;
                neighborNodeInOpen.g = gScore;
                neighborNodeInOpen.f = gScore + neighborNodeInOpen.h;
            }
        }
    }

    return [];
}

/* =========================================================
   "갇힘 방지" 안전 스폰 / 연결 영역 검사
   ========================================================= */

function pxToTile(v) {
    return Math.floor(v / TILE_SIZE);
}

function tileToPx(v) {
    return v * TILE_SIZE;
}

function inBounds(grid, tx, ty) {
    return ty >= 0 && ty < grid.length && tx >= 0 && tx < grid[0].length;
}

function isWalkableTile(mapGrid, tx, ty, TILE_PROPERTIES) {
    if (!inBounds(mapGrid, tx, ty)) return false;
    const tile = mapGrid[ty][tx];
    const name = tile?.name;
    if (!name) return false;
    return !!TILE_PROPERTIES[name]?.walkable;
}

export function countReachableWalkableTiles(mapGrid, startPx, maxCount = Infinity) {
    if (!mapGrid || mapGrid.length === 0) return 0;

    const activeTileSet = getCurrentActiveTileSet();
    if (!activeTileSet) {
        console.error("No active tile set found in countReachableWalkableTiles.");
        return 0;
    }
    const TILE_PROPERTIES = activeTileSet.TILE_PROPERTIES;

    const startTx = pxToTile(startPx.x);
    const startTy = pxToTile(startPx.y);

    if (!isWalkableTile(mapGrid, startTx, startTy, TILE_PROPERTIES)) return 0;

    const q = [{ x: startTx, y: startTy }];
    const visited = new Set([`${startTx},${startTy}`]);
    let count = 0;

    while (q.length > 0) {
        const cur = q.shift();
        count++;
        if (count >= maxCount) return count;

        const dirs = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 },
        ];

        for (const d of dirs) {
            const nx = cur.x + d.dx;
            const ny = cur.y + d.dy;
            const key = `${nx},${ny}`;

            if (visited.has(key)) continue;
            if (!isWalkableTile(mapGrid, nx, ny, TILE_PROPERTIES)) continue;

            visited.add(key);
            q.push({ x: nx, y: ny });
        }
    }

    return count;
}

export function getSafeEmptyTile(mapGrid, options = {}) {
    const {
        minReachableTiles = 20,
        maxTries = 80,
        debugLog = false
    } = options;

    if (!mapGrid || mapGrid.length === 0) {
        console.error("Map grid is not available in getSafeEmptyTile.");
        return { x: tileToPx(1), y: tileToPx(1) };
    }

    for (let i = 0; i < maxTries; i++) {
        const candidate = getRandomEmptyTile(mapGrid);
        const reachable = countReachableWalkableTiles(mapGrid, candidate, minReachableTiles);

        if (reachable >= minReachableTiles) {
            if (debugLog) console.log(`[SafeSpawn] success in ${i + 1} tries (reachable=${reachable})`, candidate);
            return candidate;
        }

        if (debugLog) console.log(`[SafeSpawn] reject (reachable=${reachable})`, candidate);
    }

    console.warn(`[SafeSpawn] Failed to find safe tile after ${maxTries} tries. Falling back to getRandomEmptyTile().`);
    return getRandomEmptyTile(mapGrid);
}

export function findSafeWalkableTileOnEdge(mapGrid, edge, options = {}) {
    const {
        minReachableTiles = 30,
        maxTries = 40,
        debugLog = false,
        maxInset = 4
    } = options;

    if (!mapGrid || mapGrid.length === 0) {
        console.error("Map grid is not available in findSafeWalkableTileOnEdge.");
        return { x: tileToPx(1), y: tileToPx(1) };
    }

    for (let i = 0; i < maxTries; i++) {
        const { candidate, usedInset } = findWalkableTileOnEdgeFlexible(mapGrid, edge, maxInset);

        if (!candidate) {
            // 후보 자체가 없으면(테두리/안쪽 테두리까지 전부 막힘) 여기서 바로 fallback
            console.warn(`No walkable tile found on '${edge}' (inset<=${maxInset}). Fallback to random empty tile.`);
            return getSafeEmptyTile(mapGrid, options);
        }

        const reachable = countReachableWalkableTiles(mapGrid, candidate, minReachableTiles);

        if (reachable >= minReachableTiles) {
            if (debugLog) console.log(`[SafeEdgeSpawn] success in ${i + 1} tries (inset=${usedInset}, reachable=${reachable})`, candidate);
            return candidate;
        }

        if (debugLog) console.log(`[SafeEdgeSpawn] reject (inset=${usedInset}, reachable=${reachable})`, candidate);
    }

    console.warn(`[SafeEdgeSpawn] Failed to find safe edge tile on '${edge}'. Falling back to getSafeEmptyTile().`);
    return getSafeEmptyTile(mapGrid, options);
}
