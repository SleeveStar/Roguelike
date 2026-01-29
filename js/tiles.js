/* =====================================================
   Biome TileSet Factory (NO INFERENCE / NO MAGIC)
===================================================== */
function createBiomeTileSet(tileTypes, tileProperties, adjacencyRules) {

    const walkableTileNames = Object.values(tileTypes).filter(
        tileName => tileProperties[tileName]?.walkable === true
    );

    return {
        tileSize: 40,
        TILE_TYPES: tileTypes,
        TILE_PROPERTIES: tileProperties,
        walkableTileNames,
        ADJACENCY_RULES: adjacencyRules,
    };
}

/* =====================================================
   🌲 FOREST BIOME
===================================================== */

const FOREST_TILE_TYPES = {
    FIELD_BASE_NONE: 'FIELD_BASE_NONE',
    FIELD_BASE_FLOWER: 'FIELD_BASE_FLOWER',
    FIELD_BASE_SEED: 'FIELD_BASE_SEED',

    WOOD_1: 'WOOD_1',
    WOOD_2: 'WOOD_2',
    WOOD_3: 'WOOD_3',

    LAKE_UL: 'LAKE_LEFT_TOP',
    LAKE_UM: 'LAKE_UP_SIDE',
    LAKE_UR: 'LAKE_RIGHT_TOP',
    LAKE_ML: 'LAKE_LEFT_SIDE',
    LAKE_MM: 'LAKE_MM',
    LAKE_MR: 'LAKE_RIGHT_SIDE',
    LAKE_DL: 'LAKE_LEFT_BOTTOM',
    LAKE_DM: 'LAKE_DOWN_SIDE',
    LAKE_DR: 'LAKE_RIGHT_BOTTOM',
};

const FOREST_FIELD_TILES = [
    FOREST_TILE_TYPES.FIELD_BASE_NONE,
    FOREST_TILE_TYPES.FIELD_BASE_FLOWER,
    FOREST_TILE_TYPES.FIELD_BASE_SEED
];

const FOREST_WOOD_TILES = [
    FOREST_TILE_TYPES.WOOD_1,
    FOREST_TILE_TYPES.WOOD_2,
    FOREST_TILE_TYPES.WOOD_3
];

const FOREST_WATER_TILES = [FOREST_TILE_TYPES.LAKE_MM];

const FOREST_TILE_PROPERTIES = {
    [FOREST_TILE_TYPES.FIELD_BASE_NONE]: { walkable: true, spawnable: true },
    [FOREST_TILE_TYPES.FIELD_BASE_FLOWER]: { walkable: true, spawnable: true, path: '/img/forest/FIELD_BASE_FLOWER.png', baseWeight: 3, drawTransparency: 0.3 },
    [FOREST_TILE_TYPES.FIELD_BASE_SEED]: { walkable: true, spawnable: true, path: '/img/forest/FIELD_BASE_SEED.png', baseWeight: 3, drawTransparency: 0.3 },

    [FOREST_TILE_TYPES.WOOD_1]: {
        walkable: false,
        spawnable: false,
        path: '/img/forest/WOOD_1.png',
        baseWeight: 0.6
    },
    [FOREST_TILE_TYPES.WOOD_2]: {
        walkable: false,
        spawnable: false,
        path: '/img/forest/WOOD_2.png',
        baseWeight: 0.6
    },
    [FOREST_TILE_TYPES.WOOD_3]: {
        walkable: false,
        spawnable: false,
        path: '/img/forest/WOOD_3.png',
        baseWeight: 0.6
    },

    [FOREST_TILE_TYPES.LAKE_UL]: { walkable: false, spawnable: false, path: '/img/forest/LAKE_LEFT_TOP.png', baseWeight: 0.2 },
    [FOREST_TILE_TYPES.LAKE_UM]: { walkable: false, spawnable: false, path: '/img/forest/LAKE_UP_SIDE.png', baseWeight: 0.2 },
    [FOREST_TILE_TYPES.LAKE_UR]: { walkable: false, spawnable: false, path: '/img/forest/LAKE_RIGHT_TOP.png', baseWeight: 0.2 },
    [FOREST_TILE_TYPES.LAKE_ML]: { walkable: false, spawnable: false, path: '/img/forest/LAKE_LEFT_SIDE.png', baseWeight: 0.2 },
    [FOREST_TILE_TYPES.LAKE_MM]: { walkable: false, spawnable: false, path: '/img/forest/LAKE_MM.png', baseWeight: 0.2 },
    [FOREST_TILE_TYPES.LAKE_MR]: { walkable: false, spawnable: false, path: '/img/forest/LAKE_RIGHT_SIDE.png', baseWeight: 0.2 },
    [FOREST_TILE_TYPES.LAKE_DL]: { walkable: false, spawnable: false, path: '/img/forest/LAKE_LEFT_BOTTOM.png', baseWeight: 0.2 },
    [FOREST_TILE_TYPES.LAKE_DM]: { walkable: false, spawnable: false, path: '/img/forest/LAKE_DOWN_SIDE.png', baseWeight: 0.2 },
    [FOREST_TILE_TYPES.LAKE_DR]: { walkable: false, spawnable: false, path: '/img/forest/LAKE_RIGHT_BOTTOM.png', baseWeight: 0.2 },
};

const FOREST_ADJACENCY_RULES = {
    // Field tiles can be next to other field tiles, wood tiles, and appropriate lake edges.
    [FOREST_TILE_TYPES.FIELD_BASE_NONE]: {
        up: [...FOREST_FIELD_TILES, FOREST_TILE_TYPES.LAKE_DR],
        right: [...FOREST_FIELD_TILES, FOREST_TILE_TYPES.LAKE_ML],
        down: [...FOREST_FIELD_TILES, FOREST_TILE_TYPES.LAKE_UM, FOREST_TILE_TYPES.LAKE_UL],
        left: [...FOREST_FIELD_TILES, FOREST_TILE_TYPES.LAKE_UR],
    },
    [FOREST_TILE_TYPES.FIELD_BASE_FLOWER]: {
        up: [FOREST_TILE_TYPES.FIELD_BASE_NONE, FOREST_TILE_TYPES.FIELD_BASE_SEED, FOREST_TILE_TYPES.FIELD_BASE_NONE,...FOREST_WOOD_TILES, FOREST_TILE_TYPES.LAKE_DM, FOREST_TILE_TYPES.LAKE_DL, FOREST_TILE_TYPES.LAKE_DR],
        right: [FOREST_TILE_TYPES.FIELD_BASE_NONE, FOREST_TILE_TYPES.FIELD_BASE_SEED, FOREST_TILE_TYPES.FIELD_BASE_NONE, ...FOREST_WOOD_TILES, FOREST_TILE_TYPES.LAKE_ML, FOREST_TILE_TYPES.LAKE_UL, FOREST_TILE_TYPES.LAKE_DL],
        down: [FOREST_TILE_TYPES.FIELD_BASE_NONE, FOREST_TILE_TYPES.FIELD_BASE_SEED, FOREST_TILE_TYPES.FIELD_BASE_NONE,...FOREST_WOOD_TILES, FOREST_TILE_TYPES.LAKE_UM, FOREST_TILE_TYPES.LAKE_UL, FOREST_TILE_TYPES.LAKE_UR],
        left: [FOREST_TILE_TYPES.FIELD_BASE_NONE, FOREST_TILE_TYPES.FIELD_BASE_SEED, FOREST_TILE_TYPES.FIELD_BASE_NONE,...FOREST_WOOD_TILES, FOREST_TILE_TYPES.LAKE_MR, FOREST_TILE_TYPES.LAKE_UR, FOREST_TILE_TYPES.LAKE_DR],
    },
    [FOREST_TILE_TYPES.FIELD_BASE_SEED]: {
        up: [FOREST_TILE_TYPES.FIELD_BASE_NONE, FOREST_TILE_TYPES.FIELD_BASE_FLOWER, FOREST_TILE_TYPES.FIELD_BASE_NONE, ...FOREST_WOOD_TILES, FOREST_TILE_TYPES.LAKE_DM, FOREST_TILE_TYPES.LAKE_DL, FOREST_TILE_TYPES.LAKE_DR],
        right: [FOREST_TILE_TYPES.FIELD_BASE_NONE, FOREST_TILE_TYPES.FIELD_BASE_FLOWER, FOREST_TILE_TYPES.FIELD_BASE_NONE, ...FOREST_WOOD_TILES, FOREST_TILE_TYPES.LAKE_ML, FOREST_TILE_TYPES.LAKE_UL, FOREST_TILE_TYPES.LAKE_DL],
        down: [FOREST_TILE_TYPES.FIELD_BASE_NONE, FOREST_TILE_TYPES.FIELD_BASE_FLOWER, FOREST_TILE_TYPES.FIELD_BASE_NONE, ...FOREST_WOOD_TILES, FOREST_TILE_TYPES.LAKE_UM, FOREST_TILE_TYPES.LAKE_UL, FOREST_TILE_TYPES.LAKE_UR],
        left: [FOREST_TILE_TYPES.FIELD_BASE_NONE, FOREST_TILE_TYPES.FIELD_BASE_FLOWER, FOREST_TILE_TYPES.FIELD_BASE_NONE, ...FOREST_WOOD_TILES, FOREST_TILE_TYPES.LAKE_MR, FOREST_TILE_TYPES.LAKE_UR, FOREST_TILE_TYPES.LAKE_DR],
    },

    // Wood tiles can be next to other wood tiles or any field tiles, allowing forests to form.
    [FOREST_TILE_TYPES.WOOD_1]: {
        // up: [FOREST_TILE_TYPES.FIELD_BASE_NONE, ...FOREST_WOOD_TILES],
        // right: [FOREST_TILE_TYPES.FIELD_BASE_NONE, ...FOREST_WOOD_TILES],
        // down: [FOREST_TILE_TYPES.FIELD_BASE_NONE, ...FOREST_WOOD_TILES],
        // left: [FOREST_TILE_TYPES.FIELD_BASE_NONE, ...FOREST_WOOD_TILES],
        up: [FOREST_TILE_TYPES.FIELD_BASE_NONE,FOREST_TILE_TYPES.FIELD_BASE_FLOWER,...FOREST_WOOD_TILES ],
        right: [FOREST_TILE_TYPES.FIELD_BASE_NONE,FOREST_TILE_TYPES.FIELD_BASE_FLOWER,...FOREST_WOOD_TILES ],
        down: [FOREST_TILE_TYPES.FIELD_BASE_NONE,FOREST_TILE_TYPES.FIELD_BASE_FLOWER,...FOREST_WOOD_TILES ],
        left: [FOREST_TILE_TYPES.FIELD_BASE_NONE,FOREST_TILE_TYPES.FIELD_BASE_FLOWER,...FOREST_WOOD_TILES ]
    },
    [FOREST_TILE_TYPES.WOOD_2]: {
        // up: [FOREST_TILE_TYPES.FIELD_BASE_NONE, ...FOREST_WOOD_TILES],
        // right: [FOREST_TILE_TYPES.FIELD_BASE_NONE, ...FOREST_WOOD_TILES],
        // down: [FOREST_TILE_TYPES.FIELD_BASE_NONE, ...FOREST_WOOD_TILES],
        // left: [FOREST_TILE_TYPES.FIELD_BASE_NONE, ...FOREST_WOOD_TILES],
        up: [FOREST_TILE_TYPES.FIELD_BASE_NONE,FOREST_TILE_TYPES.FIELD_BASE_FLOWER,...FOREST_WOOD_TILES ],
        right: [FOREST_TILE_TYPES.FIELD_BASE_NONE,FOREST_TILE_TYPES.FIELD_BASE_FLOWER,...FOREST_WOOD_TILES ],
        down: [FOREST_TILE_TYPES.FIELD_BASE_NONE,FOREST_TILE_TYPES.FIELD_BASE_FLOWER,...FOREST_WOOD_TILES ],
        left: [FOREST_TILE_TYPES.FIELD_BASE_NONE,FOREST_TILE_TYPES.FIELD_BASE_FLOWER,...FOREST_WOOD_TILES ]
    },
    [FOREST_TILE_TYPES.WOOD_3]: {
        // up: [FOREST_TILE_TYPES.FIELD_BASE_NONE, ...FOREST_WOOD_TILES],
        // right: [FOREST_TILE_TYPES.FIELD_BASE_NONE, ...FOREST_WOOD_TILES],
        // down: [FOREST_TILE_TYPES.FIELD_BASE_NONE, ...FOREST_WOOD_TILES],
        // left: [FOREST_TILE_TYPES.FIELD_BASE_NONE, ...FOREST_WOOD_TILES],
        up: [FOREST_TILE_TYPES.FIELD_BASE_NONE,FOREST_TILE_TYPES.FIELD_BASE_FLOWER,...FOREST_WOOD_TILES ],
        right: [FOREST_TILE_TYPES.FIELD_BASE_NONE,FOREST_TILE_TYPES.FIELD_BASE_FLOWER,...FOREST_WOOD_TILES ],
        down: [FOREST_TILE_TYPES.FIELD_BASE_NONE,FOREST_TILE_TYPES.FIELD_BASE_FLOWER,...FOREST_WOOD_TILES ],
        left: [FOREST_TILE_TYPES.FIELD_BASE_NONE,FOREST_TILE_TYPES.FIELD_BASE_FLOWER,...FOREST_WOOD_TILES ]
    },

    // --- Lake Tiles (Corrected Strict Rules) ---
    [FOREST_TILE_TYPES.LAKE_MM]: { // Middle-Middle (Water Body)
        up: [FOREST_TILE_TYPES.LAKE_MM, FOREST_TILE_TYPES.LAKE_UM],
        right: [FOREST_TILE_TYPES.LAKE_MM, FOREST_TILE_TYPES.LAKE_MR],
        down: [FOREST_TILE_TYPES.LAKE_MM, FOREST_TILE_TYPES.LAKE_DM],
        left: [FOREST_TILE_TYPES.LAKE_MM, FOREST_TILE_TYPES.LAKE_ML],
    },
    [FOREST_TILE_TYPES.LAKE_UL]: { // Up-Left Corner
        up: [...FOREST_FIELD_TILES],
        right: [FOREST_TILE_TYPES.LAKE_UM],
        down: [FOREST_TILE_TYPES.LAKE_ML],
        left: [...FOREST_FIELD_TILES],
    },
    [FOREST_TILE_TYPES.LAKE_UM]: { // Up-Middle Edge
        up: [...FOREST_FIELD_TILES],
        right: [FOREST_TILE_TYPES.LAKE_UM, FOREST_TILE_TYPES.LAKE_UR],
        down: FOREST_WATER_TILES,
        left: [FOREST_TILE_TYPES.LAKE_UM, FOREST_TILE_TYPES.LAKE_UL],
    },
    [FOREST_TILE_TYPES.LAKE_UR]: { // Up-Right Corner
        up: [...FOREST_FIELD_TILES],
        right: [...FOREST_FIELD_TILES],
        down: [FOREST_TILE_TYPES.LAKE_MR],
        left: [FOREST_TILE_TYPES.LAKE_UM],
    },
    [FOREST_TILE_TYPES.LAKE_ML]: { // Middle-Left Edge
        up: [FOREST_TILE_TYPES.LAKE_ML, FOREST_TILE_TYPES.LAKE_UL],
        right: FOREST_WATER_TILES,
        down: [FOREST_TILE_TYPES.LAKE_ML, FOREST_TILE_TYPES.LAKE_DL],
        left: [...FOREST_FIELD_TILES],
    },
    [FOREST_TILE_TYPES.LAKE_MR]: { // Middle-Right Edge
        up: [FOREST_TILE_TYPES.LAKE_MR, FOREST_TILE_TYPES.LAKE_UR],
        right: [...FOREST_FIELD_TILES],
        down: [FOREST_TILE_TYPES.LAKE_MR, FOREST_TILE_TYPES.LAKE_DR],
        left: FOREST_WATER_TILES,
    },
    [FOREST_TILE_TYPES.LAKE_DL]: { // Down-Left Corner
        up: [FOREST_TILE_TYPES.LAKE_ML],
        right: [FOREST_TILE_TYPES.LAKE_DM],
        down: [...FOREST_FIELD_TILES],
        left: [...FOREST_FIELD_TILES],
    },
    [FOREST_TILE_TYPES.LAKE_DM]: { // Down-Middle Edge
        up: FOREST_WATER_TILES,
        right: [FOREST_TILE_TYPES.LAKE_DM, FOREST_TILE_TYPES.LAKE_DR],
        down: [...FOREST_FIELD_TILES],
        left: [FOREST_TILE_TYPES.LAKE_DM, FOREST_TILE_TYPES.LAKE_DL],
    },
    [FOREST_TILE_TYPES.LAKE_DR]: { // Down-Right Corner
        up: [FOREST_TILE_TYPES.LAKE_MR],
        right: [...FOREST_FIELD_TILES],
        down: [...FOREST_FIELD_TILES],
        left: [FOREST_TILE_TYPES.LAKE_DM],
    },
};

export const forestTiles = createBiomeTileSet(
    FOREST_TILE_TYPES,
    FOREST_TILE_PROPERTIES,
    FOREST_ADJACENCY_RULES
);

/* =====================================================
   ❄ ICE BIOME
===================================================== */

const ICE_TILE_TYPES = {
    ICE_FLOOR_FLOWER: 'ICE_FLOOR_FLOWER',
    ICE_FLOOR_SEED: 'ICE_FLOOR_SEED',
    ICE_ROCK: 'ICE_ROCK',
    ICE_WOOD_1: 'ICE_WOOD_1',
    ICE_WOOD_2: 'ICE_WOOD_2',
    ICE_WOOD_3: 'ICE_WOOD_3',
};

const ICE_FLOOR_TILES = [
    ICE_TILE_TYPES.ICE_FLOOR_FLOWER,
    ICE_TILE_TYPES.ICE_FLOOR_SEED
];

const ICE_OBSTACLE_TILES = [
    ICE_TILE_TYPES.ICE_ROCK,
    ICE_TILE_TYPES.ICE_WOOD_1,
    ICE_TILE_TYPES.ICE_WOOD_2,
    ICE_TILE_TYPES.ICE_WOOD_3
];

const ICE_TILE_PROPERTIES = {
    [ICE_TILE_TYPES.ICE_FLOOR_FLOWER]: { walkable: true, spawnable: true, path: '/img/ice/FIELD_BASE_FLOWER.png', baseWeight: 3, drawTransparency: 0.3 },
    [ICE_TILE_TYPES.ICE_FLOOR_SEED]: { walkable: true, spawnable: true, path: '/img/ice/FIELD_BASE_SEED.png', baseWeight: 3, drawTransparency: 0.3 },
    [ICE_TILE_TYPES.ICE_ROCK]: { walkable: false, spawnable: false, path: '/img/ice/ROCK.png', baseWeight: 1 },
    [ICE_TILE_TYPES.ICE_WOOD_1]: { walkable: false, spawnable: false, path: '/img/ice/WOOD_1.png', baseWeight: 1 },
    [ICE_TILE_TYPES.ICE_WOOD_2]: { walkable: false, spawnable: false, path: '/img/ice/WOOD_2.png', baseWeight: 1 },
    [ICE_TILE_TYPES.ICE_WOOD_3]: { walkable: false, spawnable: false, path: '/img/ice/WOOD_3.png', baseWeight: 1 },
};

const ICE_ADJACENCY_RULES = {
    // Empty floor tiles can be next to other empty floor tiles or obstacles.
    [ICE_TILE_TYPES.ICE_FLOOR_FLOWER]: {
        up: [...ICE_FLOOR_TILES, ...ICE_OBSTACLE_TILES],
        right: [...ICE_FLOOR_TILES, ...ICE_OBSTACLE_TILES],
        down: [...ICE_FLOOR_TILES, ...ICE_OBSTACLE_TILES],
        left: [...ICE_FLOOR_TILES, ...ICE_OBSTACLE_TILES],
    },
    [ICE_TILE_TYPES.ICE_FLOOR_SEED]: {
        up: [...ICE_FLOOR_TILES, ...ICE_OBSTACLE_TILES],
        right: [...ICE_FLOOR_TILES, ...ICE_OBSTACLE_TILES],
        down: [...ICE_FLOOR_TILES, ...ICE_OBSTACLE_TILES],
        left: [...ICE_FLOOR_TILES, ...ICE_OBSTACLE_TILES],
    },
    // Obstacle tiles prefer to be surrounded by empty floor tiles, reducing clustering.
    [ICE_TILE_TYPES.ICE_ROCK]: {
        up: ICE_FLOOR_TILES,
        right: ICE_FLOOR_TILES,
        down: ICE_FLOOR_TILES,
        left: ICE_FLOOR_TILES,
    },
    [ICE_TILE_TYPES.ICE_WOOD_1]: {
        up: ICE_FLOOR_TILES,
        right: ICE_FLOOR_TILES,
        down: ICE_FLOOR_TILES,
        left: ICE_FLOOR_TILES,
    },
    [ICE_TILE_TYPES.ICE_WOOD_2]: {
        up: ICE_FLOOR_TILES,
        right: ICE_FLOOR_TILES,
        down: ICE_FLOOR_TILES,
        left: ICE_FLOOR_TILES,
    },
    [ICE_TILE_TYPES.ICE_WOOD_3]: {
        up: ICE_FLOOR_TILES,
        right: ICE_FLOOR_TILES,
        down: ICE_FLOOR_TILES,
        left: ICE_FLOOR_TILES,
    },
};

export const iceTiles = createBiomeTileSet(
    ICE_TILE_TYPES,
    ICE_TILE_PROPERTIES,
    ICE_ADJACENCY_RULES
);

/* =====================================================
   🕳 CAVE BIOME
===================================================== */

const CAVE_TILE_TYPES = {
    CAVE_FLOOR_FLOWER: 'CAVE_FLOOR_FLOWER',
    CAVE_FLOOR_SEED: 'CAVE_FLOOR_SEED',
    CAVE_ROCK: 'CAVE_ROCK',
    CAVE_WOOD_1: 'CAVE_WOOD_1',
    CAVE_WOOD_2: 'CAVE_WOOD_2',
    CAVE_WOOD_3: 'CAVE_WOOD_3',
};

const CAVE_FLOOR_TILES = [
    CAVE_TILE_TYPES.CAVE_FLOOR_FLOWER,
    CAVE_TILE_TYPES.CAVE_FLOOR_SEED
];

const CAVE_OBSTACLE_TILES = [
    CAVE_TILE_TYPES.CAVE_ROCK,
    CAVE_TILE_TYPES.CAVE_WOOD_1,
    CAVE_TILE_TYPES.CAVE_WOOD_2,
    CAVE_TILE_TYPES.CAVE_WOOD_3
];

const CAVE_TILE_PROPERTIES = {
    [CAVE_TILE_TYPES.CAVE_FLOOR_FLOWER]: { walkable: true, spawnable: true, path: '/img/cave/FIELD_BASE_FLOWER.png', baseWeight: 3, drawTransparency: 0.3 },
    [CAVE_TILE_TYPES.CAVE_FLOOR_SEED]: { walkable: true, spawnable: true, path: '/img/cave/FIELD_BASE_SEED.png', baseWeight: 3, drawTransparency: 0.3 },
    [CAVE_TILE_TYPES.CAVE_ROCK]: { walkable: false, spawnable: false, path: '/img/cave/ROCK.png', baseWeight: 1 },
    [CAVE_TILE_TYPES.CAVE_WOOD_1]: { walkable: false, spawnable: false, path: '/img/cave/WOOD1.png', baseWeight: 1 },
    [CAVE_TILE_TYPES.CAVE_WOOD_2]: { walkable: false, spawnable: false, path: '/img/cave/WOOD2.png', baseWeight: 1 },
    [CAVE_TILE_TYPES.CAVE_WOOD_3]: { walkable: false, spawnable: false, path: '/img/cave/WOOD3.png', baseWeight: 1 },
};

const CAVE_ADJACENCY_RULES = {
    // Empty floor tiles can be next to other empty floor tiles or obstacles.
    [CAVE_TILE_TYPES.CAVE_FLOOR_FLOWER]: {
        up: [...CAVE_FLOOR_TILES, ...CAVE_OBSTACLE_TILES],
        right: [...CAVE_FLOOR_TILES, ...CAVE_OBSTACLE_TILES],
        down: [...CAVE_FLOOR_TILES, ...CAVE_OBSTACLE_TILES],
        left: [...CAVE_FLOOR_TILES, ...CAVE_OBSTACLE_TILES],
    },
    [CAVE_TILE_TYPES.CAVE_FLOOR_SEED]: {
        up: [...CAVE_FLOOR_TILES, ...CAVE_OBSTACLE_TILES],
        right: [...CAVE_FLOOR_TILES, ...CAVE_OBSTACLE_TILES],
        down: [...CAVE_FLOOR_TILES, ...CAVE_OBSTACLE_TILES],
        left: [...CAVE_FLOOR_TILES, ...CAVE_OBSTACLE_TILES],
    },
    // Obstacle tiles prefer to be surrounded by empty floor tiles, reducing clustering.
    [CAVE_TILE_TYPES.CAVE_ROCK]: {
        up: CAVE_FLOOR_TILES,
        right: CAVE_FLOOR_TILES,
        down: CAVE_FLOOR_TILES,
        left: CAVE_FLOOR_TILES,
    },
    [CAVE_TILE_TYPES.CAVE_WOOD_1]: {
        up: CAVE_FLOOR_TILES,
        right: CAVE_FLOOR_TILES,
        down: CAVE_FLOOR_TILES,
        left: CAVE_FLOOR_TILES,
    },
    [CAVE_TILE_TYPES.CAVE_WOOD_2]: {
        up: CAVE_FLOOR_TILES,
        right: CAVE_FLOOR_TILES,
        down: CAVE_FLOOR_TILES,
        left: CAVE_FLOOR_TILES,
    },
    [CAVE_TILE_TYPES.CAVE_WOOD_3]: {
        up: CAVE_FLOOR_TILES,
        right: CAVE_FLOOR_TILES,
        down: CAVE_FLOOR_TILES,
        left: CAVE_FLOOR_TILES,
    },
};

export const caveTiles = createBiomeTileSet(
    CAVE_TILE_TYPES,
    CAVE_TILE_PROPERTIES,
    CAVE_ADJACENCY_RULES
);

/* =====================================================
   🌋 VOLCANO BIOME
===================================================== */

const VOLCANO_TILE_TYPES = {
    VOLCANO_FLOOR_FLOWER: 'VOLCANO_FLOOR_FLOWER',
    VOLCANO_FLOOR_SEED: 'VOLCANO_FLOOR_SEED',
    VOLCANO_ROCK: 'VOLCANO_ROCK',
    VOLCANO_WOOD_1: 'VOLCANO_WOOD_1',
    VOLCANO_WOOD_2: 'VOLCANO_WOOD_2',
    VOLCANO_WOOD_3: 'VOLCANO_WOOD_3',
};

const VOLCANO_FLOOR_TILES = [
    VOLCANO_TILE_TYPES.VOLCANO_FLOOR_FLOWER,
    VOLCANO_TILE_TYPES.VOLCANO_FLOOR_SEED
];

const VOLCANO_OBSTACLE_TILES = [
    VOLCANO_TILE_TYPES.VOLCANO_ROCK,
    VOLCANO_TILE_TYPES.VOLCANO_WOOD_1,
    VOLCANO_TILE_TYPES.VOLCANO_WOOD_2,
    VOLCANO_TILE_TYPES.VOLCANO_WOOD_3
];

const VOLCANO_TILE_PROPERTIES = {
    [VOLCANO_TILE_TYPES.VOLCANO_FLOOR_FLOWER]: { walkable: true, spawnable: true, path: '/img/volcano/FIELD_BASE_FLOWER.png', baseWeight: 3, drawTransparency: 0.3 },
    [VOLCANO_TILE_TYPES.VOLCANO_FLOOR_SEED]: { walkable: true, spawnable: true, path: '/img/volcano/FIELD_BASE_SEED.png', baseWeight: 3, drawTransparency: 0.3 },
    [VOLCANO_TILE_TYPES.VOLCANO_ROCK]: { walkable: false, spawnable: false, path: '/img/volcano/ROCK.png', baseWeight: 2 },
    [VOLCANO_TILE_TYPES.VOLCANO_WOOD_1]: { walkable: false, spawnable: false, path: '/img/volcano/WOOD_1.png', baseWeight: 1 },
    [VOLCANO_TILE_TYPES.VOLCANO_WOOD_2]: { walkable: false, spawnable: false, path: '/img/volcano/WOOD_2.png', baseWeight: 1 },
    [VOLCANO_TILE_TYPES.VOLCANO_WOOD_3]: { walkable: false, spawnable: false, path: '/img/volcano/WOOD_3.png', baseWeight: 1 },
};

const VOLCANO_ADJACENCY_RULES = {
    // Empty floor tiles can be next to other empty floor tiles or obstacles.
    [VOLCANO_TILE_TYPES.VOLCANO_FLOOR_FLOWER]: {
        up: [...VOLCANO_FLOOR_TILES, ...VOLCANO_OBSTACLE_TILES],
        right: [...VOLCANO_FLOOR_TILES, ...VOLCANO_OBSTACLE_TILES],
        down: [...VOLCANO_FLOOR_TILES, ...VOLCANO_OBSTACLE_TILES],
        left: [...VOLCANO_FLOOR_TILES, ...VOLCANO_OBSTACLE_TILES],
    },
    [VOLCANO_TILE_TYPES.VOLCANO_FLOOR_SEED]: {
        up: [...VOLCANO_FLOOR_TILES, ...VOLCANO_OBSTACLE_TILES],
        right: [...VOLCANO_FLOOR_TILES, ...VOLCANO_OBSTACLE_TILES],
        down: [...VOLCANO_FLOOR_TILES, ...VOLCANO_OBSTACLE_TILES],
        left: [...VOLCANO_FLOOR_TILES, ...VOLCANO_OBSTACLE_TILES],
    },
    // Obstacle tiles prefer to be surrounded by empty floor tiles, reducing clustering.
    [VOLCANO_TILE_TYPES.VOLCANO_ROCK]: {
        up: VOLCANO_FLOOR_TILES,
        right: VOLCANO_FLOOR_TILES,
        down: VOLCANO_FLOOR_TILES,
        left: VOLCANO_FLOOR_TILES,
    },
    [VOLCANO_TILE_TYPES.VOLCANO_WOOD_1]: {
        up: VOLCANO_FLOOR_TILES,
        right: VOLCANO_FLOOR_TILES,
        down: VOLCANO_FLOOR_TILES,
        left: VOLCANO_FLOOR_TILES,
    },
    [VOLCANO_TILE_TYPES.VOLCANO_WOOD_2]: {
        up: VOLCANO_FLOOR_TILES,
        right: VOLCANO_FLOOR_TILES,
        down: VOLCANO_FLOOR_TILES,
        left: VOLCANO_FLOOR_TILES,
    },
    [VOLCANO_TILE_TYPES.VOLCANO_WOOD_3]: {
        up: VOLCANO_FLOOR_TILES,
        right: VOLCANO_FLOOR_TILES,
        down: VOLCANO_FLOOR_TILES,
        left: VOLCANO_FLOOR_TILES,
    },
};

export const volcanicTiles = createBiomeTileSet(
    VOLCANO_TILE_TYPES,
    VOLCANO_TILE_PROPERTIES,
    VOLCANO_ADJACENCY_RULES
);
