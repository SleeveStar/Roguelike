import { dungeonState } from './dungeonState.js';
import { gameState } from './gameState.js';
import { MONSTER_TYPES } from './monsterConstants.js';

// 환경 변화 임계값 및 영향 계수
const ENVIRONMENT_CHANGE_FACTORS = {
    temperature: { fire: 0.5, ice: -0.5, default: 0.1 },
    humidity: { poison: 0.02, default: 0.01 },
    magicalEnergy: { lightning: 0.03, dark: 0.02, default: 0.01 },
    pollutionLevel: { poison: 0.05, default: 0.01 } // 새로운 환경 변수
};

/**
 * 플레이어의 행동에 따라 던전 상태(dungeonState)를 변경하는 규칙 엔진
 * @param {object} action - 플레이어의 행동을 설명하는 객체 (예: { type: 'KILL_MONSTER', monsterType: 'goblin' })
 */
export function applyActionEffect(action) {
    if (!action || !action.type) {
        return;
    }

    const state = dungeonState;

    switch (action.type) {
        case 'KILL_MONSTER':
            handleKillMonster(action, state);
            break;

        case 'USE_SKILL':
            handleUseSkill(action, state);
            break;

        case 'PLAYER_LEVEL_UP':
            handlePlayerLevelUp(action, state);
            break;

        case 'BOSS_KILLED':
            handleBossKilled(action, state);
            break;

        // 기타 행동 규칙 추가
    }

    // 모든 액션 처리 후 던전 이벤트 조건 확인
    checkDungeonEvents(state);
}

/**
 * 몬스터 사냥 액션을 처리합니다.
 */
function handleKillMonster(action, state) {
    const killedMonsterTypeString = action.monsterType;
    const currentBiomeKey = gameState.currentBiome;

    // 몬스터 타입 문자열을 dungeonState 키 형식으로 변환 (camelCase)
    const killedMonsterKey = killedMonsterTypeString.toLowerCase().replace(/_([a-z])/g, g => g[1].toUpperCase());

    const killedMonsterDefinition = MONSTER_TYPES.find(m => m.name === killedMonsterTypeString);

    if (!killedMonsterKey || state.monsterPopulation[killedMonsterKey] === undefined || !killedMonsterDefinition) {
        console.warn(`Action 'KILL_MONSTER' received for unknown or undefined monster: ${killedMonsterTypeString}`);
        return;
    }

    // 1. 피살 몬스터 개체수 감소
    if (state.monsterPopulation[killedMonsterKey] > 0) {
        state.monsterPopulation[killedMonsterKey]--;
        console.log(`Ecosystem update: ${killedMonsterKey} population decreased to ${state.monsterPopulation[killedMonsterKey]}`);
    }

    const ecology = killedMonsterDefinition.ecology;
    if (!ecology) {
        console.warn(`No ecology data for ${killedMonsterKey}. Skipping generalized ecological impacts.`);
        return;
    }

    const basePopulationChangeFactor = 0.01; // 기본 영향 계수
    const minPop = 0;
    const maxPop = 200; // 최대 인구수 제한 (임시)

    // 2. 생태계 상호작용 규칙 적용
    // 2.1. 피식자 (Prey) 증가: 죽은 몬스터의 피식자 개체수 증가 (포식자가 사라졌으므로)
    ecology.prey?.forEach(preyName => {
        const preyMonsterKey = preyName.toLowerCase().replace(/_([a-z])/g, g => g[1].toUpperCase());
        if (state.monsterPopulation[preyMonsterKey] !== undefined) {
            state.monsterPopulation[preyMonsterKey] = Math.min(maxPop, Math.floor(state.monsterPopulation[preyMonsterKey] * (1 + basePopulationChangeFactor * 1.0))); // 피식자 증가율 조정
            console.log(`Ecosystem update: ${killedMonsterKey} was predator for ${preyName}, so ${preyName} population increased to ${state.monsterPopulation[preyMonsterKey]}`);
        }
    });

    // 2.2. 포식자 (Predator) 감소: 죽은 몬스터를 잡아먹는 상위 포식자 개체수 감소 (먹이가 줄어들었으므로)
    ecology.predators?.forEach(predatorName => {
        const predatorMonsterKey = predatorName.toLowerCase().replace(/_([a-z])/g, g => g[1].toUpperCase());
        if (state.monsterPopulation[predatorMonsterKey] !== undefined) {
            state.monsterPopulation[predatorMonsterKey] = Math.max(minPop, Math.floor(state.monsterPopulation[predatorMonsterKey] * (1 - basePopulationChangeFactor * 0.7))); // 포식자 감소율 조정
            console.log(`Ecosystem update: ${killedMonsterKey} was prey for ${predatorName}, so ${predatorName} population decreased to ${state.monsterPopulation[predatorMonsterKey]}`);
        }
    });

    // 2.3. 경쟁자 (Competitor) 증가: 죽은 몬스터와 경쟁하는 몬스터 개체수 증가 (경쟁자가 사라졌으므로)
    ecology.competitors?.forEach(competitorName => {
        const competitorMonsterKey = competitorName.toLowerCase().replace(/_([a-z])/g, g => g[1].toUpperCase());
        if (state.monsterPopulation[competitorMonsterKey] !== undefined) {
            state.monsterPopulation[competitorMonsterKey] = Math.min(maxPop, Math.floor(state.monsterPopulation[competitorMonsterKey] * (1 + basePopulationChangeFactor * 0.5))); // 경쟁자 증가율 조정
            console.log(`Ecosystem update: ${killedMonsterKey} was competitor for ${competitorName}, so ${competitorName} population increased to ${state.monsterPopulation[competitorMonsterKey]}`);
        }
    });

    // 3. 환경 변수 조정 (바이옴별)
    if (currentBiomeKey && state.environmentState[currentBiomeKey] && ecology.elementalType) {
        adjustEnvironment(state.environmentState[currentBiomeKey], ecology.elementalType, 'kill');
    }
}

/**
 * 스킬 사용 액션을 처리합니다.
 */
function handleUseSkill(action, state) {
    const skill = action.skill; // action.skill에는 elementalType이 있어야 함 (SKILLS 정의 참조)
    const currentBiomeKey = gameState.currentBiome;

    if (!currentBiomeKey || !state.environmentState[currentBiomeKey]) {
        console.warn("handleUseSkill: Current biome or its environmental state not found.");
        return;
    }

    if (skill && skill.elementalType) {
        adjustEnvironment(state.environmentState[currentBiomeKey], skill.elementalType, 'use');
    }
}

/**
 * 플레이어 레벨업 액션을 처리합니다.
 */
function handlePlayerLevelUp(action, state) {
    // 플레이어 레벨에 비례하여 전체 몬스터 개체수를 소폭 증가시켜 난이도 상승
    const playerLevel = action.playerLevel;
    const levelUpImpactFactor = 0.005; // 레벨업당 몬스터 개체수 증가 비율

    for (const monsterKey in state.monsterPopulation) {
        // 특정 고티어 몬스터만 영향받도록 필터링 가능 (예: monsterKey.includes('dragon'))
        state.monsterPopulation[monsterKey] = Math.min(200, Math.floor(state.monsterPopulation[monsterKey] * (1 + levelUpImpactFactor)));
    }
    console.log(`Ecosystem update: Player leveled up to ${playerLevel}, overall monster population slightly increased.`);
}

/**
 * 보스 처치 액션을 처리합니다.
 */
function handleBossKilled(action, state) {
    const bossType = action.bossType; // 예: "GOBLIN_KING"

    // 보스 몬스터의 일반 개체수 영구 감소
    const bossMonsterKey = bossType.toLowerCase().replace(/_([a-z])/g, g => g[1].toUpperCase());
    if (state.monsterPopulation[bossMonsterKey] !== undefined) {
        state.monsterPopulation[bossMonsterKey] = Math.max(0, Math.floor(state.monsterPopulation[bossMonsterKey] * 0.5)); // 50% 감소
        console.log(`Ecosystem update: ${bossType} was killed, ${bossMonsterKey} population permanently reduced.`);
    }

    // eventFlags 트리거
    state.eventFlags[`${bossMonsterKey}_defeated`] = true;
    console.log(`Event Flag: ${bossMonsterKey}_defeated set to true.`);

    // 기타 연관 몬스터 개체수 변화 (예: 고블린 킹을 잡으면 일반 고블린은 잠시 혼란에 빠져 줄어들 수 있음)
    // 이 부분은 몬스터 생태계 데이터에 따라 더 세분화될 수 있습니다.
}

/**
 * 바이옴 환경 상태를 조정하는 헬퍼 함수
 */
function adjustEnvironment(biomeState, elementalType, type) {
    let tempChange = 0;
    let humidityChange = 0;
    let magicalEnergyChange = 0;
    let pollutionChange = 0;

    const factor = (type === 'kill') ? -1 : 1; // 몬스터 사망 시 영향 반대, 스킬 사용 시 직접 영향

    // 온도 변화
    if (elementalType === 'fire') tempChange += ENVIRONMENT_CHANGE_FACTORS.temperature.fire * factor;
    else if (elementalType === 'ice') tempChange += ENVIRONMENT_CHANGE_FACTORS.temperature.ice * factor;
    else tempChange += ENVIRONMENT_CHANGE_FACTORS.temperature.default * factor;

    // 습도 변화
    if (elementalType === 'poison') humidityChange += ENVIRONMENT_CHANGE_FACTORS.humidity.poison * factor;
    else humidityChange += ENVIRONMENT_CHANGE_FACTORS.humidity.default * factor;

    // 마법 에너지 변화
    if (elementalType === 'lightning') magicalEnergyChange += ENVIRONMENT_CHANGE_FACTORS.magicalEnergy.lightning * factor;
    else if (elementalType === 'dark') magicalEnergyChange += ENVIRONMENT_CHANGE_FACTORS.magicalEnergy.dark * factor;
    else magicalEnergyChange += ENVIRONMENT_CHANGE_FACTORS.magicalEnergy.default * factor;

    // 오염도 변화 (새로운 환경 변수)
    if (elementalType === 'poison') pollutionChange += ENVIRONMENT_CHANGE_FACTORS.pollutionLevel.poison * factor;
    else pollutionChange += ENVIRONMENT_CHANGE_FACTORS.pollutionLevel.default * factor;


    biomeState.temperature = Math.max(-20, Math.min(50, biomeState.temperature + tempChange));
    biomeState.humidity = Math.max(0.0, Math.min(1.0, biomeState.humidity + humidityChange));
    biomeState.magicalEnergy = Math.max(0.0, Math.min(1.0, biomeState.magicalEnergy + magicalEnergyChange));
    biomeState.pollutionLevel = Math.max(0.0, Math.min(1.0, (biomeState.pollutionLevel || 0) + pollutionChange)); // 초기값 0 고려


    console.log(`Ecosystem update in ${gameState.currentBiome} (Action: ${type}, Element: ${elementalType}): ` +
                `Temp: ${biomeState.temperature.toFixed(2)}, Hum: ${biomeState.humidity.toFixed(2)}, Mag: ${biomeState.magicalEnergy.toFixed(2)}, Pol: ${biomeState.pollutionLevel.toFixed(2)}`);
}

/**
 * 던전의 이벤트 플래그 조건을 확인하고 설정합니다.
 */
function checkDungeonEvents(state) {
    // 몬스터 개체수 기반 이벤트 트리거
    const goblinPop = state.monsterPopulation.goblin;
    if (goblinPop !== undefined && goblinPop < 20 && !state.eventFlags.goblinKingEnraged) {
        state.eventFlags.goblinKingEnraged = true;
        console.log("Event Triggered: Goblin King Enraged due to low goblin population!");
    } else if (goblinPop >= 50 && state.eventFlags.goblinKingEnraged) {
        state.eventFlags.goblinKingEnraged = false; // 충분히 회복되면 플래그 해제
        console.log("Event Cleared: Goblin King is no longer enraged.");
    }

    const blueSlimePop = state.monsterPopulation.blueSlime;
    const greenSlimePop = state.monsterPopulation.greenSlime;
    if ((blueSlimePop !== undefined && blueSlimePop < 20) || (greenSlimePop !== undefined && greenSlimePop < 20)) {
        if (!state.eventFlags.kingSlimeEnraged) {
            state.eventFlags.kingSlimeEnraged = true;
            console.log("Event Triggered: King Slime Enraged due to low slime population!");
        }
    } else if ((blueSlimePop >= 50 && greenSlimePop >= 50) && state.eventFlags.kingSlimeEnraged) {
        state.eventFlags.kingSlimeEnraged = false;
        console.log("Event Cleared: King Slime is no longer enraged.");
    }

    const skelWarriorPop = state.monsterPopulation.skelWarrior;
    const boneSlimePop = state.monsterPopulation.boneSlime;
    if ((skelWarriorPop !== undefined && skelWarriorPop < 20) || (boneSlimePop !== undefined && boneSlimePop < 20)) {
        if (!state.eventFlags.skeletonKingEnraged) {
            state.eventFlags.skeletonKingEnraged = true;
            console.log("Event Triggered: Skeleton King Enraged due to low skeleton/bone slime population!");
        }
    } else if ((skelWarriorPop >= 50 && boneSlimePop >= 50) && state.eventFlags.skeletonKingEnraged) {
        state.eventFlags.skeletonKingEnraged = false;
        console.log("Event Cleared: Skeleton King is no longer enraged.");
    }

    const zombiePop = state.monsterPopulation.zombie;
    if (zombiePop !== undefined && zombiePop < 20 && !state.eventFlags.zombieLordAwakens) {
        state.eventFlags.zombieLordAwakens = true;
        console.log("Event Triggered: Zombie Lord Awakens due to low zombie population!");
    } else if (zombiePop >= 50 && state.eventFlags.zombieLordAwakens) {
        state.eventFlags.zombieLordAwakens = false;
        console.log("Event Cleared: Zombie Lord is no longer awakened.");
    }

    // 환경 기반 이벤트 트리거
    const volcanoEnv = state.environmentState.VOLCANO;
    if (volcanoEnv && volcanoEnv.magicalEnergy > 0.95 && !state.eventFlags.lavaLordAwakens) {
        state.eventFlags.lavaLordAwakens = true;
        console.log("Event Triggered: Lava Lord Awakens due to high magical energy in Volcano!");
    } else if (volcanoEnv && volcanoEnv.magicalEnergy <= 0.8 && state.eventFlags.lavaLordAwakens) {
        state.eventFlags.lavaLordAwakens = false;
        console.log("Event Cleared: Lava Lord is no longer awakened.");
    }
    
    // Archlich Awakens - High magical energy in ICE/CAVE biomes
    const iceEnv = state.environmentState.ICE;
    const caveEnv = state.environmentState.CAVE;
    if ((iceEnv && iceEnv.magicalEnergy > 0.95) || (caveEnv && caveEnv.magicalEnergy > 0.95)) {
        if (!state.eventFlags.archlichAwakens) {
            state.eventFlags.archlichAwakens = true;
            console.log("Event Triggered: Archlich Awakens due to high magical energy in Ice/Cave!");
        }
    } else if ((iceEnv && iceEnv.magicalEnergy <= 0.8) && (caveEnv && caveEnv.magicalEnergy <= 0.8) && state.eventFlags.archlichAwakens) {
        state.eventFlags.archlichAwakens = false;
        console.log("Event Cleared: Archlich is no longer awakened.");
    }

    // Dragon Overlord Awakens - High temperature in Volcano biome
    if (volcanoEnv && volcanoEnv.temperature > 45 && !state.eventFlags.dragonOverlordAwakens) {
        state.eventFlags.dragonOverlordAwakens = true;
        console.log("Event Triggered: Dragon Overlord Awakens due to extreme heat in Volcano!");
    } else if (volcanoEnv && volcanoEnv.temperature <= 40 && state.eventFlags.dragonOverlordAwakens) {
        state.eventFlags.dragonOverlordAwakens = false;
        console.log("Event Cleared: Dragon Overlord is no longer awakened.");
    }
}
