export const MONSTER_TIERS = {
    basic:     { name: '',           stat_multiplier: 0.8,  drop_rate_bonus: 0,    threat_bonus: -5,  rarity_bonus: 0,   base_gold_drop: 3 },
    standard:  { name: '',           stat_multiplier: 1.0,  drop_rate_bonus: 0,    threat_bonus: 0,   rarity_bonus: 0,   base_gold_drop: 5 },
    advanced:  { name: '강화된',      stat_multiplier: 1.25, drop_rate_bonus: 0.05, threat_bonus: 3,   rarity_bonus: 5,   base_gold_drop: 7 },
    elite:     { name: '정예',        stat_multiplier: 1.5,  drop_rate_bonus: 0.1,  threat_bonus: 5,   rarity_bonus: 10,  base_gold_drop: 10 },
    epic:      { name: '영웅',        stat_multiplier: 2.0,  drop_rate_bonus: 0.15, threat_bonus: 8,   rarity_bonus: 15,  base_gold_drop: 15 },
    champion:  { name: '챔피언',      stat_multiplier: 2.5,  drop_rate_bonus: 0.2,  threat_bonus: 10,  rarity_bonus: 20,  base_gold_drop: 20 },
    legendary: { name: '전설적인',    stat_multiplier: 3.0,  drop_rate_bonus: 0.25, threat_bonus: 15,  rarity_bonus: 25,  base_gold_drop: 30 }
};

export const BIOMES = {
    FOREST:   { name: 'Forest',   tileSet: 'forestTiles',   baseColor: '#2e391b' },
    ICE:      { name: 'Ice',      tileSet: 'iceTiles',      baseColor: '#FFFFFF' },
    CAVE:     { name: 'Cave',     tileSet: 'caveTiles',     baseColor: '#000000' },
    VOLCANO:  { name: 'Volcano',  tileSet: 'volcanicTiles', baseColor: '#000000' },
};

export const MONSTER_TYPES = [
    // Basic Monsters - early game, can evolve
    {
        name: "BLUE_SLIME",
        archetype: 'tanky_slow',
        biomes: ['FOREST', 'CAVE'],
        skills: ["acidSpit", "regeneration"],
        minPlayerLevel: 1,
        isBasicMonster: true,
        evolvedForm: "KING_SLIME",
        ecology: {
            prey: [],
            predators: ["FROG_SHAMAN", "LIZARD_MAN", "GOBLIN"],
            competitors: ["GREEN_SLIME"],
            environmentalPreference: {humidity: 'high', temperature: 'moderate'},
            elementalType: 'ice'
        }
    },
    {
        name: "GREEN_SLIME",
        archetype: 'tanky_slow',
        biomes: ['FOREST'],
        skills: ["acidSpit", "regeneration"],
        minPlayerLevel: 1,
        isBasicMonster: true,
        evolvedForm: "KING_SLIME",
        ecology: {
            prey: [],
            predators: ["GOBLIN", "FROG_SHAMAN"],
            competitors: ["BLUE_SLIME"],
            environmentalPreference: {humidity: 'high', temperature: 'moderate'},
            elementalType: 'poison'
        }
    },
    {
        name: "BONE_SLIME",
        archetype: 'tanky_slow',
        biomes: ['ICE', 'CAVE'],
        skills: ["acidSpit", "infectiousBite"],
        minPlayerLevel: 5,
        isBasicMonster: true,
        evolvedForm: "KING_SLIME",
        ecology: {
            prey: [],
            predators: ["ICE_SKULKING", "SKEL_WARRIOR"],
            competitors: [],
            environmentalPreference: {temperature: 'low', magicalEnergy: 'high'},
            elementalType: 'dark'
        }
    },
    {
        name: "GOBLIN",
        archetype: 'standard',
        biomes: ['FOREST', 'CAVE'],
        skills: ["leapAttack", "venomousBite"],
        minPlayerLevel: 1,
        isBasicMonster: true,
        evolvedForm: "GOBLIN_KING",
        ecology: {
            prey: ["BLUE_SLIME", "GREEN_SLIME"],
            predators: ["GREY_WOLF", "ORC_WARRIOR", "DARK_KHIGHT"],
            competitors: ["KOBOLT"],
            environmentalPreference: {humidity: 'normal', temperature: 'moderate'},
            elementalType: 'physical'
        }
    },
    {
        name: "KOBOLT",
        archetype: 'standard',
        biomes: ['FOREST', 'CAVE'],
        skills: ["leapAttack", "slam"],
        minPlayerLevel: 3,
        isBasicMonster: true,
        evolvedForm: "GOBLIN_KING",
        ecology: {
            prey: [],
            predators: ["GOBLIN", "ORC_WARRIOR"],
            competitors: ["GOBLIN"],
            environmentalPreference: {humidity: 'normal', temperature: 'moderate'},
            elementalType: 'physical'
        }
    },
    {
        name: "SKEL_WARRIOR",
        archetype: 'standard',
        biomes: ['ICE', 'CAVE'],
        skills: ["slam", "venomousBite"],
        minPlayerLevel: 5,
        isBasicMonster: true,
        evolvedForm: "SKELETON_KING",
        ecology: {
            prey: ["BONE_SLIME"],
            predators: ["ICE_LICH"],
            competitors: ["ZOMBIE"],
            environmentalPreference: {magicalEnergy: 'moderate', temperature: 'low'},
            elementalType: 'physical'
        }
    },
    {
        name: "ZOMBIE",
        archetype: 'tanky_slow',
        biomes: ['CAVE'],
        skills: ["infectiousBite", "slam", "regeneration"],
        minPlayerLevel: 8,
        isBasicMonster: true,
        evolvedForm: "ZOMBIE_LORD",
        ecology: {
            prey: [],
            predators: ["POISON_LICH", "SKEL_WARRIOR"],
            competitors: ["SKEL_WARRIOR"],
            environmentalPreference: {humidity: 'high', magicalEnergy: 'low'},
            elementalType: 'physical'
        }
    },

    // Evolved/King versions of basic monsters
    {
        name: "KING_SLIME",
        archetype: 'tanky_slow',
        biomes: ['FOREST', 'CAVE', 'ICE'],
        skills: ["acidSpit", "regeneration", "slam"],
        minPlayerLevel: 20,
        initialTier: 'epic',
        ecology: {
            prey: ["GOBLIN", "KOBOLT"],
            predators: [],
            competitors: [],
            environmentalPreference: {humidity: 'high', temperature: 'moderate'},
            elementalType: 'ice'
        }
    },
    {
        name: "GOBLIN_KING",
        archetype: 'bruiser',
        biomes: ['FOREST', 'CAVE'],
        skills: ["leapAttack", "venomousBite", "berserk", "charge"],
        minPlayerLevel: 25,
        initialTier: 'epic',
        ecology: {
            prey: ["ORC_WARRIOR", "GREY_WOLF"],
            predators: [],
            competitors: ["DARK_KHIGHT"],
            environmentalPreference: {humidity: 'normal', temperature: 'moderate'},
            elementalType: 'physical'
        }
    },
    {
        name: "SKELETON_KING",
        archetype: 'bruiser',
        biomes: ['ICE', 'CAVE'],
        skills: ["slam", "venomousBite", "shadowStep", "berserk"],
        minPlayerLevel: 30,
        initialTier: 'epic',
        ecology: {
            prey: ["ZOMBIE"],
            predators: ["SKUL_LICH"],
            competitors: [],
            environmentalPreference: {magicalEnergy: 'high', temperature: 'low'},
            elementalType: 'dark'
        }
    },
    {
        name: "ZOMBIE_LORD",
        archetype: 'tank',
        biomes: ['CAVE'],
        skills: ["infectiousBite", "slam", "regeneration", "toxicCloud"],
        minPlayerLevel: 35,
        initialTier: 'epic',
        ecology: {
            prey: ["SKEL_WARRIOR"],
            predators: ["ARCHLICH"],
            competitors: ["SKEL_WARRIOR"],
            environmentalPreference: {humidity: 'high', magicalEnergy: 'moderate'},
            elementalType: 'poison'
        }
    },

    // Mid-game monsters
    {
        name: "CRYSTAL_GOLEM",
        archetype: 'tank',
        biomes: ['ICE', 'CAVE'],
        skills: ["stoneSkin", "slam", "regeneration"],
        minPlayerLevel: 10,
        ecology: {
            prey: [],
            predators: [],
            competitors: ["ROCK_GOLEM", "LAVA_GOLEM"],
            environmentalPreference: {magicalEnergy: 'high', temperature: 'low'},
            elementalType: 'physical'
        }
    },
    {
        name: "DARK_KHIGHT",
        archetype: 'bruiser',
        biomes: ['CAVE'],
        skills: ["berserk", "shadowStep", "slam"],
        minPlayerLevel: 25,
        initialTier: 'advanced',
        ecology: {
            prey: ["GOBLIN", "KOBOLT"],
            predators: [],
            competitors: ["ORC_WARRIOR"],
            environmentalPreference: {magicalEnergy: 'high', humidity: 'low'},
            elementalType: 'dark'
        }
    },
    {
        name: "EARTH_TURTLE",
        archetype: 'tank',
        biomes: ['FOREST'],
        skills: ["stoneSkin", "groundStomp", "regeneration"],
        minPlayerLevel: 8,
        ecology: {
            prey: [],
            predators: ["GREY_WOLF", "RAPTOR_WARRIOR"],
            competitors: ["ENT_WOOD"],
            environmentalPreference: {humidity: 'high', temperature: 'moderate'},
            elementalType: 'physical'
        }
    },
    {
        name: "EARTH_WORM",
        archetype: 'standard',
        biomes: ['FOREST', 'CAVE'],
        skills: ["groundStomp", "regeneration"],
        minPlayerLevel: 3,
        ecology: {
            prey: [],
            predators: ["EARTH_TURTLE", "FROG_SHAMAN"],
            competitors: ["WOOD_WARM"],
            environmentalPreference: {humidity: 'high', temperature: 'moderate'},
            elementalType: 'physical'
        }
    },
    {
        name: "ENT_WOOD",
        archetype: 'tank',
        biomes: ['FOREST'],
        skills: ["stoneSkin", "groundStomp", "toxicCloud"],
        minPlayerLevel: 12,
        ecology: {
            prey: [],
            predators: [],
            competitors: ["EARTH_TURTLE"],
            environmentalPreference: {humidity: 'high', magicalEnergy: 'moderate'},
            elementalType: 'poison'
        }
    },
    {
        name: "FIRE_WORM",
        archetype: 'caster',
        biomes: ['VOLCANO'],
        skills: ["fireBreath", "acidSpit"],
        minPlayerLevel: 15,
        ecology: {
            prey: [],
            predators: ["RED_DRAGON", "LAVA_GOLEM"],
            competitors: ["RED_OGRE"],
            environmentalPreference: {temperature: 'high', magicalEnergy: 'high'},
            elementalType: 'fire'
        }
    },
    {
        name: "FROG_SHAMAN",
        archetype: 'caster',
        biomes: ['FOREST'],
        skills: ["toxicCloud", "healingAuraMonster", "disorientingGaze"],
        minPlayerLevel: 7,
        ecology: {
            prey: ["BLUE_SLIME", "EARTH_WORM"],
            predators: ["LIZARD_MAN", "ORC_SHAMAN"],
            competitors: ["ORC_SHAMAN"],
            environmentalPreference: {humidity: 'high', magicalEnergy: 'high'},
            elementalType: 'poison'
        }
    },
    {
        name: "GARGOYLE",
        archetype: 'rusher',
        biomes: ['CAVE', 'VOLCANO'],
        skills: ["leapAttack", "slam", "stoneSkin"],
        minPlayerLevel: 12,
        ecology: {
            prey: ["GOBLIN", "KOBOLT"],
            predators: ["SATANIC_GARGOYLE"],
            competitors: ["MIMIC"],
            environmentalPreference: {temperature: 'high', magicalEnergy: 'moderate'},
            elementalType: 'physical'
        }
    },
    {
        name: "GHOST",
        archetype: 'evasive',
        biomes: ['ICE', 'CAVE'],
        skills: ["shadowBind", "evadeBoost", "blindingFlash"],
        minPlayerLevel: 10,
        ecology: {
            prey: [],
            predators: ["ICE_LICH", "SKUL_LICH"],
            competitors: [],
            environmentalPreference: {magicalEnergy: 'high', humidity: 'low'},
            elementalType: 'dark'
        }
    },
    {
        name: "GREY_WOLF",
        archetype: 'rusher',
        biomes: ['FOREST'],
        skills: ["charge", "venomousBite"],
        minPlayerLevel: 5,
        ecology: {
            prey: ["GOBLIN", "EARTH_TURTLE"],
            predators: ["WEREWOLF"],
            competitors: [],
            environmentalPreference: {humidity: 'normal', temperature: 'moderate'},
            elementalType: 'physical'
        }
    },
    {
        name: "LAVA_GOLEM",
        archetype: 'tank',
        biomes: ['VOLCANO'],
        skills: ["stoneSkin", "groundStomp", "fireBreath"],
        minPlayerLevel: 18,
        ecology: {
            prey: ["FIRE_WORM"],
            predators: ["GROUND_DRAGON"],
            competitors: ["ROCK_GOLEM"],
            environmentalPreference: {temperature: 'very_high', magicalEnergy: 'high'},
            elementalType: 'fire'
        }
    },
    {
        name: "LIZARD_MAN",
        archetype: 'standard',
        biomes: ['FOREST', 'VOLCANO'],
        skills: ["acidSpit", "leapAttack"],
        minPlayerLevel: 10,
        ecology: {
            prey: ["FROG_SHAMAN", "BLUE_SLIME"],
            predators: ["RED_RIZARDMAN", "RAPTOR_WARRIOR"],
            competitors: ["RAPTOR_WARRIOR"],
            environmentalPreference: {humidity: 'high', temperature: 'high'},
            elementalType: 'physical'
        }
    },
    {
        name: "MIMIC",
        archetype: 'bruiser',
        biomes: ['CAVE'],
        skills: ["slam", "berserk", "disorientingGaze"],
        minPlayerLevel: 15,
        ecology: {
            prey: ["KOBOLT"],
            predators: [],
            competitors: ["GARGOYLE"],
            environmentalPreference: {magicalEnergy: 'high', humidity: 'low'},
            elementalType: 'physical'
        }
    },
    {
        name: "ORC_SHAMAN",
        archetype: 'caster',
        biomes: ['FOREST'],
        skills: ["groundStomp", "healingAuraMonster", "berserk"],
        minPlayerLevel: 12,
        ecology: {
            prey: ["FROG_SHAMAN", "GOBLIN"],
            predators: ["ORC_WARRIOR"],
            competitors: ["FROG_SHAMAN"],
            environmentalPreference: {humidity: 'normal', magicalEnergy: 'high'},
            elementalType: 'physical'
        }
    },
    {
        name: "ORC_WARRIOR",
        archetype: 'bruiser',
        biomes: ['FOREST'],
        skills: ["slam", "charge", "berserk"],
        minPlayerLevel: 10,
        ecology: {
            prey: ["GOBLIN", "KOBOLT", "GREY_WOLF"],
            predators: ["WEREWOLF", "DARK_KHIGHT"],
            competitors: ["DARK_KHIGHT"],
            environmentalPreference: {humidity: 'normal', temperature: 'moderate'},
            elementalType: 'physical'
        }
    },
    {
        name: "POISON_MUSHMAN",
        archetype: 'caster',
        biomes: ['FOREST'],
        skills: ["poisonSpit", "toxicCloud"],
        minPlayerLevel: 10,
        ecology: {
            prey: [],
            predators: ["POISON_DRAGON", "POISON_LICH"],
            competitors: [],
            environmentalPreference: {humidity: 'high', temperature: 'low'},
            elementalType: 'poison'
        }
    },
    {
        name: "POISON_SIDE",
        archetype: 'standard',
        biomes: ['FOREST'],
        skills: ["venomousBite", "toxicCloud"],
        minPlayerLevel: 1,
        ecology: {
            prey: [],
            predators: [],
            competitors: [],
            environmentalPreference: {humidity: 'high', pollutionLevel: 'high'},
            elementalType: 'poison'
        }
    },
    {
        name: "RAPTOR_ARCHER",
        archetype: 'glass_cannon',
        biomes: ['FOREST'],
        skills: ["spikeBarrage", "leapAttack"],
        minPlayerLevel: 12,
        ecology: {
            prey: ["LIZARD_MAN"],
            predators: ["RAPTOR_WARRIOR"],
            competitors: ["RAPTOR_WARRIOR"],
            environmentalPreference: {temperature: 'moderate', humidity: 'low'},
            elementalType: 'physical'
        }
    },
    {
        name: "RAPTOR_WARRIOR",
        archetype: 'rusher',
        biomes: ['FOREST'],
        skills: ["charge", "venomousBite"],
        minPlayerLevel: 15,
        ecology: {
            prey: ["LIZARD_MAN", "RAPTOR_ARCHER"],
            predators: ["GROUND_DRAGON"],
            competitors: ["LIZARD_MAN"],
            environmentalPreference: {temperature: 'moderate', humidity: 'low'},
            elementalType: 'physical'
        }
    },
    {
        name: "RED_OGRE",
        archetype: 'bruiser',
        biomes: ['VOLCANO'],
        skills: ["slam", "berserk", "groundStomp"],
        minPlayerLevel: 20,
        ecology: {
            prey: ["FIRE_WORM"],
            predators: ["RED_DRAGON"],
            competitors: ["LAVA_GOLEM"],
            environmentalPreference: {temperature: 'high', humidity: 'low'},
            elementalType: 'physical'
        }
    },
    {
        name: "RED_RIZARDMAN",
        archetype: 'standard',
        biomes: ['VOLCANO'],
        skills: ["fireBreath", "leapAttack"],
        minPlayerLevel: 18,
        ecology: {
            prey: ["LIZARD_MAN"],
            predators: ["RED_DRAGON"],
            competitors: [],
            environmentalPreference: {temperature: 'high', humidity: 'moderate'},
            elementalType: 'fire'
        }
    },
    {
        name: "ROCK_GOLEM",
        archetype: 'tank',
        biomes: ['CAVE', 'VOLCANO'],
        skills: ["stoneSkin", "groundStomp", "slam"],
        minPlayerLevel: 15,
        ecology: {
            prey: [],
            predators: [],
            competitors: ["CRYSTAL_GOLEM", "LAVA_GOLEM"],
            environmentalPreference: {magicalEnergy: 'low', temperature: 'moderate'},
            elementalType: 'physical'
        }
    },
    {
        name: "SATANIC_GARGOYLE",
        archetype: 'elite',
        biomes: ['CAVE', 'VOLCANO'],
        skills: ["fireBreath", "shadowStep", "berserk"],
        minPlayerLevel: 25,
        ecology: {
            prey: ["GARGOYLE"],
            predators: [],
            competitors: [],
            environmentalPreference: {magicalEnergy: 'very_high', temperature: 'high'},
            elementalType: 'dark'
        }
    },
    {
        name: "WEREWOLF",
        archetype: 'bruiser',
        biomes: ['FOREST', 'CAVE'],
        skills: ["frenzy", "venomousBite", "charge"],
        minPlayerLevel: 20,
        ecology: {
            prey: ["GREY_WOLF", "ORC_WARRIOR"],
            predators: ["DARK_KHIGHT"],
            competitors: [],
            environmentalPreference: {magicalEnergy: 'moderate', humidity: 'normal'},
            elementalType: 'physical'
        }
    },
    {
        name: "WOOD_WARM",
        archetype: 'standard',
        biomes: ['FOREST'],
        skills: ["groundStomp", "toxicCloud"],
        minPlayerLevel: 5,
        ecology: {
            prey: [],
            predators: ["EARTH_WORM"],
            competitors: ["EARTH_WORM"],
            environmentalPreference: {humidity: 'high', temperature: 'moderate'},
            elementalType: 'poison'
        }
    },

    // High-level monsters
    {
        name: "GROUND_DRAGON",
        archetype: 'elite',
        biomes: ['VOLCANO', 'FOREST'],
        skills: ["groundStomp", "fireBreath", "berserk"],
        minPlayerLevel: 30,
        initialTier: 'elite',
        evolvedForm: "DRAGON_OVERLORD",
        ecology: {
            prey: ["FIRE_WORM", "LAVA_GOLEM", "RED_OGRE"],
            predators: [],
            competitors: ["RED_DRAGON"],
            environmentalPreference: {temperature: 'high', magicalEnergy: 'high'},
            elementalType: 'fire'
        }
    },
    {
        name: "ICE_DRAGON",
        archetype: 'elite',
        biomes: ['ICE'],
        skills: ["frostNova", "iceShard", "berserk"],
        minPlayerLevel: 35,
        initialTier: 'elite',
        evolvedForm: "DRAGON_OVERLORD",
        ecology: {
            prey: ["ICE_SKULKING", "ICE_LICH"],
            predators: [],
            competitors: [],
            environmentalPreference: {temperature: 'low', magicalEnergy: 'high'},
            elementalType: 'ice'
        }
    },
    {
        name: "ICE_LICH",
        archetype: 'caster',
        biomes: ['ICE'],
        skills: ["frostNova", "iceShard", "shadowBind"],
        minPlayerLevel: 20,
        initialTier: 'advanced',
        evolvedForm: "ARCHLICH",
        ecology: {
            prey: ["GHOST", "BONE_SLIME"],
            predators: ["ICE_DRAGON"],
            competitors: ["SKUL_LICH"],
            environmentalPreference: {temperature: 'low', magicalEnergy: 'high'},
            elementalType: 'ice'
        }
    },
    {
        name: "ICE_SKULKING",
        archetype: 'rusher',
        biomes: ['ICE'],
        skills: ["iceShard", "shadowStep", "evadeBoost"],
        minPlayerLevel: 15,
        ecology: {
            prey: ["BONE_SLIME"],
            predators: ["ICE_DRAGON"],
            competitors: [],
            environmentalPreference: {temperature: 'low', humidity: 'low'},
            elementalType: 'ice'
        }
    },
    {
        name: "POISON_DRAGON",
        archetype: 'elite',
        biomes: ['FOREST'],
        skills: ["toxicCloud", "venomousBite", "berserk"],
        minPlayerLevel: 30,
        initialTier: 'elite',
        evolvedForm: "DRAGON_OVERLORD",
        ecology: {
            prey: ["POISON_MUSHMAN"],
            predators: [],
            competitors: ["RED_DRAGON"],
            environmentalPreference: {humidity: 'high', pollutionLevel: 'high'},
            elementalType: 'poison'
        }
    },
    {
        name: "POISON_LICH",
        archetype: 'caster',
        biomes: ['FOREST'],
        skills: ["toxicCloud", "shadowBind", "drainLife"],
        minPlayerLevel: 25,
        initialTier: 'advanced',
        evolvedForm: "ARCHLICH",
        ecology: {
            prey: ["POISON_MUSHMAN", "ZOMBIE"],
            predators: ["POISON_DRAGON"],
            competitors: ["SKUL_LICH"],
            environmentalPreference: {humidity: 'high', magicalEnergy: 'high', pollutionLevel: 'high'},
            elementalType: 'poison'
        }
    },
    {
        name: "RED_DRAGON",
        archetype: 'elite',
        biomes: ['VOLCANO'],
        skills: ["fireBreath", "charge", "berserk"],
        minPlayerLevel: 40,
        initialTier: 'elite',
        evolvedForm: "DRAGON_OVERLORD",
        ecology: {
            prey: ["FIRE_WORM", "LAVA_GOLEM", "RED_OGRE"],
            predators: [],
            competitors: ["GROUND_DRAGON"],
            environmentalPreference: {temperature: 'very_high', magicalEnergy: 'very_high'},
            elementalType: 'fire'
        }
    },
    {
        name: "SKUL_LICH",
        archetype: 'caster',
        biomes: ['ICE', 'CAVE'],
        skills: ["shadowBind", "drainLife", "frostNova"],
        minPlayerLevel: 25,
        initialTier: 'advanced',
        evolvedForm: "ARCHLICH",
        ecology: {
            prey: ["SKEL_WARRIOR", "GHOST"],
            predators: ["ICE_DRAGON"],
            competitors: ["ICE_LICH"],
            environmentalPreference: {magicalEnergy: 'very_high', temperature: 'low'},
            elementalType: 'dark'
        }
    },

    // Archlich (boss level lich)
    {
        name: "ARCHLICH",
        archetype: 'caster',
        biomes: ['ICE', 'CAVE', 'FOREST'],
        skills: ["frostNova", "iceShard", "shadowBind", "drainLife", "toxicCloud"],
        minPlayerLevel: 40,
        initialTier: 'legendary',
        ecology: {
            prey: ["ICE_LICH", "POISON_LICH", "SKUL_LICH"],
            predators: [],
            competitors: [],
            environmentalPreference: {magicalEnergy: 'very_high', temperature: 'low'},
            elementalType: 'dark'
        }
    },
    // Dragon Overlord (boss level dragon)
    {
        name: "DRAGON_OVERLORD",
        archetype: 'elite',
        biomes: ['VOLCANO', 'FOREST', 'ICE'],
        skills: ["fireBreath", "charge", "berserk", "groundStomp", "toxicCloud", "frostNova"],
        minPlayerLevel: 50,
        initialTier: 'legendary',
        ecology: {
            prey: ["GROUND_DRAGON", "ICE_DRAGON", "POISON_DRAGON", "RED_DRAGON"],
            predators: [],
            competitors: [],
            environmentalPreference: {temperature: 'very_high', magicalEnergy: 'very_high'},
            elementalType: 'fire'
        }
    },
];
