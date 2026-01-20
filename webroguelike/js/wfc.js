// wfc.js
import { TILE_TYPES, ADJACENCY_RULES } from './tiles.js';

/**
 * Initializes a grid for the WFC algorithm.
 * @param {number} width - The width of the grid.
 * @param {number} height - The height of the grid.
 * @returns {Array<Array<Object>>} A 2D array representing the grid, with each cell in superposition.
 */
function initializeGrid(width, height) {
    const grid = [];
    
    // Manually construct the initial options with biases
    const initialOptions = [];
    
    // Field tiles (more frequent)
    for (let i = 0; i < 25; i++) initialOptions.push(TILE_TYPES.FIELD_BASE_NONE); // Increased from 10 to 25
    initialOptions.push(TILE_TYPES.FIELD_BASE_FLOWER);
    initialOptions.push(TILE_TYPES.FIELD_BASE_SEED);

    // Wood tiles (less frequent)
    initialOptions.push(TILE_TYPES.WOOD_1);
    initialOptions.push(TILE_TYPES.WOOD_2);
    initialOptions.push(TILE_TYPES.WOOD_3);
    initialOptions.push(TILE_TYPES.WOOD_4);

    // Lake tiles (to ensure they can form, but not dominate)
    initialOptions.push(TILE_TYPES.LAKE_UL);
    initialOptions.push(TILE_TYPES.LAKE_UM);
    initialOptions.push(TILE_TYPES.LAKE_UR);
    initialOptions.push(TILE_TYPES.LAKE_ML);
    initialOptions.push(TILE_TYPES.LAKE_MM);
    initialOptions.push(TILE_TYPES.LAKE_MR);
    initialOptions.push(TILE_TYPES.LAKE_DL);
    initialOptions.push(TILE_TYPES.LAKE_DM);
    initialOptions.push(TILE_TYPES.LAKE_DR);

    for (let y = 0; y < height; y++) {
        grid[y] = [];
        for (let x = 0; x < width; x++) {
            grid[y][x] = {
                x,
                y,
                collapsed: false,
                options: [...initialOptions], // Start with biased possible tiles
            };
        }
    }
    return grid;
}

/**
 * Finds the cell(s) with the minimum number of options (lowest entropy).
 * @param {Array<Array<Object>>} grid - The WFC grid.
 * @returns {Array<Object>} An array of cells with the lowest entropy.
 */
function findLowestEntropyCells(grid) {
    let lowestEntropy = Infinity;
    let candidates = [];

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            const cell = grid[y][x];
            if (!cell.collapsed) {
                const entropy = cell.options.length;
                if (entropy > 0 && entropy < lowestEntropy) {
                    lowestEntropy = entropy;
                    candidates = [cell];
                } else if (entropy === lowestEntropy) {
                    candidates.push(cell);
                }
            }
        }
    }
    return candidates;
}

/**
 * Propagates constraints from a collapsed cell to its neighbors.
 * @param {Object} collapsedCell - The cell that was just collapsed.
 * @param {Array<Array<Object>>} grid - The WFC grid.
 */
function propagateConstraints(collapsedCell, grid) {
    const stack = [collapsedCell];
    const width = grid[0].length;
    const height = grid.length;

    while (stack.length > 0) {
        const current = stack.pop();
        const { x, y } = current;

        // Get neighbors [up, right, down, left]
        const neighbors = [
            y > 0 ? grid[y - 1][x] : null,
            x < width - 1 ? grid[y][x + 1] : null,
            y < height - 1 ? grid[y + 1][x] : null,
            x > 0 ? grid[y][x - 1] : null,
        ];

        neighbors.forEach((neighbor, directionIndex) => {
            if (!neighbor || neighbor.collapsed) return;

            const originalOptionCount = neighbor.options.length;
            
            // Get all valid neighbors for the current cell's collapsed tile(s)
            let validNeighborOptions = new Set();
            current.options.forEach(tileName => {
                const rules = ADJACENCY_RULES[tileName];
                if (rules) {
                    // directionIndex: 0=up, 1=right, 2=down, 3=left
                    // We need the opposite rule from the neighbor's perspective
                    // e.g., if neighbor is 'up' (index 0), it's constrained by current's 'down' (index 2) rules
                    const neighborPerspectiveDir = (directionIndex + 2) % 4;
                    let ruleSet;
                    switch(directionIndex) { // FIX: Use the direct directionIndex
                        case 0: ruleSet = rules.up; break;
                        case 1: ruleSet = rules.right; break;
                        case 2: ruleSet = rules.down; break;
                        case 3: ruleSet = rules.left; break;
                    }
                    if(ruleSet) ruleSet.forEach(option => validNeighborOptions.add(option));
                }
            });

            // Filter the neighbor's options
            neighbor.options = neighbor.options.filter(option => validNeighborOptions.has(option));

            // If the neighbor's options changed, add it to the stack to propagate further
            if (neighbor.options.length < originalOptionCount) {
                if (!stack.includes(neighbor)) {
                    stack.push(neighbor);
                }
            }
        });
    }
}


/**
 * Generates a map layout using the Wave Function Collapse algorithm.
 * @param {number} width - The width of the map.
 * @param {number} height - The height of the map.
 * @returns {Array<Array<Object>>} A 2D array representing the collapsed map with tile information.
 */
export function generateWfcMap(width, height) {
    const grid = initializeGrid(width, height);
    let attempts = 0;

    while (attempts < 10) { // Add an attempt limit to prevent infinite loops on unsolvable rules
        let collapsedCount = 0;
        const totalCells = width * height;

        while (collapsedCount < totalCells) {
            const candidates = findLowestEntropyCells(grid);
            if (candidates.length === 0) {
                // This can happen if a cell has 0 options, meaning a contradiction
                break; 
            }

            // Choose one candidate randomly to collapse
            const cellToCollapse = candidates[Math.floor(Math.random() * candidates.length)];
            
            // Collapse the cell to one random option
            const chosenOption = cellToCollapse.options[Math.floor(Math.random() * cellToCollapse.options.length)];
            cellToCollapse.options = [chosenOption];
            cellToCollapse.collapsed = true;
            collapsedCount++;

            propagateConstraints(cellToCollapse, grid);
        }

        if (collapsedCount === totalCells) {
            console.log("WFC successful!");
            // Convert grid to a simpler format for the game state
            return grid.map(row => row.map(cell => {
                return {
                    name: cell.options[0] || TILE_TYPES.FIELD_BASE_NONE, // Fallback to FIELD_BASE_NONE
                };
            }));
        }

        // If loop finished but not all cells are collapsed, it failed. Reset and try again.
        attempts++;
        console.warn(`WFC failed on attempt ${attempts}. Retrying...`);
        // Reset grid for next attempt
        for(let y=0; y<height; y++) {
            for(let x=0; x<width; x++) {
                grid[y][x].collapsed = false;
                grid[y][x].options = Object.values(TILE_TYPES);
            }
        }
    }

    console.error("WFC failed to generate a map after multiple attempts. Check rules for contradictions.");
    return null; // Return null or a default map on failure
}
