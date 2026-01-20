// utils.js
import { gameState } from './gameState.js';
import { TILE_SIZE } from './constants.js';
import { TILE_PROPERTIES } from './tiles.js';

export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomEmptyTile(mapGrid) {
    let x, y, found = false;
    let attempts = 0; // Prevent infinite loops
    while (!found && attempts < 1000) {
        const gridX = Math.floor(Math.random() * (gameCanvas.width / TILE_SIZE));
        const gridY = Math.floor(Math.random() * (gameCanvas.height / TILE_SIZE));
        x = gridX * TILE_SIZE;
        y = gridY * TILE_SIZE;

        // Check tile properties first
        const tile = mapGrid[gridY][gridX];
        if (!tile || !TILE_PROPERTIES[tile.name] || !TILE_PROPERTIES[tile.name].spawnable) {
            attempts++;
            continue;
        }

        if (x === gameState.player.x && y === gameState.player.y) continue;
        if (gameState.activeMonsters.some(m => m.x === x && m.y === y)) continue;
        if (gameState.healingBlocks.some(b => b.x === x && b.y === y)) continue;
        if (gameState.wanderingMerchant && gameState.wanderingMerchant.x === x && gameState.wanderingMerchant.y === y) continue;
        
        found = true;
    }
    if (!found) {
        console.error("Could not find a spawnable empty tile after 1000 attempts.");
        return { x: 0, y: 0 }; // Fallback
    }
    return { x, y };
}

export function calculateExperienceToNextLevel(level) {
    return level * 100 + 50;
}

export function findWalkableTileOnEdge(mapGrid, edge) {
    const gridHeight = mapGrid.length;
    const gridWidth = mapGrid[0].length;
    let tile = null;

    if (edge === 'up' || edge === 'down') {
        const y = (edge === 'up') ? 0 : gridHeight - 1;
        for (let x = 0; x < gridWidth; x++) {
            tile = mapGrid[y][x];
            if (tile && TILE_PROPERTIES[tile.name]?.walkable) {
                return { x: x * TILE_SIZE, y: y * TILE_SIZE };
            }
        }
    } else if (edge === 'left' || edge === 'right') {
        const x = (edge === 'left') ? 0 : gridWidth - 1;
        for (let y = 0; y < gridHeight; y++) {
            tile = mapGrid[y][x];
            if (tile && TILE_PROPERTIES[tile.name]?.walkable) {
                return { x: x * TILE_SIZE, y: y * TILE_SIZE };
            }
        }
    }

    console.warn(`No walkable tile found on edge: ${edge}. Placing player on random empty tile.`);
    return getRandomEmptyTile(mapGrid);
}

// A* Pathfinding implementation
export function findPath(start, end, grid) {
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
