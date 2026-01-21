// wfc.js

function buildTileWeights(tileSet) {
    const weights = {};
    for (const tile of Object.values(tileSet.TILE_TYPES)) {
        const prop = tileSet.TILE_PROPERTIES[tile];
        let w = prop?.baseWeight ?? 1;
        weights[tile] = Math.max(0.01, w);
    }
    return weights;
}

function weightedRandom(options, weights) {
    let total = 0;
    for (const o of options) total += weights[o] ?? 1;
    let r = Math.random() * total;
    for (const o of options) {
        r -= weights[o] ?? 1;
        if (r <= 0) return o;
    }
    return options[0];
}

function entropy(options, weights) {
    let sum = 0;
    let sumLog = 0;
    for (const o of options) {
        const w = weights[o] ?? 1;
        sum += w;
        sumLog += w * Math.log(w);
    }
    return Math.log(sum) - sumLog / sum;
}

export function generateWfcMap(width, height, tileSet) {
    const TILE_WEIGHTS = buildTileWeights(tileSet);
    const ALL_TILES = Object.values(tileSet.TILE_TYPES);

    function initGrid() {
        return Array.from({ length: height }, (_, y) =>
            Array.from({ length: width }, (_, x) => ({
                x, y,
                collapsed: false,
                options: [...ALL_TILES]
            }))
        );
    }

    function getNeighbors(cell, grid) {
        return [
            grid[cell.y - 1]?.[cell.x],
            grid[cell.y + 1]?.[cell.x],
            grid[cell.y]?.[cell.x - 1],
            grid[cell.y]?.[cell.x + 1],
        ].filter(Boolean);
    }

    function isLake(tile) {
        return tile.startsWith('LAKE_');
    }

    function isWalkable(tile) {
        return tileSet.TILE_PROPERTIES[tile]?.walkable === true;
    }

    function propagate(start, grid) {
        const stack = [start];
        while (stack.length) {
            const cell = stack.pop();
            const { x, y } = cell;

            const dirs = [
                { dx: 0, dy: -1, dir: 'down' },
                { dx: 1, dy: 0, dir: 'left' },
                { dx: 0, dy: 1, dir: 'up' },
                { dx: -1, dy: 0, dir: 'right' }
            ];

            for (const { dx, dy, dir } of dirs) {
                const nx = x + dx;
                const ny = y + dy;
                if (!grid[ny]?.[nx]) continue;

                const n = grid[ny][nx];
                if (n.collapsed) continue;

                const before = n.options.length;
                n.options = n.options.filter(opt =>
                    cell.options.some(cOpt => {
                        const rules = tileSet.ADJACENCY_RULES[cOpt]?.[dir];
                        return !rules || rules.includes(opt);
                    })
                );

                if (n.options.length < before) stack.push(n);
            }
        }
    }

    const grid = initGrid();
    let collapsed = 0;

    while (collapsed < width * height) {
        let min = Infinity;
        let targets = [];

        for (const row of grid) {
            for (const cell of row) {
                if (cell.collapsed) continue;
                const e = entropy(cell.options, TILE_WEIGHTS);
                if (e < min) {
                    min = e;
                    targets = [cell];
                } else if (e === min) {
                    targets.push(cell);
                }
            }
        }

        if (!targets.length) break;

        const cell = targets[Math.floor(Math.random() * targets.length)];

        /* =====================================================
           🔧 여기부터 "기능 추가" (기존 구조 유지)
        ===================================================== */

        const localWeights = { ...TILE_WEIGHTS };
        const neighbors = getNeighbors(cell, grid);

        // 1️⃣ 호수 근처면 나무 가중치 감소
        const nearLake = neighbors.some(n =>
            n.collapsed && isLake(n.options[0])
        );

        if (nearLake) {
            for (const opt of cell.options) {
                if (opt.startsWith('WOOD_')) {
                    localWeights[opt] *= 0.3;
                }
            }
        }

        // 2️⃣ 갇힘 방지: 이미 막힌 이웃이 많으면 walkable 선호
        const blockingCount = neighbors.filter(n =>
            n.collapsed && !isWalkable(n.options[0])
        ).length;

        if (blockingCount >= 2) {
            for (const opt of cell.options) {
                if (isWalkable(opt)) {
                    localWeights[opt] *= 3.0;
                } else {
                    localWeights[opt] *= 0.2;
                }
            }
        }

        /* ===================================================== */

        const pick = weightedRandom(cell.options, localWeights);

        cell.options = [pick];
        cell.collapsed = true;
        collapsed++;

        propagate(cell, grid);
    }

    return grid.map(row =>
        row.map(cell => ({ name: cell.options[0] }))
    );
}
