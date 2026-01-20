// tiles.js

// A simplified list of all unique tile types for easier access
export const TILE_TYPES = {
    // Field
    FIELD_BASE_NONE: 'FIELD_BASE_NONE',
    FIELD_BASE_FLOWER: 'FIELD_BASE_FLOWER',
    FIELD_BASE_SEED: 'FIELD_BASE_SEED',
    // Wood
    WOOD_1: 'WOOD_1',
    WOOD_2: 'WOOD_2',
    WOOD_3: 'WOOD_3',
    WOOD_4: 'WOOD_4',
    // Lake
    LAKE_UL: 'LAKE_LEFT_TOP',
    LAKE_UM: 'LAKE_UP_SIDE',
    LAKE_UR: 'LAKE_RIGHT_TOP',
    LAKE_ML: 'LAKE_LEFT_SIDE',
    LAKE_MM: 'LAKE_MM', // Center Lake tile, corrected
    LAKE_MR: 'LAKE_RIGHT_SIDE',
    LAKE_DL: 'LAKE_LEFT_BOTTOM',
    LAKE_DM: 'LAKE_DOWN_SIDE',
    LAKE_DR: 'LAKE_RIGHT_BOTTOM',
};

const FIELD_TILES = [TILE_TYPES.FIELD_BASE_NONE, TILE_TYPES.FIELD_BASE_FLOWER, TILE_TYPES.FIELD_BASE_SEED];
const WOOD_TILES = [TILE_TYPES.WOOD_1, TILE_TYPES.WOOD_2, TILE_TYPES.WOOD_3, TILE_TYPES.WOOD_4];
const ALL_LAKE_EDGES = [
    TILE_TYPES.LAKE_UL, TILE_TYPES.LAKE_UM, TILE_TYPES.LAKE_UR,
    TILE_TYPES.LAKE_ML, TILE_TYPES.LAKE_MR,
    TILE_TYPES.LAKE_DL, TILE_TYPES.LAKE_DM, TILE_TYPES.LAKE_DR
];
const WATER_TILES = [TILE_TYPES.LAKE_MM];

// Define properties for each tile
export const TILE_PROPERTIES = {
    // Field
    [TILE_TYPES.FIELD_BASE_NONE]: { walkable: true, spawnable: true },
    [TILE_TYPES.FIELD_BASE_FLOWER]: { walkable: true, spawnable: true },
    [TILE_TYPES.FIELD_BASE_SEED]: { walkable: true, spawnable: true },
    // Wood (Not walkable, not spawnable)
    [TILE_TYPES.WOOD_1]: { walkable: false, spawnable: false },
    [TILE_TYPES.WOOD_2]: { walkable: false, spawnable: false },
    [TILE_TYPES.WOOD_3]: { walkable: false, spawnable: false },
    [TILE_TYPES.WOOD_4]: { walkable: false, spawnable: false },
    // Lake Edges (Not walkable, not spawnable)
    [TILE_TYPES.LAKE_UL]: { walkable: false, spawnable: false },
    [TILE_TYPES.LAKE_UM]: { walkable: false, spawnable: false },
    [TILE_TYPES.LAKE_UR]: { walkable: false, spawnable: false },
    [TILE_TYPES.LAKE_ML]: { walkable: false, spawnable: false },
    [TILE_TYPES.LAKE_MR]: { walkable: false, spawnable: false },
    [TILE_TYPES.LAKE_DL]: { walkable: false, spawnable: false },
    [TILE_TYPES.LAKE_DM]: { walkable: false, spawnable: false },
    [TILE_TYPES.LAKE_DR]: { walkable: false, spawnable: false },
    // Lake Center (Not walkable, not spawnable)
    [TILE_TYPES.LAKE_MM]: { walkable: false, spawnable: false },
};

// --- Adjacency Rules ---
// Defines which tiles can be neighbors in [up, right, down, left] directions
export const ADJACENCY_RULES = {
    // Field tiles can be next to other field tiles, wood tiles, and appropriate lake edges.
    [TILE_TYPES.FIELD_BASE_NONE]: {
        up: [...FIELD_TILES, ...WOOD_TILES, TILE_TYPES.LAKE_DM, TILE_TYPES.LAKE_DL, TILE_TYPES.LAKE_DR],
        right: [...FIELD_TILES, ...WOOD_TILES, TILE_TYPES.LAKE_ML, TILE_TYPES.LAKE_UL, TILE_TYPES.LAKE_DL],
        down: [...FIELD_TILES, ...WOOD_TILES, TILE_TYPES.LAKE_UM, TILE_TYPES.LAKE_UL, TILE_TYPES.LAKE_UR],
        left: [...FIELD_TILES, ...WOOD_TILES, TILE_TYPES.LAKE_MR, TILE_TYPES.LAKE_UR, TILE_TYPES.LAKE_DR],
    },
    [TILE_TYPES.FIELD_BASE_FLOWER]: {
        up: [...FIELD_TILES, ...WOOD_TILES, TILE_TYPES.LAKE_DM, TILE_TYPES.LAKE_DL, TILE_TYPES.LAKE_DR],
        right: [...FIELD_TILES, ...WOOD_TILES, TILE_TYPES.LAKE_ML, TILE_TYPES.LAKE_UL, TILE_TYPES.LAKE_DL],
        down: [...FIELD_TILES, ...WOOD_TILES, TILE_TYPES.LAKE_UM, TILE_TYPES.LAKE_UL, TILE_TYPES.LAKE_UR],
        left: [...FIELD_TILES, ...WOOD_TILES, TILE_TYPES.LAKE_MR, TILE_TYPES.LAKE_UR, TILE_TYPES.LAKE_DR],
    },
    [TILE_TYPES.FIELD_BASE_SEED]: {
        up: [...FIELD_TILES, ...WOOD_TILES, TILE_TYPES.LAKE_DM, TILE_TYPES.LAKE_DL, TILE_TYPES.LAKE_DR],
        right: [...FIELD_TILES, ...WOOD_TILES, TILE_TYPES.LAKE_ML, TILE_TYPES.LAKE_UL, TILE_TYPES.LAKE_DL],
        down: [...FIELD_TILES, ...WOOD_TILES, TILE_TYPES.LAKE_UM, TILE_TYPES.LAKE_UL, TILE_TYPES.LAKE_UR],
        left: [...FIELD_TILES, ...WOOD_TILES, TILE_TYPES.LAKE_MR, TILE_TYPES.LAKE_UR, TILE_TYPES.LAKE_DR],
    },

    // Wood tiles can be next to other wood tiles or any field tiles, allowing forests to form.
    [TILE_TYPES.WOOD_1]: {
        up: [...FIELD_TILES, ...WOOD_TILES],
        right: [...FIELD_TILES, ...WOOD_TILES],
        down: [...FIELD_TILES, ...WOOD_TILES],
        left: [...FIELD_TILES, ...WOOD_TILES],
    },
    [TILE_TYPES.WOOD_2]: {
        up: [...FIELD_TILES, ...WOOD_TILES],
        right: [...FIELD_TILES, ...WOOD_TILES],
        down: [...FIELD_TILES, ...WOOD_TILES],
        left: [...FIELD_TILES, ...WOOD_TILES],
    },
    [TILE_TYPES.WOOD_3]: {
        up: [...FIELD_TILES, ...WOOD_TILES],
        right: [...FIELD_TILES, ...WOOD_TILES],
        down: [...FIELD_TILES, ...WOOD_TILES],
        left: [...FIELD_TILES, ...WOOD_TILES],
    },
    [TILE_TYPES.WOOD_4]: {
        up: [...FIELD_TILES, ...WOOD_TILES],
        right: [...FIELD_TILES, ...WOOD_TILES],
        down: [...FIELD_TILES, ...WOOD_TILES],
        left: [...FIELD_TILES, ...WOOD_TILES],
    },

    // --- Lake Tiles (Corrected Strict Rules) ---
    [TILE_TYPES.LAKE_MM]: { // Middle-Middle (Water Body)
        up: [TILE_TYPES.LAKE_MM, TILE_TYPES.LAKE_UM],
        right: [TILE_TYPES.LAKE_MM, TILE_TYPES.LAKE_MR],
        down: [TILE_TYPES.LAKE_MM, TILE_TYPES.LAKE_DM],
        left: [TILE_TYPES.LAKE_MM, TILE_TYPES.LAKE_ML],
    },
    [TILE_TYPES.LAKE_UL]: { // Up-Left Corner
        up: [...FIELD_TILES, ...WOOD_TILES],
        right: [TILE_TYPES.LAKE_UM],
        down: [TILE_TYPES.LAKE_ML],
        left: [...FIELD_TILES, ...WOOD_TILES],
    },
    [TILE_TYPES.LAKE_UM]: { // Up-Middle Edge
        up: [...FIELD_TILES, ...WOOD_TILES],
        right: [TILE_TYPES.LAKE_UM, TILE_TYPES.LAKE_UR],
        down: WATER_TILES,
        left: [TILE_TYPES.LAKE_UM, TILE_TYPES.LAKE_UL],
    },
    [TILE_TYPES.LAKE_UR]: { // Up-Right Corner
        up: [...FIELD_TILES, ...WOOD_TILES],
        right: [...FIELD_TILES, ...WOOD_TILES],
        down: [TILE_TYPES.LAKE_MR],
        left: [TILE_TYPES.LAKE_UM],
    },
    [TILE_TYPES.LAKE_ML]: { // Middle-Left Edge
        up: [TILE_TYPES.LAKE_ML, TILE_TYPES.LAKE_UL],
        right: WATER_TILES,
        down: [TILE_TYPES.LAKE_ML, TILE_TYPES.LAKE_DL],
        left: [...FIELD_TILES, ...WOOD_TILES],
    },
    [TILE_TYPES.LAKE_MR]: { // Middle-Right Edge
        up: [TILE_TYPES.LAKE_MR, TILE_TYPES.LAKE_UR],
        right: [...FIELD_TILES, ...WOOD_TILES],
        down: [TILE_TYPES.LAKE_MR, TILE_TYPES.LAKE_DR],
        left: WATER_TILES,
    },
    [TILE_TYPES.LAKE_DL]: { // Down-Left Corner
        up: [TILE_TYPES.LAKE_ML],
        right: [TILE_TYPES.LAKE_DM],
        down: [...FIELD_TILES, ...WOOD_TILES],
        left: [...FIELD_TILES, ...WOOD_TILES],
    },
    [TILE_TYPES.LAKE_DM]: { // Down-Middle Edge
        up: WATER_TILES,
        right: [TILE_TYPES.LAKE_DM, TILE_TYPES.LAKE_DR],
        down: [...FIELD_TILES, ...WOOD_TILES],
        left: [TILE_TYPES.LAKE_DM, TILE_TYPES.LAKE_DL],
    },
    [TILE_TYPES.LAKE_DR]: { // Down-Right Corner
        up: [TILE_TYPES.LAKE_MR],
        right: [...FIELD_TILES, ...WOOD_TILES],
        down: [...FIELD_TILES, ...WOOD_TILES],
        left: [TILE_TYPES.LAKE_DM],
    },
};