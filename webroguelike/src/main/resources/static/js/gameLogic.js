// gameLogic.js
import { gameState, resetGameState } from './gameState.js';
import { TILE_SIZE, MONSTER_TIERS, MONSTER_TYPES, BOSS_CHANCE_PERCENT, XP_GAIN_MULTIPLIER, ESCAPE_CHANCE, LEVEL_UP_STAT_POINTS, LEVEL_UP_SKILL_POINTS, RARITY_CONFIG, BASE_ITEMS, AFFIX_TYPES, ELEMENTAL_TYPES, INVENTORY_SIZE, ITEM_DROP_CHANCE, TREASURE_CHEST_CHANCE, AFFIX_PREFIXES, UNIQUE_ITEM_NAMES_BY_RARITY_AND_SLOT, EQUIPMENT_SETS } from './constants.js'; // Added LEVEL_UP_SKILL_POINTS
const MONSTER_SKILL_CHANCE = 0.3; // 30% chance for a monster to use a skill if available
import { getRandomEmptyTile, findWalkableTileOnEdge } from './utils.js';
import { SKILLS, MONSTER_SKILLS } from './skills.js'; // Import SKILLS and MONSTER_SKILLS
import {
    logCombatMessage, updateStatusDisplay, createTooltipContent, showItemTooltip,
    hideItemTooltip, renderBagGrid, renderEquipment, renderMerchantStock,
    renderPlayerSellInventory, updateMerchantPlayerGoldDisplay, drawGame,
    initPokemonBattleUI, updatePokemonBattlePlayerUI, updatePokemonBattleMonsterUI,
    renderSidePanelEquipment, updateSkillTreeButtonState, renderSkillTree, renderSkillSlotManagementBar
} from './ui.js';
import { transitionMap } from './map.js';
import { gameContainer, gameCanvas, restartModal, finalScoreSpan, merchantOverlayElement, itemTooltipElement, bagGridElement, pokemonBattleOverlay, battleAttackBtn, battleAutoAttackBtn, battleRunAwayBtn, skillTreeTabs } from './domElements.js';


export function calculateGoldDrop(monster) {
    const tierInfo = MONSTER_TIERS[monster.tier];
    let gold = tierInfo.base_gold_drop * monster.level;
    if (monster.isBoss) {
        gold *= 2;
    }
    gold = Math.floor(gold * (0.8 + Math.random() * 0.4));

    // Apply Gold Find from player's luck
    const goldFind = gameState.playerStats.derived.goldFind || 0;
    gold = Math.floor(gold * (1 + goldFind));

    return gold;
}

export function recalculateDerivedStats() {
    const baseStats = gameState.playerStats.base;
    const equipment = gameState.playerStats.equipment;

    // 1. Consolidate ALL primary stats from base, item.stats, and item.affixes
    const totalStats = { ...baseStats };
    for (const slot in equipment) {
        const item = equipment[slot];
        if (!item) continue;

        // Add stats from the base item roll
        if (item.stats) {
            for (const stat in item.stats) {
                totalStats[stat] = (totalStats[stat] || 0) + item.stats[stat];
            }
        }
        // Add primary stats from affixes
        if (item.affixes) {
            item.affixes.forEach(affix => {
                const affixDefinition = AFFIX_TYPES[affix.type];
                if (affixDefinition && affixDefinition.type === 'stat') {
                    totalStats[affixDefinition.stat] = (totalStats[affixDefinition.stat] || 0) + affix.value;
                }
            });
        }
    }

    // 2. Initialize derived stats with base values
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
        hpRegen: totalStats.hpRegen || 0, // 기본 체력 재생량 반영
        manaRegen: totalStats.manaRegen || 0, // 기본 마나 재생량 반영
        manaCostReduction: 0, // 초기화
        statusEffects: [],
        elementalDamage: { fire: 0, ice: 0, poison: 0, lightning: 0, dark: 0 }, // Initialize dark elemental damage
        setBonuses: [], // New: to store active set bonuses
        physicalBlockChance: 0 // New: Initialize physical block chance
    };

    // 3. Apply primary-to-derived stat formulas using the final totalStats
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

    // 4. Apply flat bonuses and status effects from equipment affixes (non-primary stat affixes)
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

                switch (affix.type) { // Use affix.type directly instead of affixDefinition.type for specific cases
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
                    case 'evasion': derived.evasion = (derived.evasion || 0) + value; break; // Evasion can be added this way
                    case 'goldFind': derived.goldFind = (derived.goldFind || 0) + value; break;
                    case 'magicFind': derived.magicFind = (derived.magicFind || 0) + value; break;
                    case 'speed': derived.speed = (derived.speed || 0) + value; break;
                    case 'elementalDamageBonus': derived.elementalDamageBonus = (derived.elementalDamageBonus || 0) + value; break;
                    case 'manaRegen': derived.manaRegen = (derived.manaRegen || 0) + value; break; // New affix type
                    case 'hpRegen': derived.hpRegen = (derived.hpRegen || 0) + value; break; // New affix type
                    case 'elementalDamageResistance_fire': derived.elementalResistance_fire = (derived.elementalResistance_fire || 0) + value; break; // New elemental resistance
                    case 'elementalDamageResistance_lightning': derived.elementalResistance_lightning = (derived.elementalResistance_lightning || 0) + value; break; // New elemental resistance
                    case 'elementalDamageResistance': derived.elementalResistance = (derived.elementalResistance || 0) + value; break; // All elemental resistance
                    case 'statusEffectResistance': derived.statusEffectResistance = (derived.statusEffectResistance || 0) + value; break; // New status effect resistance

                    case 'elementalDamage': // e.g., elementalDamage
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

    // 5. Apply Set Bonuses
    const equippedSetCounts = {};
    const equippedSetItems = {}; // To store actual equipped set items for later use (e.g., UI highlighting)

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
                    // Apply stats from set bonus
                    if (bonus.effect.stats) {
                        for (const stat in bonus.effect.stats) {
                            derived[stat] = (derived[stat] || 0) + bonus.effect.stats[stat];
                        }
                    }
                    // Apply affixes from set bonus
                    if (bonus.effect.affixes) {
                        bonus.effect.affixes.forEach(affix => {
                            const affixDefinition = AFFIX_TYPES[affix.type];
                            if (affixDefinition) {
                                let value = 0;
                                if (affix.min !== undefined) {
                                    value = affix.min; // Use min for consistent stat (or average for damage range)
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
                                    case 'elementalDamage': // Handle elemental damage from set bonus
                                        derived.elementalDamage[affix.elementType] = (derived.elementalDamage[affix.elementType] || 0) + (affix.min !== undefined ? affix.min : affix.value);
                                        break;
                                    case 'statusEffectBurn': // New status effect from set
                                    case 'statusEffectChill': // New status effect from set
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
                    // Store special effects for UI/game logic
                    if (bonus.effect.special) {
                        derived.setBonuses.push({
                            setId: setId,
                            setName: setDefinition.name,
                            count: bonus.count,
                            special: bonus.effect.special,
                            color: setDefinition.color // Add set color for UI
                        });
                    }
                }
            });
        }
    }

    // 6. Apply Unique Item Special Effects
    for (const slot in equipment) {
        const item = equipment[slot];
        if (item && item.isUnique && item.specialEffects) {
            item.specialEffects.forEach(effect => {
                switch (effect.type) {
                    case 'auraDefense':
                        // This effect affects enemies, so it won't directly modify player's derived stats here.
                        // It would be handled in enemy combat calculations or a global effect manager.
                        // For now, we acknowledge it but don't apply it here.
                        // logCombatMessage(`Unique Effect: ${item.name} provides Aura Defense of ${effect.value}`);
                        break;
                    case 'physicalBlockChance':
                        derived.physicalBlockChance += effect.value;
                        break;
                    // Add other special effect types here as they are defined
                    default:
                        // Handle other special effects not directly applied to derived stats
                        // e.g., onHit effects, passive buffs that need to be tracked
                        break;
                }
            });
        }
    }

    // 7. Finalization & Clamping
    derived.maxHp = Math.floor(derived.maxHp);
    derived.maxMp = Math.max(0, Math.floor(derived.maxMp));
    derived.evasion = Math.max(0, Math.min(0.75, derived.evasion));
    derived.critChance = Math.max(0, Math.min(1, derived.critChance));
    derived.physicalBlockChance = Math.max(0, Math.min(0.75, derived.physicalBlockChance)); // New: Clamp physicalBlockChance
    derived.lifesteal = Math.max(0, Math.min(0.08, derived.lifesteal)); // New: Clamp lifesteal to 8%


    // Clamp derived stats that might exceed reasonable bounds
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

    // 8. Apply Passive Skill Effects
    // Sort learned passive skills by applyOrder and apply their effects
    const learnedPassiveSkills = Object.entries(gameState.playerStats.base.learnedSkills)
        .map(([skillId, skillLevel]) => {
            const skill = SKILLS[skillId];
            if (skill && skill.type === 'passive') {
                return { ...skill, currentLevel: skillLevel }; // 스킬 객체에 현재 레벨 추가
            }
            return null;
        })
        .filter(skill => skill !== null)
        .sort((a, b) => (a.applyOrder || 999) - (b.applyOrder || 999)); // Sort by applyOrder

    learnedPassiveSkills.forEach(passiveSkill => {
        passiveSkill.effect(derived, passiveSkill.currentLevel); // 스킬 레벨을 effect 함수에 전달
    });

    gameState.playerStats.derived = derived;

    // Clamp current HP and MP to the new maximums
    if (gameState.playerStats.base.hp > derived.maxHp) {
        gameState.playerStats.base.hp = derived.maxHp;
    }
    if (gameState.playerStats.base.mp > derived.maxMp) {
        gameState.playerStats.base.mp = derived.maxMp; // Fix: was derived.mp
    }
}

export function equipItem(itemIndex) {
    const item = gameState.playerStats.inventory[itemIndex];
    if (!item || item.type !== 'equipment') return;

    let targetSlot = item.slot;
    if (targetSlot === 'ring') {
        if (!gameState.playerStats.equipment.ring1) {
            targetSlot = 'ring1';
        } else if (!gameState.playerStats.equipment.ring2) {
            targetSlot = 'ring2';
        } else {
            targetSlot = 'ring1';
        }
    }

    if (gameState.playerStats.equipment[targetSlot]) {
        unequipItem(targetSlot);
    }

    gameState.playerStats.equipment[targetSlot] = item;
    gameState.playerStats.inventory.splice(itemIndex, 1);

    recalculateDerivedStats();
    updateStatusDisplay();
    renderBagGrid(bagGridElement, gameState.playerStats.inventory, false);
    renderEquipment();
    renderSidePanelEquipment();
    hideItemTooltip();
}

export function unequipItem(slot) {
    if (gameState.playerStats.inventory.length >= INVENTORY_SIZE) {
        logCombatMessage("<span style='color: lightcoral;'>인벤토리가 가득 찼습니다! 아이템을 해제할 수 없습니다.</span>");
        return;
    }
    const item = gameState.playerStats.equipment[slot];
    if (!item) return;
    gameState.playerStats.inventory.push(item);
    gameState.playerStats.equipment[slot] = null;

    recalculateDerivedStats();
    updateStatusDisplay();
    renderBagGrid(bagGridElement, gameState.playerStats.inventory, false);
    renderEquipment();
    renderSidePanelEquipment();
    hideItemTooltip();
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
    base.availableStatPoints += LEVEL_UP_STAT_POINTS; // 기존 스탯 포인트
    base.availableSkillPoints += LEVEL_UP_SKILL_POINTS; // 새로 추가된 스킬 포인트 획득
    base.experienceToNextLevel = base.level * 100 + 50;

    recalculateDerivedStats(); // Recalculate stats to get new max HP/MP
    base.hp = gameState.playerStats.derived.maxHp; // Heal to full on level up
    base.mp = gameState.playerStats.derived.maxMp;

    logCombatMessage(`<span style="color: gold;">레벨 업! 현재 레벨 ${base.level}입니다!</span>`);
    logCombatMessage(`<span style="color: gold;">새로운 스킬 포인트를 획득했습니다! '스킬' 버튼을 확인하세요.</span>`); // 스킬 포인트 획득 알림
    updateStatusDisplay();
    updateSkillTreeButtonState(); // 스킬 버튼 반짝임 상태 업데이트
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

    // 스킬이 이미 최대 레벨인 경우
    if (currentSkillLevel >= skill.maxLevel) {
        logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] ${skill.name} 스킬은 이미 최대 레벨입니다.</span>`);
        return;
    }

    // 스킬 포인트 부족 확인
    if (playerBase.availableSkillPoints < skill.costPerLevel) {
        logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] 스킬 포인트가 부족합니다. (${skill.name} 요구: ${skill.costPerLevel})</span>`);
        return;
    }

    // 선행 스킬 마스터 여부 확인
    const allDependenciesMet = skill.dependencies.every(depId => {
        const depSkill = SKILLS[depId];
        // 선행 스킬이 존재하고, 플레이어가 배웠으며, 해당 선행 스킬이 최대 레벨에 도달했는지 확인
        return depSkill && playerBase.learnedSkills[depId] === depSkill.maxLevel;
    });

    // 만약 선행 스킬이 있지만 아직 배우지 않은 스킬이라면
    if (skill.dependencies.length > 0 && !allDependenciesMet) {
        logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] 선행 스킬을 먼저 마스터해야 합니다.</span>`);
        return;
    }

    // 스킬 레벨업
    playerBase.availableSkillPoints -= skill.costPerLevel;
    playerBase.learnedSkills[skillId] = currentSkillLevel + 1; // 스킬 레벨 1 증가
    const newSkillLevel = playerBase.learnedSkills[skillId];

    logCombatMessage(`<span style="color: limegreen;">[SYSTEM] ${skill.name} 스킬을 ${newSkillLevel} 레벨로 올렸습니다!</span>`);

    // 패시브 스킬이라면 스탯 즉시 재계산
    if (skill.type === 'passive') {
        recalculateDerivedStats();
    }

    // UI 업데이트
    const activeTree = skillTreeTabs.querySelector('.tab-btn.active').dataset.tree;
    renderSkillTree(activeTree);
    renderSkillSlotManagementBar(); // 스킬 슬롯 관리 바 업데이트

}

export function equipSkillToSlot(skillId, targetSlotIndex, sourceSlotIndex = null) {
    const playerBase = gameState.playerStats.base;

    // 스킬 슬롯에서 스킬을 제거하는 경우 (skillId가 null 또는 undefined인 경우)
    if (!skillId) {
        if (playerBase.skillSlots.slots[targetSlotIndex]) {
            const existingSkillId = playerBase.skillSlots.slots[targetSlotIndex];
            playerBase.skillSlots.slots[targetSlotIndex] = null;
            logCombatMessage(`<span style="color: gold;">[SYSTEM] ${SKILLS[existingSkillId].name} 스킬이 슬롯 ${targetSlotIndex + 1}에서 해제되었습니다.</span>`);
            renderSkillSlotManagementBar();
            return true;
        }
        return false; // 제거할 스킬이 없음
    }

    // skillId가 유효할 때만 skill 객체를 가져옵니다.
    const skill = SKILLS[skillId];
    if (!skill || skill.type !== 'active') {
        logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] 액티브 스킬만 장착할 수 있습니다.</span>`);
        return false;
    }
    // 스킬 레벨이 0보다 커야 장착 가능 (배우지 않은 스킬은 장착 불가)
    if (!playerBase.learnedSkills[skillId] || playerBase.learnedSkills[skillId] === 0) {
        logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] 배우지 않은 스킬은 장착할 수 없습니다.</span>`);
        return false;
    }
    if (targetSlotIndex < 0 || targetSlotIndex >= playerBase.skillSlots.max) {
        logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] 유효하지 않은 스킬 슬롯입니다.</span>`);
        return false;
    }

    // 대상 슬롯에 이미 스킬이 있는 경우
    const existingSkillInTargetSlot = playerBase.skillSlots.slots[targetSlotIndex];
    if (existingSkillInTargetSlot === skillId) {
        // 같은 스킬을 같은 슬롯에 드롭한 경우, 변경 없음
        return true;
    }

    // 다른 슬롯에서 드래그한 경우, 원본 슬롯을 비움
    if (sourceSlotIndex !== null) {
        playerBase.skillSlots.slots[sourceSlotIndex] = null;
    }

    // 기존 슬롯에 있는 스킬을 현재 빈 슬롯으로 옮기거나, 스왑하는 로직
    if (existingSkillInTargetSlot) {
        // 이미 스킬이 있다면, 다른 빈 슬롯을 찾아 넣어주거나 (복잡해지므로 제외),
        // 아니면 원래 드래그 시작한 곳으로 되돌리는 등의 처리가 필요.
        // 여기서는 간단하게 기존 스킬을 해제하는 것으로 처리
        playerBase.skillSlots.slots[targetSlotIndex] = null;
        logCombatMessage(`<span style="color: gold;">[SYSTEM] ${SKILLS[existingSkillInTargetSlot].name} 스킬이 슬롯 ${targetSlotIndex + 1}에서 해제되었습니다.</span>`);
    }

    // 새로운 스킬을 대상 슬롯에 장착
    playerBase.skillSlots.slots[targetSlotIndex] = skillId;
    logCombatMessage(`<span style="color: limegreen;">[SYSTEM] ${skill.name} 스킬을 슬롯 ${targetSlotIndex + 1}에 장착했습니다.</span>`);
    renderSkillSlotManagementBar(); // UI 업데이트

    return true;
}

    export function calculateDamage(attacker, defender, attackType, playerEquipment = {}) {
        // Evasion Check
        if (defender.derived && defender.derived.evasion > 0) {
            if (Math.random() < defender.derived.evasion) {
                logCombatMessage(`${defender.name || '플레이어'}가 공격을 회피했습니다!`);
                return {damage: 0, isCritical: false, isEvaded: true};
            }
        }

        const attackerStats = attacker; // attacker는 이미 파생 스탯 객체 또는 몬스터 객체
        const defenderStats = defender; // defender는 이미 파생 스탯 객체 또는 몬스터 객체

        // 방어 로직은 그대로 유지 (attacker, defender 자체가 null/undefined일 경우 대비)
        if (!attackerStats || !defenderStats) {
            // console.error("calculateDamage: Attacker or Defender object is null/undefined. This should not happen.", { attacker, defender, attackerStats, defenderStats }); // 디버그 로그 제거
            return {damage: 0, isCritical: false, isEvaded: false};
        }

        let attack, defense;
        if (attackType === 'physical') {
            attack = attackerStats.physicalAttack || 0;
            defense = defenderStats.physicalDefense || 0;
        } else if (attackType === 'magical') {
            attack = attackerStats.magicalAttack || 0;
            defense = defenderStats.magicalDefense || 0;
        } else if (attackType === 'ranged') { // New ranged attack type
            // Use the pre-calculated rangedAttack from derived stats
            attack = attackerStats.rangedAttack || 0; // Derived rangedAttack will be used
            defense = defenderStats.physicalDefense || 0; // Ranged attacks use physical defense
            logCombatMessage(`원거리 공격!`); // For debugging/testing
        }

        // Apply Aura Defense from player's unique items if player is attacker and target is monster
        if (attacker.id === 'player' && defender.id !== 'player' && playerEquipment) {
            for (const slot in playerEquipment) {
                const item = playerEquipment[slot];
                if (item && item.isUnique && item.specialEffects) {
                    item.specialEffects.forEach(effect => {
                        if (effect.type === 'auraDefense') {
                            defense = Math.max(0, defense - effect.value);
                        }
                    });
                }
            }
        }

        // Ensure attack and defense are numbers
        attack = typeof attack === 'number' ? attack : 0;
        defense = typeof defense === 'number' ? defense : 0;


        // Critical Hit Check
        const critChance = attackerStats.critChance || 0;
        const isCritical = Math.random() < critChance;

        let baseDamage = Math.max(1, attack - defense);

        // Apply critical damage if it's a critical hit
        if (isCritical) {
            const critDamage = attackerStats.critDamage || 1.5;
            baseDamage *= critDamage;
        }

        // Apply variance
        baseDamage *= (0.9 + Math.random() * 0.2);

        // Handle elemental damage
        let elementalDamageValue = 0;
        if (attackerStats.elementalDamage) {
            for (const type in attackerStats.elementalDamage) {
                elementalDamageValue += attackerStats.elementalDamage[type];
            }
        }

        // Apply elemental damage bonus
        if (attackerStats.elementalDamageBonus > 0) {
            elementalDamageValue *= (1 + attackerStats.elementalDamageBonus);
        }

        let finalDamage = baseDamage + elementalDamageValue;
        finalDamage = Math.floor(finalDamage);

        // Lifesteal
        if (attackerStats.lifesteal > 0 && attacker.id === 'player') {
            const healedAmount = Math.floor(finalDamage * attackerStats.lifesteal);
            gameState.playerStats.base.hp = Math.min(gameState.playerStats.derived.maxHp, gameState.playerStats.base.hp + healedAmount);
            logCombatMessage(`<span style="color: mediumspringgreen;">생명력 흡수로 ${healedAmount}의 HP를 회복했습니다!</span>`);
            updateStatusDisplay(); // 메인 스탯 패널 업데이트
            updatePokemonBattlePlayerUI(); // 전투 UI의 플레이어 HP 바 업데이트
        }

        // Apply Status Effects on hit
        if (attackerStats.statusEffects && attackerStats.statusEffects.length > 0) {
            attackerStats.statusEffects.forEach(effect => {
                if (Math.random() < effect.chance) {
                    applyStatusEffect(defender, {...effect});
                }
            });
        }

        return {damage: finalDamage, isCritical: isCritical, isEvaded: false};
    }


    export function applyStatusEffect(target, effect) {
        if (!target.statusEffects) target.statusEffects = [];

        const existingEffectIndex = target.statusEffects.findIndex(e => e.type === effect.type);

        // 이름을 결정하는 로직 추가
        const entityName = (target.id === 'player') ? '플레이어' : target.name;

        if (existingEffectIndex !== -1) {
            target.statusEffects[existingEffectIndex].duration = effect.duration;
            target.statusEffects[existingEffectIndex].magnitude = Math.max(target.statusEffects[existingEffectIndex].magnitude, effect.magnitude);
            logCombatMessage(`<span style="color: yellow;">${entityName}의 ${effect.type} 효과가 갱신되었습니다!</span>`);
        } else {
            target.statusEffects.push({...effect, currentDuration: effect.duration});
            const effectName = SKILLS[effect.skillId]?.name || effect.type;

            if (effect.type === 'stun') {
                logCombatMessage(`<span style="color: orange;">${entityName}이(가) ${effectName} 효과로 기절했습니다!</span>`);
            } else {
                logCombatMessage(`<span style="color: lightcoral;">${entityName}이(가) ${effectName} 효과로 ${effect.type} 상태가 되었습니다!</span>`);
            }
        }
    }

    export function processStatusEffects(entity) {
        if (!entity.statusEffects || entity.statusEffects.length === 0) return;

        const entityName = (entity.id === 'player') ? '플레이어' : entity.name; // 이름 결정 로직 추가

        entity.statusEffects = entity.statusEffects.filter(effect => {
            if (effect.currentDuration <= 0) {
                logCombatMessage(`<span style="color: lightgray;">${entityName}의 ${effect.type} 효과가 사라졌습니다.</span>`);
                // Reset any specific effects if needed
                if (effect.type === 'stun') {
                    // Stun wears off, entity can act again
                }
                return false;
            }

            let effectDamage = 0;
            // NaN 버그 수정: 플레이어와 몬스터의 maxHp 위치가 다름
            const maxHp = (entity.id === 'player') ? entity.derived.maxHp : entity.maxHp;

            if (effect.type === 'bleed') {
                effectDamage = Math.floor(effect.magnitude * (maxHp * 0.01));
                logCombatMessage(`<span style="color: red;">${entityName}이(가) 출혈로 ${effectDamage}의 피해를 입었습니다!</span>`);
            } else if (effect.type === 'poison') {
                effectDamage = Math.floor(effect.magnitude * (maxHp * 0.005));
                logCombatMessage(`<span style="color: lightgreen;">${entityName}이(가) 중독으로 ${effectDamage}의 피해를 입었습니다!</span>`);
            } else if (effect.type === 'stun') {
                // Stun effect: entity skips turn. Handled in playerTurn/monsterTurn before action.
                // Just decrement duration here.
            }

            if (effectDamage > 0) {
                entity.hp = Math.max(0, entity.hp - effectDamage);
                if (entity.id === 'player') {
                    updateStatusDisplay();
                    updatePokemonBattlePlayerUI();
                } else {
                    updatePokemonBattleMonsterUI();
                }

                if (entity.hp <= 0) {
                    logCombatMessage(`${entityName} was defeated by ${effect.type}!`);
                    if (entity.id === 'player') gameOver();
                    else endCombat(true);
                    return false;
                }
            }

            effect.currentDuration--;
            return true;
        });
    }

    export function generateRandomItem(playerLevel, magicFind = 0, desiredRarity = null) {
        // 1. Determine Item Level
        const levelVariance = 5;
        const itemLevel = Math.max(1, playerLevel + Math.floor(Math.random() * (levelVariance * 2 + 1)) - levelVariance);

        // 2. Determine Rarity
        let rarityKey = 'common';
        if (desiredRarity && RARITY_CONFIG[desiredRarity]) {
            rarityKey = desiredRarity;
        } else {
            const totalMagicFind = magicFind + (gameState.playerStats.derived.magicFind || 0);
            const exponent = 1 / (1 + totalMagicFind / 100);
            const roll = Math.random(); // Use a roll between 0-1 for probability

            let cumulativeProb = 0;
            // Sort rarities by their probability to ensure correct cumulative probability calculation
            // The instruction says "rarity_bonus: 45" for legacy, but probability for common is 0.1, so
            // let's assume the probability here means a weight, and I need to normalize it.
            // Or assume the probabilities are already normalized to sum up to 100.
            // Given the numbers (0.1, 30, 15, 5, 3, 1.5, 0.4, 45), they sum up to ~100.
            // Let's adjust the `roll` to be between 0 and `sum of probabilities`.

            const rarityProbabilities = Object.values(RARITY_CONFIG).map(r => r.probability);
            const sumOfProbabilities = rarityProbabilities.reduce((sum, prob) => sum + prob, 0);
            const scaledRoll = roll * sumOfProbabilities;

            for (const rKey in RARITY_CONFIG) { // Iterate using for...in for original order
                cumulativeProb += RARITY_CONFIG[rKey].probability;
                if (scaledRoll < cumulativeProb) {
                    rarityKey = rKey;
                    break;
                }
            }
        }
        const rarity = RARITY_CONFIG[rarityKey];

        // 3. Create Base Item and determine if it's Unique or Set
        const slots = Object.keys(BASE_ITEMS);
        const randomSlotKey = slots[Math.floor(Math.random() * slots.length)];
        const baseItemCandidates = BASE_ITEMS[randomSlotKey];
        const baseItem = baseItemCandidates[Math.floor(Math.random() * baseItemCandidates.length)];

        let generatedItem = {
            id: `${baseItem.name.toLowerCase()}_${Date.now()}`,
            name: baseItem.name, // Will be overridden by unique/set name or combined with prefix
            level: itemLevel,
            type: 'equipment',
            slot: randomSlotKey,
            weaponType: baseItem.weaponType,
            rarity: rarityKey,
            stats: {},
            affixes: []
        };

        let isUniqueGenerated = false;
        let isSetGenerated = false;

        // Item generation probabilities
        const UNIQUE_ITEM_BASE_CHANCE = 0.75; // 75% chance for a unique if rarity is Mystic or Legacy
        const SET_ITEM_BASE_CHANCE = 0.7;    // 70% chance for a set item if rarity is Epic, Mystic, or Legacy and not unique

        // Determine if we should attempt to generate a Unique item
        if ((rarityKey === 'mystic' || rarityKey === 'legacy') && Math.random() < UNIQUE_ITEM_BASE_CHANCE) {
            const possibleUniqueItems = UNIQUE_ITEM_NAMES_BY_RARITY_AND_SLOT[rarityKey]?.[randomSlotKey];
            if (possibleUniqueItems) {
                const uniqueItemNames = Object.keys(possibleUniqueItems);
                if (uniqueItemNames.length > 0) {
                    const randomUniqueName = uniqueItemNames[Math.floor(Math.random() * uniqueItemNames.length)];
                    const uniqueItemData = possibleUniqueItems[randomUniqueName];

                    generatedItem = {
                        ...generatedItem,
                        ...uniqueItemData,
                        name: randomUniqueName,
                        rarity: rarityKey, // Ensure rarity is correct for unique item
                        isUnique: true,
                        // description will be uniqueItemData.description if it exists, otherwise generatedItem.description (from baseItem)
                        description: uniqueItemData.description || generatedItem.description,
                        color: uniqueItemData.color || rarity.color,
                        prefix: '' // Unique items have no prefixes
                    };
                    isUniqueGenerated = true;

                    // Add random affixes for unique items (1-2 additional affixes)
                    let numAdditionalAffixes;
                    if (rarityKey === 'epic' || rarityKey === 'mystic' || rarityKey === 'legacy') {
                        numAdditionalAffixes = Math.floor(Math.random() * 2) + 5; // 2 or 3 additional affixes for Epic+
                    } else {
                        numAdditionalAffixes = Math.floor(Math.random() * 2) + 4; // 1 or 2 additional affixes for others
                    }
                    const uniqueAffixPool = [...rarity.possibleAffixes]; // Copy to modify

                    for (let i = 0; i < numAdditionalAffixes && uniqueAffixPool.length > 0; i++) {
                        const affixTypeKey = uniqueAffixPool.splice(Math.floor(Math.random() * uniqueAffixPool.length), 1)[0];
                        const affixDefinition = AFFIX_TYPES[affixTypeKey];
                        const affixValues = rarity.affixValues[affixTypeKey];

                        if (affixDefinition && affixValues) {
                            const affix = {type: affixTypeKey};
                            if (affixDefinition.minMax) {
                                affix.min = Math.floor(Math.random() * (affixValues.max - affixValues.min + 1)) + affixValues.min;
                                affix.max = Math.floor(Math.random() * (affixValues.max - affixValues.min + 1)) + affixValues.min;
                                if (affix.min > affix.max) [affix.min, affix.max] = [affix.max, affix.min];
                            } else if (affixDefinition.chanceVal) {
                                affix.chance = affixValues.chance;
                                if (affixDefinition.type === 'statusEffect') {
                                    affix.magnitude = affixValues.magnitude;
                                    affix.duration = affixValues.duration;
                                    affix.effectType = affixDefinition.effectType;
                                }
                            } else {
                                affix.value = Math.random() * (affixValues.max - affixValues.min) + affixValues.min;
                                if (affixDefinition.type === 'stat') affix.value = Math.floor(affix.value);
                                else affix.value = parseFloat(affix.value.toFixed(2));
                            }

                            if (affixTypeKey === 'elementalDamage') {
                                const elementKeys = Object.keys(ELEMENTAL_TYPES);
                                const randomElementKey = elementKeys[Math.floor(Math.random() * elementKeys.length)];
                                affix.elementType = randomElementKey;
                            }
                            generatedItem.affixes.push(affix);
                        }
                    }
                }
            }
        }

        // Determine if we should attempt to generate a Set item, only if not already a Unique
        if (!isUniqueGenerated && (rarityKey === 'epic' || rarityKey === 'mystic' || rarityKey === 'legacy') && Math.random() < SET_ITEM_BASE_CHANCE) {
            // Find set pieces that match the current slot and base item name
            const possibleSetPieces = EQUIPMENT_SETS.flatMap(set =>
                set.pieces.filter(piece =>
                    piece.slot === randomSlotKey && piece.baseName === baseItem.name
                ).map(piece => ({...piece, setId: set.id, setName: set.name, setColor: set.color})) // Add set info
            );

            if (possibleSetPieces.length > 0) {
                const randomSetPiece = possibleSetPieces[Math.floor(Math.random() * possibleSetPieces.length)];

                generatedItem = {
                    ...generatedItem,
                    ...randomSetPiece,
                    name: randomSetPiece.name,
                    rarity: rarityKey, // Set item rarity is determined by the generation process
                    isSetItem: true,
                    setId: randomSetPiece.setId,
                    setName: randomSetPiece.setName,
                    // description will be randomSetPiece.description if it exists, otherwise generatedItem.description
                    description: randomSetPiece.description || generatedItem.description,
                    color: randomSetPiece.color || rarity.color, // Use set piece color or rarity color
                    prefix: '' // Set items have no prefixes
                };
                isSetGenerated = true;
            }
        }

        // If not unique or set, proceed with normal item generation (dynamic stats and affixes)
        if (!isUniqueGenerated && !isSetGenerated) {
            // 4. Calculate Dynamic Budget and Allocate Stats
            let budget = (rarity.budget * 0.5) + (itemLevel * rarity.level_multiplier);
            const possibleStats = ['strength', 'intelligence', 'agility', 'vitality', 'mentality', 'luck'];
            while (budget > 0) {
                const statToBuff = possibleStats[Math.floor(Math.random() * possibleStats.length)];
                const amount = 1 + Math.floor(Math.random() * (budget / 4));
                generatedItem.stats[statToBuff] = (generatedItem.stats[statToBuff] || 0) + amount;
                budget -= (amount * 2); // Primary stats are valuable
                if (budget < 1) break;
            }

            // 5. Generate Affixes
            if (rarity.affixSlots && rarity.affixSlots.max > 0) {
                const numAffixes = Math.floor(Math.random() * (rarity.affixSlots.max - rarity.affixSlots.min + 1)) + rarity.affixSlots.min;
                const potentialAffixes = [...rarity.possibleAffixes];

                for (let i = 0; i < numAffixes && potentialAffixes.length > 0; i++) {
                    const affixTypeKey = potentialAffixes.splice(Math.floor(Math.random() * potentialAffixes.length), 1)[0];
                    const affixDefinition = AFFIX_TYPES[affixTypeKey];
                    const affixValues = rarity.affixValues[affixTypeKey];

                    if (affixDefinition && affixValues) {
                        const affix = {type: affixTypeKey};
                        if (affixDefinition.minMax) {
                            affix.min = Math.floor(Math.random() * (affixValues.max - affixValues.min + 1)) + affixValues.min;
                            affix.max = Math.floor(Math.random() * (affixValues.max - affixValues.min + 1)) + affixValues.min;
                            if (affix.min > affix.max) [affix.min, affix.max] = [affix.max, affix.min];
                        } else if (affixDefinition.chanceVal) {
                            affix.chance = affixValues.chance;
                            if (affixDefinition.type === 'statusEffect') {
                                affix.magnitude = affixValues.magnitude;
                                affix.duration = affixValues.duration;
                                affix.effectType = affixDefinition.effectType;
                            }
                        } else {
                            affix.value = Math.random() * (affixValues.max - affixValues.min) + affixValues.min;
                            if (affixDefinition.type === 'stat') affix.value = Math.floor(affix.value);
                            else affix.value = parseFloat(affix.value.toFixed(2));
                        }

                        if (affixTypeKey === 'elementalDamage') {
                            const elementKeys = Object.keys(ELEMENTAL_TYPES);
                            const randomElementKey = elementKeys[Math.floor(Math.random() * elementKeys.length)];
                            affix.elementType = randomElementKey;
                        }
                        generatedItem.affixes.push(affix);
                    }
                }
            }

            let prefix = '';
            if (generatedItem.affixes.length > 0) {
                const firstAffix = generatedItem.affixes[0];
                let prefixKey = firstAffix.type;
                if (prefixKey === 'elementalDamage' && firstAffix.elementType) {
                    prefixKey = `elementalDamage_${firstAffix.elementType}`;
                }
                prefix = AFFIX_PREFIXES[prefixKey] || '';
            }
            generatedItem.prefix = prefix;
        }

        generatedItem.rarityName = rarity.name; // Store rarity name for tooltip

        // Ensure the item's name is set correctly based on its type
        if (generatedItem.isUnique || generatedItem.isSetItem) {
            // Name already set by unique/set logic
            // Also ensure the color is set to the item's specific color if defined, otherwise fall back to rarity color
            generatedItem.color = generatedItem.color || rarity.color;
        } else {
            // For normal items, combine prefix and base name
            generatedItem.name = `${generatedItem.prefix} ${generatedItem.name}`.trim();
            // For normal items, color is based on rarity
            generatedItem.color = rarity.color;
        }

        return generatedItem;
    }

    export function generateMonster(mapGrid) {
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
            "ZOMBIE": "좀비"
        };

        const playerLevel = gameState.playerStats.base.level;
        const isBoss = Math.random() * 100 < BOSS_CHANCE_PERCENT;

        let tierKey = 'normal';
        if (playerLevel < 5) {
            tierKey = 'normal';
        } else if (playerLevel < 10) {
            tierKey = (Math.random() < 0.7) ? 'normal' : 'elite';
        } else {
            tierKey = (Math.random() < 0.5) ? 'normal' : (Math.random() < 0.7) ? 'elite' : 'champion';
        }

        const tier = MONSTER_TIERS[tierKey];

        // Filter MONSTER_TYPES based on the current biome
        const availableMonstersInBiome = MONSTER_TYPES.filter(monster =>
            monster.biomes && monster.biomes.includes(gameState.currentBiome)
        );

        // Fallback if no biome-specific monsters are defined, or if the currentBiome is not found
        const finalMonsterPool = availableMonstersInBiome.length > 0 ? availableMonstersInBiome : MONSTER_TYPES;

        const monsterInfo = finalMonsterPool[Math.floor(Math.random() * finalMonsterPool.length)];
        const monsterType = monsterInfo.name;
        const monsterArchetype = monsterInfo.archetype;

        const translatedName = MONSTER_NAME_MAP[monsterType] || monsterType.replace(/_/g, ' ');
        const name = tier.name ? `${tier.name} ${translatedName}` : translatedName;

        const monsterLevel = isBoss ? Math.max(1, playerLevel + Math.floor(Math.random() * 8)) : Math.max(1, playerLevel + Math.floor(Math.random() * 7) - 3);
        const stats = generateMonsterStats(monsterLevel, isBoss, tier.stat_multiplier, monsterArchetype);

        const levelDiff = monsterLevel - playerLevel;
        let threatScore = levelDiff + (tier.threat_bonus || 0);
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
            tier: tierKey,
            threatColor: threatColor,
            statusEffects: []
        });
    }

    export function generateMonsterStats(level, isBoss, multiplier, archetype) {
        // Increased per-level scaling to make monsters tougher
        let baseHp = 50 + (level * 18);
        let baseAttack = 5 + (level * 3);
        let baseDefense = 2 + (level * 1.5);
        let baseSpeed = 5 + level * 0.5;
        let baseEvasion = 0;

        // Apply archetype modifications
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
                // Will be used to give monsters magical attacks later
                baseAttack *= 1.4; // For now, boost their main attack
                baseHp *= 0.85;
                baseDefense *= 0.85;
                break;
            case 'evasive':
                baseEvasion = 0.15; // 15% base evasion
                baseSpeed *= 1.2;
                baseHp *= 0.8;
                break;
            case 'glass_cannon':
                baseAttack *= 1.6;
                baseHp *= 0.7;
                baseDefense *= 0.7;
                baseSpeed *= 1.1;
                break;
            case 'elite':
                baseHp *= 1.3;
                baseAttack *= 1.3;
                baseDefense *= 1.2;
                baseSpeed *= 1.1;
                break;
            case 'standard':
            default:
                // No changes for standard archetype
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
            magicalAttack: Math.floor(variance(baseAttack * 0.8) * multiplier), // Give some MA by default
            physicalDefense: Math.floor(variance(baseDefense) * multiplier),
            magicalDefense: Math.floor(variance(baseDefense * 0.8) * multiplier),
            speed: Math.floor(variance(baseSpeed)),
            luck: Math.floor(variance(1 + level * 0.2)),
            evasion: baseEvasion, // Evasion is not randomized by variance
        };
    }

    export function gameOver() {
        alert("You have been defeated!");
        location.reload();
    }

    export function startCombat(monster) {
        gameState.isInCombat = true;
        // Initialize monster with its skills and an empty skillCooldowns object
        gameState.currentCombatMonster = {
            ...monster,
            statusEffects: [],
            skillCooldowns: {} // Initialize monster's skill cooldowns
        };

        const monsterDefinition = MONSTER_TYPES.find(m => m.name === monster.monsterType);
        if (monsterDefinition && monsterDefinition.skills) {
            monsterDefinition.skills.forEach(skillId => {
                if (MONSTER_SKILLS[skillId]) { // Ensure the skill is actually defined
                    gameState.currentCombatMonster.skillCooldowns[skillId] = 0;
                }
            });
        }

        // Hide game container, show new Pokémon battle overlay
        gameContainer.classList.add('hidden');
        pokemonBattleOverlay.classList.remove('hidden');

        // Initialize the new battle UI
        initPokemonBattleUI(monster);

        // Clear log and add initial message
        battleLog.innerHTML = '';
        logCombatMessage(`${monster.name}와 마주쳤습니다!`);

        // Determine who goes first
        if (gameState.playerStats.derived.speed >= gameState.currentCombatMonster.speed) {
            logCombatMessage("당신이 더 빠릅니다! 선공을 취합니다!");
            setCombatButtonsEnabled(true);
        } else {
            logCombatMessage("몬스터가 더 빠릅니다! 몬스터가 먼저 공격합니다!");
            setCombatButtonsEnabled(false);
            setTimeout(monsterTurn, 1000);
        }
    }

    export function endCombat(wasVictory) {
        gameState.isInCombat = false;
        try {
            if (wasVictory && gameState.currentCombatMonster) {
                const goldAmount = calculateGoldDrop(gameState.currentCombatMonster);
                gameState.playerStats.base.gold += goldAmount;
                logCombatMessage(`<span style="color: gold;">${goldAmount} 골드를 획득했습니다!</span>`);
                updateStatusDisplay();

                const monsterTierInfo = MONSTER_TIERS[gameState.currentCombatMonster.tier];
                const dropChance = ITEM_DROP_CHANCE + (monsterTierInfo.drop_rate_bonus || 0);

                if (Math.random() < dropChance) {
                    if (gameState.playerStats.inventory.length < INVENTORY_SIZE) {
                        let rarityBonus = monsterTierInfo.rarity_bonus || 0;
                        if (gameState.currentCombatMonster.isBoss) {
                            rarityBonus += 25;
                        }
                        const newItem = generateRandomItem(gameState.playerStats.base.level, rarityBonus);
                        gameState.playerStats.inventory.push(newItem);
                        logCombatMessage(`<span style="color: gold;">${gameState.currentCombatMonster.name}이(가) 아이템을 드랍했습니다: </span><span style="color:${RARITY_CONFIG[newItem.rarity].color};">${newItem.name}</span>!`);
                    } else {
                        logCombatMessage("<span style='color: lightcoral;'>인벤토리가 가득 찼습니다! 몬스터의 드랍 아이템을 잃었습니다.</span>");
                    }
                }

                if (Math.random() < TREASURE_CHEST_CHANCE) {
                    logCombatMessage("<span style='color: gold;'>보물 상자가 나타났습니다!</span>");
                    const numberOfItems = 2 + Math.floor(Math.random() * 3);

                    for (let i = 0; i < numberOfItems; i++) {
                        if (gameState.playerStats.inventory.length < INVENTORY_SIZE) {
                            const rarityBonus = 50 + Math.random() * 50;
                            const newItem = generateRandomItem(gameState.playerStats.base.level, rarityBonus);
                            gameState.playerStats.inventory.push(newItem);
                            logCombatMessage(`<span style="color: gold;">획득: </span><span style="color:${RARITY_CONFIG[newItem.rarity].color};">${newItem.name}</span>!`);
                        } else {
                            logCombatMessage("<span style='color: lightcoral;'>인벤토리가 가득 찼습니다! 보물 상자 아이템 중 일부를 잃었습니다.</span>");
                            break;
                        }
                    }
                }

                gameState.player.x = gameState.currentCombatMonster.x;
                gameState.player.y = gameState.currentCombatMonster.y;
                gameState.activeMonsters = gameState.activeMonsters.filter(m => m.id !== gameState.currentCombatMonster.id);
            } else if (!wasVictory && gameState.currentCombatMonster) { // Successful escape
                gameState.activeMonsters = gameState.activeMonsters.filter(m => m.id !== gameState.currentCombatMonster.id);
                // Optionally, log a message here if not already done in handleKeyDown
            }
        } catch (e) {
            console.error("Error during victory processing in endCombat:", e);
            logCombatMessage(`<span style="color: lightcoral;">An error occurred processing victory rewards.</span>`);
        } finally {
            gameState.isAutoAttacking = false;
            battleAutoAttackBtn.textContent = '자동 공격';
            gameState.currentCombatMonster = null;
            pokemonBattleOverlay.classList.add('hidden'); // Hide the new battle overlay
            gameContainer.classList.remove('hidden'); // Show game container
            drawGame();
        }
    }

    export function useSkill(skillSlotIndex) {
        setCombatButtonsEnabled(false); // Disable buttons while skill is processing
        processCooldowns(); // 스킬 사용 시에도 쿨다운을 감소시킵니다.

        const playerBase = gameState.playerStats.base;
        const playerDerived = gameState.playerStats.derived;
        const currentCombatMonster = gameState.currentCombatMonster;

        if (!currentCombatMonster) {
            logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] 전투 중이 아닙니다.</span>`);
            setCombatButtonsEnabled(true);
            return;
        }

        const skillId = playerBase.skillSlots.slots[skillSlotIndex];
        if (!skillId) {
            logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] 스킬 슬롯이 비어 있습니다.</span>`);
            setCombatButtonsEnabled(true);
            return;
        }

        const skill = SKILLS[skillId];
        if (!skill) {
            logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] 알 수 없는 스킬입니다: ${skillId}</span>`);
            setCombatButtonsEnabled(true);
            return;
        }
        if (skill.type !== 'active') {
            logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] 액티브 스킬이 아닙니다.</span>`);
            setCombatButtonsEnabled(true);
            return;
        }

        if (skill.type !== 'active') {
            logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] 액티브 스킬이 아닙니다.</span>`);
            setCombatButtonsEnabled(true);
            return;
        }

        // 스킬별 전제 조건 확인
        if (skill.id === "shieldBash") {
            const subWeapon = gameState.playerStats.equipment.subWeapon;
            // subWeapon이 있고, 그 아이템이 방패라고 가정 (실제로는 아이템 타입 확인 필요)
            // 임시로 subWeapon이 존재하면 방패로 간주합니다.
            if (!subWeapon || !subWeapon.name.includes('방패')) { // "방패"라는 단어를 포함하는지 확인
                logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] ${skill.name} 스킬은 방패를 장착해야 사용할 수 있습니다.</span>`);
                setCombatButtonsEnabled(true);
                return;
            }
        }
        
        const playerSkillLevel = playerBase.learnedSkills[skillId];

        // 마나 소모량 계산 (마나 소모 감소 적용)
        const skillCostValue = Array.isArray(skill.cost) ? skill.cost[playerSkillLevel - 1] : skill.cost;
        const manaCost = Math.max(0, skillCostValue * (1 - (playerDerived.manaCostReduction || 0)));

        // Mana check
        if (playerBase.mp < manaCost) {
            logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] 마나가 부족합니다! (${skill.name} 요구 마나: ${manaCost})</span>`);
            setCombatButtonsEnabled(true);
            return;
        }

        // Cooldown check
        if (gameState.skillCooldowns[skillId] && gameState.skillCooldowns[skillId] > 0) {
            logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] ${skill.name} 스킬은 재사용 대기 중입니다! (${gameState.skillCooldowns[skillId]} 턴 남음)</span>`);
            setCombatButtonsEnabled(true);
            return;
        }

        // Consume Mana
        playerBase.mp = Math.max(0, playerBase.mp - manaCost);
        // Set Cooldown
        gameState.skillCooldowns[skillId] = skill.cooldown;

        logCombatMessage(`<span style="color: deepskyblue;">[SYSTEM] ${skill.name} 스킬을 사용했습니다!</span>`);

        let skillEffectResult = skill.effect(gameState.playerStats, currentCombatMonster, playerSkillLevel);

        if (skill.id === "healing") {
            // healing 스킬은 playerStats의 hp를 직접 수정하므로 별도 처리
            // skill.effect 함수 내에서 이미 HP를 수정하도록 되어 있음.
            // 추가적인 데미지 계산 및 몬스터 HP 감소 로직 불필요.
            logCombatMessage(skillEffectResult); // healing 스킬의 메시지를 로그에 출력
        } else {
            // healing 외의 모든 공격 스킬에 대한 일반 처리
            let originalCritChance;
            if (skill.id === "precisionShot") {
                originalCritChance = playerDerived.critChance;
                playerDerived.critChance += skill.critChanceBonus[playerSkillLevel - 1];
            }

            // 스킬 계수 적용을 위한 공격력 임시 조정
            let adjustedAttackerStats = { ...playerDerived }; // playerDerived를 복사하여 사용
            let originalAdjustedAttackValue; // 임시 조정한 값을 다시 복원할 필요는 없지만, 혹시 모를 로깅을 위해 변수 선언

            if (skillEffectResult.damageCoefficient) {
                switch (skillEffectResult.damageType) {
                    case 'physical':
                        originalAdjustedAttackValue = adjustedAttackerStats.physicalAttack;
                        adjustedAttackerStats.physicalAttack = Math.floor(adjustedAttackerStats.physicalAttack * skillEffectResult.damageCoefficient);
                        break;
                    case 'magical':
                        originalAdjustedAttackValue = adjustedAttackerStats.magicalAttack;
                        adjustedAttackerStats.magicalAttack = Math.floor(adjustedAttackerStats.magicalAttack * skillEffectResult.damageCoefficient);
                        break;
                    case 'ranged':
                        originalAdjustedAttackValue = adjustedAttackerStats.rangedAttack;
                        adjustedAttackerStats.rangedAttack = Math.floor(adjustedAttackerStats.rangedAttack * skillEffectResult.damageCoefficient);
                        break;
                }
            }
            
            const { damage, isCritical } = calculateDamage(
                adjustedAttackerStats, // 임시 조정한 스탯 사용
                currentCombatMonster,
                skillEffectResult.damageType,
                gameState.playerStats.equipment
            );

            currentCombatMonster.hp -= damage;
            let critString = isCritical ? ` <span style="color: lightcoral;">(CRIT!)</span>` : '';
            logCombatMessage(`${skillEffectResult.message} ${currentCombatMonster.name}에게 ${damage}의 ${skillEffectResult.damageType} 피해를 입혔다!${critString}`);


            // precisionShot의 critChance를 원상복구
            if (skill.id === "precisionShot") {
                playerDerived.critChance = originalCritChance;
            }

            // shieldBash의 기절 효과 적용
            if (skill.id === "shieldBash") {
                applyStatusEffect(currentCombatMonster, { type: 'stun', duration: skillEffectResult.stunDuration });
            }
        }


        updateStatusDisplay();
        updatePokemonBattlePlayerUI();
        updatePokemonBattleMonsterUI(); // 몬스터의 HP 바를 업데이트하도록 추가

// After skill, check if monster was defeated
        if (currentCombatMonster.hp <= 0) {
            logCombatMessage("<span style='color: gold;'>스킬에 의해 몬스터를 물리쳤습니다!</span>");
            gainExperience(currentCombatMonster.level * XP_GAIN_MULTIPLIER);
            setTimeout(() => endCombat(true), 1000);
        } else {
            setTimeout(monsterTurn, 1000);
        }



    }

    export function playerTurn() {
        setCombatButtonsEnabled(false);
        processCooldowns(); // Decrement all cooldowns at the start of the player's turn

        // 방어 로직: currentCombatMonster가 null인 경우 턴 중단
        if (!gameState.currentCombatMonster) {
            // console.warn("playerTurn: currentCombatMonster is null. Aborting turn."); // 디버그 로그 제거
            return;
        }

        processStatusEffects(gameState.currentCombatMonster);
        if (gameState.currentCombatMonster.hp <= 0) {
            logCombatMessage("<span style='color: gold;'>몬스터가 상태 이상으로 쓰러졌습니다!</span>");
            gainExperience(gameState.currentCombatMonster.level * XP_GAIN_MULTIPLIER);
            setTimeout(() => endCombat(true), 1000);
            return;
        }

        const weapon = gameState.playerStats.equipment.mainWeapon;
        const attackType = weapon ? weapon.weaponType : 'physical'; // Default to physical if unarmed

        const {
            damage,
            isCritical
        } = calculateDamage(gameState.playerStats.derived, gameState.currentCombatMonster, attackType, gameState.playerStats.equipment);

        gameState.currentCombatMonster.hp -= damage;
        gameState.currentCombatMonster.hp = Math.max(0, gameState.currentCombatMonster.hp);

        let critString = isCritical ? ` <span style="color: lightcoral;">(치명타!)</span>` : '';
        logCombatMessage(`당신이 ${damage}의 ${attackType} 피해를 입혔습니다!${critString}`);

        updatePokemonBattleMonsterUI(); // Update new UI monster HP
        if (gameState.currentCombatMonster.hp <= 0) {
            logCombatMessage("<span style='color: gold;'>몬스터를 물리쳤습니다!</span>");
            gainExperience(gameState.currentCombatMonster.level * XP_GAIN_MULTIPLIER);
            setTimeout(() => endCombat(true), 1000);
        } else {
            setTimeout(monsterTurn, 1000);
        }
    }

    export function monsterTurn() {
        processStatusEffects(gameState.playerStats);
        if (gameState.playerStats.base.hp <= 0) {
            logCombatMessage("<span style='color: lightcoral;'>상태 이상으로 인해 쓰러졌습니다!</span>");
            setTimeout(gameOver, 1000);
            return;
        }

        const monster = gameState.currentCombatMonster;
        const playerDerived = gameState.playerStats.derived;

        // Check if monster is stunned
        const isStunned = monster.statusEffects.some(effect => effect.type === 'stun');
        if (isStunned) {
            logCombatMessage(`<span style="color: orange;">${monster.name}은(는) 기절하여 움직일 수 없습니다!</span>`);
            // Stun duration will be decremented in processStatusEffects on the next turn.
            if (gameState.isAutoAttacking) {
                setTimeout(playerTurn, 500); // Player's turn again
            } else {
                setCombatButtonsEnabled(true);
            }
            return;
        }

        // --- Monster Skill Usage ---
        const monsterTypesDefinedSkills = MONSTER_TYPES.find(mt => mt.name === monster.monsterType)?.skills || [];
        const usableSkills = monsterTypesDefinedSkills.filter(skillId => {
            const skill = MONSTER_SKILLS[skillId]; // Use MONSTER_SKILLS for monster skill definitions
            return skill && (!monster.skillCooldowns[skillId] || monster.skillCooldowns[skillId] <= 0);
        });

        if (Math.random() < MONSTER_SKILL_CHANCE && usableSkills.length > 0) {
            // Prioritize skills based on some logic (e.g., higher damage, healing when low HP)
            // For now, just pick a random usable skill
            const skillToUseId = usableSkills[Math.floor(Math.random() * usableSkills.length)];
            const skillToUse = MONSTER_SKILLS[skillToUseId]; // Ensure to get from MONSTER_SKILLS

            if (skillToUse) {
                logCombatMessage(`<span style="color: lightcoral;">${monster.name}이(가) ${skillToUse.name}을(를) 사용했습니다!</span>`);
                skillToUse.effect(monster, gameState.playerStats); // Monster's effect targets player
                monster.skillCooldowns[skillToUseId] = skillToUse.cooldown; // Set skill cooldown
                updatePokemonBattleMonsterUI(); // Update monster HP/MP if skill healed, etc.
                updatePokemonBattlePlayerUI(); // Update player HP/MP if skill damaged, etc.

                if (gameState.playerStats.base.hp <= 0) {
                    logCombatMessage("<span style='color: lightcoral;'>몬스터 스킬에 의해 쓰러졌습니다!</span>");
                    setTimeout(gameOver, 1000);
                    return;
                }
                // If the monster used a skill, its turn ends.
                if (gameState.isAutoAttacking) {
                    setTimeout(playerTurn, 1000);
                } else {
                    setCombatButtonsEnabled(true);
                }
                return;
            }
        }

        // --- Monster Normal Attack (Fallback) ---
        const {
            damage,
            isCritical
        } = calculateDamage(monster, playerDerived, 'physical', gameState.playerStats.equipment);

        gameState.playerStats.base.hp -= damage;
        gameState.playerStats.base.hp = Math.max(0, gameState.playerStats.base.hp);

        let critString = isCritical ? ` <span style="color: lightcoral;">(치명타!)</span>` : '';
        logCombatMessage(`몬스터가 ${damage}의 피해를 입혔습니다!${critString}`);

        updatePokemonBattlePlayerUI(); // Update new UI player HP
        updateStatusDisplay();
        if (gameState.playerStats.base.hp <= 0) {
            logCombatMessage("<span style='color: lightcoral;'>쓰러졌습니다!</span>");
            setTimeout(gameOver, 1000);
        } else {
            if (gameState.isAutoAttacking) {
                setTimeout(playerTurn, 500); // Continue auto-attack loop
            } else {
                setCombatButtonsEnabled(true);
            }
        }
    }

    export function toggleAutoAttack() {
        gameState.isAutoAttacking = !gameState.isAutoAttacking;
        // setCombatButtonsEnabled(false); // Removed: playerTurn will disable attack/run buttons

        if (gameState.isAutoAttacking) {
            battleAutoAttackBtn.textContent = '자동 공격 중...';
            playerTurn(); // Start the auto-attack loop
        } else {
            battleAutoAttackBtn.textContent = '자동 공격';
            setCombatButtonsEnabled(true); // Re-enable buttons if auto-attack is stopped manually
        }
    }

    export function processCooldowns() {
        // Player skill cooldowns
        for (const skillId in gameState.skillCooldowns) {
            if (gameState.skillCooldowns[skillId] > 0) {
                gameState.skillCooldowns[skillId]--;
                if (gameState.skillCooldowns[skillId] === 0) {
                    logCombatMessage(`<span style="color: lightgray;">[SYSTEM] ${SKILLS[skillId].name} 스킬의 재사용 대기 시간이 끝났습니다.</span>`);
                }
            }
        }

        // Monster skill cooldowns
        if (gameState.currentCombatMonster && gameState.currentCombatMonster.skillCooldowns) {
            for (const skillId in gameState.currentCombatMonster.skillCooldowns) {
                if (gameState.currentCombatMonster.skillCooldowns[skillId] > 0) {
                    gameState.currentCombatMonster.skillCooldowns[skillId]--;
                }
            }
        }

        // Update the UI to reflect new cooldowns
        // (This would typically trigger a re-render of the combat skill bar in ui.js)
        updatePokemonBattlePlayerUI(); // This function already calls renderCombatSkillBar()
    }

// Removed showLevelUpModal and hideLevelUpModal as they are no longer used.

// Merchant logic


    export function openMerchantUI() {
        gameState.isUiVisible = true;
        merchantOverlayElement.classList.remove('hidden');
        renderMerchantStock(gameState.wanderingMerchant.stock, buyItem, showMerchantItemTooltip);
        renderPlayerSellInventory(gameState.playerStats.inventory, sellItem, showPlayerSellTooltip);
        updateMerchantPlayerGoldDisplay();
    }

    export function closeMerchantUI() {
        gameState.isUiVisible = false;
        merchantOverlayElement.classList.add('hidden');
        gameState.wanderingMerchant = null;
        hideItemTooltip(); // Ensure tooltip is hidden when merchant window closes
        drawGame(); // Call drawGame from map.js or main.js
    }

    export function buyItem(item, merchantItemIndex) {
        if (gameState.playerStats.base.gold >= item.price) {
            if (gameState.playerStats.inventory.length < INVENTORY_SIZE) {
                gameState.playerStats.base.gold -= item.price;
                const newItem = {...item};
                delete newItem.price; // The price is a merchant-specific thing

                gameState.playerStats.inventory.push(newItem);
                gameState.wanderingMerchant.stock.splice(merchantItemIndex, 1);

                logCombatMessage(`<span style="color: mediumspringgreen;">${item.name}을(를) ${item.price} 골드에 구매했습니다.</span>`);

                // Re-render the merchant's stock to show the item has been removed
                renderMerchantStock(gameState.wanderingMerchant.stock, buyItem, showMerchantItemTooltip);
            } else {
                logCombatMessage("<span style='color: red;'>인벤토리가 가득 찼습니다! 아이템을 구매할 수 없습니다.</span>");
            }
        } else {
            logCombatMessage("<span style='color: lightcoral;'>골드가 부족합니다!</span>");
        }
        updateStatusDisplay();
        renderPlayerSellInventory(gameState.playerStats.inventory, sellItem, showPlayerSellTooltip);
        updateMerchantPlayerGoldDisplay();
    }

    export function sellItem(itemIndex) {
        const item = gameState.playerStats.inventory[itemIndex];
        if (!item) return;

        const sellPrice = calculateSellPrice(item);
        gameState.playerStats.base.gold += sellPrice;
        gameState.playerStats.inventory.splice(itemIndex, 1);
        logCombatMessage(`<span style="color: mediumspringgreen;">${item.name}을(를) ${sellPrice} 골드에 판매했습니다.</span>`);

        updateStatusDisplay();
        renderPlayerSellInventory(gameState.playerStats.inventory, sellItem, showPlayerSellTooltip);
        updateMerchantPlayerGoldDisplay();
    }

    export function calculateSellPrice(item) {
        let price = 0;
        if (item.rarity && RARITY_CONFIG[item.rarity]) {
            price = RARITY_CONFIG[item.rarity].budget * 2;
        } else if (item.price) {
            price = item.price;
        } else {
            price = 10;
        }
        return Math.floor(price / 2);
    }

    export function showMerchantItemTooltip(event, item) {
        let tooltipContent = createTooltipContent(item, 'Item');
        tooltipContent = tooltipContent.replace('</div>', `<div>Price: ${item.price} Gold</div><div>${item.description || ''}</div></div>`);

        itemTooltipElement.innerHTML = tooltipContent;
        itemTooltipElement.classList.remove('hidden');
        itemTooltipElement.style.opacity = 1;
        itemTooltipElement.style.left = event.pageX + 15 + 'px';
        itemTooltipElement.style.top = event.pageY + 15 + 'px';
    }

    export function showPlayerSellTooltip(event, item) {
        const sellPrice = calculateSellPrice(item);
        let tooltipContent = createTooltipContent(item, 'Item');
        tooltipContent = tooltipContent.replace('</div>', `<div>Sell Price: ${sellPrice} Gold</div></div>`);

        itemTooltipElement.innerHTML = tooltipContent;
        itemTooltipElement.classList.remove('hidden');
        itemTooltipElement.style.opacity = 1;
        itemTooltipElement.style.left = event.pageX + 15 + 'px';
        itemTooltipElement.style.top = event.pageY + 15 + 'px';
    }

    export function setCombatButtonsEnabled(enabled) {
        battleAttackBtn.disabled = !enabled;
        // battleAutoAttackBtn.disabled = !enabled; // Auto-attack button should always be enabled to toggle
        battleRunAwayBtn.disabled = !enabled;
    }