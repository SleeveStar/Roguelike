import { gameState } from './gameState.js';
import { INVENTORY_SIZE } from './gameSettings.js';
import { RARITY_CONFIG, BASE_ITEMS, AFFIX_TYPES, ELEMENTAL_TYPES, AFFIX_PREFIXES, UNIQUE_ITEM_NAMES_BY_RARITY_AND_SLOT, EQUIPMENT_SETS } from './itemConstants.js';
import {
    logCombatMessage, renderBagGrid, renderEquipment, renderSidePanelEquipment,
    hideItemTooltip, updateStatusDisplay, createTooltipContent
} from './ui.js';
import { bagGridElement, itemTooltipElement } from './domElements.js';
import { recalculateDerivedStats } from './playerProgression.js';

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

export function generateRandomItem(playerLevel, magicFind = 0, desiredRarity = null) {
    const levelVariance = 5;
    const itemLevel = Math.max(1, playerLevel + Math.floor(Math.random() * (levelVariance * 2 + 1)) - levelVariance);

    let rarityKey = 'common';
    if (desiredRarity && RARITY_CONFIG[desiredRarity]) {
        rarityKey = desiredRarity;
    } else {
        const totalMagicFind = magicFind + (gameState.playerStats.derived.magicFind || 0);
        const exponent = 1 / (1 + totalMagicFind / 100);
        const roll = Math.random();

        let cumulativeProb = 0;
        const rarityProbabilities = Object.values(RARITY_CONFIG).map(r => r.probability);
        const sumOfProbabilities = rarityProbabilities.reduce((sum, prob) => sum + prob, 0);
        const scaledRoll = roll * sumOfProbabilities;

        for (const rKey in RARITY_CONFIG) {
            cumulativeProb += RARITY_CONFIG[rKey].probability;
            if (scaledRoll < cumulativeProb) {
                rarityKey = rKey;
                break;
            }
        }
    }
    const rarity = RARITY_CONFIG[rarityKey];

    const slots = Object.keys(BASE_ITEMS);
    const randomSlotKey = slots[Math.floor(Math.random() * slots.length)];
    const baseItemCandidates = BASE_ITEMS[randomSlotKey];
    const baseItem = baseItemCandidates[Math.floor(Math.random() * baseItemCandidates.length)];

    let generatedItem = {
        id: `${baseItem.name.toLowerCase()}_${Date.now()}`,
        name: baseItem.name,
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

    const UNIQUE_ITEM_BASE_CHANCE = 0.75;
    const SET_ITEM_BASE_CHANCE = 0.7;

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
                    rarity: rarityKey,
                    isUnique: true,
                    description: uniqueItemData.description || generatedItem.description,
                    color: uniqueItemData.color || rarity.color,
                    prefix: ''
                };
                isUniqueGenerated = true;

                let numAdditionalAffixes;
                if (rarityKey === 'epic' || rarityKey === 'mystic' || rarityKey === 'legacy') {
                    numAdditionalAffixes = Math.floor(Math.random() * 2) + 5;
                } else {
                    numAdditionalAffixes = Math.floor(Math.random() * 2) + 4;
                }
                const uniqueAffixPool = [...rarity.possibleAffixes];

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

    if (!isUniqueGenerated && (rarityKey === 'epic' || rarityKey === 'mystic' || rarityKey === 'legacy') && Math.random() < SET_ITEM_BASE_CHANCE) {
        const possibleSetPieces = EQUIPMENT_SETS.flatMap(set =>
            set.pieces.filter(piece =>
                piece.slot === randomSlotKey && piece.baseName === baseItem.name
            ).map(piece => ({...piece, setId: set.id, setName: set.name, setColor: set.color}))
        );

        if (possibleSetPieces.length > 0) {
            const randomSetPiece = possibleSetPieces[Math.floor(Math.random() * possibleSetPieces.length)];

            generatedItem = {
                ...generatedItem,
                ...randomSetPiece,
                name: randomSetPiece.name,
                rarity: rarityKey,
                isSetItem: true,
                setId: randomSetPiece.setId,
                setName: randomSetPiece.setName,
                description: randomSetPiece.description || generatedItem.description,
                color: randomSetPiece.color || rarity.color,
                prefix: ''
            };
            isSetGenerated = true;
        }
    }

    if (!isUniqueGenerated && !isSetGenerated) {
        let budget = (rarity.budget * 0.5) + (itemLevel * rarity.level_multiplier);
        const possibleStats = ['strength', 'intelligence', 'agility', 'vitality', 'mentality', 'luck'];
        while (budget > 0) {
            const statToBuff = possibleStats[Math.floor(Math.random() * possibleStats.length)];
            const amount = 1 + Math.floor(Math.random() * (budget / 4));
            generatedItem.stats[statToBuff] = (generatedItem.stats[statToBuff] || 0) + amount;
            budget -= (amount * 2);
            if (budget < 1) break;
        }

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

    generatedItem.rarityName = rarity.name;

    if (generatedItem.isUnique || generatedItem.isSetItem) {
        generatedItem.color = generatedItem.color || rarity.color;
    } else {
        generatedItem.name = `${generatedItem.prefix} ${generatedItem.name}`.trim();
        generatedItem.color = rarity.color;
    }

    return generatedItem;
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
