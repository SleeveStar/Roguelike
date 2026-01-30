// src/main/resources/static/js/dungeonState.js

import { MONSTER_TYPES } from './monsterConstants.js';

// 초기 던전 상태 정의
const initialDungeonState = {
    monsterPopulation: MONSTER_TYPES.reduce((acc, monster) => {
        acc[monster.name.toLowerCase().replace(/_([a-z])/g, g => g[1].toUpperCase())] = 100; // 기본 인구수 100
        return acc;
    }, {}),
    environmentState: {
        FOREST: { temperature: 15.0, humidity: 0.7, magicalEnergy: 0.3, type: 'normal' },
        ICE: { temperature: -10.0, humidity: 0.2, magicalEnergy: 0.5, type: 'normal' },
        CAVE: { temperature: 10.0, humidity: 0.8, magicalEnergy: 0.6, type: 'normal' },
        VOLCANO: { temperature: 40.0, humidity: 0.1, magicalEnergy: 0.9, type: 'normal' },
    },
    eventFlags: {
        spider_queen_killed: false, // 예시
        goblin_king_defeated: false, // 예시
        goblinKingEnraged: false,
        lavaLordAwakens: false,
        kingSlimeEnraged: false,
        skeletonKingEnraged: false,
        zombieLordAwakens: false,
        archlichAwakens: false,
        dragonOverlordAwakens: false
    }
};

// 실제 게임에서 사용될 상태 객체. 초기 상태의 깊은 복사로 시작합니다.
export let dungeonState = JSON.parse(JSON.stringify(initialDungeonState));

const DUNGEON_STATE_KEY = 'webroguelike_dungeonState';

/**
 * 현재 던전 상태를 localStorage에 저장합니다.
 */
export function saveDungeonState() {
    try {
        const stateString = JSON.stringify(dungeonState);
        localStorage.setItem(DUNGEON_STATE_KEY, stateString);
        console.log("Dungeon state saved.");
    } catch (error) {
        console.error("Failed to save dungeon state:", error);
    }
}

/**
 * localStorage에서 던전 상태를 불러옵니다.
 * 저장된 상태가 없으면 초기 상태를 사용합니다.
 */
export function loadDungeonState() {
    try {
        const savedStateString = localStorage.getItem(DUNGEON_STATE_KEY);
        if (savedStateString) {
            const savedState = JSON.parse(savedStateString);
            // 저장된 상태로 현재 상태를 덮어씁니다.
            // 향후 상태 구조 변경 시 호환성을 위해 더 정교한 병합 로직이 필요할 수 있습니다.
            dungeonState = savedState;
            console.log("Dungeon state loaded.");
        } else {
            // 저장된 상태가 없으면 초기 상태로 시작
            dungeonState = JSON.parse(JSON.stringify(initialDungeonState));
            console.log("No saved dungeon state found, starting with initial state.");
        }
    } catch (error) {
        console.error("Failed to load dungeon state, using initial state:", error);
        dungeonState = JSON.parse(JSON.stringify(initialDungeonState));
    }
}

/**
 * 디버깅 또는 특정 이벤트 발생 시 던전 상태를 초기화합니다.
 */
export function resetDungeonState() {
    dungeonState = JSON.parse(JSON.stringify(initialDungeonState));
    saveDungeonState();
    console.log("Dungeon state has been reset.");
}

/**
 * 던전의 몬스터 개체수 및 환경 상태를 자연적으로 회복/변동시킵니다.
 * 이 함수는 주기적으로 호출되어야 합니다 (예: 맵 전환 시).
 */
export function recoverDungeonState() {
    const MONSTER_MAX_POPULATION = 100; // 초기 인구수이자 최대치
    const MONSTER_RECOVERY_RATE = 1;   // 몬스터 개체수 회복량

    // 몬스터 개체수 회복
    for (const monsterKey in dungeonState.monsterPopulation) {
        if (dungeonState.monsterPopulation[monsterKey] < MONSTER_MAX_POPULATION) {
            dungeonState.monsterPopulation[monsterKey] = Math.min(MONSTER_MAX_POPULATION, dungeonState.monsterPopulation[monsterKey] + MONSTER_RECOVERY_RATE);
        }
    }

    // 환경 상태 자연 변동
    const ENVIRONMENT_FLUCTUATION = {
        temperature: 0.5, // +/- 0.5
        humidity: 0.01,   // +/- 0.01
        magicalEnergy: 0.01, // +/- 0.01
        pollutionLevel: 0.01 // +/- 0.01
    };

    for (const biomeKey in dungeonState.environmentState) {
        const biomeEnv = dungeonState.environmentState[biomeKey];

        // Temperature
        biomeEnv.temperature += (Math.random() - 0.5) * 2 * ENVIRONMENT_FLUCTUATION.temperature;
        biomeEnv.temperature = Math.max(-20, Math.min(50, biomeEnv.temperature)); // Clamp to min/max

        // Humidity
        biomeEnv.humidity += (Math.random() - 0.5) * 2 * ENVIRONMENT_FLUCTUATION.humidity;
        biomeEnv.humidity = Math.max(0.0, Math.min(1.0, biomeEnv.humidity)); // Clamp to min/max

        // Magical Energy
        biomeEnv.magicalEnergy += (Math.random() - 0.5) * 2 * ENVIRONMENT_FLUCTUATION.magicalEnergy;
        biomeEnv.magicalEnergy = Math.max(0.0, Math.min(1.0, biomeEnv.magicalEnergy)); // Clamp to min/max

        // Pollution Level (if it exists)
        if (biomeEnv.pollutionLevel !== undefined) {
            biomeEnv.pollutionLevel += (Math.random() - 0.5) * 2 * ENVIRONMENT_FLUCTUATION.pollutionLevel;
            biomeEnv.pollutionLevel = Math.max(0.0, Math.min(1.0, biomeEnv.pollutionLevel)); // Clamp to min/max
        }
    }
    console.log("Dungeon state recovered/fluctuated naturally.");
}