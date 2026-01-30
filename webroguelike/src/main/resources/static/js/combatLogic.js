import { gameState } from './gameState.js';
import { MONSTER_TIERS, MONSTER_TYPES } from './monsterConstants.js';
import { RARITY_CONFIG, AFFIX_TYPES, ELEMENTAL_TYPES } from './itemConstants.js';
import { ITEM_DROP_CHANCE, TREASURE_CHEST_CHANCE, INVENTORY_SIZE, XP_GAIN_MULTIPLIER } from './gameSettings.js';
import { SKILLS, MONSTER_SKILLS } from './skills.js';
import {
    logCombatMessage, updateStatusDisplay, initPokemonBattleUI, updatePokemonBattlePlayerUI, updatePokemonBattleMonsterUI, drawGame
} from './ui.js';
import { gameContainer, pokemonBattleOverlay, battleAttackBtn, battleAutoAttackBtn, battleRunAwayBtn } from './domElements.js';
import { calculateGoldDrop } from './monsterGenerationLogic.js';
import { generateRandomItem } from './itemManagement.js';
import { gameOver } from './gameOverLogic.js';
import { gainExperience, recalculateDerivedStats } from './playerProgression.js';
import { applyActionEffect } from './effectRules.js'; // Import applyActionEffect

const MONSTER_SKILL_CHANCE = 0.3; // 30% chance for a monster to use a skill if available

export function calculateDamage(attacker, defender, attackType, playerEquipment = {}) {
    if (defender.derived && defender.derived.evasion > 0) {
        if (Math.random() < defender.derived.evasion) {
            logCombatMessage(`${defender.name || '플레이어'}가 공격을 회피했습니다!`);
            return {damage: 0, isCritical: false, isEvaded: true};
        }
    }

    const attackerStats = attacker;
    const defenderStats = defender;

    if (!attackerStats || !defenderStats) {
        return {damage: 0, isCritical: false, isEvaded: false};
    }

    let attack, defense;
    if (attackType === 'physical') {
        attack = attackerStats.physicalAttack || 0;
        defense = defenderStats.physicalDefense || 0;
    } else if (attackType === 'magical') {
        attack = attackerStats.magicalAttack || 0;
        defense = defenderStats.magicalDefense || 0;
    } else if (attackType === 'ranged') {
        attack = attackerStats.rangedAttack || 0;
        defense = defenderStats.physicalDefense || 0;
        logCombatMessage(`원거리 공격!`);
    }

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

    attack = typeof attack === 'number' ? attack : 0;
    defense = typeof defense === 'number' ? defense : 0;

    const critChance = attackerStats.critChance || 0;
    const isCritical = Math.random() < critChance;

    let baseDamage = Math.max(1, attack - defense);

    if (isCritical) {
        const critDamage = attackerStats.critDamage || 1.5;
        baseDamage *= critDamage;
    }

    baseDamage *= (0.9 + Math.random() * 0.2);

    let elementalDamageValue = 0;
    if (attackerStats.elementalDamage) {
        for (const type in attackerStats.elementalDamage) {
            elementalDamageValue += attackerStats.elementalDamage[type];
        }
    }

    if (attackerStats.elementalDamageBonus > 0) {
        elementalDamageValue *= (1 + attackerStats.elementalDamageBonus);
    }

    let finalDamage = baseDamage + elementalDamageValue;
    finalDamage = Math.floor(finalDamage);

    if (attackerStats.lifesteal > 0 && attacker.id === 'player') {
        const healedAmount = Math.floor(finalDamage * attackerStats.lifesteal);
        gameState.playerStats.base.hp = Math.min(gameState.playerStats.derived.maxHp, gameState.playerStats.base.hp + healedAmount);
        logCombatMessage(`<span style="color: mediumspringgreen;">생명력 흡수로 ${healedAmount}의 HP를 회복했습니다!</span>`);
        updateStatusDisplay();
        updatePokemonBattlePlayerUI();
    }

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

    const entityName = (target.derived && target.derived.id === 'player') ? '플레이어' : target.name;

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

    const entityName = (entity.id === 'player') ? '플레이어' : (entity.name || entity.monsterType || '알 수 없는 존재');

    entity.statusEffects = entity.statusEffects.filter(effect => {
        if (effect.currentDuration <= 0) {
            logCombatMessage(`<span style="color: lightgray;">${entityName}의 ${effect.type} 효과가 사라졌습니다.</span>`);
            if (effect.type === 'stun') {
            }
            return false;
        }

        let effectDamage = 0;
        // maxHp가 유효한 숫자인지 확인하고, 그렇지 않으면 기본값 1을 사용합니다.
        const maxHp = (entity.id === 'player') ? (entity.derived?.maxHp || 1) : (entity.maxHp || 1); 

        if (effect.type === 'bleed') {
            effectDamage = Math.floor(effect.magnitude * (maxHp * 0.01));
            logCombatMessage(`<span style="color: red;">${entityName}이(가) 출혈로 ${effectDamage}의 피해를 입었습니다!</span>`);
        } else if (effect.type === 'poison') {
            effectDamage = Math.floor(effect.magnitude * (maxHp * 0.005));
            logCombatMessage(`<span style="color: lightgreen;">${entityName}이(가) 중독으로 ${effectDamage}의 피해를 입었습니다!</span>`);
        } else if (effect.type === 'stun') {
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

export function startCombat(monster) {
    gameState.isInCombat = true;
    gameState.currentCombatMonster = {
        ...monster,
        statusEffects: [],
        skillCooldowns: {}
    };

    const monsterDefinition = MONSTER_TYPES.find(m => m.name === monster.monsterType);
    if (monsterDefinition && monsterDefinition.skills) {
        monsterDefinition.skills.forEach(skillId => {
            if (MONSTER_SKILLS[skillId]) {
                gameState.currentCombatMonster.skillCooldowns[skillId] = 0;
            }
        });
    }

    gameContainer.classList.add('hidden');
    pokemonBattleOverlay.classList.remove('hidden');

    initPokemonBattleUI(monster);

    battleLog.innerHTML = '';
    logCombatMessage(`${monster.name}와 마주쳤습니다!`);

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
            applyActionEffect({type: 'KILL_MONSTER', monsterType: gameState.currentCombatMonster.monsterType});
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
        } else if (!wasVictory && gameState.currentCombatMonster) {
            gameState.activeMonsters = gameState.activeMonsters.filter(m => m.id !== gameState.currentCombatMonster.id);
        }
    } catch (e) {
        console.error("Error during victory processing in endCombat:", e);
        logCombatMessage(`<span style="color: lightcoral;">An error occurred processing victory rewards.</span>`);
    } finally {
        gameState.isAutoAttacking = false;
        battleAutoAttackBtn.textContent = '자동 공격';
        gameState.currentCombatMonster = null;
        pokemonBattleOverlay.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        drawGame();
    }
}

export function useSkill(skillSlotIndex) {
    setCombatButtonsEnabled(false);

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

    if (skill.id === "shieldBash") {
        const subWeapon = gameState.playerStats.equipment.subWeapon;
        if (!subWeapon || !subWeapon.name.includes('방패')) {
            logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] ${skill.name} 스킬은 방패를 장착해야 사용할 수 있습니다.</span>`);
            setCombatButtonsEnabled(true);
            return;
        }
    }
    
    const playerSkillLevel = playerBase.learnedSkills[skillId];

    const skillCostValue = Array.isArray(skill.cost) ? skill.cost[playerSkillLevel - 1] : skill.cost;
    const manaCost = Math.max(0, skillCostValue * (1 - (playerDerived.manaCostReduction || 0)));

    if (playerBase.mp < manaCost) {
        logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] 마나가 부족합니다! (${skill.name} 요구 마나: ${manaCost})</span>`);
        setCombatButtonsEnabled(true);
        return;
    }

    if (gameState.skillCooldowns[skillId] && gameState.skillCooldowns[skillId] > 0) {
        logCombatMessage(`<span style="color: lightcoral;">[SYSTEM] ${skill.name} 스킬은 재사용 대기 중입니다! (${gameState.skillCooldowns[skillId]} 턴 남음)</span>`);
        setCombatButtonsEnabled(true);
        return;
    }

    playerBase.mp = Math.max(0, playerBase.mp - manaCost);
    // Set Cooldown
    gameState.skillCooldowns[skillId] = skill.cooldown;

    // Apply action effect for skill usage
    applyActionEffect({type: 'USE_SKILL', skill: skill});

    logCombatMessage(`<span style="color: deepskyblue;">[SYSTEM] ${skill.name} 스킬을 사용했습니다!</span>`);

    let skillEffectResult = skill.effect(gameState.playerStats, currentCombatMonster, playerSkillLevel);

    if (skill.id === "healing") {
        logCombatMessage(skillEffectResult);
    } else {
        let originalCritChance;
        if (skill.id === "precisionShot") {
            originalCritChance = playerDerived.critChance;
            playerDerived.critChance += skill.critChanceBonus[playerSkillLevel - 1];
        }

        let adjustedAttackerStats = { ...playerDerived };
        let originalAdjustedAttackValue;

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
            adjustedAttackerStats,
            currentCombatMonster,
            skillEffectResult.damageType,
            gameState.playerStats.equipment
        );

        currentCombatMonster.hp -= damage;
        let critString = isCritical ? ` <span style="color: lightcoral;">(CRIT!)</span>` : '';
        logCombatMessage(`${skillEffectResult.message} ${currentCombatMonster.name}에게 ${damage}의 ${skillEffectResult.damageType} 피해를 입혔다!${critString}`);

        if (skill.id === "precisionShot") {
            playerDerived.critChance = originalCritChance;
        }

        if (skill.id === "shieldBash") {
            applyStatusEffect(currentCombatMonster, { type: 'stun', duration: skillEffectResult.stunDuration });
        }
    }

    updateStatusDisplay();
    updatePokemonBattlePlayerUI();
    updatePokemonBattleMonsterUI();

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

    if (!gameState.currentCombatMonster) {
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
    const attackType = weapon ? weapon.weaponType : 'physical';

    const {
        damage,
        isCritical
    } = calculateDamage(gameState.playerStats.derived, gameState.currentCombatMonster, attackType, gameState.playerStats.equipment);

    gameState.currentCombatMonster.hp -= damage;
    gameState.currentCombatMonster.hp = Math.max(0, gameState.currentCombatMonster.hp);

    let critString = isCritical ? ` <span style="color: lightcoral;">(치명타!)</span>` : '';
    logCombatMessage(`당신이 ${damage}의 ${attackType} 피해를 입혔습니다!${critString}`);

    updatePokemonBattleMonsterUI();
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

    const isStunned = monster.statusEffects.some(effect => effect.type === 'stun');
    if (isStunned) {
        logCombatMessage(`<span style="color: orange;">${monster.name}은(는) 기절하여 움직일 수 없습니다!</span>`);
        if (gameState.isAutoAttacking) {
            setTimeout(playerTurn, 500);
        } else {
            setCombatButtonsEnabled(true);
        }
        return;
    }

    const monsterTypesDefinedSkills = MONSTER_TYPES.find(mt => mt.name === monster.monsterType)?.skills || [];
    const usableSkills = monsterTypesDefinedSkills.filter(skillId => {
        const skill = MONSTER_SKILLS[skillId];
        return skill && (!monster.skillCooldowns[skillId] || monster.skillCooldowns[skillId] <= 0);
    });

    if (Math.random() < MONSTER_SKILL_CHANCE && usableSkills.length > 0) {
        const skillToUseId = usableSkills[Math.floor(Math.random() * usableSkills.length)];
        const skillToUse = MONSTER_SKILLS[skillToUseId];

        if (skillToUse) {
            logCombatMessage(`<span style="color: lightcoral;">${monster.name}이(가) ${skillToUse.name}을(를) 사용했습니다!</span>`);
            skillToUse.effect(monster, gameState.playerStats);
            monster.skillCooldowns[skillToUseId] = skillToUse.cooldown;
            updatePokemonBattleMonsterUI();
            updatePokemonBattlePlayerUI();

            if (gameState.playerStats.base.hp <= 0) {
                logCombatMessage("<span style='color: lightcoral;'>몬스터 스킬에 의해 쓰러졌습니다!</span>");
                setTimeout(gameOver, 1000);
                return;
            }
            if (gameState.isAutoAttacking) {
                setTimeout(playerTurn, 1000);
            } else {
                setCombatButtonsEnabled(true);
            }
            return;
        }
    }

    const {
        damage,
        isCritical
    } = calculateDamage(monster, playerDerived, 'physical', gameState.playerStats.equipment);

    gameState.playerStats.base.hp -= damage;
    gameState.playerStats.base.hp = Math.max(0, gameState.playerStats.base.hp);

    let critString = isCritical ? ` <span style="color: lightcoral;">(치명타!)</span>` : '';
    logCombatMessage(`몬스터가 ${damage}의 피해를 입혔습니다!${critString}`);

    updatePokemonBattlePlayerUI();
    updateStatusDisplay();
    if (gameState.playerStats.base.hp <= 0) {
        logCombatMessage("<span style='color: lightcoral;'>쓰러졌습니다!</span>");
        setTimeout(gameOver, 1000);
    } else {
        if (gameState.isAutoAttacking) {
            setTimeout(playerTurn, 500);
        } else {
            setCombatButtonsEnabled(true);
        }
    }
    processCooldowns();
}

export function toggleAutoAttack() {
    gameState.isAutoAttacking = !gameState.isAutoAttacking;
    if (gameState.isAutoAttacking) {
        battleAutoAttackBtn.textContent = '자동 공격 중...';
        playerTurn();
    } else {
        battleAutoAttackBtn.textContent = '자동 공격';
        setCombatButtonsEnabled(true);
    }
}

export function processCooldowns() {
    for (const skillId in gameState.skillCooldowns) {
        if (gameState.skillCooldowns[skillId] > 0) {
            gameState.skillCooldowns[skillId]--;
            if (gameState.skillCooldowns[skillId] === 0) {
                logCombatMessage(`<span style="color: lightgray;">[SYSTEM] ${SKILLS[skillId].name} 스킬의 재사용 대기 시간이 끝났습니다.</span>`);
            }
        }
    }

    if (gameState.currentCombatMonster && gameState.currentCombatMonster.skillCooldowns) {
        for (const skillId in gameState.currentCombatMonster.skillCooldowns) {
            if (gameState.currentCombatMonster.skillCooldowns[skillId] > 0) {
                gameState.currentCombatMonster.skillCooldowns[skillId]--;
            }
        }
    }

    updatePokemonBattlePlayerUI();
}

export function setCombatButtonsEnabled(enabled) {
    battleAttackBtn.disabled = !enabled;
    battleRunAwayBtn.disabled = !enabled;
}