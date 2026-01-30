import { gameState } from './gameState.js';
import { LEVEL_UP_STAT_POINTS, LEVEL_UP_SKILL_POINTS } from './gameSettings.js';
import { AFFIX_TYPES, EQUIPMENT_SETS } from './itemConstants.js';
import { SKILLS } from './skills.js';
import {
    logCombatMessage, updateStatusDisplay, updateSkillTreeButtonState,
    renderSkillTree, renderSkillSlotManagementBar
} from './ui.js';
import { skillTreeTabs } from './domElements.js';
import { applyActionEffect } from './effectRules.js'; // Import applyActionEffect

export function recalculateDerivedStats() {
    const baseStats = gameState.playerStats.base;
    const equipment = gameState.playerStats.equipment;

    const totalStats = { ...baseStats };
    for (const slot in equipment) {
        const item = equipment[slot];
        if (!item) continue;

        if (item.stats) {
            for (const stat in item.stats) {
                totalStats[stat] = (totalStats[stat] || 0) + item.stats[stat];
            }
        }
        if (item.affixes) {
            item.affixes.forEach(affix => {
                const affixDefinition = AFFIX_TYPES[affix.type];
                if (affixDefinition && affixDefinition.type === 'stat') {
                    totalStats[affixDefinition.stat] = (totalStats[affixDefinition.stat] || 0) + affix.value;
                }
            });
        }
    }

    const derived = {
        id: 'player',
        maxHp: 50,
        maxMp: 20,
        physicalAttack: 0,
        magicalAttack: 0,
        rangedAttack: 0,
        physicalDefense: 0,
        magicalDefense: 0,
        speed: 0,
        evasion: 0,
        critChance: 0.05,
        critDamage: 1.5,
        elementalDamageBonus: 0,
        magicFind: 0,
        goldFind: 0,
        lifesteal: 0,
        hpRegen: totalStats.hpRegen || 0,
        manaRegen: totalStats.manaRegen || 0,
        manaCostReduction: 0,
        statusEffects: [],
        elementalDamage: { fire: 0, ice: 0, poison: 0, lightning: 0, dark: 0 },
        setBonuses: [],
        physicalBlockChance: 0
    };

    derived.physicalAttack += totalStats.strength * 2;
    derived.physicalDefense += Math.floor(totalStats.strength * 0.5);
    derived.maxHp += totalStats.strength * 2;

    derived.magicalAttack += totalStats.intelligence * 2;
    derived.maxMp += totalStats.intelligence * 1;
    derived.magicalDefense += Math.floor(totalStats.intelligence * 0.5);

    derived.speed += totalStats.agility * 1;
    derived.evasion += totalStats.agility * 0.002;
    derived.physicalAttack += Math.floor(totalStats.agility * 0.5);
    derived.critChance += totalStats.agility * 0.001;
    derived.rangedAttack += totalStats.agility * 2;
    derived.rangedAttack += totalStats.strength * 0.5;

    derived.maxHp += totalStats.vitality * 10;
    derived.physicalDefense += totalStats.vitality * 1;
    derived.physicalAttack += Math.floor(totalStats.vitality * 0.2);

    derived.maxMp += totalStats.mentality * 5;
    derived.elementalDamageBonus += totalStats.mentality * 0.005;
    derived.magicalAttack += Math.floor(totalStats.mentality * 0.5);
    derived.magicalDefense += totalStats.mentality * 1;

    derived.critChance += totalStats.luck * 0.0025;
    derived.critDamage += totalStats.luck * 0.01;
    derived.magicFind += totalStats.luck * 0.015;
    derived.goldFind += totalStats.luck * 0.03;

    for (const slot in equipment) {
        const item = equipment[slot];
        if (item && item.affixes) {
            item.affixes.forEach(affix => {
                const affixDefinition = AFFIX_TYPES[affix.type];
                if (!affixDefinition || affixDefinition.type === 'stat') return;

                let value = 0;
                if (affixDefinition.minMax) {
                    value = affix.min !== undefined ? affix.min : 0;
                } else if (affixDefinition.chanceVal && affix.magnitude !== undefined) {
                    value = affix.magnitude;
                } else if (affix.value !== undefined) {
                    value = affix.value;
                }

                switch (affix.type) {
                    case 'physicalAttack': derived.physicalAttack += value; break;
                    case 'magicalAttack': derived.magicalAttack += value; break;
                    case 'rangedAttack': derived.rangedAttack += value; break;
                    case 'physicalDefense': derived.physicalDefense += value; break;
                    case 'magicalDefense': derived.magicalDefense += value; break;
                    case 'maxHp': derived.maxHp += value; break;
                    case 'maxMp': derived.maxMp += value; break;
                    case 'critChance': derived.critChance += value; break;
                    case 'critDamage': derived.critDamage += value; break;
                    case 'lifesteal': derived.lifesteal += value; break;
                    case 'evasion': derived.evasion = (derived.evasion || 0) + value; break;
                    case 'goldFind': derived.goldFind = (derived.goldFind || 0) + value; break;
                    case 'magicFind': derived.magicFind = (derived.magicFind || 0) + value; break;
                    case 'speed': derived.speed = (derived.speed || 0) + value; break;
                    case 'elementalDamageBonus': derived.elementalDamageBonus = (derived.elementalDamageBonus || 0) + value; break;
                    case 'manaRegen': derived.manaRegen = (derived.manaRegen || 0) + value; break;
                    case 'hpRegen': derived.hpRegen = (derived.hpRegen || 0) + value; break;
                    case 'elementalDamageResistance_fire': derived.elementalResistance_fire = (derived.elementalResistance_fire || 0) + value; break;
                    case 'elementalDamageResistance_lightning': derived.elementalResistance_lightning = (derived.elementalResistance_lightning || 0) + value; break;
                    case 'elementalDamageResistance': derived.elementalResistance = (derived.elementalResistance || 0) + value; break;
                    case 'statusEffectResistance': derived.statusEffectResistance = (derived.statusEffectResistance || 0) + value; break;

                    case 'elementalDamage':
                        derived.elementalDamage[affix.elementType] = (derived.elementalDamage[affix.elementType] || 0) + value;
                        break;
                    case 'statusEffectBleed':
                    case 'statusEffectPoison':
                        derived.statusEffects.push({
                            type: affixDefinition.effectType,
                            chance: affix.chance,
                            magnitude: affix.magnitude,
                            duration: affix.duration
                        });
                        break;
                }
            });
        }
    }

    const equippedSetCounts = {};
    const equippedSetItems = {};

    for (const slot in equipment) {
        const item = equipment[slot];
        if (item && item.isSetItem && item.setId) {
            equippedSetCounts[item.setId] = (equippedSetCounts[item.setId] || 0) + 1;
            if (!equippedSetItems[item.setId]) {
                equippedSetItems[item.setId] = [];
            }
            equippedSetItems[item.setId].push(item);
        }
    }

    for (const setId in equippedSetCounts) {
        const equippedCount = equippedSetCounts[setId];
        const setDefinition = EQUIPMENT_SETS.find(set => set.id === setId);

        if (setDefinition) {
            setDefinition.bonuses.forEach(bonus => {
                if (equippedCount >= bonus.count) {
                    if (bonus.effect.stats) {
                        for (const stat in bonus.effect.stats) {
                            derived[stat] = (derived[stat] || 0) + bonus.effect.stats[stat];
                        }
                    }
                    if (bonus.effect.affixes) {
                        bonus.effect.affixes.forEach(affix => {
                            const affixDefinition = AFFIX_TYPES[affix.type];
                            if (affixDefinition) {
                                let value = 0;
                                if (affix.min !== undefined) {
                                    value = affix.min;
                                } else if (affix.value !== undefined) {
                                    value = affix.value;
                                } else if (affix.magnitude !== undefined) {
                                    value = affix.magnitude;
                                }

                                switch (affix.type) {
                                    case 'physicalAttack': derived.physicalAttack += value; break;
                                    case 'magicalAttack': derived.magicalAttack += value; break;
                                    case 'rangedAttack': derived.rangedAttack += value; break;
                                    case 'physicalDefense': derived.physicalDefense += value; break;
                                    case 'magicalDefense': derived.magicalDefense += value; break;
                                    case 'maxHp': derived.maxHp += value; break;
                                    case 'maxMp': derived.maxMp += value; break;
                                    case 'critChance': derived.critChance += value; break;
                                    case 'critDamage': derived.critDamage += value; break;
                                    case 'lifesteal': derived.lifesteal += value; break;
                                    case 'evasion': derived.evasion = (derived.evasion || 0) + value; break;
                                    case 'goldFind': derived.goldFind = (derived.goldFind || 0) + value; break;
                                    case 'magicFind': derived.magicFind = (derived.magicFind || 0) + value; break;
                                    case 'speed': derived.speed = (derived.speed || 0) + value; break;
                                    case 'elementalDamageBonus': derived.elementalDamageBonus = (derived.elementalDamageBonus || 0) + value; break;
                                    case 'manaRegen': derived.manaRegen = (derived.manaRegen || 0) + value; break;
                                    case 'hpRegen': derived.hpRegen = (derived.hpRegen || 0) + value; break;
                                    case 'elementalDamageResistance_fire': derived.elementalResistance_fire = (derived.elementalResistance_fire || 0) + value; break;
                                    case 'elementalDamageResistance_lightning': derived.elementalResistance_lightning = (derived.elementalResistance_lightning || 0) + value; break;
                                    case 'elementalDamageResistance': derived.elementalResistance = (derived.elementalResistance || 0) + value; break;
                                    case 'statusEffectResistance': derived.statusEffectResistance = (derived.statusEffectResistance || 0) + value; break;
                                    case 'elementalDamage':
                                        derived.elementalDamage[affix.elementType] = (derived.elementalDamage[affix.elementType] || 0) + (affix.min !== undefined ? affix.min : affix.value);
                                        break;
                                    case 'statusEffectBurn':
                                    case 'statusEffectChill':
                                        derived.statusEffects.push({
                                            type: affix.type.replace('statusEffect', '').toLowerCase(),
                                            chance: affix.chance,
                                            magnitude: affix.magnitude,
                                            duration: affix.duration
                                        });
                                        break;
                                }
                            }
                        });
                    }
                    if (bonus.effect.special) {
                        derived.setBonuses.push({
                            setId: setId,
                            setName: setDefinition.name,
                            count: bonus.count,
                            special: bonus.effect.special,
                            color: setDefinition.color
                        });
                    }
                }
            });
        }
    }

    for (const slot in equipment) {
        const item = equipment[slot];
        if (item && item.isUnique && item.specialEffects) {
            item.specialEffects.forEach(effect => {
                switch (effect.type) {
                    case 'auraDefense':
                        break;
                    case 'physicalBlockChance':
                        derived.physicalBlockChance += effect.value;
                        break;
                    default:
                        break;
                }
            });
        }
    }

    derived.maxHp = Math.floor(derived.maxHp);
    derived.maxMp = Math.max(0, Math.floor(derived.maxMp));
    derived.evasion = Math.max(0, Math.min(0.75, derived.evasion));
    derived.critChance = Math.max(0, Math.min(1, derived.critChance));
    derived.physicalBlockChance = Math.max(0, Math.min(0.75, derived.physicalBlockChance));
    derived.lifesteal = Math.max(0, Math.min(0.08, derived.lifesteal));

    derived.physicalAttack = Math.floor(derived.physicalAttack);
    derived.magicalAttack = Math.floor(derived.magicalAttack);
    derived.rangedAttack = Math.floor(derived.rangedAttack);
    derived.physicalDefense = Math.floor(derived.physicalDefense);
    derived.magicalDefense = Math.floor(derived.magicalDefense);
    derived.speed = Math.floor(derived.speed);
    derived.elementalDamageBonus = Math.max(0, derived.elementalDamageBonus);
    derived.manaRegen = derived.manaRegen || 0;
    derived.hpRegen = derived.hpRegen || 0;
    derived.elementalResistance_fire = derived.elementalResistance_fire || 0;
    derived.elementalResistance_lightning = derived.elementalResistance_lightning || 0;
    derived.elementalResistance = derived.elementalResistance || 0;
    derived.statusEffectResistance = derived.statusEffectResistance || 0;

    const learnedPassiveSkills = Object.entries(gameState.playerStats.base.learnedSkills)
        .map(([skillId, skillLevel]) => {
            const skill = SKILLS[skillId];
            if (skill && skill.type === 'passive') {
                return { ...skill, currentLevel: skillLevel };
            }
            return null;
        })
        .filter(skill => skill !== null)
        .sort((a, b) => (a.applyOrder || 999) - (b.applyOrder || 999));

    learnedPassiveSkills.forEach(passiveSkill => {
        passiveSkill.effect(derived, passiveSkill.currentLevel);
    });

    gameState.playerStats.derived = derived;

    if (gameState.playerStats.base.hp > derived.maxHp) {
        gameState.playerStats.base.hp = derived.maxHp;
    }
    if (gameState.playerStats.base.mp > derived.maxMp) {
        gameState.playerStats.base.mp = derived.maxMp;
    }
}

export function gainExperience(amount) {
    gameState.playerStats.base.experience += amount;
    logCombatMessage(`<span style="color: gold;">${amount.toFixed(0)} 경험치를 획득했습니다.</span>`);
    while (gameState.playerStats.base.experience >= gameState.playerStats.base.experienceToNextLevel) {
        gameState.playerStats.base.experience -= gameState.playerStats.base.experienceToNextLevel;
        levelUp();
    }
    updateStatusDisplay();
}

export function levelUp() {
    const base = gameState.playerStats.base;
    base.level++;
    base.availableStatPoints += LEVEL_UP_STAT_POINTS;
    base.availableSkillPoints += LEVEL_UP_SKILL_POINTS;
    base.experienceToNextLevel = base.level * 100 + 50;

    recalculateDerivedStats();
    base.hp = gameState.playerStats.derived.maxHp;
    base.mp = gameState.playerStats.derived.maxMp;

    logCombatMessage(`<span style="color: gold;">레벨 업! 현재 레벨 ${base.level}입니다!</span>`);
    applyActionEffect({type: 'PLAYER_LEVEL_UP', playerLevel: base.level});
    logCombatMessage(`<span style="color: gold;">새로운 스킬 포인트를 획득했습니다! '스킬' 버튼을 확인하세요.</span>`);
    updateStatusDisplay();
    updateSkillTreeButtonState();
}

export function allocateStatPoint(statName) {
    const base = gameState.playerStats.base;
    if (base.availableStatPoints > 0) {
        if (base.hasOwnProperty(statName)) {
            base[statName]++;
            base.availableStatPoints--;
            recalculateDerivedStats();
        }
    }
}

export function learnSkill(skillId) {
    const playerBase = gameState.playerStats.base;
    const skill = SKILLS[skillId];

    if (!skill) {
        logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] 알 수 없는 스킬입니다: ${skillId}</span>`);
        return;
    }

    const currentSkillLevel = playerBase.learnedSkills[skillId] || 0;

    if (currentSkillLevel >= skill.maxLevel) {
        logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] ${skill.name} 스킬은 이미 최대 레벨입니다.</span>`);
        return;
    }

    if (playerBase.availableSkillPoints < skill.costPerLevel) {
        logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] 스킬 포인트가 부족합니다. (${skill.name} 요구: ${skill.costPerLevel})</span>`);
        return;
    }

    const allDependenciesMet = skill.dependencies.every(depId => {
        const depSkill = SKILLS[depId];
        return depSkill && playerBase.learnedSkills[depId] === depSkill.maxLevel;
    });

    if (skill.dependencies.length > 0 && !allDependenciesMet) {
        logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] 선행 스킬을 먼저 마스터해야 합니다.</span>`);
        return;
    }

    playerBase.availableSkillPoints -= skill.costPerLevel;
    playerBase.learnedSkills[skillId] = currentSkillLevel + 1;
    const newSkillLevel = playerBase.learnedSkills[skillId];

    logCombatMessage(`<span style="color: limegreen;">[SYSTEM] ${skill.name} 스킬을 ${newSkillLevel} 레벨로 올렸습니다!</span>`);

    if (skill.type === 'passive') {
        recalculateDerivedStats();
    }

    const activeTree = skillTreeTabs.querySelector('.tab-btn.active').dataset.tree;
    renderSkillTree(activeTree);
    renderSkillSlotManagementBar();
}

export function equipSkillToSlot(skillId, targetSlotIndex, sourceSlotIndex = null) {
    const playerBase = gameState.playerStats.base;

    if (!skillId) {
        if (playerBase.skillSlots.slots[targetSlotIndex]) {
            const existingSkillId = playerBase.skillSlots.slots[targetSlotIndex];
            playerBase.skillSlots.slots[targetSlotIndex] = null;
            logCombatMessage(`<span style="color: gold;">[SYSTEM] ${SKILLS[existingSkillId].name} 스킬이 슬롯 ${targetSlotIndex + 1}에서 해제되었습니다.</span>`);
            renderSkillSlotManagementBar();
            return true;
        }
        return false;
    }

    const skill = SKILLS[skillId];
    if (!skill || skill.type !== 'active') {
        logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] 액티브 스킬만 장착할 수 있습니다.</span>`);
        return false;
    }
    if (!playerBase.learnedSkills[skillId] || playerBase.learnedSkills[skillId] === 0) {
        logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] 배우지 않은 스킬은 장착할 수 없습니다.</span>`);
        return false;
    }
    if (targetSlotIndex < 0 || targetSlotIndex >= playerBase.skillSlots.max) {
        logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] 유효하지 않은 스킬 슬롯입니다.</span>`);
        return false;
    }

    const existingSkillInTargetSlot = playerBase.skillSlots.slots[targetSlotIndex];
    if (existingSkillInTargetSlot === skillId) {
        return true;
    }

    if (sourceSlotIndex !== null) {
        playerBase.skillSlots.slots[sourceSlotIndex] = null;
    }

    if (existingSkillInTargetSlot) {
        playerBase.skillSlots.slots[targetSlotIndex] = null;
        logCombatMessage(`<span style="color: gold;">[SYSTEM] ${SKILLS[existingSkillInTargetSlot].name} 스킬이 슬롯 ${targetSlotIndex + 1}에서 해제되었습니다.</span>`);
    }

    playerBase.skillSlots.slots[targetSlotIndex] = skillId;
    logCombatMessage(`<span style="color: limegreen;">[SYSTEM] ${skill.name} 스킬을 슬롯 ${targetSlotIndex + 1}에 장착했습니다.</span>`);
    renderSkillSlotManagementBar();

    return true;
}