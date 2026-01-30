import { gameState } from './gameState.js';
import { MONSTER_TIERS, MONSTER_TYPES, BIOMES } from './monsterConstants.js';
import { BOSS_CHANCE_PERCENT } from './gameSettings.js';
import { getRandomEmptyTile } from './utils.js';
import { dungeonState } from './dungeonState.js';

const MONSTER_NAME_MAP = {
    "BLUE_SLIME": "블루 슬라임",
    "BONE_SLIME": "본 슬라임",
    "CRYSTAL_GOLEM": "크리스탈 골렘",
    "DARK_KHIGHT": "다크 나이트",
    "EARTH_TURTLE": "어스 터틀",
    "EARTH_WORM": "어스 웜",
    "ENT_WOOD": "엔트 우드",
    "FIRE_WORM": "파이어 웜",
    "FROG_SHAMAN": "프로그 주술사",
    "GARGOYLE": "가고일",
    "GHOST": "고스트",
    "GOBLIN": "고블린",
    "GREEN_SLIME": "그린 슬라임",
    "GREY_WOLF": "회색 늑대",
    "GROUND_DRAGON": "어스 드래곤",
    "ICE_DRAGON": "아이스 드래곤",
    "ICE_LICH": "아이스 리치",
    "ICE_SKULKING": "아이스 스컬킹",
    "KOBOLT": "코볼트",
    "LAVA_GOLEM": "라바 골렘",
    "LIZARD_MAN": "리자드맨",
    "MIMIC": "미믹",
    "ORC_SHAMAN": "오크 주술사",
    "ORC_WARRIOR": "오크 전사",
    "POISON_DRAGON": "독룡",
    "POISON_LICH": "포이즌 리치",
    "POISON_MUSHMAN": "독버섯",
    "POISON_SIDE": "포이즌 사이드",
    "RAPTOR_ARCHER": "랩터 아처",
    "RAPTOR_WARRIOR": "랩터 워리어",
    "RED_DRAGON": "레드 드래곤",
    "RED_OGRE": "레드 오우거",
    "RED_RIZARDMAN": "레드 리자드맨",
    "ROCK_GOLEM": "바위 골렘",
    "SATANIC_GARGOYLE": "사타닉 가고일",
    "SKEL_WARRIOR": "해골 전사",
    "SKUL_LICH": "스컬 리치",
    "WEREWOLF": "웨어울프",
    "WOOD_WARM": "우드 웜",
    "ZOMBIE": "좀비",
    "KING_SLIME": "킹 슬라임",
    "GOBLIN_KING": "고블린 왕",
    "SKELETON_KING": "스켈레톤 왕",
    "ZOMBIE_LORD": "좀비 군주",
    "ARCHLICH": "아크 리치",
    "DRAGON_OVERLORD": "드래곤 오버로드"
};

export function calculateGoldDrop(monster) {
    const tierInfo = MONSTER_TIERS[monster.tier];
    let gold = tierInfo.base_gold_drop * monster.level;
    if (monster.isBoss) {
        gold *= 2;
    }
    gold = Math.floor(gold * (0.8 + Math.random() * 0.4));

    const goldFind = gameState.playerStats.derived.goldFind || 0;
    gold = Math.floor(gold * (1 + goldFind));

    return gold;
}

/**
 * 현재 던전 상태 및 환경에 따라 몬스터 풀과 스폰 확률을 조정합니다.
 * @param {Array} baseMonsterPool - 현재 바이옴에 따른 기본 몬스터 풀.
 * @param {number} playerLevel - 플레이어 레벨.
 * @param {string} currentBiomeKey - 현재 바이옴 키.
 * @returns {Array} 가중치가 적용된 몬스터 풀 (스폰 가능성이 있는 몬스터 객체와 조정된 확률).
 */
function getAdjustedMonsterPool(baseMonsterPool, playerLevel, currentBiomeKey) {
    const adjustedPool = [];
    const biomeState = dungeonState.environmentState[currentBiomeKey];
    if (!biomeState) {
        console.warn(`Biome state not found for ${currentBiomeKey}. Using base monster pool.`);
        return baseMonsterPool.map(m => ({ monster: m, weight: 1 }));
    }

    // 1. 이벤트 플래그에 따른 보스 우선 순위
    for (const eventFlag in dungeonState.eventFlags) {
        if (dungeonState.eventFlags[eventFlag]) {
            // 예시: 고블린 킹 보스 플래그가 true이면 고블린 킹을 강제 추가
            if (eventFlag === 'goblinKingEnraged' && currentBiomeKey === 'FOREST') {
                const goblinKing = MONSTER_TYPES.find(m => m.name === "GOBLIN_KING"); // GOBLIN_KING 몬스터 정의 필요
                if (goblinKing) {
                    return [{ monster: goblinKing, weight: 1000 }]; // 보스 강제 스폰
                }
            }
            // 다른 보스 이벤트 처리...
        }
    }

    // 2. 각 몬스터의 가중치 계산
    baseMonsterPool.forEach(monster => {
        let weight = 1.0; // 기본 가중치
        const monsterKey = monster.name.toLowerCase().replace(/_([a-z])/g, g => g[1].toUpperCase());

        // 2.1. 개체수 보정 (몬스터 개체수가 적을수록 가중치 증가, 많을수록 감소)
        const population = dungeonState.monsterPopulation[monsterKey];
        if (population !== undefined) {
            // 개체수가 50 미만이면 등장 확률 증가, 150 초과면 감소
            if (population < 50) {
                weight *= (1 + (50 - population) / 50);
            } else if (population > 150) {
                weight *= (1 - (population - 150) / 100);
            }
            weight = Math.max(0.1, weight); // 최소 가중치 제한
        }

        // 2.2. 환경 선호도 보정
        if (monster.ecology?.environmentalPreference) {
            const pref = monster.ecology.environmentalPreference;
            if (pref.temperature) {
                // 예: 온대 선호 몬스터가 한대 바이옴에선 가중치 감소
                if (pref.temperature === 'high' && biomeState.temperature < 20) weight *= 0.8;
                if (pref.temperature === 'low' && biomeState.temperature > 0) weight *= 0.8;
                if (pref.temperature === 'moderate' && (biomeState.temperature < 0 || biomeState.temperature > 20)) weight *= 0.9;
                if (pref.temperature === 'very_high' && biomeState.temperature < 30) weight *= 0.5;
            }
            if (pref.humidity) {
                if (pref.humidity === 'high' && biomeState.humidity < 0.6) weight *= 0.8;
                if (pref.humidity === 'low' && biomeState.humidity > 0.4) weight *= 0.8;
            }
            if (pref.magicalEnergy) {
                if (pref.magicalEnergy === 'high' && biomeState.magicalEnergy < 0.7) weight *= 0.7;
                if (pref.magicalEnergy === 'low' && biomeState.magicalEnergy > 0.3) weight *= 0.7;
            }
            if (pref.pollutionLevel) { // 새로운 환경 변수
                if (pref.pollutionLevel === 'high' && biomeState.pollutionLevel < 0.5) weight *= 0.5;
            }
        }
        adjustedPool.push({ monster: monster, weight: weight });
    });

    return adjustedPool;
}

export function generateMonster(mapGrid) {
    const playerLevel = gameState.playerStats.base.level;
    const currentBiomeKey = gameState.currentBiome;

    let possibleMonsters = MONSTER_TYPES.filter(monster =>
        monster.biomes && monster.biomes.includes(currentBiomeKey) && monster.minPlayerLevel <= playerLevel
    );

    // 플레이어 레벨과 현재 바이옴에 적합한 몬스터가 없는 경우,
    // 항상 몬스터가 스폰되도록 플레이어 레벨에 적합한 모든 몬스터를 고려합니다.
    if (possibleMonsters.length === 0) {
        let levelAppropriateMonsters = MONSTER_TYPES.filter(monster =>
            monster.minPlayerLevel <= playerLevel + 2 && monster.minPlayerLevel >= Math.max(1, playerLevel - 5) // 플레이어 레벨 주변 몬스터
        );

        if (levelAppropriateMonsters.length === 0) {
             // 최후의 수단으로, 매우 낮은 레벨에 적합한 모든 몬스터 허용
             levelAppropriateMonsters = MONSTER_TYPES.filter(monster => monster.minPlayerLevel <= 5);
        }

        // 레벨에 적합한 몬스터 중에서 현재 바이옴과 일치하는 몬스터를 찾으려고 시도합니다.
        // 그렇지 않으면 레벨에 적합한 아무 몬스터나 사용합니다.
        possibleMonsters = levelAppropriateMonsters.filter(monster =>
            monster.biomes && monster.biomes.includes(currentBiomeKey)
        );

        if (possibleMonsters.length === 0) {
            // 여전히 바이옴과 일치하는 몬스터가 없으면, 레벨에 적합한 아무 몬스터나 폴백으로 사용합니다.
            possibleMonsters = levelAppropriateMonsters;
        }

        // possibleMonsters가 여전히 비어 있으면 MONSTER_TYPES 정의에 심각한 문제가 있는 것입니다.
        if (possibleMonsters.length === 0) {
            console.warn(`Critical: No level-appropriate monsters found at all for player level ${playerLevel}! Using all MONSTER_TYPES as emergency fallback.`);
            possibleMonsters = MONSTER_TYPES; // 비상 폴백
        }
    }

    // 기본 몬스터를 진화형으로 교체하는 로직
    let processedMonsterPool = possibleMonsters.map(monster => {
        if (monster.isBasicMonster && monster.evolvedForm && playerLevel >= monster.minPlayerLevel + 10) { // 플레이어 레벨이 일정 수준 이상 높으면 진화
            const evolved = MONSTER_TYPES.find(m => m.name === monster.evolvedForm);
            if (evolved && evolved.minPlayerLevel <= playerLevel + 5) { // 진화형도 플레이어 레벨과 너무 차이나지 않게
                return evolved;
            }
        }
        return monster;
    });

    // 2단계: 던전 상태에 따른 생태계 보정 적용
    const weightedMonsterPool = getAdjustedMonsterPool(processedMonsterPool, playerLevel, currentBiomeKey);

    // 가중치에 따라 몬스터 선택
    let totalWeight = weightedMonsterPool.reduce((sum, entry) => sum + entry.weight, 0);
    if (totalWeight <= 0) {
        console.warn("Total monster spawn weight is zero or negative. Falling back to random selection.");
        totalWeight = 1; // Fallback to avoid division by zero
        weightedMonsterPool.forEach(entry => entry.weight = 1);
    }

    let randomRoll = Math.random() * totalWeight;
    let selectedMonsterEntry = weightedMonsterPool[0]; // Fallback
    for (const entry of weightedMonsterPool) {
        randomRoll -= entry.weight;
        if (randomRoll <= 0) {
            selectedMonsterEntry = entry;
            break;
        }
    }

    const monsterInfo = selectedMonsterEntry.monster;
    const monsterType = monsterInfo.name;
    const monsterArchetype = monsterInfo.archetype;

    // 몬스터의 기본 티어 결정 (initialTier가 있으면 사용, 없으면 플레이어 레벨 기반으로 추정)
    let tierKey;
    if (monsterInfo.initialTier) {
        tierKey = monsterInfo.initialTier;
    } else {
        // 플레이어 레벨에 따라 동적으로 티어 결정 (가중치를 두어 일반 몬스터가 더 많이 나오도록)
        const tierRoll = Math.random();
        if (playerLevel < 5) { // 초반
            tierKey = 'basic';
        } else if (playerLevel < 15) { // 중반 초입
            tierKey = tierRoll < 0.6 ? 'standard' : (tierRoll < 0.9 ? 'advanced' : 'elite');
        } else if (playerLevel < 30) { // 중반
            tierKey = tierRoll < 0.5 ? 'standard' : (tierRoll < 0.8 ? 'advanced' : (tierRoll < 0.95 ? 'elite' : 'epic'));
        } else { // 후반
            tierKey = tierRoll < 0.4 ? 'advanced' : (tierRoll < 0.7 ? 'elite' : (tierRoll < 0.9 ? 'epic' : 'legendary'));
        }
    }
    const tier = MONSTER_TIERS[tierKey];

    // 보스 몬스터 처리 (기존 로직 유지)
    const isBoss = Math.random() * 100 < BOSS_CHANCE_PERCENT; // 기존 보스 확률 유지
    // isBoss 상태가 되면 티어 보정 (always epic or legendary if boss)
    if (isBoss) {
        tierKey = (tierKey === 'legendary') ? 'legendary' : 'epic';
        if (playerLevel < 20) tierKey = 'elite'; // 낮은 레벨에서는 epic 보스도 elite로 하향
    }
    const finalTier = MONSTER_TIERS[tierKey];


    const translatedName = MONSTER_NAME_MAP[monsterType] || monsterType.replace(/_/g, ' ');
    // 최종 몬스터 이름: 티어 접두사 + 번역된 이름
    const name = (finalTier.name ? `${finalTier.name} ` : '') + translatedName;

    // 몬스터 레벨 계산
    // isBoss 여부와 finalTier.stat_multiplier를 활용하여 몬스터 레벨 조정
    let monsterLevel;
    if (isBoss) {
        monsterLevel = Math.max(1, playerLevel + Math.floor(Math.random() * 8));
        // 보스 레벨이 너무 낮으면 보정
        if (monsterLevel < monsterInfo.minPlayerLevel) monsterLevel = monsterInfo.minPlayerLevel;
    } else {
        monsterLevel = Math.max(1, playerLevel + Math.floor(Math.random() * 7) - 3);
        // 몬스터 최소 레벨보다 낮으면 보정
        if (monsterLevel < monsterInfo.minPlayerLevel) monsterLevel = monsterInfo.minPlayerLevel;
    }

    const stats = generateMonsterStats(monsterLevel, isBoss, finalTier.stat_multiplier, monsterArchetype);

    const levelDiff = monsterLevel - playerLevel;
    let threatScore = levelDiff + (finalTier.threat_bonus || 0);
    if (isBoss) threatScore += 15;

    let threatColor = '#aaaaaa';
    if (threatScore > 15) threatColor = '#a335ee';
    else if (threatScore > 10) threatColor = '#c62828';
    else if (threatScore > 5) threatColor = '#ff4040';
    else if (threatScore > 2) threatColor = '#ff8000';
    else if (threatScore > -2) threatColor = '#FFFF00';
    else threatColor = '#FFFFFF';

    if (isBoss) threatColor = '#ff00ff';

    const {x, y} = getRandomEmptyTile(mapGrid);
    gameState.activeMonsters.push({
        id: Date.now() + Math.random(), x, y, ...stats,
        name: name,
        monsterType: monsterType,
        tier: tierKey, // 최종 결정된 tierKey 사용
        threatColor: threatColor,
        statusEffects: []
    });
}

export function generateMonsterStats(level, isBoss, multiplier, archetype) {
    let baseHp = 50 + (level * 18);
    let baseAttack = 5 + (level * 3);
    let baseDefense = 2 + (level * 1.5);
    let baseSpeed = 5 + level * 0.5;
    let baseEvasion = 0;

    switch (archetype) {
        case 'tank':
            baseHp *= 1.6;
            baseDefense *= 1.5;
            baseAttack *= 0.7;
            baseSpeed *= 0.8;
            break;
        case 'tanky_slow':
            baseHp *= 1.4;
            baseDefense *= 1.2;
            baseAttack *= 0.9;
            baseSpeed *= 0.6;
            break;
        case 'bruiser':
            baseHp *= 1.2;
            baseAttack *= 1.2;
            baseDefense *= 1.1;
            break;
        case 'rusher':
            baseSpeed *= 1.4;
            baseAttack *= 1.1;
            baseHp *= 0.8;
            baseDefense *= 0.8;
            break;
        case 'caster':
            baseAttack *= 1.4;
            baseHp *= 0.85;
            baseDefense *= 0.85;
            break;
        case 'evasive':
            baseEvasion = 0.15;
            baseSpeed *= 1.2;
            baseHp *= 0.8;
            break;
        case 'glass_cannon':
            baseAttack *= 1.6;
            baseHp *= 0.7;
            baseDefense *= 0.7;
            baseSpeed *= 1.1;
            break;
        case 'elite': // Old elite archetype
            baseHp *= 1.3;
            baseAttack *= 1.3;
            baseDefense *= 1.2;
            baseSpeed *= 1.1;
            break;
        case 'standard':
        default:
            break;
    }

    if (isBoss) {
        baseHp *= 2.5;
        baseAttack *= 1.8;
        baseDefense *= 1.8;
    }

    const variance = (val) => val * (0.8 + Math.random() * 0.4);
    const maxHp = Math.floor(variance(baseHp) * multiplier);

    return {
        level, maxHp, hp: maxHp, isBoss,
        physicalAttack: Math.floor(variance(baseAttack) * multiplier),
        magicalAttack: Math.floor(variance(baseAttack * 0.8) * multiplier),
        physicalDefense: Math.floor(variance(baseDefense) * multiplier),
        magicalDefense: Math.floor(variance(baseDefense * 0.8) * multiplier),
        speed: Math.floor(variance(baseSpeed)),
        luck: Math.floor(variance(1 + level * 0.2)),
        evasion: baseEvasion,
    };
}