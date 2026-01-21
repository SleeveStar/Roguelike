// constants.js
export const TILE_SIZE = 40;
export const PLAYER_COLOR = 'blue';
// export const PLAYER_IMAGE_PATH = '/img/CHARACTER.png';
//호스팅버전
export const PLAYER_IMAGE_PATH = new URL('../img/CHARACTER.png', import.meta.url).href;

export const MERCHANT_COLOR = '#8B4513';

// export const GOLD_ICON_PATH = '/img/GOLD_COIN.png';
// 호스팅버전
export const GOLD_ICON_PATH = new URL('../img/GOLD_COIN.png', import.meta.url).href;

// export const HEALING_BLOCK_IMAGE_PATH = '/img/MEDI_KIT.png';
// 호스팅버전
export const HEALING_BLOCK_IMAGE_PATH = new URL('../img/MEDI_KIT.png', import.meta.url).href;

export const MONSTER_SPAWN_COUNT = 5;
export const HEALING_BLOCK_CHANCE = 0.05;
export const HEALING_BLOCK_RECOVERY_PERCENT = 0.3;
export const BOSS_CHANCE_PERCENT = 5;
export const XP_GAIN_MULTIPLIER = 50;
export const ESCAPE_CHANCE = 0.5;
export const LEVEL_UP_STAT_POINTS = 5;
export const ITEM_DROP_CHANCE = 0.75;
export const TREASURE_CHEST_CHANCE = 0.1;
export const INVENTORY_SIZE = 36; // Changed to 36 for 6x6
export const WANDERING_MERCHANT_CHANCE = HEALING_BLOCK_CHANCE;
export const MERCHANT_STOCK_SIZE = 6;

export const MERCHANT_ITEMS = [
    { name: '치유 물약', type: 'consumable', price: 50, effect: { hp: 50, mp: 0 }, description: '체력을 50 회복합니다.' },
    { name: '마나 물약', type: 'consumable', price: 75, effect: { hp: 0, mp: 30 }, description: '마나를 30 회복합니다.' },
];

export const MONSTER_TIERS = {
    normal:   { name: '',       stat_multiplier: 1.0, drop_rate_bonus: 0,   threat_bonus: 0,  rarity_bonus: 0,  base_gold_drop: 5 },
    elite:    { name: '정예',    stat_multiplier: 1.5, drop_rate_bonus: 0.1, threat_bonus: 5,  rarity_bonus: 10, base_gold_drop: 10 },
    champion: { name: '챔피언', stat_multiplier: 2.0, drop_rate_bonus: 0.25,threat_bonus: 10, rarity_bonus: 20, base_gold_drop: 20 }
};

export const BIOMES = {
    FOREST:   { name: 'Forest',   tileSet: 'forestTiles',   baseColor: '#2e391b' },
    ICE:      { name: 'Ice',      tileSet: 'iceTiles',      baseColor: '#FFFFFF' },
    CAVE:     { name: 'Cave',     tileSet: 'caveTiles',     baseColor: '#000000' },
    VOLCANO:  { name: 'Volcano',  tileSet: 'volcanicTiles', baseColor: '#000000' },
};

export const MONSTER_TYPES = [
    { name: "BLUE_SLIME",      archetype: 'tanky_slow', biomes: ['FOREST', 'CAVE'] },
    { name: "BONE_SLIME",      archetype: 'tanky_slow', biomes: ['ICE', 'CAVE'] },
    { name: "CRYSTAL_GOLEM",   archetype: 'tank', biomes: ['ICE', 'CAVE'] },
    { name: "DARK_KHIGHT",     archetype: 'bruiser', biomes: ['CAVE'] },
    { name: "EARTH_TURTLE",    archetype: 'tank', biomes: ['FOREST'] },
    { name: "EARTH_WORM",      archetype: 'standard', biomes: ['FOREST', 'CAVE'] },
    { name: "ENT_WOOD",        archetype: 'tank', biomes: ['FOREST'] },
    { name: "FIRE_WORM",       archetype: 'caster', biomes: ['VOLCANO'] },
    { name: "FROG_SHAMAN",     archetype: 'caster', biomes: ['FOREST'] },
    { name: "GARGOYLE",        archetype: 'rusher', biomes: ['CAVE', 'VOLCANO'] },
    { name: "GHOST",           archetype: 'evasive', biomes: ['ICE', 'CAVE'] },
    { name: "GOBLIN",          archetype: 'standard', biomes: ['FOREST', 'CAVE'] },
    { name: "GREEN_SLIME",     archetype: 'tanky_slow', biomes: ['FOREST'] },
    { name: "GREY_WOLF",       archetype: 'rusher', biomes: ['FOREST'] },
    { name: "GROUND_DRAGON",   archetype: 'elite', biomes: ['VOLCANO', 'FOREST'] }, // Ground Dragon could be in rocky forests or volcanic
    { name: "ICE_DRAGON",      archetype: 'elite', biomes: ['ICE'] },
    { name: "ICE_LICH",        archetype: 'caster', biomes: ['ICE'] },
    { name: "ICE_SKULKING",    archetype: 'rusher', biomes: ['ICE'] },
    { name: "KOBOLT",          archetype: 'standard', biomes: ['FOREST', 'CAVE'] },
    { name: "LAVA_GOLEM",      archetype: 'tank', biomes: ['VOLCANO'] },
    { name: "LIZARD_MAN",      archetype: 'standard', biomes: ['FOREST', 'VOLCANO'] }, // Lizard Man in forests or volcanic areas
    { name: "MIMIC",           archetype: 'bruiser', biomes: ['CAVE'] },
    { name: "ORC_SHAMAN",      archetype: 'caster', biomes: ['FOREST'] },
    { name: "ORC_WARRIOR",     archetype: 'bruiser', biomes: ['FOREST'] },
    { name: "POISON_DRAGON",   archetype: 'elite', biomes: ['FOREST'] }, // Poison Dragon for swampy/poisonous forests (if we add swamp later)
    { name: "POISON_LICH",     archetype: 'caster', biomes: ['FOREST'] },
    { name: "POISON_MUSHMAN",  archetype: 'caster', biomes: ['FOREST'] },
    { name: "POISON_SIDE",     archetype: 'standard', biomes: ['FOREST'] },
    { name: "RAPTOR_ARCHER",   archetype: 'glass_cannon', biomes: ['FOREST'] },
    { name: "RAPTOR_WARRIOR",  archetype: 'rusher', biomes: ['FOREST'] },
    { name: "RED_DRAGON",      archetype: 'elite', biomes: ['VOLCANO'] },
    { name: "RED_OGRE",        archetype: 'bruiser', biomes: ['VOLCANO'] },
    { name: "RED_RIZARDMAN",   archetype: 'standard', biomes: ['VOLCANO'] },
    { name: "ROCK_GOLEM",      archetype: 'tank', biomes: ['CAVE', 'VOLCANO'] },
    { name: "SATANIC_GARGOYLE",archetype: 'elite', biomes: ['CAVE', 'VOLCANO'] },
    { name: "SKEL_WARRIOR",    archetype: 'standard', biomes: ['ICE', 'CAVE'] },
    { name: "SKUL_LICH",       archetype: 'caster', biomes: ['ICE', 'CAVE'] },
    { name: "WEREWOLF",        archetype: 'bruiser', biomes: ['FOREST', 'CAVE'] },
    { name: "WOOD_WARM",       archetype: 'standard', biomes: ['FOREST'] },
    { name: "ZOMBIE",          archetype: 'tanky_slow', biomes: ['CAVE'] }
];

export const RARITY_CONFIG = {
    common:     { name: '일반',     color: '#ffffff', probability: 0.1,  budget: 5,  level_multiplier: 1.0, affixSlots: { min: 0, max: 1 },
                    affixValues: {
                        physicalAttack: { min: 1, max: 2 }
                    },
                    possibleAffixes: ['physicalAttack']
                },
    uncommon:   { name: '고급',   color: '#87CEEB', probability: 30,  budget: 15, level_multiplier: 1.3, affixSlots: { min: 1, max: 1 },
                    affixValues: {
                        physicalAttack: { min: 2, max: 4 },
                        magicalAttack: { min: 2, max: 4 }
                    },
                    possibleAffixes: ['physicalAttack', 'magicalAttack']
                },
    rare:       { name: '희귀',       color: '#A335EE', probability: 15,  budget: 30, level_multiplier: 1.6, affixSlots: { min: 1, max: 2 },
                    affixValues: { 
                        physicalAttack: { min: 3, max: 7 },
                        critChance: { min: 0.01, max: 0.03 },
                        lifesteal: { min: 0.01, max: 0.02 },
                        statusEffectBleed: { chance: 0.05, magnitude: 1, duration: 2 },
                        elementalDamage: { min: 1, max: 3 }
                    },
                    possibleAffixes: ['physicalAttack', 'critChance', 'lifesteal', 'statusEffectBleed', 'elementalDamage']
                },
    unique:     { name: '특별',     color: '#FF69B4', probability: 10,   budget: 60, level_multiplier: 2.0, affixSlots: { min: 2, max: 3 },
                    affixValues: { 
                        physicalAttack: { min: 7, max: 12 },
                        critChance: { min: 0.03, max: 0.05 },
                        lifesteal: { min: 0.02, max: 0.03 },
                        statusEffectPoison: { chance: 0.10, magnitude: 2, duration: 3 },
                        elementalDamage: { min: 3, max: 7 }
                    },
                    possibleAffixes: ['physicalAttack', 'critChance', 'lifesteal', 'statusEffectPoison', 'elementalDamage']
                },
    legendary:  { name: '전설',  color: '#ff9900', probability: 3,   budget: 120, level_multiplier: 2.5, affixSlots: { min: 2, max: 4 },
                    affixValues: {
                        physicalAttack: { min: 12, max: 20 },
                        critChance: { min: 0.05, max: 0.08 },
                        critDamage: { min: 0.1, max: 0.25 },
                        lifesteal: { min: 0.03, max: 0.05 },
                        statusEffectBleed: { chance: 0.15, magnitude: 3, duration: 4 },
                        elementalDamage: { min: 7, max: 15 }
                    },
                    possibleAffixes: ['physicalAttack', 'critChance', 'critDamage', 'lifesteal', 'statusEffectBleed', 'elementalDamage']
                },
    epic:       { name: '서사',       color: '#FFFF00', probability: 1.5, budget: 200, level_multiplier: 3.0, affixSlots: { min: 3, max: 4 },
                    affixValues: {
                        physicalAttack: { min: 24, max: 36 },
                        critChance: { min: 0.08, max: 0.12 },
                        critDamage: { min: 0.3, max: 0.6 },
                        lifesteal: { min: 0.05, max: 0.08 },
                        statusEffectPoison: { chance: 0.20, magnitude: 4.8, duration: 5 },
                        elementalDamage: { min: 18, max: 30 }
                    },
                    possibleAffixes: ['physicalAttack', 'critChance', 'critDamage', 'lifesteal', 'statusEffectPoison', 'elementalDamage']
                },
    mystic:     { name: '신화',     color: '#FF0000', probability: 0.4, budget: 350, level_multiplier: 3.8, affixSlots: { min: 4, max: 5 },
                    affixValues: { 
                        physicalAttack: { min: 36, max: 60 },
                        critChance: { min: 0.12, max: 0.18 },
                        critDamage: { min: 0.6, max: 1.2 },
                        lifesteal: { min: 0.08, max: 0.08 },
                        statusEffectBleed: { chance: 0.25, magnitude: 6, duration: 5 },
                        elementalDamage: { min: 30, max: 48 }
                    },
                    possibleAffixes: ['physicalAttack', 'critChance', 'critDamage', 'lifesteal', 'statusEffectBleed', 'elementalDamage']
                },
    legacy:     { name: '유산',     color: '#00FFFF', probability: 40, budget: 600, level_multiplier: 4.8, affixSlots: { min: 5, max: 6 },
                    affixValues: {
                        physicalAttack: { min: 60, max: 96 },
                        critChance: { min: 0.18, max: 0.25 },
                        critDamage: { min: 1.2, max: 1.8 },
                        lifesteal: { min: 0.08, max: 0.08 },
                        statusEffectPoison: { chance: 0.30, magnitude: 8.4, duration: 6 },
                        elementalDamage: { min: 48, max: 72 }
                    },
                    possibleAffixes: ['physicalAttack', 'critChance', 'critDamage', 'lifesteal', 'statusEffectPoison', 'elementalDamage']
                }
};

export const BASE_ITEMS = {
    // Primary Weapon Slot: Melee, Magical, or Ranged
    mainWeapon: [
        // --- Physical Weapons ---
        // Swords
        { name: '낡은 단검', type: 'equipment', slot: 'mainWeapon', weaponType: 'physical' },
        { name: '녹슨 검', type: 'equipment', slot: 'mainWeapon', weaponType: 'physical' },
        { name: '강철 장검', type: 'equipment', slot: 'mainWeapon', weaponType: 'physical' },
        { name: '룬 검', type: 'equipment', slot: 'mainWeapon', weaponType: 'physical' },
        { name: '대검', type: 'equipment', slot: 'mainWeapon', weaponType: 'physical' },
        // Axes
        { name: '작은 도끼', type: 'equipment', slot: 'mainWeapon', weaponType: 'physical' },
        { name: '전투 도끼', type: 'equipment', slot: 'mainWeapon', weaponType: 'physical' },
        { name: '양손 도끼', type: 'equipment', slot: 'mainWeapon', weaponType: 'physical' },
        // Maces/Hammers
        { name: '나무 몽둥이', type: 'equipment', slot: 'mainWeapon', weaponType: 'physical' },
        { name: '철퇴', type: 'equipment', slot: 'mainWeapon', weaponType: 'physical' },
        { name: '전쟁 망치', type: 'equipment', slot: 'mainWeapon', weaponType: 'physical' },
        // Spears/Polearms
        { name: '짧은 창', type: 'equipment', slot: 'mainWeapon', weaponType: 'physical' },
        { name: '미늘창', type: 'equipment', slot: 'mainWeapon', weaponType: 'physical' },

        // --- Magical Weapons ---
        // Staves
        { name: '나무 지팡이', type: 'equipment', slot: 'mainWeapon', weaponType: 'magical' },
        { name: '수정 지팡이', type: 'equipment', slot: 'mainWeapon', weaponType: 'magical' },
        { name: '현자의 지팡이', type: 'equipment', slot: 'mainWeapon', weaponType: 'magical' },
        // Wands
        { name: '낡은 완드', type: 'equipment', slot: 'mainWeapon', weaponType: 'magical' },
        { name: '룬 완드', type: 'equipment', slot: 'mainWeapon', weaponType: 'magical' },
        // Orbs/Tomes
        { name: '마력의 오브', type: 'equipment', slot: 'mainWeapon', weaponType: 'magical' },
        { name: '고대 마법서', type: 'equipment', slot: 'mainWeapon', weaponType: 'magical' },

        // --- Ranged Weapons ---
        { name: '짧은 활', type: 'equipment', slot: 'mainWeapon', weaponType: 'ranged' },
        { name: '사냥꾼의 활', type: 'equipment', slot: 'mainWeapon', weaponType: 'ranged' },
        { name: '장궁', type: 'equipment', slot: 'mainWeapon', weaponType: 'ranged' },
        { name: '가벼운 석궁', type: 'equipment', slot: 'mainWeapon', weaponType: 'ranged' },
        { name: '강철 석궁', type: 'equipment', slot: 'mainWeapon', weaponType: 'ranged' },
        { name: '엘프 활', type: 'equipment', slot: 'mainWeapon', weaponType: 'ranged' },
        { name: '드워프 석궁', type: 'equipment', slot: 'mainWeapon', weaponType: 'ranged' },
    ],

    // Off-hand Slot: Shields or Magical Off-hands
    subWeapon: [
        { name: '나무 방패', type: 'equipment', slot: 'subWeapon' },
        { name: '강철 방패', type: 'equipment', slot: 'subWeapon' },
        { name: '기사의 방패', type: 'equipment', slot: 'subWeapon' },
        { name: '버클러', type: 'equipment', slot: 'subWeapon' },
        { name: '마력의 수정', type: 'equipment', slot: 'subWeapon' }, // Magical focus
        { name: '수호의 보주', type: 'equipment', slot: 'subWeapon' }, // Magical focus
        { name: '정령의 고서', type: 'equipment', slot: 'subWeapon' }, // Magical focus
        { name: '나무 화살통', type: 'equipment', slot: 'subWeapon' },
        { name: '정령의 화살통', type: 'equipment', slot: 'subWeapon' },
        { name: '강철 화살통', type: 'equipment', slot: 'subWeapon' },
    ],

    // Head Armor
    hat: [
        { name: '천 두건', type: 'equipment', slot: 'hat' },
        { name: '가죽 모자', type: 'equipment', slot: 'hat' },
        { name: '사슬 후드', type: 'equipment', slot: 'hat' },
        { name: '강철 투구', type: 'equipment', slot: 'hat' },
        { name: '마법사 모자', type: 'equipment', slot: 'hat' },
        { name: '왕관', type: 'equipment', slot: 'hat' },
        { name: '야만의 투구', type: 'equipment', slot: 'hat' },
    ],

    // Chest Armor
    chest: [
        { name: '천 로브', type: 'equipment', slot: 'chest' },
        { name: '가죽 조끼', type: 'equipment', slot: 'chest' },
        { name: '사슬 갑옷', type: 'equipment', slot: 'chest' },
        { name: '판금 갑옷', type: 'equipment', slot: 'chest' },
        { name: '마법사 로브', type: 'equipment', slot: 'chest' },
        { name: '용의 비늘 갑옷', type: 'equipment', slot: 'chest' },
        { name: '암살자의 튜닉', type: 'equipment', slot: 'chest' },
    ],

    // Leg Armor
    legs: [
        { name: '천 바지', type: 'equipment', slot: 'legs' },
        { name: '가죽 바지', type: 'equipment', slot: 'legs' },
        { name: '사슬 각반', type: 'equipment', slot: 'legs' },
        { name: '강철 각반', type: 'equipment', slot: 'legs' },
        { name: '마법사 하의', type: 'equipment', slot: 'legs' },
        { name: '영혼의 다리 보호대', type: 'equipment', slot: 'legs' },
    ],

    // Foot Armor
    feet: [
        { name: '천 신발', type: 'equipment', slot: 'feet' },
        { name: '가죽 장화', type: 'equipment', slot: 'feet' },
        { name: '사슬 장화', type: 'equipment', slot: 'feet' },
        { name: '강철 장화', type: 'equipment', slot: 'feet' },
        { name: '마법사 신발', type: 'equipment', slot: 'feet' },
        { name: '민첩의 장화', type: 'equipment', slot: 'feet' },
    ],

    // Shoulder Armor
    shoulder: [
        { name: '천 견갑', type: 'equipment', slot: 'shoulder' },
        { name: '가죽 견갑', type: 'equipment', slot: 'shoulder' },
        { name: '사슬 견갑', type: 'equipment', slot: 'shoulder' },
        { name: '강철 견갑', type: 'equipment', slot: 'shoulder' },
        { name: '용사 견갑', type: 'equipment', slot: 'shoulder' },
        { name: '그림자 견갑', type: 'equipment', slot: 'shoulder' },
    ],

    // Wrist Armor
    wrist: [
        { name: '천 손목 보호대', type: 'equipment', slot: 'wrist' },
        { name: '가죽 팔목 보호대', type: 'equipment', slot: 'wrist' },
        { name: '강철 팔목 보호대', type: 'equipment', slot: 'wrist' },
        { name: '마법의 팔목 보호대', type: 'equipment', slot: 'wrist' },
        { name: '결속의 팔찌', type: 'equipment', slot: 'wrist' },
    ],

    // Neck Accessories
    neck: [
        { name: '나무 펜던트', type: 'equipment', slot: 'neck' },
        { name: '은 아뮬렛', type: 'equipment', slot: 'neck' },
        { name: '마력의 탈리스만', type: 'equipment', slot: 'neck' },
        { name: '수호의 메달리온', type: 'equipment', slot: 'neck' },
        { name: '불멸의 목걸이', type: 'equipment', slot: 'neck' },
    ],

    // Ring Accessories
    ring: [
        { name: '낡은 반지', type: 'equipment', slot: 'ring' },
        { name: '은 반지', type: 'equipment', slot: 'ring' },
        { name: '마력의 반지', type: 'equipment', slot: 'ring' },
        { name: '수호의 반지', type: 'equipment', slot: 'ring' },
        { name: '민첩의 밴드', type: 'equipment', slot: 'ring' },
        { name: '생명의 고리', type: 'equipment', slot: 'ring' },
    ]
};

export const AFFIX_PREFIXES = {
    lifesteal: '피의',
    critChance: '치명적인',
    critDamage: '파괴적인',
    elementalDamage_fire: '화염의',
    elementalDamage_ice: '냉기의',
    elementalDamage_poison: '독의',
    elementalDamage_lightning: '번개의',
    statusEffectBleed: '출혈의',
    statusEffectPoison: '맹독의',
    strengthBonus: '강력한',
    dexterityBonus: '민첩한',
    intelligenceBonus: '지적인',
    vitalityBonus: '건강한',
};

export const AFFIX_TYPES = {
    // Flat Damage Affixes
    bonusDamageFlat: { type: 'damage', format: (val) => `+${val} Damage` },
    bonusDamageRange: { type: 'damage', minMax: true, format: (min, max) => `+${min}-${max} Damage` },

    // Elemental Damage Affixes (e.g., Fire Damage, Ice Damage)
    elementalDamage: { type: 'elemental', minMax: true, format: (min, max, type) => `+${min}-${max} ${ELEMENTAL_TYPES[type] || type} Damage` },

    // Stat Bonus Affixes (e.g., +Strength, +Dexterity)
    strengthBonus: { type: 'stat', stat: 'strength', format: (val) => `+${val} Strength` },
    dexterityBonus: { type: 'stat', stat: 'dexterity', format: (val) => `+${val} Dexterity` },
    intelligenceBonus: { type: 'stat', stat: 'intelligence', format: (val) => `+${val} Intelligence` },
    vitalityBonus: { type: 'stat', stat: 'vitality', format: (val) => `+${val} Vitality` },

    // Combat Mechanic Affixes
    critChance: { type: 'combat', format: (val) => `+${(val * 100).toFixed(0)}% Crit Chance` },
    critDamage: { type: 'combat', format: (val) => `+${(val * 100).toFixed(0)}% Crit Damage` },
    lifesteal: { type: 'combat', format: (val) => `+${(val * 100).toFixed(0)}% Lifesteal` },

    // Proc-on-kill Affixes
    procOnKillHellfire: { type: 'proc', chanceVal: true, format: (chance) => `${(chance * 100).toFixed(0)}% Chance for Hellfire on Kill` },

    // Status Effect Affixes (e.g., Bleed, Poison)
    statusEffectBleed: { type: 'statusEffect', effectType: 'bleed', chanceVal: true, format: (chance, magnitude, duration) => `${(chance * 100).toFixed(0)}% Chance to Bleed (Mag:${magnitude}, Dur:${duration})` },
    statusEffectPoison: { type: 'statusEffect', effectType: 'poison', chanceVal: true, format: (chance, magnitude, duration) => `${(chance * 100).toFixed(0)}% Chance to Poison (Mag:${magnitude}, Dur:${duration})` },
    
    // Global Damage Multiplier
    damageMultiplier: { type: 'damage', format: (val) => `+${(val * 100).toFixed(0)}% Total Damage` },
};

export const ELEMENTAL_TYPES = {
    fire: '화염',
    ice: '냉기',
    poison: '독',
    lightning: '번개',
    dark: '어둠'
};

export const UNIQUE_ITEM_NAMES_BY_RARITY_AND_SLOT = {
    // Legendary Unique Items
    legendary: {
        mainWeapon: {
            // Swords
            '엑스칼리버': {
                baseName: '강철 장검', // 어떤 일반 아이템을 기반으로 하는지
                stats: { strength: 24, vitality: 12 },
                affixes: [{ type: 'physicalAttack', value: 36 }, { type: 'critChance', value: 0.1 }],
                specialEffects: [{ type: 'auraDefense', value: 6 }, { type: 'physicalBlockChance', value: 0.1 },
                    { type: 'statusEffectImmunityOnHit', chance: 0.05, duration: 2 }],
                weaponType: 'physical',
                description: '전설적인 영웅만이 휘두를 수 있는 신성한 검.',
                color: '#FFD700'
            },
            '아론다이트': {
                baseName: '대검',
                stats: { strength: 30, agility: 6 },
                affixes: [{ type: 'physicalAttack', value: 42 }, { type: 'lifesteal', value: 0.05 }],
                specialEffects: [{ type: 'lifestealOnKill', value: 0.05, duration: 5 }],
                weaponType: 'physical',
                description: '호수의 기사가 사용했던 피에 굶주린 검.',
                color: '#FFD700'
            },
            '궁니르': {
                baseName: '미늘창', // 스피어/폴암 계열
                stats: { strength: 21.6, mentality: 14.4 },
                affixes: [{ type: 'physicalAttack', value: 33.6 }, { type: 'elementalDamage', elementType: 'lightning', min: 12, max: 24 }],
                specialEffects: [{ type: 'piercingShot', value: 0.2 }],
                weaponType: 'physical',
                description: '결코 빗나가지 않는다는 신의 창.',
                color: '#FFD700'
            },
            '티르빙': {
                baseName: '대검',
                stats: { strength: 36, luck: 12 },
                affixes: [{ type: 'physicalAttack', value: 48 }, { type: 'critDamage', value: 0.24 }],
                specialEffects: [{ type: 'onHitAttackDebuff', chance: 0.1, magnitude: 0.15, duration: 3 }],
                weaponType: 'physical',
                description: '들기만 해도 주인을 파멸로 이끄는 저주받은 검.',
                color: '#FFD700'
            },
            '프라가라흐': {
                baseName: '대검',
                stats: { intelligence: 24, agility: 12 },
                affixes: [{ type: 'magicalAttack', value: 36 }, { type: 'statusEffectBleed', chance: 0.1, magnitude: 2.4, duration: 3 }],
                specialEffects: [{ type: 'manaRegenOnSpell', value: 10 },{ type: 'onHitFireball', chance: 0.15, magnitude: 30 }],
                weaponType: 'magical', // 마법검으로 분류
                description: '대답하는 검이라 불리는 요정의 마검.',
                color: '#FFD700'
            },
            // Axes
            '묠니르': {
                baseName: '전투 도끼',
                stats: { strength: 42, vitality: 18 },
                affixes: [{ type: 'physicalAttack', value: 54 }, { type: 'elementalDamage', elementType: 'lightning', min: 18, max: 30 }],
                specialEffects: [{ type: 'chainLightningProc', chance: 0.1 },{ type: 'onAttackStun', chance: 0.05, duration: 1 }],
                weaponType: 'physical',
                description: '천둥의 신이 사용하는 강력한 망치.',
                color: '#FFD700'
            },
            '스톰브레이커': {
                baseName: '양손 도끼',
                stats: { strength: 48, mentality: 12 },
                affixes: [{ type: 'physicalAttack', value: 60 }, { type: 'critChance', value: 0.15 }],
                specialEffects: [{ type: 'onHitDefenseBreak', chance: 0.1, magnitude: 0.1, duration: 3 }],
                weaponType: 'physical',
                description: '신들의 무기를 부수는 거대한 도끼.',
                color: '#FFD700'
            },
            '흐룬팅': {
                baseName: '피의 도끼', // BASE_ITEMS에 없으므로 '전투 도끼'로 대체
                stats: { strength: 33.6, vitality: 14.4 },
                affixes: [{ type: 'physicalAttack', value: 45.6 }, { type: 'lifesteal', value: 0.08 }],
                specialEffects: [{ type: 'speedBoostOnKill', value: 0.1, duration: 5 }],
                weaponType: 'physical',
                description: '적의 피를 마시면 강해지는 도끼.',
                color: '#FFD700'
            },
            // Staves
            '헤르메스의 케뤼케이온': {
                baseName: '수정 지팡이',
                stats: { intelligence: 30, mentality: 18 },
                affixes: [{ type: 'magicalAttack', value: 42 }, { type: 'magicFind', value: 0.1 }],
                specialEffects: [{ type: 'movementSpeedBonus', value: 0.1 },{ type: 'magicFindBonus', value: 0.05 }],
                weaponType: 'magical',
                description: '신들의 전령이 사용하던 마법 지팡이.',
                color: '#FFD700'
            },
            '이둔의 지팡이': {
                baseName: '수정 지팡이',
                stats: { vitality: 24, mentality: 24 },
                affixes: [{ type: 'magicalDefense', value: 30 }, { type: 'maxHp', value: 120 }], // maxHp는 derived stat이므로 직접 추가.
                specialEffects: [{ type: 'hpRegen', value: 5 },{ type: 'manaRegen', value: 5 }],
                weaponType: 'magical',
                description: '영원한 젊음을 가져다주는 황금 사과의 지팡이.',
                color: '#FFD700'
            },
            '게피온의 지팡이': {
                baseName: '현자의 지팡이',
                stats: { intelligence: 36, mentality: 30 },
                affixes: [{ type: 'magicalAttack', value: 54 }, { type: 'elementalDamageBonus', value: 0.24 }],
                specialEffects: [{ type: 'allElementalResistance', value: 0.1 }],
                weaponType: 'magical',
                description: '모든 원소를 다루는 대현자의 지팡이.',
                color: '#FFD700'
            },
            // Bows
            '아르테미스의 활': {
                baseName: '장궁',
                stats: { agility: 30, luck: 12 },
                affixes: [{ type: 'rangedAttack', value: 48 }, { type: 'critChance', value: 0.12 }],
                specialEffects: [{ type: 'multiShot', chance: 0.1, count: 1 }],
                weaponType: 'ranged',
                description: '사냥의 여신이 사용했던 신비로운 활.',
                color: '#FFD700'
            },
            '아폴론의 활': {
                baseName: '장궁',
                stats: { agility: 24, mentality: 18 },
                affixes: [{ type: 'rangedAttack', value: 42 }, { type: 'elementalDamage', elementType: 'fire', min: 12, max: 24 }],
                specialEffects: [{ type: 'statusEffectBurn', chance: 0.15, magnitude: 2, duration: 3 }],
                weaponType: 'ranged',
                description: '태양의 신이 사용했던 불꽃의 활.',
                color: '#FFD700'
            },
            '타니아의 활': {
                baseName: '엘프 활',
                stats: { agility: 36, luck: 6 },
                affixes: [{ type: 'rangedAttack', value: 54 }, { type: 'evasion', value: 0.05 }],
                specialEffects: [{ type: 'speedOnEvade', value: 0.1, duration: 2 }],
                weaponType: 'ranged',
                description: '숲의 정령이 깃든 엘프 여왕의 활.',
                color: '#FFD700'
            },
            // Crossbows
            '하데스의 저승 석궁': {
                baseName: '강철 석궁',
                stats: { strength: 18, agility: 30 },
                affixes: [{ type: 'rangedAttack', value: 48 }, { type: 'elementalDamage', elementType: 'dark', min: 18, max: 36 }],
                specialEffects: [{ type: 'statusEffectPoison', chance: 0.2, magnitude: 3, duration: 5 },{ type: 'onHitSlow', chance: 0.1, magnitude: 0.2, duration: 3 }],
                weaponType: 'ranged',
                description: '저승의 신이 다루는 맹독의 석궁.',
                color: '#FFD700'
            },
        },
        chest: {
            '아테나의 흉갑': {
                baseName: '판금 갑옷',
                stats: { strength: 18, vitality: 30 },
                affixes: [{ type: 'physicalDefense', value: 36 }, { type: 'magicalDefense', value: 18 }],
                specialEffects: [{ type: 'statusEffectResistance', value: 0.1 }],
                description: '지혜와 전쟁의 여신이 수여한 방어구.',
                color: '#FFD700'
            },
            '헤라클레스의 갑옷': {
                baseName: '판금 갑옷',
                stats: { strength: 36, vitality: 24 },
                affixes: [{ type: 'physicalDefense', value: 48 }, { type: 'maxHp', value: 180 }],
                specialEffects: [{ type: 'damageReductionAura', value: 0.05 },{ type: 'lowHpDefenseBoost', threshold: 0.3, value: 0.15 }],
                description: '영웅 헤라클레스의 불굴의 힘이 깃든 갑옷.',
                color: '#FFD700'
            },
            '오딘의 로브': {
                baseName: '마법사 로브',
                stats: { intelligence: 30, mentality: 30 },
                affixes: [{ type: 'magicalAttack', value: 36 }, { type: 'maxMp', value: 120 }],
                specialEffects: [{ type: 'manaRegen', value: 5 }],
                description: '모든 지식을 담은 위대한 신의 로브.',
                color: '#FFD700'
            },
            '프레이야의 망토': {
                baseName: '마법사 로브',
                stats: { agility: 24, luck: 24 },
                affixes: [{ type: 'magicFind', value: 0.15 }, { type: 'evasion', value: 0.08 }],
                specialEffects: [{ type: 'goldBonus', value: 0.1 },{ type: 'magicFindBonus', value: 0.05 }],
                description: '사랑과 풍요의 여신이 수여한 행운의 망토.',
                color: '#FFD700'
            },
            '파프니르의 갑옷': {
                baseName: '용의 비늘 갑옷',
                stats: { strength: 24, vitality: 36 },
                affixes: [{ type: 'physicalDefense', value: 42 }, { type: 'elementalDamageResistance_fire', value: 0.24 }], // 저항력 (새로운 affix 타입 필요)
                specialEffects: [{ type: 'goldBonus', value: 0.15 }],
                description: '탐욕스러운 용 파프니르의 비늘로 만들어진 갑옷.',
                color: '#FFD700'
            },
        },
        hat: {
            '아레스의 투구': {
                baseName: '강철 투구',
                stats: { strength: 24, vitality: 12 },
                affixes: [{ type: 'physicalDefense', value: 24 }, { type: 'critDamage', value: 0.18 }],
                specialEffects: [{ type: 'onHitFear', chance: 0.05, duration: 2 }],
                description: '전쟁의 신이 착용하던 불멸의 투구.',
                color: '#FFD700'
            },
            '토르의 투구': {
                baseName: '강철 투구',
                stats: { strength: 30, mentality: 12 },
                affixes: [{ type: 'physicalAttack', value: 24 }, { type: 'elementalDamageResistance_lightning', value: 0.12 }],
                specialEffects: [{ type: 'chainLightningProc', chance: 0.1 }],
                description: '천둥의 힘이 깃든 신의 투구.',
                color: '#FFD700'
            },
            '메르가드의 모자': {
                baseName: '마법사 모자',
                stats: { intelligence: 24, luck: 12 },
                affixes: [{ type: 'magicalAttack', value: 18 }, { type: 'magicFind', value: 0.1 }],
                specialEffects: [{ type: 'manaCostReduction', value: 0.1 }],
                description: '고대 마법사의 지식이 담긴 모자.',
                color: '#FFD700'
            },
            '발키리의 왕관': {
                baseName: '왕관',
                stats: { vitality: 24, mentality: 18 },
                affixes: [{ type: 'maxHp', value: 120 }, { type: 'magicalDefense', value: 18 }],
                specialEffects: [{ type: 'healingEffectiveness', value: 0.1 },{ type: 'hpRegen', value: 5 }],
                description: '전장의 영혼을 인도하는 발키리의 왕관.',
                color: '#FFD700'
            },
        },
        neck: {
            '로키의 목걸이': {
                baseName: '은 아뮬렛',
                stats: { agility: 18, luck: 18 },
                affixes: [{ type: 'evasion', value: 0.05 }, { type: 'goldFind', value: 0.1 }],
                specialEffects: [{ type: 'teleportOnEvade', chance: 0.05 }],
                description: '장난의 신이 남긴 기만적인 목걸이.',
                color: '#FFD700'
            },
            '프리그의 목걸이': {
                baseName: '은 아뮬렛',
                stats: { mentality: 24, vitality: 12 },
                affixes: [{ type: 'magicalDefense', value: 12 }, { type: 'statusEffectResistance', value: 0.12 }], // 새로운 affix 타입
                specialEffects: [{ type: 'statusEffectResistance', value: 0.15 },{ type: 'damageReductionAura', value: 0.03 }],
                description: '사랑과 운명의 여신이 수여한 평화로운 목걸이.',
                color: '#FFD700'
            },
            '오시리스의 눈': {
                baseName: '불멸의 목걸이',
                stats: { intelligence: 24, mentality: 24 },
                affixes: [{ type: 'maxMp', value: 96 }, { type: 'manaRegen', value: 6 }], // manaRegen (새로운 affix 타입)
                specialEffects: [{ type: 'manaRegen', value: 10 },{ type: 'chanceToSurviveLethal', chance: 0.05 }],
                description: '죽음과 부활의 신이 가진 영원의 눈.',
                color: '#FFD700'
            },
        },
        ring: {
            '반지 중의 반지': {
                baseName: '마력의 반지',
                stats: { strength: 12, intelligence: 12, agility: 12, vitality: 12, mentality: 12, luck: 12 },
                affixes: [{ type: 'physicalAttack', value: 12 }, { type: 'magicalAttack', value: 12 }, { type: 'rangedAttack', value: 12 }],
                specialEffects: [{ type: 'allStatsBonus', value: 5 },{ type: 'elementalDamageBonus', value: 0.1 }],
                description: '모든 힘을 담고 있는 절대적인 반지.',
                color: '#FFD700'
            },
            '드로프니르': {
                baseName: '마력의 반지',
                stats: { luck: 30 },
                affixes: [{ type: 'goldFind', value: 0.2 }, { type: 'magicFind', value: 0.1 }],
                specialEffects: [{ type: 'goldBonus', value: 0.25 },{ type: 'magicFindBonus', value: 0.1 }],
                description: '매 아홉 번째 밤마다 아홉 개의 새로운 반지를 만들어내는 황금 반지.',
                color: '#FFD700'
            },
            '우로보로스의 고리': {
                baseName: '영원의 반지', // BASE_ITEMS에 없으므로 '마력의 반지'로 대체
                stats: { vitality: 24, mentality: 24 },
                affixes: [{ type: 'maxHp', value: 96 }, { type: 'maxMp', value: 60 }, { type: 'hpRegen', value: 3.6 }], // hpRegen (새로운 affix 타입)
                specialEffects: [{ type: 'hpRegen', value: 10 },{ type: 'manaRegen', value: 10 },{ type: 'chanceToResurrect', chance: 0.01 }],
                description: '뱀이 자신의 꼬리를 물고 있는 영원과 순환의 상징.',
                color: '#FFD700'
            },
        },
        subWeapon: {
            '아이기스': {
                baseName: '강철 방패',
                stats: { strength: 24, vitality: 36 },
                affixes: [{ type: 'physicalDefense', value: 48 }, { type: 'magicalDefense', value: 24 }],
                specialEffects: [{ type: 'physicalBlockChance', value: 0.15 },{ type: 'reflectDamage', chance: 0.1, magnitude: 0.2 }],
                description: '제우스의 방패로 모든 공격을 막아낸다.',
                color: '#FFD700'
            },
            '호루스의 눈': {
                baseName: '수호의 보주',
                stats: { intelligence: 30, mentality: 30 },
                affixes: [{ type: 'magicalDefense', value: 36 }, { type: 'critChance', value: 0.05 }],
                specialEffects: [{ type: 'magicFindBonus', value: 0.1 },{ type: 'onHitBlind', chance: 0.1, duration: 2 }],
                description: '고대 이집트의 지혜가 담긴 수호의 눈.',
                color: '#FFD700'
            },
        }
    },
    // Mystic Unique Items
    mystic: {
        mainWeapon: {
            '데미안의 복수': {
                baseName: '대검',
                stats: { strength: 80, agility: 30, vitality: 40 },
                affixes: [{ type: 'physicalAttack', value: 72 }, { type: 'critDamage', value: 0.36 }],
                specialEffects: [{ type: 'critDamageBonus', value: 0.1 }],
                weaponType: 'physical',
                description: '악마의 힘이 깃든 파괴적인 검.',
                color: '#FF4500'
            },
            '천상의 지팡이': {
                baseName: '현자의 지팡이',
                stats: { intelligence: 65, mentality: 30, luck: 20 },
                affixes: [{ type: 'magicalAttack', value: 66 }, { type: 'elementalDamageBonus', value: 0.36 }],
                specialEffects: [{ type: 'healingAura', value: 10 }],
                weaponType: 'magical',
                description: '천사들의 힘을 빌어 마법을 증폭시키는 지팡이.',
                color: '#FF4500'
            },
            '태양파괴자의 활': {
                baseName: '장궁',
                stats: { agility: 80, strength: 40, intelligence: 20},
                affixes: [{ type: 'rangedAttack', value: 60 }, { type: 'elementalDamage', elementType: 'fire', min: 24, max: 48 }],
                specialEffects: [{ type: 'areaFireDamage', chance: 0.1, magnitude: 20 },{ type: 'fireResistanceDebuff', chance: 0.05, magnitude: 0.1, duration: 5 }],
                weaponType: 'ranged',
                description: '태양의 불꽃을 담아 적을 섬멸하는 활.',
                color: '#FF4500'
            },
            '스타포스 블레이드': { // 광선검은 BASE_ITEMS에 없으므로 '강철 장검'으로 대체
                baseName: '강철 장검',
                stats: { intelligence: 36, agility: 24 },
                affixes: [{ type: 'magicalAttack', value: 54 }, { type: 'physicalAttack', value: 24 }, { type: 'critChance', value: 0.05 }],
                specialEffects: [{ type: 'meteorStrikeProc', chance: 0.08, magnitude: 50 }],
                weaponType: 'magical',
                description: '별의 힘으로 만들어진 빛나는 검.',
                color: '#FF4500'
            },
        },
        chest: {
            '용언의 갑옷': {
                baseName: '용의 비늘 갑옷',
                stats: { strength: 40, vitality: 100 },
                affixes: [{ type: 'physicalDefense', value: 60 }, { type: 'maxHp', value: 240 }, { type: 'elementalDamageResistance', value: 0.12 }], // 모든 원소 저항력
                specialEffects: [{ type: 'damageReductionAura', value: 0.06 },{ type: 'allElementalResistance', value: 0.1 },
                    { type: 'chanceToNegateDamage', chance: 0.03 }],
                description: '고대 용의 언어가 새겨진 견고한 갑옷.',
                color: '#FF4500'
            },
            '밤의 장막': {
                baseName: '암살자의 튜닉',
                stats: { agility: 100, luck: 40 },
                affixes: [{ type: 'evasion', value: 0.1 }, { type: 'magicFind', value: 0.2 }],
                specialEffects: [{ type: 'stealthAttackBonus', value: 0.2 }],
                description: '밤의 어둠 속에 숨어 적을 기습하는 튜닉.',
                color: '#FF4500'
            },
        },
        hat: {
            '솔로몬의 지혜': {
                baseName: '왕관',
                stats: { intelligence: 99, mentality: 66 },
                affixes: [{ type: 'magicalAttack', value: 36 }, { type: 'maxMp', value: 180 }],
                specialEffects: [{ type: 'manaCostReduction', value: 0.15 }],
                description: '고대 왕의 지혜가 깃든 왕관.',
                color: '#FF4500'
            },
        },
    },
    // Legacy Unique Items
    legacy: {
        mainWeapon: {
            '운명의 파괴자': {
                baseName: '룬 검',
                stats: { strength: 60, vitality: 30, luck: 30 },
                affixes: [{ type: 'physicalAttack', value: 96 }, { type: 'critChance', value: 0.2 }, { type: 'critDamage', value: 0.6 }],
                specialEffects: [{ type: 'onCritInstantKill', chance: 0.01 }],
                weaponType: 'physical',
                description: '운명을 거스르는 절대적인 파괴의 검.',
                color: '#00FFFF'
            },
            '그림자 송곳니': {
                baseName: '낡은 단검',
                stats: { strength: 25,agility: 60, vitality: 20, luck: 40 },
                affixes: [
                    { type: 'physicalAttack', value: 65 },{ type: 'critChance', value: 0.35 }
                ],
                specialEffects: [{ type: 'stealthAttackBonus', value: 0.45 },
                    { type: 'evasionOnCrit', chance: 0.5, duration: 2 }],
                weaponType: 'physical',
                description: '그림자 속에서 적의 숨통을 끊는 전설의 단검.',
                color: '#00FFFF'
            },
            '왕의 유산': {
                baseName: '녹슨 검',
                stats: { strength: 70, vitality: 45, luck: 20 },
                affixes: [
                    { type: 'physicalAttack', value: 90 }
                ],
                specialEffects: [{ type: 'auraDefense', value: 12 },
                    { type: 'goldBonus', value: 1.35 }],
                weaponType: 'physical',
                description: '쇠락한 왕국의 의지가 아직 남아 있는 검.',
                color: '#00FFFF'
            },
            '거신의 척추': {
                baseName: '대검',
                stats: { strength: 130, vitality: 70, luck: 5 },
                affixes: [
                    { type: 'physicalAttack', value: 180 },{ type: 'critDamage', value: 0.6 }
                ],
                specialEffects: [{ type: 'areaPhysicalDamageStun', chance: 0.25, magnitude: 120, duration: 2 },
                    { type: 'critDamageBonus', value: 0.45 }],
                weaponType: 'physical',
                description: '거대한 존재를 쓰러뜨린 자만이 들 수 있는 대검.',
                color: '#00FFFF'
            },
            '피의 톱날': {
                baseName: '작은 도끼',
                stats: { strength: 70, vitality: 35, luck: 15 },
                affixes: [
                    { type: 'physicalAttack', value: 100 },
                    { type: 'critChance', value: 0.1 }
                ],
                specialEffects: [{ type: 'areaPoisonCloud', chance: 0.3 },
                    { type: 'lifestealOnKill', value: 0.08, duration: 5 }],
                weaponType: 'physical',
                description: '작지만 잔혹한 베기로 수많은 전투를 치러온 전설의 도끼.',
                color: '#00FFFF'
            },
            '산을 가르는 자': {
                baseName: '양손 도끼',
                stats: { strength: 150, vitality: 80, luck: 5 },
                affixes: [
                    { type: 'physicalAttack', value: 220 }
                ],
                specialEffects: [{ type: 'onHitDefenseBreak', chance: 0.35, magnitude: 0.35, duration: 4 },
                    { type: 'damageBoostOnKill', value: 0.25, duration: 6 }],
                weaponType: 'physical',
                description: '산과 성문조차 가를 수 있다고 전해지는 신화적인 양손 도끼.',
                color: '#00FFFF'
            },
            '부러지지 않는 몽둥이': {
                baseName: '나무 몽둥이',
                stats: { strength: 60, vitality: 45, luck: 10 },
                affixes: [
                    { type: 'physicalAttack', value: 85 }
                ],
                specialEffects: [{ type: 'chanceToNegateDamage', chance: 0.18 },
                    { type: 'lowHpDefenseBoost', threshold: 0.3, value: 0.4 }],
                weaponType: 'physical',
                description: '단순하지만 끝까지 부러지지 않았던 집념의 둔기.',
                color: '#00FFFF'
            },

            '철의 심판': {
                baseName: '철퇴',
                stats: { strength: 95, vitality: 65, luck: 10 },
                affixes: [
                    { type: 'physicalAttack', value: 140 }
                ],
                specialEffects: [{ type: 'onAttackStun', chance: 0.25, duration: 2 },
                    { type: 'onHitAttackDebuff', chance: 0.4, magnitude: 0.25, duration: 4 }],
                weaponType: 'physical',
                description: '방어와 갑옷을 가리지 않고 내려치는 철의 심판.',
                color: '#00FFFF'
            },

            '멸망의 강타': {
                baseName: '전쟁 망치',
                stats: { strength: 150, vitality: 90, luck: 5 },
                affixes: [
                    { type: 'physicalAttack', value: 230 }
                ],
                specialEffects: [{ type: 'areaPhysicalDamageStun', chance: 0.3, magnitude: 150, duration: 3 },
                    { type: 'damageReductionAura', value: 0.15 }],
                weaponType: 'physical',
                description: '성벽과 군세를 함께 무너뜨렸다고 전해지는 전쟁 망치.',
                color: '#00FFFF'
            },

            '용의 이빨': {
                baseName: '짧은 창',
                stats: { strength: 85, vitality: 40, luck: 20 },
                affixes: [
                    { type: 'physicalAttack', value: 120 },
                    { type: 'critChance', value: 0.15 }
                ],
                specialEffects: [{ type: 'onHitFear', chance: 0.25, duration: 2 },
                    { type: 'piercingShot', value: 0.35 }],
                weaponType: 'physical',
                description: '빠르고 정확한 찌르기로 적을 꿰뚫는 전설의 창.',
                color: '#00FFFF'
            },

            '전장의 파수꾼': {
                baseName: '미늘창',
                stats: { strength: 120, vitality: 70, luck: 10 },
                affixes: [
                    { type: 'physicalAttack', value: 180 }
                ],
                specialEffects: [{ type: 'auraDefense', value: 18 },
                    { type: 'onHitSlow', chance: 0.4, magnitude: 0.35, duration: 3 }],
                weaponType: 'physical',
                description: '전열을 유지하며 수많은 전장을 지켜낸 장병기의 상징.',
                color: '#00FFFF'
            },
            '세계수의 새싹': {
                baseName: '나무 지팡이',
                stats: { strength: 15, vitality: 55, luck: 30, intelligence: 70, mentality: 65 },
                affixes: [
                    { type: 'magicalAttack', value: 130 }
                ],
                specialEffects: [{ type: 'healingAura', value: 8 },
                    { type: 'manaRegenOnSpell', value: 12 }],
                weaponType: 'magical',
                description: '자연의 마력을 천천히 증폭시키는 세계수의 지팡이.',
                color: '#00FFFF'
            },

            '수정의 지배자': {
                baseName: '수정 지팡이',
                stats: { strength: 20, vitality: 65, luck: 25, intelligence: 90, mentality: 80 },
                affixes: [
                    { type: 'magicalAttack', value: 180 }
                ],
                specialEffects: [{ type: 'freeSpellCast', chance: 0.18 },
                    { type: 'allElementalResistance', value: 0.2 }],
                weaponType: 'magical',
                description: '순수한 수정이 마력을 안정적으로 증폭시킨다.',
                color: '#00FFFF'
            },

            '망각의 속삭임': {
                baseName: '낡은 완드',
                stats: { strength: 10, vitality: 40, luck: 70, intelligence: 85, mentality: 55 },
                affixes: [
                    { type: 'magicalAttack', value: 160 },
                    { type: 'critChance', value: 0.25 }
                ],
                specialEffects: [{ type: 'onCritInstantKill', chance: 0.03 },
                    { type: 'manaCostReduction', value: 0.25 }],
                weaponType: 'magical',
                description: '불안정하지만 폭발적인 주문을 이끌어내는 완드.',
                color: '#00FFFF'
            },

            '룬의 증폭기': {
                baseName: '룬 완드',
                stats: { strength: 15, vitality: 45, luck: 60, intelligence: 100, mentality: 70 },
                affixes: [
                    { type: 'magicalAttack', value: 200 }
                ],
                specialEffects: [{ type: 'chainLightningProc', chance: 0.25 },
                    { type: 'manaRegenOnSpell', value: 18 }],
                weaponType: 'magical',
                description: '고대 룬이 주문의 구조 자체를 강화한다.',
                color: '#00FFFF'
            },

            '심연의 핵': {
                baseName: '마력의 오브',
                stats: { strength: 5, vitality: 70, luck: 40, intelligence: 110, mentality: 90 },
                affixes: [
                    { type: 'magicalAttack', value: 230 }
                ],
                specialEffects: [{ type: 'meteorStrikeProc', chance: 0.12, magnitude: 180 },
                    { type: 'chanceToNegateDamage', chance: 0.1 }],
                weaponType: 'magical',
                description: '응축된 마력이 쉼 없이 방출되는 오브.',
                color: '#00FFFF'
            },

            '영원의 서약서': {
                baseName: '고대 마법서',
                stats: { strength: 10, vitality: 80, luck: 45, intelligence: 120, mentality: 110 },
                affixes: [
                    { type: 'magicalAttack', value: 260 }
                ],
                specialEffects: [{ type: 'freeSpellCast', chance: 0.25 },
                    { type: 'chanceToResurrect', chance: 0.12 }],
                weaponType: 'magical',
                description: '마법사의 정신과 지식을 끝없이 시험하는 고대의 서적.',
                color: '#00FFFF'
            },
            '세계수의 가지': {
                baseName: '현자의 지팡이', // 대현자의 지팡이는 BASE_ITEMS에 없으므로 '현자의 지팡이'로 대체
                stats: { intelligence: 60, mentality: 60, vitality: 36 },
                affixes: [{ type: 'magicalAttack', value: 84 }, { type: 'elementalDamageBonus', value: 0.6 }, { type: 'manaRegen', value: 12 }],
                specialEffects: [{ type: 'healingEffectiveness', value: 0.3 },
                    { type: 'healingAura', value: 12 }],
                weaponType: 'magical',
                description: '모든 생명의 근원, 세계수의 힘이 깃든 지팡이.',
                color: '#00FFFF'
            },
            '아스가르드의 심장': { // 파괴자의 망치는 BASE_ITEMS에 없으므로 '전쟁 망치'로 대체
                baseName: '전쟁 망치',
                stats: { strength: 72, vitality: 48, mentality: 24 },
                affixes: [{ type: 'physicalAttack', value: 108 }, { type: 'physicalDefense', value: 36 }, { type: 'maxHp', value: 360 }],
                specialEffects: [{ type: 'areaPhysicalDamageStun', chance: 0.25, magnitude: 120, duration: 2 },
                    { type: 'damageReductionAura', value: 0.15 }],
                weaponType: 'physical',
                description: '신들의 고향 아스가르드의 핵으로 만들어진 망치.',
                color: '#00FFFF'
            },
            '아발론의 속삭임': {
                baseName: '엘프 활',
                stats: { agility: 60, luck: 36, mentality: 24 },
                affixes: [{ type: 'rangedAttack', value: 90 }, { type: 'evasion', value: 0.15 }, { type: 'magicFind', value: 0.3 }],
                specialEffects: [{ type: 'stealthOnRangedHit', chance: 0.25, duration: 3 },
                    { type: 'magicFindBonus', value: 0.25 }],
                weaponType: 'ranged',
                description: '전설의 섬 아발론에서 전해 내려오는 신비로운 활.',
                color: '#00FFFF'
            },
            '바람의 첫 화살': {
                baseName: '짧은 활',
                stats: { strength: 55, vitality: 35, luck: 75 },
                affixes: [
                    { type: 'physicalAttack', value: 120 },{ type: 'evasion', value: 0.15 },
                    { type: 'critChance', value: 0.2 }
                ],
                specialEffects: [{ type: 'multiShot', chance: 0.3, count: 1 },
                    { type: 'speedOnEvade', value: 0.25, duration: 2 }],
                weaponType: 'ranged',
                description: '가볍고 빠른 사격으로 적을 압도하는 전설의 활.',
                color: '#00FFFF'
            },
            '추적자의 의지': {
                baseName: '사냥꾼의 활',
                stats: { strength: 65, vitality: 45, luck: 85 },
                affixes: [
                    { type: 'physicalAttack', value: 150 },{ type: 'evasion', value: 0.15 },
                    { type: 'critChance', value: 0.25 }
                ],
                specialEffects: [{ type: 'chanceToRoot', chance: 0.3 },
                    { type: 'piercingShot', value: 0.25 }],
                weaponType: 'ranged',
                description: '한 번 겨눈 목표는 결코 놓치지 않는 사냥꾼의 활.',
                color: '#00FFFF'
            },
            '천리안': {
                baseName: '장궁',
                stats: { strength: 90, vitality: 55, luck: 70 },
                affixes: [
                    { type: 'physicalAttack', value: 190 },{ type: 'evasion', value: 0.15 },
                ],
                specialEffects: [{ type: 'piercingShot', value: 0.4 },
                    { type: 'critDamageBonus', value: 0.4 }],
                weaponType: 'ranged',
                description: '먼 거리에서도 정확한 일격을 보장하는 장궁.',
                color: '#00FFFF'
            },
            '기계식 속사포': {
                baseName: '가벼운 석궁',
                stats: { strength: 75, vitality: 50, luck: 65 },
                affixes: [
                    { type: 'physicalAttack', value: 170 },{ type: 'evasion', value: 0.15 },
                    { type: 'critChance', value: 0.15 }
                ],
                specialEffects: [{ type: 'multiShot', chance: 0.35, count: 2 },
                    { type: 'onAttackStun', chance: 0.15, duration: 1 }],
                weaponType: 'ranged',
                description: '기계 구조로 안정적인 연속 사격이 가능한 석궁.',
                color: '#00FFFF'
            },
            '강철 관통자': {
                baseName: '강철 석궁',
                stats: { strength: 110, vitality: 65, luck: 50 },
                affixes: [
                    { type: 'physicalAttack', value: 220 }
                ],
                specialEffects: [{ type: 'piercingShot', value: 0.6 },
                    { type: 'onHitDefenseBreak', chance: 0.3, magnitude: 0.3, duration: 4 }],
                weaponType: 'ranged',
                description: '강철 볼트로 방어를 관통하는 중화기 석궁.',
                color: '#00FFFF'
            },
            '실바나의 노래': {
                baseName: '엘프 활',
                stats: { strength: 80, vitality: 45, luck: 100 },
                affixes: [
                    { type: 'physicalAttack', value: 200 },
                    { type: 'critChance', value: 0.3 }
                ],
                specialEffects: [{ type: 'stealthCritChanceBonus', value: 0.35 },
                    { type: 'stealthOnRangedHit', chance: 0.3, duration: 4 }],
                weaponType: 'ranged',
                description: '엘프의 감각과 자연의 흐름이 하나 된 신화의 활.',
                color: '#00FFFF'
            },

            '산맥의 기어': {
                baseName: '드워프 석궁',
                stats: { strength: 130, vitality: 80, luck: 40 },
                affixes: [
                    { type: 'physicalAttack', value: 260 }
                ],
                specialEffects: [{ type: 'areaPhysicalDamageStun', chance: 0.2, magnitude: 180, duration: 2 },
                    { type: 'physicalBlockChance', value: 0.25 }],
                weaponType: 'ranged',
                description: '드워프의 기술력이 집약된 파괴적인 석궁.',
                color: '#00FFFF'
            }
        },
        subWeapon:{

            '숲의 수호판': {
                baseName: '나무 방패',
                stats: { strength: 40, vitality: 80, luck: 20, intelligence: 10, mentality: 20 },
                affixes: [
                    { type: 'physicalDefense', value: 120 }
                ],
                specialEffects: [{ type: 'physicalBlockChance', value: 0.18 },
                    { type: 'lowHpDefenseBoost', threshold: 0.3, value: 0.25 }],
                description: '거칠지만 충격을 흡수하는 기본적인 수호 방패.',
                color: '#00FFFF'
            },

            '강철 방벽': {
                baseName: '강철 방패',
                stats: { strength: 80, vitality: 120, luck: 15, intelligence: 10, mentality: 25 },
                affixes: [
                    { type: 'physicalDefense', value: 220 }
                ],
                specialEffects: [{ type: 'physicalBlockChance', value: 0.28 },
                    { type: 'reflectDamage', chance: 0.2, magnitude: 0.25 }],
                description: '강철로 제작되어 강력한 타격을 견뎌내는 방패.',
                color: '#00FFFF'
            },

            '기사의 서약': {
                baseName: '기사의 방패',
                stats: { strength: 100, vitality: 150, luck: 20, intelligence: 15, mentality: 40 },
                affixes: [
                    { type: 'physicalDefense', value: 300 },
                    { type: 'magicalDefense', value: 120 }
                ],
                specialEffects: [{ type: 'damageReductionAura', value: 0.15 },
                    { type: 'chanceToNegateDamage', chance: 0.15 }],
                description: '기사의 신념과 명예가 깃든 정통 수호 방패.',
                color: '#00FFFF'
            },

            '바람의 원반': {
                baseName: '버클러',
                stats: { strength: 50, vitality: 70, luck: 90, intelligence: 20, mentality: 30 },
                affixes: [
                    { type: 'physicalDefense', value: 140 },{ type: 'evasion', value: 0.15 },
                ],
                specialEffects: [{ type: 'speedOnEvade', value: 0.3, duration: 2 },
                    { type: 'teleportOnEvade', chance: 0.12 }],
                description: '기민한 움직임을 위해 설계된 경량 방패.',
                color: '#00FFFF'
            },

            '마력의 초점핵': {
                baseName: '마력의 수정',
                stats: { strength: 5, vitality: 50, luck: 30, intelligence: 110, mentality: 100 },
                affixes: [
                    { type: 'magicalDefense', value: 220 },{ type: 'evasion', value: 0.15 },
                ],
                specialEffects: [{ type: 'manaRegenOnSpell', value: 15 },
                    { type: 'freeSpellCast', chance: 0.2 }],
                description: '마법 시전을 안정화하는 순수 마력의 결정.',
                color: '#00FFFF'
            },

            '수호의 보주': {
                baseName: '수호의 보주',
                stats: { strength: 10, vitality: 70, luck: 25, intelligence: 120, mentality: 130 },
                affixes: [
                    { type: 'magicalDefense', value: 260 }
                ],
                specialEffects: [{ type: 'allElementalResistance', value: 0.3 },
                    { type: 'chanceToNegateDamage', chance: 0.18 }],
                description: '외부 마력을 굴절시켜 사용자를 보호하는 보주.',
                color: '#00FFFF'
            },

            '정령의 기록서': {
                baseName: '정령의 고서',
                stats: { strength: 5, vitality: 60, luck: 40, intelligence: 140, mentality: 120 },
                affixes: [
                    { type: 'magicalDefense', value: 240 }
                ],
                specialEffects: [{ type: 'healingEffectiveness', value: 0.35 },
                    { type: 'manaCostReduction', value: 0.25 }],
                description: '정령과의 계약이 기록된 고대의 마법서.',
                color: '#00FFFF'
            },

            '숲사냥꾼의 화살통': {
                baseName: '나무 화살통',
                stats: { strength: 30, vitality: 60, luck: 80, intelligence: 10, mentality: 20 },
                affixes: [
                    { type: 'physicalAttack', value: 60 },{ type: 'evasion', value: 0.15 },
                ],
                specialEffects: [{ type: 'multiShot', chance: 0.25, count: 1 },
                    { type: 'speedOnEvade', value: 0.2, duration: 2 }],
                description: '자연 속에서 장기간 사냥을 버틸 수 있도록 만들어진 화살통.',
                color: '#00FFFF'
            },

            '정령의 인도': {
                baseName: '정령의 화살통',
                stats: { strength: 35, vitality: 70, luck: 110, intelligence: 60, mentality: 50 },
                affixes: [
                    { type: 'physicalAttack', value: 90 }
                ],
                specialEffects: [{ type: 'chanceToRoot', chance: 0.3 },
                    { type: 'piercingShot', value: 0.25 }],
                description: '정령의 기운이 화살의 궤적을 인도하는 신비한 화살통.',
                color: '#00FFFF'
            },

            '강철 탄창': {
                baseName: '강철 화살통',
                stats: { strength: 70, vitality: 100, luck: 60, intelligence: 15, mentality: 25 },
                affixes: [
                    { type: 'physicalAttack', value: 120 }
                ],
                specialEffects: [{ type: 'piercingShot', value: 0.35 },
                    { type: 'onHitDefenseBreak', chance: 0.25, magnitude: 0.25, duration: 3 }],
                description: '강철 구조로 제작되어 전장에서도 안정성을 유지하는 화살통.',
                color: '#00FFFF'
            },




        },

        hat:{

            '성좌의 순례관': {
                baseName: '천 두건',
                stats: { strength: 10, vitality: 40, intelligence: 60, mentality: 70, luck: 20 },
                affixes: [
                    { type: 'magicalDefense', value: 48 },
                    { type: 'maxMp', value: 240 }
                ],
                specialEffects: [{ type: 'manaRegenOnSpell', value: 20 },
                    { type: 'freeSpellCast', chance: 0.12 }],
                description: '별의 흐름을 읽던 고대 순례자의 두건.',
                color: '#00FFFF'
            },

            '그림자 사냥왕의 모자': {
                baseName: '가죽 모자',
                stats: { strength: 35, vitality: 55, intelligence: 20, mentality: 30, luck: 60 },
                affixes: [
                    { type: 'physicalAttack', value: 42 },{ type: 'evasion', value: 0.15 },
                    { type: 'critChance', value: 0.18 }
                ],
                specialEffects: [ { type: 'stealthAttackBonus', value: 0.3 },
                    { type: 'stealthCritChanceBonus', value: 0.25 }],
                description: '어둠 속에서 사냥을 지배했던 왕의 흔적.',
                color: '#00FFFF'
            },

            '강철 서약의 후드': {
                baseName: '사슬 후드',
                stats: { strength: 45, vitality: 75, intelligence: 15, mentality: 35, luck: 15 },
                affixes: [
                    { type: 'physicalDefense', value: 84 },
                    { type: 'maxHp', value: 480 }
                ],
                specialEffects: [{ type: 'damageReductionAura', value: 0.08 },
                    { type: 'physicalBlockChance', value: 0.18 }],
                description: '무너지지 않겠다는 서약이 깃든 사슬 후드.',
                color: '#00FFFF'
            },

            '천공 파쇄자의 투구': {
                baseName: '강철 투구',
                stats: { strength: 80, vitality: 90, intelligence: 10, mentality: 30, luck: 10 },
                affixes: [
                    { type: 'physicalDefense', value: 96 },
                    { type: 'physicalAttack', value: 36 }
                ],
                specialEffects: [{ type: 'onAttackStun', chance: 0.18, duration: 2 },
                    { type: 'reflectDamage', chance: 0.25, magnitude: 0.3 }],
                description: '하늘을 꿰뚫은 전사의 투구.',
                color: '#00FFFF'
            },

            '아르카나 대현자의 관': {
                baseName: '마법사 모자',
                stats: { strength: 5, vitality: 35, intelligence: 90, mentality: 90, luck: 25 },
                affixes: [
                    { type: 'magicalAttack', value: 72 },
                    { type: 'elementalDamageBonus', value: 0.36 }
                ],
                specialEffects: [{ type: 'manaCostReduction', value: 0.2 },
                    { type: 'meteorStrikeProc', chance: 0.1, magnitude: 220 }],
                description: '원소와 하나가 된 대현자의 유물.',
                color: '#00FFFF'
            },

            '왕권의 성좌관': {
                baseName: '왕관',
                stats: { strength: 40, vitality: 65, intelligence: 55, mentality: 65, luck: 45 },
                affixes: [
                    { type: 'magicalDefense', value: 60 },
                    { type: 'maxHp', value: 360 }
                ],
                specialEffects: [{ type: 'healingAura', value: 25 },
                    { type: 'chanceToNegateDamage', chance: 0.12 }],
                description: '왕만이 감당할 수 있는 성좌의 무게.',
                color: '#00FFFF'
            },

            '전장의 파멸투구': {
                baseName: '야만의 투구',
                stats: { strength: 95, vitality: 100, intelligence: 5, mentality: 25, luck: 10 },
                affixes: [
                    { type: 'physicalAttack', value: 84 },
                    { type: 'maxHp', value: 600 }
                ],
                specialEffects: [{ type: 'damageBoostOnKill', value: 0.35, duration: 6 },
                    { type: 'chanceToSurviveLethal', chance: 0.15 }],
                description: '피와 광기로 단련된 전장의 상징.',
                color: '#00FFFF'
            }


        },

        chest: {
            '아카샤의 기록': { // 신의 로브는 BASE_ITEMS에 없으므로 '마법사 로브'로 대체
                baseName: '마법사 로브',
                stats: { intelligence: 60, mentality: 60, luck: 3.6 },
                affixes: [{ type: 'magicalAttack', value: 72 }, { type: 'maxMp', value: 240 }, { type: 'elementalDamageBonus', value: 0.36 }],
                specialEffects: [{ type: 'freeSpellCast', chance: 0.15 },
                    { type: 'manaRegenOnSpell', value: 25 }],
                description: '우주 만물의 지식이 담겨 있는 기록의 로브.',
                color: '#00FFFF'
            },
            '영광의 판금 갑옷': { // 불멸의 판금 갑옷은 BASE_ITEMS에 없으므로 '판금 갑옷'으로 대체
                baseName: '판금 갑옷',
                stats: { strength: 60, vitality: 60, physicalDefense: 36 },
                affixes: [{ type: 'physicalDefense', value: 84 }, { type: 'magicalDefense', value: 48 }, { type: 'maxHp', value: 480 }],
                specialEffects: [{ type: 'damageReductionAura', value: 0.1 },
                    { type: 'physicalBlockChance', value: 0.2 }],
                description: '전설적인 전사들의 영광이 깃든 견고한 갑옷.',
                color: '#00FFFF'
            },
            '순례자의 천의': {
                baseName: '천 로브',
                stats: { strength: 10, vitality: 60, luck: 30, intelligence: 70, mentality: 65 },
                affixes: [
                    { type: 'physicalDefense', value: 80 },
                    { type: 'magicalDefense', value: 120 }
                ],
                specialEffects: [{ type: 'healingAura', value: 18 },
                    { type: 'manaCostReduction', value: 0.15 }],
                description: '소박하지만 마력을 안정적으로 감싸는 천 로브.',
                color: '#00FFFF'
            },
            '그림자 가죽 조끼': {
                baseName: '가죽 조끼',
                stats: { strength: 40, vitality: 70, luck: 60, intelligence: 20, mentality: 25 },
                affixes: [
                    { type: 'physicalDefense', value: 140 },{ type: 'evasion', value: 0.15 },
                ],
                specialEffects: [{ type: 'speedOnEvade', value: 0.3, duration: 4 },
                    { type: 'stealthOnRangedHit', chance: 0.18, duration: 3 }],
                description: '기동성과 생존성을 모두 고려한 가죽 방어구.',
                color: '#00FFFF'
            },
            '전장의 사슬': {
                baseName: '사슬 갑옷',
                stats: { strength: 70, vitality: 100, luck: 25, intelligence: 15, mentality: 20 },
                affixes: [
                    { type: 'physicalDefense', value: 200 }
                ],
                specialEffects: [{ type: 'onHitAttackDebuff', chance: 0.2, magnitude: 0.2, duration: 4 }],
                description: '타격을 분산시키는 균형 잡힌 사슬 갑옷.',
                color: '#00FFFF'
            },
            '강철의 성벽': {
                baseName: '판금 갑옷',
                stats: { strength: 100, vitality: 140, luck: 10, intelligence: 5, mentality: 15 },
                affixes: [
                    { type: 'physicalDefense', value: 300 }
                ],
                specialEffects: [{ type: 'chanceToNegateDamage', chance: 0.15 },
                    { type: 'lowHpDefenseBoost', threshold: 0.35, value: 0.4 }],
                description: '전면에서의 공격을 막아내는 중무장 판금 갑옷.',
                color: '#00FFFF'
            },
            '대마법사의 의복': {
                baseName: '마법사 로브',
                stats: { strength: 10, vitality: 80, luck: 35, intelligence: 120, mentality: 110 },
                affixes: [
                    { type: 'magicalDefense', value: 260 }
                ],
                specialEffects: [{ type: 'manaRegenOnSpell', value: 30 },
                    { type: 'onSpellHitDispelBuff', chance: 0.18 }],
                description: '강력한 주문을 견디기 위해 설계된 마법사의 로브.',
                color: '#00FFFF'
            },
            '용린 흉갑': {
                baseName: '용의 비늘 갑옷',
                stats: { strength: 130, vitality: 160, luck: 20, intelligence: 40, mentality: 50 },
                affixes: [
                    { type: 'physicalDefense', value: 360 },
                    { type: 'magicalDefense', value: 220 }
                ],
                specialEffects: [{ type: 'reflectDamage', chance: 0.25, magnitude: 0.35 },
                    { type: 'allElementalResistance', value: 0.25 }],
                description: '용의 비늘로 만들어진 전설적인 최상급 갑옷.',
                color: '#00FFFF'
            },
            '밤의 속삭임': {
                baseName: '암살자의 튜닉',
                stats: { strength: 55, vitality: 75, luck: 100, intelligence: 30, mentality: 40 },
                affixes: [
                    { type: 'physicalDefense', value: 160 },{ type: 'evasion', value: 0.15 },
                ],
                specialEffects: [{ type: 'stealthAttackBonus', value: 0.35 },
                    { type: 'teleportOnEvade', chance: 0.15 }],
                description: '소리 없이 움직이기 위해 설계된 암살자의 방어구.',
                color: '#00FFFF'
            },
            '성좌의 성의': {
                baseName: '천 로브',
                stats: { strength: 5, vitality: 50, intelligence: 80, mentality: 90, luck: 25 },
                affixes: [
                    { type: 'magicalDefense', value: 72 },
                    { type: 'maxMp', value: 360 }
                ],
                specialEffects: [{ type: 'meteorStrikeProc', chance: 0.08, magnitude: 180 },
                    { type: 'magicFindBonus', value: 0.25 }],
                description: '별의 흐름을 몸에 두른 자만이 입을 수 있는 신성한 로브.',
                color: '#00FFFF'
            },

            '황야의 생존자 조끼': {
                baseName: '가죽 조끼',
                stats: { strength: 40, vitality: 80, intelligence: 20, mentality: 35, luck: 45 },
                affixes: [
                    { type: 'physicalDefense', value: 60 },
                    { type: 'maxHp', value: 420 }
                ],
                specialEffects: [{ type: 'speedBoostOnKill', value: 0.3, duration: 5 }],
                description: '수많은 전투와 도주 속에서 살아남은 자의 증표.',
                color: '#00FFFF'
            },

            '강철 맹약의 사슬갑주': {
                baseName: '사슬 갑옷',
                stats: { strength: 60, vitality: 100, intelligence: 15, mentality: 40, luck: 15 },
                affixes: [
                    { type: 'physicalDefense', value: 84 },
                    { type: 'maxHp', value: 480 }
                ],
                specialEffects: [{ type: 'damageReductionAura', value: 0.08 }],
                description: '사슬 하나하나에 전사의 맹세가 새겨진 갑옷.',
                color: '#00FFFF'
            },

            '천공의 수호판금': {
                baseName: '판금 갑옷',
                stats: { strength: 90, vitality: 120, intelligence: 10, mentality: 35, luck: 10 },
                affixes: [
                    { type: 'physicalDefense', value: 120 },
                    { type: 'maxHp', value: 720 }
                ],
                specialEffects: [{ type: 'chanceToSurviveLethal', chance: 0.18 }],
                description: '왕국을 수차례 멸망에서 구해냈다는 전설의 판금 갑옷.',
                color: '#00FFFF'
            },

            '대현자의 마나 로브': {
                baseName: '마법사 로브',
                stats: { strength: 5, vitality: 60, intelligence: 100, mentality: 100, luck: 30 },
                affixes: [
                    { type: 'magicalAttack', value: 84 },
                    { type: 'elementalDamageBonus', value: 0.42 }
                ],
                specialEffects: [{ type: 'manaCostReduction', value: 0.25 },
                    { type: 'freeSpellCast', chance: 0.18 }],
                description: '마력 그 자체가 옷의 형태를 취한 신화의 로브.',
                color: '#00FFFF'
            },

            '용왕의 비늘갑주': {
                baseName: '용의 비늘 갑옷',
                stats: { strength: 85, vitality: 130, intelligence: 30, mentality: 50, luck: 20 },
                affixes: [
                    { type: 'physicalDefense', value: 96 },
                    { type: 'magicalDefense', value: 48 }
                ],
                specialEffects: [{ type: 'allElementalResistance', value: 0.2 },
                    { type: 'reflectDamage', chance: 0.2, magnitude: 0.25 }],
                description: '고룡의 비늘로 만들어진, 파괴 불가의 갑주.',
                color: '#00FFFF'
            },

            '그림자 군주의 튜닉': {
                baseName: '암살자의 튜닉',
                stats: { strength: 70, vitality: 70, intelligence: 30, mentality: 40, luck: 80 },
                affixes: [
                    { type: 'physicalAttack', value: 72 },
                    { type: 'critChance', value: 0.24 }
                ],
                specialEffects: [{ type: 'onCritInstantKill', chance: 0.05 },
                    { type: 'stealthCritChanceBonus', value: 0.3 }],
                description: '어둠 속에서 왕으로 군림했던 암살자의 유산.',
                color: '#00FFFF'
            }


        },

        leg:{

            '성서의 순례하의': {
                baseName: '천 바지',
                stats: { strength: 5, vitality: 55, intelligence: 75, mentality: 85, luck: 25 },
                affixes: [
                    { type: 'magicalDefense', value: 48 },
                    { type: 'maxMp', value: 300 }
                ],
                specialEffects: [{ type: 'manaRegenOnSpell', value: 15 },
                    { type: 'healingEffectiveness', value: 0.15 }],
                description: '성서의 문양이 수놓아진 신비한 하의.',
                color: '#00FFFF'
            },

            '황야 방랑자의 가죽각반': {
                baseName: '가죽 바지',
                stats: { strength: 45, vitality: 85, intelligence: 20, mentality: 35, luck: 55 },
                affixes: [
                    { type: 'physicalDefense', value: 60 },
                    { type: 'maxHp', value: 420 }
                ],
                specialEffects: [{ type: 'speedOnEvade', value: 0.25, duration: 3 },
                    { type: 'goldBonus', value: 1.25 }],
                description: '끝없는 황야를 건넌 자만이 입을 수 있는 각반.',
                color: '#00FFFF'
            },

            '강철 맹세의 사슬각반': {
                baseName: '사슬 각반',
                stats: { strength: 65, vitality: 110, intelligence: 15, mentality: 40, luck: 15 },
                affixes: [
                    { type: 'physicalDefense', value: 84 },
                    { type: 'maxHp', value: 480 }
                ],
                specialEffects: [{ type: 'physicalBlockChance', value: 0.18 },
                    { type: 'onHitDefenseBreak', chance: 0.2, magnitude: 0.25, duration: 4 }],
                description: '무릎을 꿇지 않겠다는 전사의 맹세가 담긴 각반.',
                color: '#00FFFF'
            },

            '천공 파수자의 강철각반': {
                baseName: '강철 각반',
                stats: { strength: 85, vitality: 130, intelligence: 10, mentality: 35, luck: 10 },
                affixes: [
                    { type: 'physicalDefense', value: 108 },
                    { type: 'maxHp', value: 600 }
                ],
                specialEffects: [{ type: 'chanceToNegateDamage', chance: 0.12 },
                    { type: 'onHitSlow', chance: 0.25, magnitude: 0.4, duration: 3 }],
                description: '하늘의 성문을 지키던 파수병의 유산.',
                color: '#00FFFF'
            },

            '대현자의 마력하의': {
                baseName: '마법사 하의',
                stats: { strength: 5, vitality: 60, intelligence: 95, mentality: 95, luck: 30 },
                affixes: [
                    { type: 'magicalAttack', value: 72 },
                    { type: 'maxMp', value: 360 }
                ],
                specialEffects: [{ type: 'freeSpellCast', chance: 0.18 },
                    { type: 'manaCostReduction', value: 0.2 }],
                description: '마력이 흐르듯 봉인된 대현자의 하의.',
                color: '#00FFFF'
            },

            '영혼수호자의 다리갑주': {
                baseName: '영혼의 다리 보호대',
                stats: { strength: 70, vitality: 120, intelligence: 40, mentality: 60, luck: 20 },
                affixes: [
                    { type: 'magicalDefense', value: 60 },
                    { type: 'physicalDefense', value: 72 }
                ],
                specialEffects: [{ type: 'damageReductionAura', value: 0.12 },
                    { type: 'statusEffectImmunityOnHit', chance: 0.2, duration: 3 }],
                description: '영혼의 영역을 지키던 수호자의 장비.',
                color: '#00FFFF'
            }


        },

        feet:{

            '성좌의 발걸음': {
                baseName: '천 신발',
                stats: { strength: 5, vitality: 45, intelligence: 70, mentality: 80, luck: 35 },
                affixes: [
                    { type: 'magicalDefense', value: 36 },
                    { type: 'maxMp', value: 240 }
                ],
                specialEffects: [{ type: 'movementSpeedBonus', value: 0.15 },
                    { type: 'manaRegenOnSpell', value: 20 }],
                description: '별의 길을 걷던 자의 신비한 발걸음.',
                color: '#00FFFF'
            },

            '야수추적자의 장화': {
                baseName: '가죽 장화',
                stats: { strength: 40, vitality: 75, intelligence: 20, mentality: 30, luck: 65 },
                affixes: [
                    { type: 'critChance', value: 0.18 },
                    { type: 'physicalAttack', value: 36 }
                ],
                specialEffects: [{ type: 'speedOnEvade', value: 0.25, duration: 4 },
                    { type: 'chanceToRoot', chance: 0.2 }],
                description: '발자국조차 남기지 않는 사냥꾼의 장화.',
                color: '#00FFFF'
            },

            '강철 행군자의 장화': {
                baseName: '사슬 장화',
                stats: { strength: 55, vitality: 95, intelligence: 15, mentality: 35, luck: 15 },
                affixes: [
                    { type: 'physicalDefense', value: 72 },
                    { type: 'maxHp', value: 420 }
                ],
                specialEffects: [{ type: 'physicalBlockChance', value: 0.18 },
                    { type: 'lowHpDefenseBoost', threshold: 0.3, value: 0.25 }],
                description: '수천 리를 행군한 병사의 유산.',
                color: '#00FFFF'
            },

            '전장의 심판자 장화': {
                baseName: '강철 장화',
                stats: { strength: 80, vitality: 120, intelligence: 10, mentality: 30, luck: 10 },
                affixes: [
                    { type: 'physicalDefense', value: 96 },
                    { type: 'maxHp', value: 540 }
                ],
                specialEffects: [{ type: 'onHitDefenseBreak', chance: 0.2, magnitude: 0.25, duration: 4 },
                    { type: 'chanceToNegateDamage', chance: 0.12 }],
                description: '전장을 짓밟던 심판자의 발걸음.',
                color: '#00FFFF'
            },

            '마력윤회의 신발': {
                baseName: '마법사 신발',
                stats: { strength: 5, vitality: 55, intelligence: 90, mentality: 90, luck: 30 },
                affixes: [
                    { type: 'magicalAttack', value: 60 },
                    { type: 'elementalDamageBonus', value: 0.30 }
                ],
                specialEffects: [{ type: 'freeSpellCast', chance: 0.18 },
                    { type: 'manaCostReduction', value: 0.2 }],
                description: '마력이 순환하도록 설계된 신비한 신발.',
                color: '#00FFFF'
            },

            '시간을 가르는 장화': {
                baseName: '민첩의 장화',
                stats: { strength: 50, vitality: 80, intelligence: 25, mentality: 35, luck: 85 },
                affixes: [
                    { type: 'critChance', value: 0.24 },
                    { type: 'physicalAttack', value: 48 }
                ],
                specialEffects: [{ type: 'teleportOnEvade', chance: 0.18 },
                    { type: 'stealthOnRangedHit', chance: 0.15, duration: 3 }],
                description: '찰나를 앞서는 자만이 신을 수 있는 장화.',
                color: '#00FFFF'
            }


        },
        Shoulder:{

            '성서의 어깨망토': {
                baseName: '천 견갑',
                stats: { strength: 10, vitality: 50, intelligence: 75, mentality: 85, luck: 25 },
                affixes: [
                    { type: 'magicalDefense', value: 48 },
                    { type: 'maxMp', value: 300 }
                ],
                specialEffects: [{ type: 'healingEffectiveness', value: 0.2 },
                    { type: 'manaRegenOnSpell', value: 25 }],
                description: '성서의 문장이 수놓인 견갑.',
                color: '#00FFFF'
            },

            '황혼 사냥꾼의 견갑': {
                baseName: '가죽 견갑',
                stats: { strength: 45, vitality: 80, intelligence: 20, mentality: 35, luck: 55 },
                affixes: [
                    { type: 'physicalAttack', value: 48 },
                    { type: 'critChance', value: 0.18 }
                ],
                specialEffects: [{ type: 'stealthAttackBonus', value: 0.25 },
                    { type: 'evasionOnCrit', chance: 0.3, duration: 3 }],
                description: '해 질 녘에 사냥을 시작하던 자의 장비.',
                color: '#00FFFF'
            },

            '불굴의 사슬견갑': {
                baseName: '사슬 견갑',
                stats: { strength: 65, vitality: 110, intelligence: 15, mentality: 40, luck: 15 },
                affixes: [
                    { type: 'physicalDefense', value: 84 },
                    { type: 'maxHp', value: 480 }
                ],
                specialEffects: [{ type: 'damageReductionAura', value: 0.12 },
                    { type: 'onHitSlow', chance: 0.25, magnitude: 0.3, duration: 3 }],
                description: '부러지지 않는 의지를 상징하는 견갑.',
                color: '#00FFFF'
            },

            '왕국수호자의 강철견갑': {
                baseName: '강철 견갑',
                stats: { strength: 85, vitality: 130, intelligence: 10, mentality: 35, luck: 10 },
                affixes: [
                    { type: 'physicalDefense', value: 108 },
                    { type: 'maxHp', value: 600 }
                ],
                specialEffects: [{ type: 'chanceToNegateDamage', chance: 0.15 },
                    { type: 'onHitAttackDebuff', chance: 0.3, magnitude: 0.25, duration: 4 }],
                description: '왕국을 지켜낸 수호자의 상징.',
                color: '#00FFFF'
            },

            '용맹의 서약견갑': {
                baseName: '용사 견갑',
                stats: { strength: 90, vitality: 120, intelligence: 20, mentality: 45, luck: 20 },
                affixes: [
                    { type: 'physicalAttack', value: 72 },
                    { type: 'maxHp', value: 540 }
                ],
                specialEffects: [{ type: 'damageBoostOnKill', value: 0.3, duration: 5 },
                    { type: 'lifestealOnKill', value: 0.08, duration: 5 }],
                description: '영웅의 서약이 새겨진 견갑.',
                color: '#00FFFF'
            },

            '어둠왕의 그림자견갑': {
                baseName: '그림자 견갑',
                stats: { strength: 70, vitality: 90, intelligence: 35, mentality: 45, luck: 70 },
                affixes: [
                    { type: 'critChance', value: 0.24 },
                    { type: 'physicalAttack', value: 60 }
                ],
                specialEffects: [{ type: 'stealthCritChanceBonus', value: 0.3 },
                    { type: 'teleportOnEvade', chance: 0.2 }],
                description: '어둠 속 왕의 존재를 증명하는 장비.',
                color: '#00FFFF'
            }


        },

        wrist:{

            '성좌의 결계대': {
                baseName: '천 손목 보호대',
                stats: { strength: 5, vitality: 45, intelligence: 70, mentality: 85, luck: 30 },
                affixes: [
                    { type: 'magicalDefense', value: 48 },
                    { type: 'maxMp', value: 240 }
                ],
                specialEffects: [],
                description: '별의 결계를 형상화한 신비한 손목 보호대.',
                color: '#00FFFF'
            },

            '황야 추적자의 팔목대': {
                baseName: '가죽 팔목 보호대',
                stats: { strength: 45, vitality: 70, intelligence: 20, mentality: 30, luck: 60 },
                affixes: [
                    { type: 'physicalAttack', value: 48 },
                    { type: 'critChance', value: 0.18 }
                ],
                specialEffects: [],
                description: '사냥의 순간을 놓치지 않기 위한 추적자의 장비.',
                color: '#00FFFF'
            },

            '강철 서약의 팔목갑': {
                baseName: '강철 팔목 보호대',
                stats: { strength: 70, vitality: 110, intelligence: 10, mentality: 35, luck: 10 },
                affixes: [
                    { type: 'physicalDefense', value: 84 },
                    { type: 'maxHp', value: 480 }
                ],
                specialEffects: [],
                description: '무기를 놓지 않겠다는 전사의 서약이 깃든 팔목.',
                color: '#00FFFF'
            },

            '마나윤회의 속박대': {
                baseName: '마법의 팔목 보호대',
                stats: { strength: 5, vitality: 50, intelligence: 90, mentality: 90, luck: 30 },
                affixes: [
                    { type: 'magicalAttack', value: 72 },
                    { type: 'maxMp', value: 360 }
                ],
                specialEffects: [],
                description: '마력이 끊임없이 순환하도록 설계된 팔목 보호대.',
                color: '#00FFFF'
            },

            '운명의 결속 팔찌': {
                baseName: '결속의 팔찌',
                stats: { strength: 35, vitality: 80, intelligence: 40, mentality: 60, luck: 40 },
                affixes: [
                    { type: 'physicalDefense', value: 48 },
                    { type: 'magicalDefense', value: 48 }
                ],
                specialEffects: [{ type:'allElementalResistance',value:0.15 },
                    { type:'manaCostReduction',value:0.12 }],
                description: '착용자의 운명과 생존을 결속시키는 신비한 팔찌.',
                color: '#00FFFF'
            }

        },

        neck:{

            '태초의 숨결 펜던트': {
                baseName: '나무 펜던트',
                stats: { strength: 10, vitality: 70, intelligence: 50, mentality: 60, luck: 40 },
                affixes: [
                    { type: 'maxHp', value: 420 },
                    { type: 'maxMp', value: 240 }
                ],
                specialEffects: [{ type:'speedOnEvade',value:0.25,duration:3 },
                    { type:'stealthOnRangedHit',chance:0.25,duration:2 }],
                description: '세계가 태동하던 시절의 숨결이 깃든 펜던트.',
                color: '#00FFFF'
            },

            '달빛 수호의 아뮬렛': {
                baseName: '은 아뮬렛',
                stats: { strength: 20, vitality: 85, intelligence: 45, mentality: 65, luck: 35 },
                affixes: [
                    { type: 'magicalDefense', value: 60 },
                    { type: 'physicalDefense', value: 48 }
                ],
                specialEffects: [],
                description: '달빛의 가호로 착용자를 보호하는 은빛 아뮬렛.',
                color: '#00FFFF'
            },

            '심연 마력의 탈리스만': {
                baseName: '마력의 탈리스만',
                stats: { strength: 5, vitality: 60, intelligence: 95, mentality: 95, luck: 30 },
                affixes: [
                    { type: 'magicalAttack', value: 84 },
                    { type: 'elementalDamageBonus', value: 0.42 }
                ],
                specialEffects: [{ type:'physicalBlockChance',value:0.18 },
                    { type:'onHitDefenseBreak',chance:0.25,magnitude:0.3,duration:3 }],
                description: '심연에서 길어 올린 마력이 응축된 탈리스만.',
                color: '#00FFFF'
            },

            '성역의 수호 메달리온': {
                baseName: '수호의 메달리온',
                stats: { strength: 30, vitality: 100, intelligence: 40, mentality: 60, luck: 30 },
                affixes: [
                    { type: 'physicalDefense', value: 72 },
                    { type: 'magicalDefense', value: 72 }
                ],
                specialEffects: [{ type:'freeSpellCast',chance:0.2 },
                    { type:'manaRegenOnSpell',value:30 }],
                description: '성역을 수호하던 기사단의 상징.',
                color: '#00FFFF'
            },

            '불멸왕의 생명목걸이': {
                baseName: '불멸의 목걸이',
                stats: { strength: 50, vitality: 130, intelligence: 50, mentality: 70, luck: 40 },
                affixes: [
                    { type: 'maxHp', value: 720 },
                    { type: 'magicalDefense', value: 60 }
                ],
                specialEffects: [{ type:'chanceToSurviveLethal',chance:0.18 },
                    { type:'healingAura',value:18 }],
                description: '죽음을 거부한 왕의 생명이 깃든 목걸이.',
                color: '#00FFFF'
            }


        },

        ring:{

            '잊힌 왕의 인장': {
                baseName: '낡은 반지',
                stats: { strength: 30, vitality: 70, intelligence: 40, mentality: 50, luck: 50 },
                affixes: [
                    { type: 'critChance', value: 0.18 },
                    { type: 'physicalAttack', value: 36 }
                ],
                specialEffects: [{ type: 'onHitAttackDebuff', chance: 0.25, magnitude: 0.15, duration: 4 },
                    { type: 'auraDefense', value: 20 }],
                description: '역사에서 지워진 왕의 권위를 상징하는 반지.',
                color: '#00FFFF'
            },

            '월은의 가호 반지': {
                baseName: '은 반지',
                stats: { strength: 25, vitality: 80, intelligence: 55, mentality: 65, luck: 35 },
                affixes: [
                    { type: 'magicalDefense', value: 48 },
                    { type: 'maxMp', value: 240 }
                ],
                specialEffects: [{ type: 'manaRegenOnSpell', value: 25 },
                    { type: 'allElementalResistance', value: 0.12 }],
                description: '달빛의 축복을 받은 은빛 반지.',
                color: '#00FFFF'
            },

            '대마도사의 마력환': {
                baseName: '마력의 반지',
                stats: { strength: 5, vitality: 60, intelligence: 100, mentality: 100, luck: 30 },
                affixes: [
                    { type: 'magicalAttack', value: 72 },
                    { type: 'elementalDamageBonus', value: 0.36 }
                ],
                specialEffects: [{ type: 'freeSpellCast', chance: 0.18 },
                    { type: 'meteorStrikeProc', chance: 0.12, magnitude: 220 }],
                description: '대마도사의 마력이 응축된 반지.',
                color: '#00FFFF'
            },

            '성역 수호자의 반지': {
                baseName: '수호의 반지',
                stats: { strength: 40, vitality: 110, intelligence: 40, mentality: 60, luck: 30 },
                affixes: [
                    { type: 'physicalDefense', value: 72 },
                    { type: 'maxHp', value: 480 }
                ],
                specialEffects: [{ type: 'damageReductionAura', value: 0.12 },
                    { type: 'lowHpDefenseBoost', threshold: 0.3, value: 0.25 }],
                description: '성역을 끝까지 지켜낸 수호자의 반지.',
                color: '#00FFFF'
            },

            '찰나를 붙잡는 밴드': {
                baseName: '민첩의 밴드',
                stats: { strength: 55, vitality: 75, intelligence: 30, mentality: 40, luck: 85 },
                affixes: [
                    { type: 'critChance', value: 0.24 },
                    { type: 'physicalAttack', value: 48 }
                ],
                specialEffects: [{ type: 'speedOnEvade', value: 0.35, duration: 3 },
                    { type: 'evasionOnCrit', chance: 0.4, duration: 2 }],
                description: '시간의 틈을 붙잡은 자의 손에 남은 밴드.',
                color: '#00FFFF'
            },

            '영원의 생명고리': {
                baseName: '생명의 고리',
                stats: { strength: 35, vitality: 140, intelligence: 40, mentality: 70, luck: 35 },
                affixes: [
                    { type: 'maxHp', value: 840 },
                    { type: 'magicalDefense', value: 48 }
                ],
                specialEffects: [{ type: 'healingAura', value: 18 },
                    { type: 'chanceToSurviveLethal', chance: 0.15 }],
                description: '영원이 흐르는 생명의 순환을 상징하는 고리.',
                color: '#00FFFF'
            }


        }



    }
};

export const EQUIPMENT_SETS = [
    // 1. 그림자 암살자 세트 (민첩, 치명타, 회피)
    {
        id: 'shadow_assassin',
        name: '그림자 암살자 세트',
        theme: '민첩한 움직임과 치명적인 일격으로 적을 제압하는 암살자를 위한 세트',
        pieces: [
            { name: '암살자의 후드', baseName: '가죽 모자', slot: 'hat', stats: { agility: 60, luck: 40 }, affixes: [{ type: 'evasion', value: 0.18 }] },
            { name: '암살자의 튜닉', baseName: '가죽 조끼', slot: 'chest', stats: { agility: 72, strength: 40 }, affixes: [{ type: 'physicalAttack', value: 48 }] },
            { name: '암살자의 장갑', baseName: '가죽 팔목 보호대', slot: 'wrist', stats: { agility: 48, luck: 48 }, affixes: [{ type: 'critChance', value: 0.15 }] },
            { name: '암살자의 부츠', baseName: '가죽 장화', slot: 'feet', stats: { agility: 64 }, affixes: [{ type: 'speed', value: 24 }] },
        ],
        bonuses: [
            { count: 2, effect: { stats: { agility: 60 }, affixes: [{ type: 'critChance', value: 0.2 }] } },
            { count: 4, effect: { stats: { agility: 80 }, affixes: [{ type: 'critDamage', value: 0.18 }], specialEffects: [{ type: 'evasionOnCrit', chance: 0.3, duration: 2 }, { type: 'stealthAttackBonus', value: 0.45 }] } },
        ]
    },
    // 2. 빛의 수호자 세트 (힘, 체력, 방어)
    {
        id: 'guardian_of_light',
        name: '빛의 수호자 세트',
        theme: '적의 공격을 견뎌내고 아군을 보호하는 성스러운 기사를 위한 세트',
        pieces: [
            { name: '수호자의 투구', baseName: '강철 투구', slot: 'hat',  stats: { strength: 56, vitality: 56 }, affixes: [{ type: 'physicalDefense', value: 48 }] },
            { name: '수호자의 판금 갑옷', baseName: '판금 갑옷', slot: 'chest', stats: { strength: 72, vitality: 72 }, affixes: [{ type: 'physicalDefense', value: 72 }] },
            { name: '수호자의 각반', baseName: '강철 각반', slot: 'legs', stats: { vitality: 64 }, affixes: [{ type: 'physicalDefense', value: 60 }] },
            { name: '수호자의 방패', baseName: '강철 방패', slot: 'subWeapon', stats: { strength: 56, vitality: 56 }, affixes: [{ type: 'physicalDefense', value: 84 }] },
        ],
        bonuses: [
            { count: 2, effect: { stats: { strength: 40, vitality: 40 } } },
            { count: 4, effect: { stats: { physicalDefense: 60, magicalDefense: 60 }, specialEffects: [{ type: 'damageReductionAura', magnitude: 0.18 },{ type: 'lowHpDefenseBoost', threshold: 0.35, value: 0.45 }] } },
        ]
    },
    // 3. 비전 마법사 세트 (지능, 마법 공격력, 마나)
    {
        id: 'arcane_weaver',
        name: '비전 마법사 세트',
        theme: '강력한 마법으로 적을 불태우는 대마법사를 위한 세트',
        pieces: [
            { name: '비전 후드', baseName: '천 두건', slot: 'hat', stats: { intelligence: 56, mentality: 56 }, affixes: [{ type: 'magicalAttack', value: 48 }] },
            { name: '비전 로브', baseName: '천 로브', slot: 'chest', stats: { intelligence: 72, mentality: 72 }, affixes: [{ type: 'magicalAttack', value: 72 }] },
            { name: '비전 완드', baseName: '낡은 완드', slot: 'mainWeapon', stats: { intelligence: 80, mentality: 56 }, affixes: [{ type: 'magicalAttack', value: 84 }], weaponType: 'magical' },
            { name: '비전 보주', baseName: '마력의 수정', slot: 'subWeapon', stats: { intelligence: 64, mentality: 64 }, affixes: [{ type: 'magicalAttack', value: 64 }] },
        ],
        bonuses: [
            { count: 2, effect: { stats: { intelligence: 40, mentality: 40 } } },
            { count: 4, effect: { stats: { magicalAttack: 100 }, specialEffects: [{ type: 'manaRegenOnSpell', value: 24 },{ type: 'freeSpellCast', chance: 0.3 }] } },
        ]
    },
    // 4. 자연의 분노 세트 (원거리, 민첩, 원소 피해)
    {
        id: 'fury_of_nature',
        name: '자연의 분노 세트',
        theme: '자연의 힘을 빌어 원거리에서 적을 꿰뚫는 사냥꾼을 위한 세트',
        pieces: [
            { name: '자연의 활', baseName: '짧은 활', slot: 'mainWeapon', stats: { agility: 80, vitality: 24 }, affixes: [{ type: 'rangedAttack', value: 72 }], weaponType: 'ranged' },
            { name: '자연의 가죽 갑옷', baseName: '가죽 조끼', slot: 'chest', stats: { agility: 64, vitality: 48 }, affixes: [{ type: 'evasion', value: 0.2 }] },
            { name: '자연의 장갑', baseName: '가죽 팔목 보호대', slot: 'wrist', stats: { agility: 56 }, affixes: [{ type: 'critChance', value: 0.18 }] },
        ],
        bonuses: [
            { count: 2, effect: { stats: { agility: 80 }, affixes: [{ type: 'elementalDamage', elementType: 'poison', min: 24, max: 48 }] } },
            { count: 3, effect: { stats: { rangedAttack: 100 }, specialEffects: [{ type: 'chanceToRoot', chance: 0.25 },{ type: 'multiShot', chance: 0.2, count: 2 }] } },
        ]
    },
    // 5. 황금의 상인 세트 (골드 획득, 행운)
    {
        id: 'golden_merchant',
        name: '황금의 상인 세트',
        theme: '재물에 대한 욕망이 가득한 상인을 위한 세트',
        pieces: [
            { name: '상인의 모자', baseName: '가죽 모자', slot: 'hat', stats:{ luck:48, vitality:42 }, affixes: [{ type: 'goldFind', value: 0.25 }] },
            { name: '상인의 조끼', baseName: '가죽 조끼', slot: 'chest', stats:{ luck:62, vitality:45 }, affixes: [{ type: 'magicFind', value: 0.23 }] },
            { name: '상인의 반지', baseName: '낡은 반지', slot: 'ring', stats:{ luck:40, mentality:40 }, affixes: [{ type: 'goldFind', value: 0.22 }] },
        ],
        bonuses: [
            { count: 2, effect: { stats: { luck: 40 }, affixes: [{ type: 'goldFind', value: 0.10 }] } },
            { count: 3, effect: { stats: { luck: 60 }, affixes: [{ type: 'magicFind', value: 0.05 }], specialEffects: [{ type:'extraMerchantStock' },{ type:'magicFindBonus', value:0.35 }] } },
        ]
    },
    // 6. 뱀파이어 군주 세트 (생명력 흡수, 체력, 어둠 피해)
    {
        id: 'vampire_lord',
        name: '뱀파이어 군주 세트',
        theme: '적의 생명력을 흡수하여 자신의 것으로 만드는 피의 지배자를 위한 세트',
        pieces: [
            { name: '군주의 망토', baseName: '천 견갑', slot: 'shoulder', stats:{ vitality:55, mentality:45 }, affixes: [{ type: 'lifesteal', value: 0.08 }] },
            { name: '군주의 갑옷', baseName: '판금 갑옷', slot: 'chest', stats:{ vitality:78, strength:42 }, affixes: [{ type: 'maxHp', value: 480 }] },
            { name: '피의 반지', baseName: '낡은 반지', slot: 'ring', stats:{ vitality:44, luck:40 }, affixes: [{ type: 'lifesteal', value: 0.08 }] },
            { name: '군주의 대검', baseName: '대검', slot: 'mainWeapon', stats:{ strength:72, vitality:48 }, affixes: [{ type: 'lifesteal', value: 0.08 }], weaponType: 'physical' },
        ],
        bonuses: [
            { count: 2, effect: { stats: { vitality: 60 }, affixes: [{ type: 'lifesteal', value: 0.08 }] } },
            { count: 4, effect: { stats: { vitality: 60, maxHp: 480 }, affixes: [{ type: 'elementalDamage', elementType: 'dark', min: 48, max: 56 }],
                    specialEffects:[{ type:'lifestealOnKill', value:0.08, duration:5 }, { type:'onHitFear', chance:0.2, duration:2 }] } }, // Dark damage would be a new elemental type
        ]
    },
    // 7. 파괴의 화염 세트 (힘, 화염 피해)
    {
        id: 'flame_of_destruction',
        name: '파괴의 화염 세트',
        theme: '모든 것을 불태우는 강력한 화염 마법과 물리 공격을 위한 세트',
        pieces: [
            { name: '화염의 투구', baseName: '강철 투구', slot: 'hat', stats:{ strength: 55, vitality: 45 }, affixes: [{ type: 'physicalAttack', value: 48 }] },
            { name: '화염의 대검', baseName: '대검', slot: 'mainWeapon', stats:{ strength: 80, vitality: 20, intelligence: 20 }, affixes: [{ type: 'elementalDamage', elementType: 'fire', min: 48, max: 60 }], weaponType: 'physical' },
            { name: '화염의 각반', baseName: '강철 각반', slot: 'legs', stats: { strength: 48, vitality:52, agility: 30 }, affixes: [{ type: 'physicalDefense', value: 42 }] },
        ],
        bonuses: [
            { count: 2, effect: { stats: { strength: 60 }, affixes: [{ type: 'elementalDamage', elementType: 'fire', min: 6, max: 12 }] } },
            { count: 3, effect: { affixes: [{ type: 'statusEffectBurn', chance: 0.15, magnitude: 2.4, duration: 3 }],
                    specialEffects: [{ type:'meteorStrikeProc', chance:0.18, magnitude:120 }, { type:'fireResistanceDebuff', chance:0.3, magnitude:0.25, duration:4 }] } }, // New status effect
        ]
    },
    // 8. 얼어붙은 심장 세트 (지능, 냉기 피해, 방어)
    {
        id: 'frozen_heart',
        name: '얼어붙은 심장 세트',
        theme: '냉기 마법으로 적을 얼리고 움직임을 봉쇄하는 얼음 마법사를 위한 세트',
        pieces: [
            { name: '서리의 로브', baseName: '천 로브', slot: 'chest', stats:{ intelligence:55, mentality:50 }, affixes: [{ type: 'magicalAttack', value: 50 }] },
            { name: '서리의 완드', baseName: '낡은 완드', slot: 'mainWeapon', stats:{ intelligence:80, mentality:50, agility: 20 }, affixes: [{ type: 'elementalDamage', elementType: 'ice', min: 40, max: 80 }], weaponType: 'magical' },
            { name: '서리의 반지', baseName: '낡은 반지', slot: 'ring', stats:{ intelligence:45, vitality:42 }, affixes: [{ type: 'magicalDefense', value: 36 }] },
        ],
        bonuses: [
            { count: 2, effect: { stats: { intelligence: 84 }, affixes: [{ type: 'elementalDamage', elementType: 'ice', min: 60, max: 120 }] } },
            { count: 3, effect: { affixes: [{ type: 'statusEffectChill', chance: 0.15, magnitude: 0.6, duration: 2 }],
                    specialEffects:[{ type:'chanceToNegateDamage', chance:0.18 }, { type:'statusEffectImmunityOnHit', chance:0.2, duration:2 }
                    ] } }, // New status effect
        ]
    },
    // 9. 폭풍의 인도자 세트 (민첩, 번개 피해, 속도)
    {
        id: 'storm_caller',
        name: '폭풍의 인도자 세트',
        theme: '번개와 폭풍의 힘을 빌어 빠르게 적을 섬멸하는 세트',
        pieces: [
            { name: '폭풍의 활', baseName: '짧은 활', slot: 'mainWeapon', stats: { agility: 120, luck: 40, strength: 60 }, affixes: [{ type: 'rangedAttack', value: 80 }], weaponType: 'ranged' },
            { name: '폭풍의 가죽 갑옷', baseName: '가죽 조끼', slot: 'chest', stats: { agility: 84, luck:42, vitality: 20 }, affixes: [{ type: 'speed', value: 60 }] },
            { name: '폭풍의 장화', baseName: '가죽 장화', slot: 'feet', stats: { agility: 65, luck:42 }, affixes: [{ type: 'evasion', value: 0.12 }] },
        ],
        bonuses: [
            { count: 2, effect: { stats: { agility: 84 }, affixes: [{ type: 'elementalDamage', elementType: 'lightning', min: 60, max: 120 }] } },
            { count: 3, effect: { stats: { speed: 90 }, specialEffects:[{ type:'multiShot', chance:0.2, count:2 }, { type:'speedOnEvade', value:0.4, duration:3 }] } }, // Special effect
        ]
    },
    // 10. 고대 드루이드 세트 (체력, 마나, 독 피해)
    {
        id: 'ancient_druid',
        name: '고대 드루이드 세트',
        theme: '자연의 지혜와 독의 힘으로 적을 서서히 약화시키는 드루이드를 위한 세트',
        pieces: [
            { name: '드루이드의 모자', baseName: '천 두건', slot: 'hat', stats:{ vitality:55, mentality:55 }, affixes: [{ type: 'maxHp', value: 360 }] },
            { name: '드루이드의 로브', baseName: '천 로브', slot: 'chest', stats: { vitality: 62, mentality: 62 }, affixes: [{ type: 'maxMp', value: 420 }] },
            { name: '드루이드의 지팡이', baseName: '나무 지팡이', slot: 'mainWeapon', stats: { vitality: 48, mentality: 72 }, affixes: [{ type: 'elementalDamage', elementType: 'poison', min: 64, max: 124 }], weaponType:
       'magical' },
        ],
        bonuses: [
            { count: 2, effect: { stats: { vitality: 66, mentality: 66 } } },
            { count: 3, effect: { affixes: [{ type: 'elementalDamage', elementType: 'poison', min: 8.4, max: 14.4 }],
                    specialEffects:[
                        { type:'areaPoisonCloud', chance:0.25 },
                        { type:'healingAura', value:18 }
                    ] } }, // Special effect
        ]
    },
    // 11. 불굴의 전사 세트 (힘, 물리 방어, HP)
    {
        id: 'unyielding_warrior',
        name: '불굴의 전사 세트',
        theme: '어떤 역경에도 굴하지 않는 강인한 전사를 위한 세트',
        pieces: [
            { name: '전사의 판금 투구', baseName: '강철 투구', slot: 'hat', stats:{ strength:60, vitality:45 }, affixes: [{ type: 'physicalDefense', value: 60 }] },
            { name: '전사의 판금 갑옷', baseName: '판금 갑옷', slot: 'chest', stats:{ strength:72, vitality:60 }, affixes: [{ type: 'physicalDefense', value: 80 }] },
            { name: '전사의 대검', baseName: '대검', slot: 'mainWeapon', stats:{ strength:80, vitality:45, agility: 20 }, affixes: [{ type: 'physicalAttack', value: 80 }], weaponType: 'physical' },
            { name: '전사의 방패', baseName: '강철 방패', slot: 'subWeapon', stats:{ vitality:60, strength:48 }, affixes: [{ type: 'physicalDefense', value: 72 }] },
        ],
        bonuses: [
            { count: 2, effect: { stats: { strength: 80, physicalDefense: 60 } } },
            { count: 4, effect: { stats: { maxHp: 480 }, specialEffects:[
                        { type:'physicalBlockChance', value:0.3 },
                        { type:'chanceToSurviveLethal', chance:0.25 }
                    ] } },
        ]
    },
    // 12. 그림자 사냥꾼 세트 (민첩, 원거리 공격력, 회피)
    {
        id: 'shadow_hunter',
        name: '그림자 사냥꾼 세트',
        theme: '어둠 속에 숨어 원거리에서 적을 사냥하는 능숙한 사냥꾼을 위한 세트',
        pieces: [
            { name: '사냥꾼의 두건', baseName: '가죽 모자', slot: 'hat', stats:{ agility:55, luck:40 }, affixes: [{ type: 'rangedAttack', value: 48}] },
            { name: '사냥꾼의 가죽 조끼', baseName: '가죽 조끼', slot: 'chest', stats:{ agility:62, vitality:42 }, affixes: [{ type: 'evasion', value: 0.12 }] },
            { name: '그림자 활', baseName: '사냥꾼의 활', slot: 'mainWeapon', stats:{ agility:80, strength: 60, luck: 60 }, affixes: [{ type: 'rangedAttack', value: 104 }], weaponType: 'ranged' },
            { name: '사냥꾼의 장화', baseName: '가죽 장화', slot: 'feet', stats:{ agility:48, luck:42 }, affixes: [{ type: 'speed', value: 48 }] },
        ],
        bonuses: [
            { count: 2, effect: { stats: { agility: 120, rangedAttack: 60 },specialEffects:[{ type:'stealthOnRangedHit', chance:0.25, duration:2 }] } },
            { count: 4, effect: { affixes: [{ type: 'evasion', value: 0.15 }],
                    specialEffects:[{ type:'piercingShot', value:0.35 }, { type:'stealthCritChanceBonus', value:0.3 }
                    ] } }, // Ignore X% physical defense
        ]
    }
];

export const SPECIAL_AFFIX_TYPES = {
    // Unique item special effects
    onHitFireball: {
        description: (chance, magnitude) => `${(chance * 100).toFixed(0)}% 확률로 적에게 화염구 발사 (피해: ${magnitude})`,
        effect: { type: 'onHit', trigger: 'attack', effectType: 'fireball', magnitude: 0 },
        format: (affix) => `${(affix.chance * 100).toFixed(0)}% 확률로 적에게 화염구 발사 (피해: ${affix.magnitude})`
    },
    auraDefense: {
        description: (value) => `주변 적들의 물리 방어력 ${value} 감소 오라`,
        effect: { type: 'aura', stat: 'physicalDefenseReduction', value: 0 },
        format: (affix) => `주변 적들의 물리 방어력 ${affix.value} 감소 오라`
    },
    goldBonus: {
        description: (multiplier) => `몬스터 처치 시 골드 획득량 ${((multiplier - 1) * 100).toFixed(0)}% 증가`,
        effect: { type: 'passive', stat: 'goldFindMultiplier', value: 0 },
        format: (affix) => `몬스터 처치 시 골드 획득량 ${((affix.value - 1) * 100).toFixed(0)}% 증가`
    },
    lifestealAura: {
        description: (value) => `주변 아군 생명력 흡수 ${value} 증가 오라`,
        effect: { type: 'aura', stat: 'lifestealBonus', value: 0 },
        format: (affix) => `주변 아군 생명력 흡수 ${affix.value * 100}% 증가 오라`
    },
    // Set item special effects (examples, could be used by unique too)
    evasionOnCrit: {
        description: (chance, duration) => `치명타 발동 시 ${(chance * 100).toFixed(0)}% 확률로 ${duration}초간 회피율 증가`,
        effect: { type: 'onCrit', effectType: 'evasionBuff', chance: 0, duration: 0 },
        format: (affix) => `치명타 발동 시 ${(affix.chance * 100).toFixed(0)}% 확률로 ${affix.duration}초간 회피율 증가`
    },
    damageReductionAura: {
        description: (magnitude) => `주변 아군 받는 피해 ${magnitude * 100}% 감소 오라`,
        effect: { type: 'aura', stat: 'damageReduction', value: 0 },
        format: (affix) => `주변 아군 받는 피해 ${affix.value * 100}% 감소 오라`
    },
    manaRegenOnSpell: {
        description: (value) => `마법 사용 시 마나 ${value} 회복`,
        effect: { type: 'onSpellCast', stat: 'manaRegenFlat', value: 0 },
        format: (affix) => `마법 사용 시 마나 ${affix.value} 회복`
    },
    chanceToRoot: {
        description: (chance) => `원거리 공격 시 ${(chance * 100).toFixed(0)}% 확률로 적 속박`,
        effect: { type: 'onRangedAttack', effectType: 'root', chance: 0, duration: 2 },
        format: (affix) => `원거리 공격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 적 속박`
    },
    extraMerchantStock: {
        description: () => `떠돌이 상인에게서 더 많은 물품을 발견합니다.`,
        effect: { type: 'passive', stat: 'merchantStockBonus' },
        format: () => `떠돌이 상인에게서 더 많은 물품을 발견합니다.`
    },
    chainLightningProc: {
        description: (chance) => `공격 시 ${(chance * 100).toFixed(0)}% 확률로 번개 연쇄`,
        effect: { type: 'onAttack', effectType: 'chainLightning', chance: 0, magnitude: 15 },
        format: (affix) => `공격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 번개 연쇄`
    },
    areaPoisonCloud: {
        description: (chance) => `공격 시 ${(chance * 100).toFixed(0)}% 확률로 독 구름 생성`,
        effect: { type: 'onAttack', effectType: 'poisonCloud', chance: 0, magnitude: 10, duration: 3 },
        format: (affix) => `공격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 독 구름 생성`
    },
    physicalBlockChance: {
        description: (value) => `물리 공격 방어 확률 ${value * 100}% 증가`,
        effect: { type: 'passive', stat: 'physicalBlockChance', value: 0 },
        format: (affix) => `물리 공격 방어 확률 ${affix.value * 100}% 증가`
    },
    piercingShot: {
        description: (value) => `원거리 공격 시 적의 물리 방어력 ${value * 100}% 무시`,
        effect: { type: 'passive', stat: 'physicalDefensePenetration', value: 0 },
        format: (affix) => `원거리 공격 시 적의 물리 방어력 ${affix.value * 100}% 무시`
    },
    statusEffectImmunityOnHit: {
        description: (chance, duration) => `피격 시 ${(chance * 100).toFixed(0)}% 확률로 ${duration}초간 상태 이상 면역`,
        effect: { type: 'onHit', effectType: 'statusImmunity', chance: 0, duration: 0 },
        format: (affix) => `피격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 ${affix.duration}초간 상태 이상 면역`
    },
    lifestealOnKill: {
        description: (value, duration) => `몬스터 처치 시 ${value * 100}% 추가 생명력 흡수 ${duration}초간 지속`,
        effect: { type: 'onKill', stat: 'lifestealBonus', value: 0, duration: 0 },
        format: (affix) => `몬스터 처치 시 ${(affix.value * 100).toFixed(0)}% 추가 생명력 흡수 ${affix.duration}초간 지속`
    },
    onHitAttackDebuff: {
        description: (chance, magnitude, duration) => `피격 시 ${(chance * 100).toFixed(0)}% 확률로 적 공격력 ${magnitude * 100}% 감소 ${duration}초간 지속`,
        effect: { type: 'onHit', effectType: 'attackDebuff', chance: 0, magnitude: 0, duration: 0 },
        format: (affix) => `피격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 적 공격력 ${(affix.magnitude * 100).toFixed(0)}% 감소 ${affix.duration}초간 지속`
    },
    onAttackStun: {
        description: (chance, duration) => `공격 시 ${(chance * 100).toFixed(0)}% 확률로 적 ${duration}초간 기절`,
        effect: { type: 'onAttack', effectType: 'stun', chance: 0, duration: 0 },
        format: (affix) => `공격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 적 ${affix.duration}초간 기절`
    },
    onHitDefenseBreak: {
        description: (chance, magnitude, duration) => `피격 시 ${(chance * 100).toFixed(0)}% 확률로 적 방어력 ${magnitude * 100}% 감소 ${duration}초간 지속`,
        effect: { type: 'onHit', effectType: 'defenseBreak', chance: 0, magnitude: 0, duration: 0 },
        format: (affix) => `피격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 적 방어력 ${(affix.magnitude * 100).toFixed(0)}% 감소 ${affix.duration}초간 지속`
    },
    speedBoostOnKill: {
        description: (value, duration) => `몬스터 처치 시 ${(value * 100).toFixed(0)}% 이동 속도 증가 ${duration}초간 지속`,
        effect: { type: 'onKill', stat: 'movementSpeedBonus', value: 0, duration: 0 },
        format: (affix) => `몬스터 처치 시 ${(affix.value * 100).toFixed(0)}% 이동 속도 증가 ${affix.duration}초간 지속`
    },
    movementSpeedBonus: {
        description: (value) => `이동 속도 ${value * 100}% 증가`,
        effect: { type: 'passive', stat: 'speed', value: 0 },
        format: (affix) => `이동 속도 ${(affix.value * 100).toFixed(0)}% 증가`
    },
    magicFindBonus: {
        description: (value) => `매직 파인드 ${value * 100}% 증가`,
        effect: { type: 'passive', stat: 'magicFind', value: 0 },
        format: (affix) => `매직 파인드 ${(affix.value * 100).toFixed(0)}% 증가`
    },
    allElementalResistance: { // All elemental resistance
        description: (value) => `모든 원소 저항 ${value * 100}% 증가`,
        effect: { type: 'passive', stat: 'elementalResistance', value: 0 },
        format: (affix) => `모든 원소 저항 ${(affix.value * 100).toFixed(0)}% 증가`
    },
    multiShot: {
        description: (chance, count) => `원거리 공격 시 ${(chance * 100).toFixed(0)}% 확률로 ${count}발의 추가 화살 발사`,
        effect: { type: 'onRangedAttack', effectType: 'multiShot', chance: 0, count: 0 },
        format: (affix) => `원거리 공격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 ${affix.count}발의 추가 화살 발사`
    },
    speedOnEvade: {
        description: (value, duration) => `회피 성공 시 ${(value * 100).toFixed(0)}% 이동 속도 증가 ${duration}초간 지속`,
        effect: { type: 'onEvade', stat: 'movementSpeedBonus', value: 0, duration: 0 },
        format: (affix) => `회피 성공 시 ${(affix.value * 100).toFixed(0)}% 이동 속도 증가 ${affix.duration}초간 지속`
    },
    onHitSlow: {
        description: (chance, magnitude, duration) => `피격 시 ${(chance * 100).toFixed(0)}% 확률로 적 이동 속도 ${magnitude * 100}% 감소 ${duration}초간 지속`,
        effect: { type: 'onHit', effectType: 'slow', chance: 0, magnitude: 0, duration: 0 },
        format: (affix) => `피격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 적 이동 속도 ${(affix.magnitude * 100).toFixed(0)}% 감소 ${affix.duration}초간 지속`
    },
    lowHpDefenseBoost: {
        description: (threshold, value) => `체력 ${(threshold * 100).toFixed(0)}% 이하 시 방어력 ${(value * 100).toFixed(0)}% 추가 증가`,
        effect: { type: 'passive', trigger: 'lowHp', threshold: 0, value: 0 },
        format: (affix) => `체력 ${(affix.threshold * 100).toFixed(0)}% 이하 시 방어력 ${(affix.value * 100).toFixed(0)}% 추가 증가`
    },
    onHitFear: {
        description: (chance, duration) => `공격 시 ${(chance * 100).toFixed(0)}% 확률로 적 ${duration}초간 공포에 빠짐`,
        effect: { type: 'onHit', effectType: 'fear', chance: 0, duration: 0 },
        format: (affix) => `공격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 적 ${affix.duration}초간 공포에 빠짐`
    },
    manaCostReduction: {
        description: (value) => `MP 소모 ${value * 100}% 감소`,
        effect: { type: 'passive', stat: 'manaCostReduction', value: 0 },
        format: (affix) => `MP 소모 ${(affix.value * 100).toFixed(0)}% 감소`
    },
    healingEffectiveness: {
        description: (value) => `자신 및 아군 치유 효과 ${value * 100}% 증가`,
        effect: { type: 'passive', stat: 'healingEffectiveness', value: 0 },
        format: (affix) => `자신 및 아군 치유 효과 ${(affix.value * 100).toFixed(0)}% 증가`
    },
    teleportOnEvade: {
        description: (chance) => `회피 성공 시 ${(chance * 100).toFixed(0)}% 확률로 무작위 위치로 순간 이동`,
        effect: { type: 'onEvade', effectType: 'teleport', chance: 0 },
        format: (affix) => `회피 성공 시 ${(affix.chance * 100).toFixed(0)}% 확률로 무작위 위치로 순간 이동`
    },
    chanceToSurviveLethal: {
        description: (chance) => `죽음의 위기 시 ${(chance * 100).toFixed(0)}% 확률로 생존`,
        effect: { type: 'passive', effectType: 'surviveLethal', chance: 0 },
        format: (affix) => `죽음의 위기 시 ${(affix.chance * 100).toFixed(0)}% 확률로 생존`
    },
    allStatsBonus: {
        description: (value) => `모든 기본 스탯 +${value}`,
        effect: { type: 'passive', stat: 'allStats', value: 0 },
        format: (affix) => `모든 기본 스탯 +${affix.value}`
    },
    chanceToResurrect: {
        description: (chance) => `죽음 시 ${(chance * 100).toFixed(0)}% 확률로 부활`,
        effect: { type: 'onDeath', effectType: 'resurrect', chance: 0 },
        format: (affix) => `죽음 시 ${(affix.chance * 100).toFixed(0)}% 확률로 부활`
    },
    reflectDamage: {
        description: (chance, magnitude) => `피격 시 ${(chance * 100).toFixed(0)}% 확률로 받는 피해의 ${magnitude * 100}% 반사`,
        effect: { type: 'onHit', effectType: 'reflectDamage', chance: 0, magnitude: 0 },
        format: (affix) => `피격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 받는 피해의 ${(affix.magnitude * 100).toFixed(0)}% 반사`
    },
    onHitBlind: {
        description: (chance, duration) => `피격 시 ${(chance * 100).toFixed(0)}% 확률로 적 ${duration}초간 실명`,
        effect: { type: 'onHit', effectType: 'blind', chance: 0, duration: 0 },
        format: (affix) => `피격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 적 ${affix.duration}초간 실명`
    },
    critDamageBonus: {
        description: (value) => `치명타 피해량 ${value * 100}% 추가 증가`,
        effect: { type: 'passive', stat: 'critDamage', value: 0 },
        format: (affix) => `치명타 피해량 ${(affix.value * 100).toFixed(0)}% 추가 증가`
    },
    damageBoostOnKill: {
        description: (value, duration) => `몬스터 처치 시 공격력 ${value * 100}% 증가 ${duration}초간 지속`,
        effect: { type: 'onKill', stat: 'physicalAttackBonus', value: 0, duration: 0 },
        format: (affix) => `몬스터 처치 시 공격력 ${(affix.value * 100).toFixed(0)}% 증가 ${affix.duration}초간 지속`
    },
    healingAura: {
        description: (value) => `주변 아군 초당 체력 ${value} 회복 오라`,
        effect: { type: 'aura', stat: 'hpRegen', value: 0 },
        format: (affix) => `주변 아군 초당 체력 ${affix.value} 회복 오라`
    },
    areaFireDamage: {
        description: (chance, magnitude) => `공격 시 ${(chance * 100).toFixed(0)}% 확률로 ${magnitude} 화염 범위 피해`,
        effect: { type: 'onAttack', effectType: 'areaDamage', elementalType: 'fire', magnitude: 0, chance: 0 },
        format: (affix) => `공격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 ${affix.magnitude} 화염 범위 피해`
    },
    fireResistanceDebuff: {
        description: (chance, magnitude, duration) => `공격 시 ${(chance * 100).toFixed(0)}% 확률로 적 화염 저항 ${magnitude * 100}% 감소 ${duration}초간 지속`,
        effect: { type: 'onAttack', effectType: 'elementalResistanceDebuff', elementalType: 'fire', chance: 0, magnitude: 0, duration: 0 },
        format: (affix) => `공격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 적 화염 저항 ${(affix.magnitude * 100).toFixed(0)}% 감소 ${affix.duration}초간 지속`
    },
    meteorStrikeProc: {
        description: (chance, magnitude) => `공격 시 ${(chance * 100).toFixed(0)}% 확률로 ${magnitude} 별똥별 소환`,
        effect: { type: 'onAttack', effectType: 'meteorStrike', chance: 0, magnitude: 0 },
        format: (affix) => `공격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 ${affix.magnitude} 별똥별 소환`
    },
    chanceToNegateDamage: {
        description: (chance) => `피격 시 ${(chance * 100).toFixed(0)}% 확률로 받는 피해 무효화`,
        effect: { type: 'onHit', effectType: 'negateDamage', chance: 0 },
        format: (affix) => `피격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 받는 피해 무효화`
    },
    stealthAttackBonus: {
        description: (value) => `은신 상태에서 공격 시 공격력 ${value * 100}% 증가`,
        effect: { type: 'passive', trigger: 'stealthAttack', value: 0 },
        format: (affix) => `은신 상태에서 공격 시 공격력 ${(affix.value * 100).toFixed(0)}% 증가`
    },
    onCritInstantKill: {
        description: (chance) => `치명타 시 ${(chance * 100).toFixed(0)}% 확률로 적 즉사`,
        effect: { type: 'onCrit', effectType: 'instantKill', chance: 0 },
        format: (affix) => `치명타 시 ${(affix.chance * 100).toFixed(0)}% 확률로 적 즉사`
    },
    areaPhysicalDamageStun: {
        description: (chance, magnitude, duration) => `공격 시 ${(chance * 100).toFixed(0)}% 확률로 ${magnitude} 물리 범위 피해 및 ${duration}초간 기절`,
        effect: { type: 'onAttack', effectType: 'areaDamageStun', elementalType: 'physical', magnitude: 0, chance: 0, duration: 0 },
        format: (affix) => `공격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 ${affix.magnitude} 물리 범위 피해 및 ${affix.duration}초간 기절`
    },
    stealthOnRangedHit: {
        description: (chance, duration) => `원거리 공격 시 ${(chance * 100).toFixed(0)}% 확률로 ${duration}초간 은신`,
        effect: { type: 'onRangedAttack', effectType: 'stealth', chance: 0, duration: 0 },
        format: (affix) => `원거리 공격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 ${affix.duration}초간 은신`
    },
    stealthCritChanceBonus: {
        description: (value) => `은신 상태에서 치명타 확률 ${value * 100}% 증가`,
        effect: { type: 'passive', trigger: 'stealthCrit', value: 0 },
        format: (affix) => `은신 상태에서 치명타 확률 ${(affix.value * 100).toFixed(0)}% 증가`
    },
    freeSpellCast: {
        description: (chance) => `마법 공격 시 ${(chance * 100).toFixed(0)}% 확률로 MP 소모 없이 발동`,
        effect: { type: 'onSpellAttack', effectType: 'freeCast', chance: 0 },
        format: (affix) => `마법 공격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 MP 소모 없이 발동`
    },
    onSpellHitDispelBuff: {
        description: (chance) => `마법 공격 시 ${(chance * 100).toFixed(0)}% 확률로 적의 버프 해제`,
        effect: { type: 'onSpellAttack', effectType: 'dispelBuff', chance: 0 },
        format: (affix) => `마법 공격 시 ${(affix.chance * 100).toFixed(0)}% 확률로 적의 버프 해제`
    }
};