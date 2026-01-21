// utils.js
import { TILE_SIZE } from './constants.js';
import { gameState } from './gameState.js';
import { getCurrentActiveTileSet } from './imageLoader.js'; // Import getter for active tile set

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
            const tileProps = TILE_PROPERTIES[tile.name];
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

export function findWalkableTileOnEdge(mapGrid, edge) {
    if (!mapGrid || mapGrid.length === 0) {
        console.error("Map grid is not available to find a tile on edge.");
        return { x: 0, y: 0 };
    }

    const activeTileSet = getCurrentActiveTileSet();
    if (!activeTileSet) {
        console.error("No active tile set found. Cannot determine tile properties.");
        return { x: 0, y: 0 };
    }
    const TILE_PROPERTIES = activeTileSet.TILE_PROPERTIES;

    const walkableEdgeTiles = [];
    const height = mapGrid.length;
    const width = mapGrid[0].length;

    let startX = 0, startY = 0, endX = width - 1, endY = height - 1;
    switch(edge) {
        case 'up': startY = 0; endY = 0; break;
        case 'down': startY = height - 1; endY = height - 1; break;
        case 'left': startX = 0; endX = 0; break;
        case 'right': startX = width - 1; endX = width - 1; break;
    }

    for (let y = startY; y <= endY; y++) {
        for (let x = startX; x <= endX; x++) {
            const tile = mapGrid[y][x];
            if (tile && TILE_PROPERTIES[tile.name]?.walkable) {
                walkableEdgeTiles.push({ x: x * TILE_SIZE, y: y * TILE_SIZE });
            }
        }
    }

    if (walkableEdgeTiles.length > 0) {
        return walkableEdgeTiles[Math.floor(Math.random() * walkableEdgeTiles.length)];
    }

    console.warn(`No walkable tile found on the '${edge}' edge. Returning a random empty tile as fallback.`);
    return getRandomEmptyTile(mapGrid);
}

// A* Pathfinding implementation
export function findPath(start, end, grid) {
    const activeTileSet = getCurrentActiveTileSet();
    if (!activeTileSet) {
        console.error("No active tile set found in findPath. Cannot determine tile properties.");
        return []; // Return empty path if no tile set
    }
    const TILE_PROPERTIES = activeTileSet.TILE_PROPERTIES;
    const openSet = [];
    const closedSet = [];
    const path = [];
    const gridHeight = grid.length;
    const gridWidth = grid[0].length;

    // Helper to create a node for the A* algorithm
    function AStarNode(x, y, parent = null, g = 0, h = 0) {
        this.x = x;
        this.y = y;
        this.parent = parent;
        this.g = g; // Cost from start
        this.h = h; // Heuristic cost to end
        this.f = g + h; // Total cost
    }

    // Heuristic function (Manhattan distance)
    function heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    const startNode = new AStarNode(start.x, start.y, null, 0, heuristic(start, end));
    openSet.push(startNode);

    while (openSet.length > 0) {
        // Find the node with the lowest f cost in the open set
        let lowestIndex = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[lowestIndex].f) {
                lowestIndex = i;
            }
        }
        const currentNode = openSet[lowestIndex];

        // If we've reached the end, reconstruct the path
        if (currentNode.x === end.x && currentNode.y === end.y) {
            let temp = currentNode;
            while (temp.parent) {
                path.unshift({ x: temp.x, y: temp.y });
                temp = temp.parent;
            }
            return path;
        }

        // Move current node from open to closed set
        openSet.splice(lowestIndex, 1);
        closedSet.push(currentNode);

        // Get neighbors
        const neighbors = [];
        const { x, y } = currentNode;
        if (x > 0) neighbors.push({ x: x - 1, y: y });
        if (x < gridWidth - 1) neighbors.push({ x: x + 1, y: y });
        if (y > 0) neighbors.push({ x: x, y: y - 1 });
        if (y < gridHeight - 1) neighbors.push({ x: x, y: y + 1 });

        for (const neighborPos of neighbors) {
            const neighborTile = grid[neighborPos.y][neighborPos.x];
            // Check if walkable and not in closed set
            if (!TILE_PROPERTIES[neighborTile.name]?.walkable || closedSet.some(node => node.x === neighborPos.x && node.y === neighborPos.y)) {
                continue;
            }

            const gScore = currentNode.g + 1;
            let gScoreIsBest = false;

            const neighborNodeInOpen = openSet.find(node => node.x === neighborPos.x && node.y === neighborPos.y);
            if (!neighborNodeInOpen) {
                gScoreIsBest = true;
                const hScore = heuristic(neighborPos, end);
                const newNode = new AStarNode(neighborPos.x, neighborPos.y, currentNode, gScore, hScore);
                openSet.push(newNode);
            } else if (gScore < neighborNodeInOpen.g) {
                gScoreIsBest = true;
                neighborNodeInOpen.parent = currentNode;
                neighborNodeInOpen.g = gScore;
                neighborNodeInOpen.f = gScore + neighborNodeInOpen.h;
            }
        }
    }

    // No path found
    return [];
}

/* =========================================================
   추가 기능: "갇힘 방지" 안전 스폰 / 연결 영역 검사 (기존 코드 유지)
   ========================================================= */

/**
 * 픽셀 좌표 -> 타일 인덱스
 */
function pxToTile(v) {
    return Math.floor(v / TILE_SIZE);
}

/**
 * 타일 인덱스 -> 픽셀 좌표
 */
function tileToPx(v) {
    return v * TILE_SIZE;
}

function inBounds(grid, tx, ty) {
    return ty >= 0 && ty < grid.length && tx >= 0 && tx < grid[0].length;
}

/**
 * 이동 가능(walkable) 여부만 확인 (spawnable은 이동과 무관)
 */
function isWalkableTile(mapGrid, tx, ty, TILE_PROPERTIES) {
    if (!inBounds(mapGrid, tx, ty)) return false;
    const tile = mapGrid[ty][tx];
    if (!tile) return false;
    return !!TILE_PROPERTIES[tile.name]?.walkable;
}

/**
 * 시작 지점(픽셀 좌표)에서 BFS로 도달 가능한 walkable 타일 수를 계산합니다.
 * 성능을 위해 maxCount 이상이면 조기 종료합니다.
 */
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

/**
 * "갇힘 방지" 스폰:
 * getRandomEmptyTile()로 뽑은 타일이 너무 작은 섬(이동 가능 영역이 작음)이면 다시 뽑습니다.
 *
 * @param {Array<Array<any>>} mapGrid
 * @param {Object} options
 * @param {number} options.minReachableTiles - 이 수 이상 이동 가능한 영역이어야 통과
 * @param {number} options.maxTries - 재시도 횟수
 * @param {boolean} options.debugLog - 디버그 로그
 */
export function getSafeEmptyTile(mapGrid, options = {}) {
    const {
        minReachableTiles = 30,
        maxTries = 80,
        debugLog = false
    } = options;

    // mapGrid / tileset 체크는 내부 함수들이 하고 있지만, 여기서도 가드
    if (!mapGrid || mapGrid.length === 0) {
        console.error("Map grid is not available in getSafeEmptyTile.");
        return { x: tileToPx(1), y: tileToPx(1) };
    }

    for (let i = 0; i < maxTries; i++) {
        const candidate = getRandomEmptyTile(mapGrid); // 기존 로직 그대로 활용(점유체크 포함)

        // candidate에서 reachable 계산 (minReachableTiles에 도달하면 조기 종료로 빠르게)
        const reachable = countReachableWalkableTiles(mapGrid, candidate, minReachableTiles);

        if (reachable >= minReachableTiles) {
            if (debugLog) console.log(`[SafeSpawn] success in ${i + 1} tries (reachable=${reachable})`, candidate);
            return candidate;
        }

        if (debugLog) console.log(`[SafeSpawn] reject (reachable=${reachable})`, candidate);
    }

    // 여기까지 왔다면 "조건 만족"을 못 찾은 것
    // 그래도 게임이 멈추지 않게 기본 랜덤을 반환
    console.warn(`[SafeSpawn] Failed to find safe tile after ${maxTries} tries. Falling back to getRandomEmptyTile().`);
    return getRandomEmptyTile(mapGrid);
}

/**
 * 엣지 스폰도 갇힘이 생길 수 있어서,
 * findWalkableTileOnEdge 결과가 "작은 섬"이면 안전 타일로 대체하는 헬퍼
 */
export function findSafeWalkableTileOnEdge(mapGrid, edge, options = {}) {
    const {
        minReachableTiles = 30,
        maxTries = 40,
        debugLog = false
    } = options;

    if (!mapGrid || mapGrid.length === 0) {
        console.error("Map grid is not available in findSafeWalkableTileOnEdge.");
        return { x: tileToPx(1), y: tileToPx(1) };
    }

    // 엣지 후보를 여러 번 뽑아서 검사
    for (let i = 0; i < maxTries; i++) {
        const candidate = findWalkableTileOnEdge(mapGrid, edge);
        const reachable = countReachableWalkableTiles(mapGrid, candidate, minReachableTiles);

        if (reachable >= minReachableTiles) {
            if (debugLog) console.log(`[SafeEdgeSpawn] success in ${i + 1} tries (reachable=${reachable})`, candidate);
            return candidate;
        }
        if (debugLog) console.log(`[SafeEdgeSpawn] reject (reachable=${reachable})`, candidate);
    }

    // 엣지도 실패하면 안전 랜덤 타일로 대체
    console.warn(`[SafeEdgeSpawn] Failed to find safe edge tile on '${edge}'. Falling back to getSafeEmptyTile().`);
    return getSafeEmptyTile(mapGrid, options);
}
