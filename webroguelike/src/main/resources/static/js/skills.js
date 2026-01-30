import { applyStatusEffect } from './combatLogic.js';
import { logCombatMessage } from './ui.js';

export const SKILLS = {
    "powerStrike": {
        id: "powerStrike",
        name: "강타",
        type: "active", // 'active' 또는 'passive'
        tree: "melee", // 'melee', 'magic', 'ranged'
        maxLevel: 5, // 최대 스킬 레벨 추가
        costPerLevel: 1, // 레벨당 스킬 포인트 소모량
        cost: 10, // 이 스킬 사용에 필요한 MP (마나) 소모량
        cooldown: 3, // 스킬 사용 후 재사용 대기 턴 수
        dependencies: [], // 선행 스킬 id 배열 (예: ["skillId1", "skillId2"])
        position: { x: 1, y: 1 }, // 스킬 트리 UI에서의 상대적 좌표
        icon: "img/skills/power_strike.png", // 스킬 아이콘 경로
        description: [ // 레벨별 설명으로 변경 (배열)
            "적에게 강력한 물리 피해를 입힙니다. (현재: 150% 물리 공격력)",
            "적에게 강력한 물리 피해를 입힙니다. (현재: 160% 물리 공격력)",
            "적에게 강력한 물리 피해를 입힙니다. (현재: 170% 물리 공격력)",
            "적에게 강력한 물리 피해를 입힙니다. (현재: 180% 물리 공격력)",
            "적에게 강력한 물리 피해를 입힙니다. (현재: 200% 물리 공격력)"
        ],
        coefficient: [1.5, 1.6, 1.7, 1.8, 2.0], // 레벨별 계수
        effect: (caster, target, skillLevel) => {
            return {
                damageCoefficient: SKILLS.powerStrike.coefficient[skillLevel - 1],
                message: `${target.name}에게 강력한 강타를 시전한다!`,
                damageType: 'physical'
            };
        }
    },

    "cleave": {
        id: "cleave",
        name: "휩쓸기",
        type: "active",
        tree: "melee",
        maxLevel: 3,
        costPerLevel: 1,
        cost: 15,
        cooldown: 4,
        dependencies: ["powerStrike"], // 강타 스킬을 선행으로 요구
        position: { x: 2, y: 0 },
        icon: "img/skills/cleave.png",
        description: [
            "주변의 모든 적에게 물리 피해를 입힙니다. (현재: 80% 물리 공격력)",
            "주변의 모든 적에게 물리 피해를 입힙니다. (현재: 90% 물리 공격력)",
            "주변의 모든 적에게 물리 피해를 입힙니다. (현재: 100% 물리 공격력)"
        ],
        coefficient: [0.8, 0.9, 1.0],
        effect: (caster, target, skillLevel) => {
            return {
                damageCoefficient: SKILLS.cleave.coefficient[skillLevel - 1],
                message: "주변의 적들에게 휩쓸기를 시전한다!", // 메시지는 동일하게 유지
                damageType: 'physical'
            };
        }
    },

    "criticalStrike": {
        id: "criticalStrike",
        name: "치명타",
        type: "passive",
        tree: "melee",
        maxLevel: 3,
        costPerLevel: 1,
        dependencies: ["powerStrike"], // 강타 스킬을 선행으로 요구
        position: { x: 2, y: 2 },
        icon: "img/skills/critical_strike.png",
        description: [
            "치명타 확률이 5% 증가합니다.",
            "치명타 확률이 10% 증가합니다.",
            "치명타 확률이 15% 증가합니다."
        ],
        effect: (derivedStats, skillLevel) => {
            const bonus = [0.05, 0.10, 0.15];
            derivedStats.critChance += bonus[skillLevel - 1];
        }
    },

    "meleeMastery": {
        id: "meleeMastery",
        name: "근접 숙련",
        type: "passive",
        tree: "melee",
        maxLevel: 5,
        costPerLevel: 1,
        dependencies: ["cleave", "criticalStrike"], // 휩쓸기, 치명타 스킬을 선행으로 요구
        position: { x: 3, y: 1 },
        icon: "img/skills/melee_mastery.png",
        description: [
            "모든 물리 공격력이 5% 증가합니다.",
            "모든 물리 공격력이 10% 증가합니다.",
            "모든 물리 공격력이 15% 증가합니다.",
            "모든 물리 공격력이 20% 증가합니다.",
            "모든 물리 공격력이 25% 증가합니다."
        ],
        effect: (derivedStats, skillLevel) => {
            const bonus = [1.05, 1.10, 1.15, 1.20, 1.25];
            derivedStats.physicalAttack = Math.floor(
                derivedStats.physicalAttack * bonus[skillLevel - 1]
            );
        }
    },

    "fireball": {
        id: "fireball",
        name: "화염구",
        type: "active",
        tree: "magic",
        maxLevel: 5,
        costPerLevel: 1,
        cost: 15,
        cooldown: 4,
        dependencies: [],
        position: { x: 1, y: 1 },
        icon: "img/skills/fireball.png",
        description: [
            "적에게 강력한 화염 마법 피해를 입힙니다. (현재: 180% 마법 공격력)",
            "적에게 강력한 화염 마법 피해를 입힙니다. (현재: 190% 마법 공격력)",
            "적에게 강력한 화염 마법 피해를 입힙니다. (현재: 200% 마법 공격력)",
            "적에게 강력한 화염 마법 피해를 입힙니다. (현재: 210% 마법 공격력)",
            "적에게 강력한 화염 마법 피해를 입힙니다. (현재: 230% 마법 공격력)"
        ],
        coefficient: [1.8, 1.9, 2.0, 2.1, 2.3],
        effect: (caster, target, skillLevel) => {
            return {
                damageCoefficient: SKILLS.fireball.coefficient[skillLevel - 1],
                message: `${target.name}에게 화염구를 시전한다!`,
                damageType: 'magical'
            };
        }
    },

    "healing": {
        id: "healing",
        name: "치유",
        type: "active",
        tree: "magic",
        maxLevel: 3,
        costPerLevel: 1,
        cost: 20,
        cooldown: 5,
        dependencies: ["fireball"], // 화염구 스킬을 선행으로 요구
        position: { x: 2, y: 1 },
        icon: "img/skills/healing.png",
        description: [
            "자신의 체력을 회복합니다. (현재: 50% 마법 공격력)",
            "자신의 체력을 회복합니다. (현재: 60% 마법 공격력)",
            "자신의 체력을 회복합니다. (현재: 70% 마법 공격력)"
        ],
        coefficient: [0.5, 0.6, 0.7],
        effect: (caster, target, skillLevel) => { // target은 caster 자신
            const healAmount = caster.derived.magicalAttack * SKILLS.healing.coefficient[skillLevel - 1];
            caster.base.hp = Math.min(caster.derived.maxHp, caster.base.hp + healAmount);
            return `${caster.name}이(가) ${healAmount.toFixed(0)}의 체력을 회복했다!`;
        }

    },

    "precisionShot": {
        id: "precisionShot",
        name: "정밀 사격",
        type: "active",
        tree: "ranged",
        maxLevel: 5,
        costPerLevel: 1,
        cost: [10, 12, 14, 16, 18],
        cooldown: 3,
        dependencies: [],
        position: { x: 1, y: 1 },
        icon: "img/skills/precision_shot.png", // 플레이스홀더 아이콘
        description: [
            "단일 적에게 정밀한 사격을 가해 180% 원거리 물리 피해를 입힙니다. 치명타 확률이 5% 증가합니다.",
            "단일 적에게 정밀한 사격을 가해 200% 원거리 물리 피해를 입힙니다. 치명타 확률이 7% 증가합니다.",
            "단일 적에게 정밀한 사격을 가해 220% 원거리 물리 피해를 입힙니다. 치명타 확률이 9% 증가합니다.",
            "단일 적에게 정밀한 사격을 가해 240% 원거리 물리 피해를 입힙니다. 치명타 확률이 11% 증가합니다.",
            "단일 적에게 정밀한 사격을 가해 270% 원거리 물리 피해를 입힙니다. 치명타 확률이 15% 증가합니다."
        ],
        coefficient: [1.8, 2.0, 2.2, 2.4, 2.7],
        critChanceBonus: [0.05, 0.07, 0.09, 0.11, 0.15],
        effect: (caster, target, skillLevel) => {
            // 이펙트 구현은 gameLogic.js에서 처리됩니다.
            // 여기서는 단순히 공격력 계수와 치명타 보너스만 전달합니다.
            return {
                damageCoefficient: SKILLS.precisionShot.coefficient[skillLevel - 1],
                critChanceBonus: SKILLS.precisionShot.critChanceBonus[skillLevel - 1],
                message: `${target.name}에게 정밀한 사격을 준비한다!`,
                damageType: 'ranged'
            };
        }
    },

    "huntersEye": {
        id: "huntersEye",
        name: "사냥꾼의 눈",
        type: "passive",
        tree: "ranged",
        maxLevel: 3,
        costPerLevel: 1,
        dependencies: ["precisionShot"],
        position: { x: 2, y: 1 },
        icon: "img/skills/hunters_eye.png", // 플레이스홀더 아이콘
        description: [
            "원거리 공격력이 5% 증가하고, 치명타 피해량이 10% 증가합니다.",
            "원거리 공격력이 10% 증가하고, 치명타 피해량이 15% 증가합니다.",
            "원거리 공격력이 15% 증가하고, 치명타 피해량이 20% 증가합니다."
        ],
        rangedAttackBonus: [0.05, 0.10, 0.15],
        critDamageBonus: [0.10, 0.15, 0.20],
        effect: (derivedStats, skillLevel) => {
            const rangedAttackMult = 1 + SKILLS.huntersEye.rangedAttackBonus[skillLevel - 1];
            derivedStats.rangedAttack = Math.floor(derivedStats.rangedAttack * rangedAttackMult);
            derivedStats.critDamage += SKILLS.huntersEye.critDamageBonus[skillLevel - 1];
        }
    },

    "shieldBash": {
        id: "shieldBash",
        name: "방패 강타",
        type: "active",
        tree: "melee",
        maxLevel: 4,
        costPerLevel: 1,
        cost: [12, 14, 16, 18],
        cooldown: 5,
        dependencies: ["powerStrike"],
        position: { x: 2, y: 1 },
        icon: "img/skills/shield_bash.png", // 플레이스홀더 아이콘
        description: [
            "방패로 적을 강타하여 120% 물리 피해를 입히고 1턴간 기절시킵니다. 방패 장착 필수.",
            "방패로 적을 강타하여 130% 물리 피해를 입히고 1턴간 기절시킵니다. 방패 장착 필수.",
            "방패로 적을 강타하여 140% 물리 피해를 입히고 2턴간 기절시킵니다. 방패 장착 필수.",
            "방패로 적을 강타하여 150% 물리 피해를 입히고 2턴간 기절시킵니다. 방패 장착 필수."
        ],
        coefficient: [1.2, 1.3, 1.4, 1.5],
        stunDuration: [1, 1, 2, 2],
        effect: (caster, target, skillLevel) => {
            // 이펙트 구현은 gameLogic.js에서 처리됩니다.
            // 여기서는 단순히 공격력 계수와 스턴 지속 시간만 전달합니다.
            return {
                damageCoefficient: SKILLS.shieldBash.coefficient[skillLevel - 1],
                stunDuration: SKILLS.shieldBash.stunDuration[skillLevel - 1],
                message: `${target.name}에게 방패 강타를 시전한다!`,
                damageType: 'physical'
            };
        }
    },

    "manaCondensation": {
        id: "manaCondensation",
        name: "마력 응축",
        type: "passive",
        tree: "magic",
        maxLevel: 3,
        costPerLevel: 1,
        dependencies: ["fireball"],
        position: { x: 2, y: 2 },
        icon: "img/skills/mana_condensation.png", // 플레이스홀더 아이콘
        description: [
            "마나 재생량이 10% 증가하고, 모든 마법 스킬의 마나 소모량이 5% 감소합니다.",
            "마나 재생량이 15% 증가하고, 모든 마법 스킬의 마나 소모량이 8% 감소합니다.",
            "마나 재생량이 20% 증가하고, 모든 마법 스킬의 마나 소모량이 10% 감소합니다."
        ],
        manaRegenBonus: [0.10, 0.15, 0.20],
        manaCostReduction: [0.05, 0.08, 0.10],
        effect: (derivedStats, skillLevel) => {
            derivedStats.manaRegen = (derivedStats.manaRegen || 0) + derivedStats.maxMp * SKILLS.manaCondensation.manaRegenBonus[skillLevel - 1]; // 마나 재생량 증가
            derivedStats.manaCostReduction = (derivedStats.manaCostReduction || 0) + SKILLS.manaCondensation.manaCostReduction[skillLevel - 1]; // 마나 소모량 감소
        }
    }
};

export const MONSTER_SKILLS = {
    "poisonSpit": {
        id: "poisonSpit",
        name: "독 뱉기",
        cooldown: 4, // 몬스터 스킬의 재사용 대기 턴 수
        description: "플레이어를 중독시켜 지속 피해를 입힙니다.",
        coefficient: 0.5, // 몬스터 마법 공격력에 곱해질 계수
        effect: (caster, target) => {
            const damage = caster.magicalAttack * MONSTER_SKILLS.poisonSpit.coefficient;
            target.hp -= damage; // Direct damage
            applyStatusEffect(target, { type: 'poison', duration: 3, magnitude: caster.magicalAttack * 0.1 }); // Poison over time
            logCombatMessage(`<span style="color: mediumpurple;">${caster.name}이(가) ${target.name || '플레이어'}에게 독침을 뱉어 ${damage.toFixed(0)}의 피해를 입혔다!</span>`);
            logCombatMessage(`<span style="color: mediumpurple;">${target.name || '플레이어'}이(가) 독에 중독되었다!</span>`);
        }
    },
    "frenzy": {
        id: "frenzy",
        name: "광란",
        cooldown: 5,
        description: "일정 시간 동안 자신의 공격력을 증가시킵니다.",
        coefficient: 1.5, // 광란 시 공격력 계수
        effect: (caster, target) => { // 몬스터 자신(caster)에게 버프 적용
            applyStatusEffect(caster, { type: 'attack_buff', duration: 3, magnitude: MONSTER_SKILLS.frenzy.coefficient });
            logCombatMessage(`<span style="color: lightcoral;">${caster.name}이(가) 광란 상태에 빠져 공격력이 증가했다!</span>`);
        }
    },
    "slam": { // For bruisers, tanks
        id: "slam",
        name: "내려찍기",
        cooldown: 3,
        description: "강력하게 내려찍어 물리 피해를 입히고 잠시 기절시킵니다.",
        coefficient: 1.2,
        effect: (caster, target) => {
            const damage = caster.physicalAttack * MONSTER_SKILLS.slam.coefficient;
            target.hp -= damage;
            applyStatusEffect(target, { type: 'stun', duration: 1 });
            logCombatMessage(`<span style="color: crimson;">${caster.name}이(가) ${target.name || '플레이어'}에게 내려찍기! ${damage.toFixed(0)}의 피해를 입혔다!</span>`);
            logCombatMessage(`<span style="color: crimson;">${target.name || '플레이어'}이(가) 기절했다!</span>`);
        }
    },
    "charge": { // For rushers, bruisers
        id: "charge",
        name: "돌진",
        cooldown: 4,
        description: "플레이어에게 돌진하여 물리 피해를 입히고 밀쳐냅니다.",
        coefficient: 1.5,
        effect: (caster, target) => {
            const damage = caster.physicalAttack * MONSTER_SKILLS.charge.coefficient;
            target.hp -= damage;
            logCombatMessage(`<span style="color: crimson;">${caster.name}이(가) ${target.name || '플레이어'}에게 돌진하여 ${damage.toFixed(0)}의 피해를 입혔다!</span>`);
            // For now, only text. Actual push back on map can be a future enhancement.
            logCombatMessage(`<span style="color: lightgray;">${target.name || '플레이어'}이(가) 밀쳐졌다!</span>`);
        }
    },
    "fireBreath": { // For fire-themed casters (e.g., dragons, fire worms)
        id: "fireBreath",
        name: "화염 숨결",
        cooldown: 5,
        description: "전방에 화염 숨결을 뿜어 마법 피해를 입히고 불태웁니다.",
        coefficient: 1.8,
        elementalType: 'fire',
        effect: (caster, target) => {
            const damage = caster.magicalAttack * MONSTER_SKILLS.fireBreath.coefficient;
            target.hp -= damage;
            applyStatusEffect(target, { type: 'burn', duration: 2, magnitude: caster.magicalAttack * 0.05 });
            logCombatMessage(`<span style="color: orangered;">${caster.name}이(가) ${target.name || '플레이어'}에게 화염 숨결을 뿜어 ${damage.toFixed(0)}의 피해를 입혔다!</span>`);
            logCombatMessage(`<span style="color: orangered;">${target.name || '플레이어'}이(가) 불에 탔다!</span>`);
        }
    },
    "iceShard": { // For ice-themed casters
        id: "iceShard",
        name: "얼음 파편",
        cooldown: 3,
        description: "날카로운 얼음 파편을 발사하여 마법 피해를 입히고 이동 속도를 감소시킵니다.",
        coefficient: 1.2,
        elementalType: 'ice',
        effect: (caster, target) => {
            const damage = caster.magicalAttack * MONSTER_SKILLS.iceShard.coefficient;
            target.hp -= damage;
            applyStatusEffect(target, { type: 'slow', duration: 2, magnitude: 0.2 }); // 20% slow
            logCombatMessage(`<span style="color: deepskyblue;">${caster.name}이(가) ${target.name || '플레이어'}에게 얼음 파편을 발사하여 ${damage.toFixed(0)}의 피해를 입혔다!</span>`);
            logCombatMessage(`<span style="color: deepskyblue;">${target.name || '플레이어'}이(가) 느려졌다!</span>`);
        }
    },
    "shadowBind": { // For dark/caster types
        id: "shadowBind",
        name: "그림자 속박",
        cooldown: 4,
        description: "그림자로 플레이어를 속박하여 행동을 제한하고 지속적인 어둠 피해를 입힙니다.",
        coefficient: 0.8, // DoT magnitude
        elementalType: 'dark',
        effect: (caster, target) => {
            applyStatusEffect(target, { type: 'root', duration: 2 }); // Root for 2 turns
            applyStatusEffect(target, { type: 'dark_dot', duration: 3, magnitude: caster.magicalAttack * MONSTER_SKILLS.shadowBind.coefficient }); // Dark DoT
            logCombatMessage(`<span style="color: darkgray;">${caster.name}이(가) ${target.name || '플레이어'}를 그림자로 속박했다!</span>`);
            logCombatMessage(`<span style="color: darkgray;">${target.name || '플레이어'}이(가) 어둠의 고통에 시달린다!</span>`);
        }
    },
    "healingAuraMonster": { // For supportive casters, shamans
        id: "healingAuraMonster",
        name: "치유 오라",
        cooldown: 6,
        description: "주변의 모든 아군 몬스터의 체력을 회복시킵니다.",
        effect: (caster, target) => { // Currently self-heal, needs broader context for AoE monster heal
            const healAmount = caster.magicalAttack * 0.7; // Example coefficient
            caster.hp = Math.min(caster.maxHp, caster.hp + healAmount);
            logCombatMessage(`<span style="color: limegreen;">${caster.name}이(가) 치유 오라를 사용하여 ${healAmount.toFixed(0)}의 체력을 회복했다!</span>`);
            // Placeholder: Needs logic to find nearby monsters, apply healing
        }
    },
    "evadeBoost": { // For evasive types
        id: "evadeBoost",
        name: "회피 강화",
        cooldown: 4,
        description: "일정 시간 동안 자신의 회피율을 크게 증가시킵니다.",
        coefficient: 0.2, // evasion percentage
        effect: (caster, target) => { // Self-buff
            applyStatusEffect(caster, { type: 'evasion_buff', duration: 3, magnitude: MONSTER_SKILLS.evadeBoost.coefficient });
            logCombatMessage(`<span style="color: dodgerblue;">${caster.name}이(가) 회피를 강화하여 민첩해졌다!</span>`);
        }
    },
    "berserk": { // For bruisers, elite types
        id: "berserk",
        name: "광폭화",
        cooldown: 5,
        description: "일정 시간 동안 공격력이 크게 증가하지만 방어력이 감소합니다.",
        coefficient: 0.3, // attack boost, defense debuff
        effect: (caster, target) => { // Self-buff
            applyStatusEffect(caster, { type: 'attack_buff', duration: 3, magnitude: MONSTER_SKILLS.berserk.coefficient });
            applyStatusEffect(caster, { type: 'defense_debuff', duration: 3, magnitude: MONSTER_SKILLS.berserk.coefficient * 0.5 }); // defense debuff is half of attack buff
            logCombatMessage(`<span style="color: lightcoral;">${caster.name}이(가) 광폭화하여 공격력이 증가하고 방어력이 감소했다!</span>`);
        }
    },
    "roar": { // For bruisers, tanks, elite
        id: "roar",
        name: "포효",
        cooldown: 4,
        description: "위협적인 포효로 플레이어를 공포에 떨게 합니다.",
        effect: (caster, target) => {
            applyStatusEffect(target, { type: 'fear', duration: 2 });
            logCombatMessage(`<span style="color: darkorange;">${caster.name}이(가) 포효하여 ${target.name || '플레이어'}를 공포에 떨게 했다!</span>`);
        }
    },
    "webShot": { // For spider-like monsters
        id: "webShot",
        name: "거미줄 발사",
        cooldown: 3,
        description: "끈적한 거미줄을 발사하여 플레이어를 속박합니다.",
        effect: (caster, target) => {
            applyStatusEffect(target, { type: 'root', duration: 2 });
            logCombatMessage(`<span style="color: lightgray;">${caster.name}이(가) ${target.name || '플레이어'}에게 거미줄을 발사하여 속박했다!</span>`);
        }
    },
    "venomousBite": { // For poison-themed physical attackers
        id: "venomousBite",
        name: "맹독 이빨",
        cooldown: 3,
        description: "맹독이 묻은 이빨로 물어뜯어 물리 피해와 함께 강력한 독을 겁니다.",
        coefficient: 1.0,
        effect: (caster, target) => {
            const damage = caster.physicalAttack * MONSTER_SKILLS.venomousBite.coefficient;
            target.hp -= damage;
            applyStatusEffect(target, { type: 'poison', duration: 3, magnitude: caster.physicalAttack * 0.1 });
            logCombatMessage(`<span style="color: seagreen;">${caster.name}이(가) ${target.name || '플레이어'}를 맹독 이빨로 물어뜯어 ${damage.toFixed(0)}의 피해를 입혔다!</span>`);
            logCombatMessage(`<span style="color: seagreen;">${target.name || '플레이어'}이(가) 강력한 독에 중독되었다!</span>`);
        }
    },
    "stoneSkin": { // For tanks, golems
        id: "stoneSkin",
        name: "돌 피부",
        cooldown: 5,
        description: "자신의 피부를 단단하게 만들어 방어력을 크게 증가시킵니다.",
        coefficient: 0.3, // defense percentage
        effect: (caster, target) => { // Self-buff
            applyStatusEffect(caster, { type: 'defense_buff', duration: 4, magnitude: MONSTER_SKILLS.stoneSkin.coefficient });
            logCombatMessage(`<span style="color: lightgray;">${caster.name}이(가) 돌 피부를 활성화하여 방어력이 단단해졌다!</span>`);
        }
    },
    "groundStomp": { // For bruisers, tanks, large monsters
        id: "groundStomp",
        name: "지면 강타",
        cooldown: 4,
        description: "지면을 강타하여 주변 플레이어에게 물리 피해를 입힙니다.",
        coefficient: 1.0,
        effect: (caster, target) => { // AoE around monster
            const damage = caster.physicalAttack * MONSTER_SKILLS.groundStomp.coefficient;
            target.hp -= damage;
            logCombatMessage(`<span style="color: peru;">${caster.name}이(가) 지면을 강타하여 ${target.name || '플레이어'}에게 ${damage.toFixed(0)}의 피해를 입혔다!</span>`);
            // Placeholder: Needs AoE damage logic, logCombatMessage
        }
    },
    "acidSpit": { // For poison-themed casters
        id: "acidSpit",
        name: "산성 침 뱉기",
        cooldown: 3,
        description: "산성 침을 뱉어 마법 피해를 입히고 방어력을 감소시킵니다.",
        coefficient: 0.8,
        elementalType: 'poison',
        effect: (caster, target) => {
            const damage = caster.magicalAttack * MONSTER_SKILLS.acidSpit.coefficient;
            target.hp -= damage;
            applyStatusEffect(target, { type: 'defense_debuff', duration: 3, magnitude: 0.15 }); // 15% defense reduction
            logCombatMessage(`<span style="color: yellowgreen;">${caster.name}이(가) ${target.name || '플레이어'}에게 산성 침을 뱉어 ${damage.toFixed(0)}의 피해를 입혔다!</span>`);
            logCombatMessage(`<span style="color: yellowgreen;">${target.name || '플레이어'}의 방어력이 약해졌다!</span>`);
        }
    },
    "leapAttack": { // For rushers, agile bruisers
        id: "leapAttack",
        name: "도약 공격",
        cooldown: 3,
        description: "플레이어에게 도약하여 물리 피해를 입힙니다.",
        coefficient: 1.3,
        effect: (caster, target) => {
            const damage = caster.physicalAttack * MONSTER_SKILLS.leapAttack.coefficient;
            target.hp -= damage;
            logCombatMessage(`<span style="color: chocolate;">${caster.name}이(가) ${target.name || '플레이어'}에게 도약 공격하여 ${damage.toFixed(0)}의 피해를 입혔다!</span>`);
            // Placeholder: Needs map interaction (move monster), logCombatMessage
        }
    },
    "frostNova": { // For ice-themed casters
        id: "frostNova",
        name: "서리 폭발",
        cooldown: 5,
        description: "주변에 서리 폭발을 일으켜 냉기 마법 피해를 입히고 플레이어를 얼립니다.",
        coefficient: 1.5,
        elementalType: 'ice',
        effect: (caster, target) => { // AoE around monster
            const damage = caster.magicalAttack * MONSTER_SKILLS.frostNova.coefficient;
            target.hp -= damage;
            applyStatusEffect(target, { type: 'freeze', duration: 1 });
            logCombatMessage(`<span style="color: aqua;">${caster.name}이(가) 서리 폭발을 일으켜 ${target.name || '플레이어'}에게 ${damage.toFixed(0)}의 피해를 입혔다!</span>`);
            logCombatMessage(`<span style="color: aqua;">${target.name || '플레이어'}이(가) 얼어붙었다!</span>`);
        }
    },
    "electrocute": { // For lightning-themed casters
        id: "electrocute",
        name: "감전",
        cooldown: 3,
        description: "플레이어를 감전시켜 마법 피해를 입히고 잠시 기절시킵니다.",
        coefficient: 1.0,
        elementalType: 'lightning',
        effect: (caster, target) => {
            const damage = caster.magicalAttack * MONSTER_SKILLS.electrocute.coefficient;
            target.hp -= damage;
            applyStatusEffect(target, { type: 'stun', duration: 1 });
            logCombatMessage(`<span style="color: gold;">${caster.name}이(가) ${target.name || '플레이어'}를 감전시켜 ${damage.toFixed(0)}의 피해를 입혔다!</span>`);
            logCombatMessage(`<span style="color: gold;">${target.name || '플레이어'}이(가) 기절했다!</span>`);
        }
    },
    "webSpray": { // For spider-like monsters (AoE root)
        id: "webSpray",
        name: "거미줄 분사",
        cooldown: 4,
        description: "광범위하게 거미줄을 분사하여 여러 플레이어를 속박합니다.",
        effect: (caster, target) => { // AoE
            applyStatusEffect(target, { type: 'root', duration: 2 });
            logCombatMessage(`<span style="color: lightgray;">${caster.name}이(가) 거미줄을 분사하여 ${target.name || '플레이어'}를 속박했다!</span>`);
            // Placeholder: Needs applyStatusEffect (root), logic to find multiple targets
        }
    },
    "shadowStep": { // For evasive, rogue-like monsters
        id: "shadowStep",
        name: "그림자 밟기",
        cooldown: 3,
        description: "그림자에 숨어 플레이어 뒤로 순간 이동하여 기습 공격합니다.",
        coefficient: 1.5,
        effect: (caster, target) => {
            const damage = caster.physicalAttack * MONSTER_SKILLS.shadowStep.coefficient;
            target.hp -= damage;
            logCombatMessage(`<span style="color: darkgray;">${caster.name}이(가) 그림자 밟기로 ${target.name || '플레이어'}를 기습하여 ${damage.toFixed(0)}의 피해를 입혔다!</span>`);
            // Placeholder: Needs map interaction (teleport), logCombatMessage
        }
    },
    "regeneration": { // For tough, healing monsters
        id: "regeneration",
        name: "재생",
        cooldown: 6,
        description: "자신의 체력을 빠르게 회복시킵니다.",
        coefficient: 0.3, // Percentage of max HP
        effect: (caster, target) => { // Self-heal
            const healAmount = caster.maxHp * MONSTER_SKILLS.regeneration.coefficient;
            caster.hp = Math.min(caster.maxHp, caster.hp + healAmount);
            logCombatMessage(`<span style="color: mediumseagreen;">${caster.name}이(가) 재생을 사용하여 ${healAmount.toFixed(0)}의 체력을 회복했다!</span>`);
        }
    },
    "toxicCloud": { // For poison-themed casters
        id: "toxicCloud",
        name: "맹독 구름",
        cooldown: 5,
        description: "주변에 맹독 구름을 생성하여 지속적인 독 피해를 입힙니다.",
        coefficient: 0.1, // DoT magnitude
        elementalType: 'poison',
        effect: (caster, target) => {
            applyStatusEffect(target, { type: 'poison', duration: 4, magnitude: caster.magicalAttack * MONSTER_SKILLS.toxicCloud.coefficient });
            logCombatMessage(`<span style="color: seagreen;">${caster.name}이(가) 맹독 구름을 생성하여 ${target.name || '플레이어'}를 중독시켰다!</span>`);
        }
    },
    "drainLife": { // For dark/caster types
        id: "drainLife",
        name: "생명력 흡수",
        cooldown: 4,
        description: "플레이어의 생명력을 흡수하여 자신의 체력을 회복합니다.",
        coefficient: 1.0, // damage, lifesteal percentage
        effect: (caster, target) => {
            const damage = caster.magicalAttack * MONSTER_SKILLS.drainLife.coefficient;
            target.hp -= damage;
            const healAmount = damage * 0.5; // Lifesteal for 50% of damage dealt
            caster.hp = Math.min(caster.maxHp, caster.hp + healAmount);
            logCombatMessage(`<span style="color: darkviolet;">${caster.name}이(가) ${target.name || '플레이어'}의 생명력을 흡수하여 ${damage.toFixed(0)}의 피해를 입히고 ${healAmount.toFixed(0)}의 체력을 회복했다!</span>`);
        }
    },
    "blindingFlash": { // For casters
        id: "blindingFlash",
        name: "섬광",
        cooldown: 3,
        description: "강렬한 섬광으로 플레이어를 실명시킵니다.",
        effect: (caster, target) => {
            applyStatusEffect(target, { type: 'blind', duration: 2 });
            logCombatMessage(`<span style="color: silver;">${caster.name}이(가) 강렬한 섬광으로 ${target.name || '플레이어'}를 실명시켰다!</span>`);
        }
    },
    "spikeBarrage": { // For physical ranged, defender types
        id: "spikeBarrage",
        name: "가시 폭풍",
        cooldown: 4,
        description: "몸에서 날카로운 가시를 발사하여 물리 피해를 입힙니다.",
        coefficient: 1.0,
        effect: (caster, target) => {
            const damage = caster.physicalAttack * MONSTER_SKILLS.spikeBarrage.coefficient;
            target.hp -= damage;
            logCombatMessage(`<span style="color: peru;">${caster.name}이(가) 가시 폭풍을 일으켜 ${target.name || '플레이어'}에게 ${damage.toFixed(0)}의 피해를 입혔다!</span>`);
        }
    },
    "infectiousBite": { // For zombie-like, poison types
        id: "infectiousBite",
        name: "감염된 물기",
        cooldown: 3,
        description: "감염된 이빨로 물어뜯어 물리 피해와 함께 전염병을 겁니다.",
        coefficient: 1.0,
        effect: (caster, target) => {
            const damage = caster.physicalAttack * MONSTER_SKILLS.infectiousBite.coefficient;
            target.hp -= damage;
            applyStatusEffect(target, { type: 'disease', duration: 3 });
            logCombatMessage(`<span style="color: yellowgreen;">${caster.name}이(가) ${target.name || '플레이어'}를 감염된 이빨로 물어뜯어 ${damage.toFixed(0)}의 피해를 입혔다!</span>`);
            logCombatMessage(`<span style="color: yellowgreen;">${target.name || '플레이어'}이(가) 전염병에 걸렸다!</span>`);
        }
    },
    "disorientingGaze": { // For caster, mental types
        id: "disorientingGaze",
        name: "혼란의 시선",
        cooldown: 4,
        description: "혼란스러운 시선으로 플레이어를 잠시 혼란에 빠뜨립니다.",
        effect: (caster, target) => {
            applyStatusEffect(target, { type: 'confuse', duration: 2 });
            logCombatMessage(`<span style="color: lightblue;">${caster.name}이(가) 혼란의 시선으로 ${target.name || '플레이어'}를 혼란에 빠뜨렸다!</span>`);
        }
    }
};