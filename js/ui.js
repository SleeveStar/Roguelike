// ui.js
import { gameState } from './gameState.js';
import { 
    ctx, inventoryOverlayElement, itemTooltipElement, 
    merchantOverlayElement, merchantStockGridElement, playerSellGridElement, 
    merchantPlayerGoldAmountElement, gameCanvas, allocateButtons, eqSlotElements, 
    levelUpModal, sidePanelEquipment, infoLogElement,
    // New Battle UI elements
    battleLog, battleMonsterName, battleMonsterLevel, battleMonsterHpBar,
    battleMonsterHp, battleMonsterMaxHp, battleMonsterSprite, battlePlayerName,
    battlePlayerLevel, battlePlayerHpBar, battlePlayerHp, battlePlayerMaxHp,
    battlePlayerMpBar, battlePlayerMp, battlePlayerMaxMp, battlePlayerSprite,
    // Pagination Elements
    prevPageBtn, pageNumberDisplay, nextPageBtn
} from './domElements.js';
import { TILE_SIZE, RARITY_CONFIG, AFFIX_TYPES, INVENTORY_SIZE, EQUIPMENT_SETS, BIOMES } from './constants.js';
import { playerImage, goldIconImage, healingBlockImage, monsterImageCache, tileImageCache, getCurrentActiveTileSet } from './imageLoader.js';

export function initUI() {
    // This function can be used for any other UI initialization that doesn't fit into other exports.
    // DOM elements are now directly imported and used.
    eqSlotElements.forEach(slot => {
        slot.dataset.defaultText = slot.textContent;
    });
    renderSidePanelEquipment(); // Initial render

    // Pagination Event Listeners
    prevPageBtn.addEventListener('click', prevPage);
    nextPageBtn.addEventListener('click', nextPage);
}

// Pagination functions
export function updatePaginationControls() {
    const totalPages = Math.ceil(gameState.playerStats.inventory.length / gameState.playerStats.itemsPerPage);
    pageNumberDisplay.textContent = `${gameState.playerStats.currentPage} / ${totalPages}`;

    prevPageBtn.disabled = gameState.playerStats.currentPage <= 1;
    nextPageBtn.disabled = gameState.playerStats.currentPage >= totalPages;
}

export function goToPage(pageNumber) {
    const totalPages = Math.ceil(gameState.playerStats.inventory.length / gameState.playerStats.itemsPerPage);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
        gameState.playerStats.currentPage = pageNumber;
        renderBagGrid(bagGridElement, gameState.playerStats.inventory, false); // Re-render bag grid for the new page
    }
}

export function nextPage() {
    goToPage(gameState.playerStats.currentPage + 1);
}

export function prevPage() {
    goToPage(gameState.playerStats.currentPage - 1);
}

export function renderSidePanelEquipment() {
    sidePanelEquipment.innerHTML = '';
    const equipment = gameState.playerStats.equipment;
    const slotKorean = {
        hat: '모자', neck: '목걸이', shoulder: '어깨', mainWeapon: '주무기', chest: '상의',
        subWeapon: '보조무기', wrist: '손목', legs: '하의', ring1: '반지1', ring2: '반지2', feet: '신발'
    };

    for (const slot in equipment) {
        const item = equipment[slot];
        const itemDiv = document.createElement('div');
        itemDiv.className = 'equipped-item-display';

        const slotName = slotKorean[slot] || slot;
        
        if (item) {
            let itemName = item.name;
            if (item.isUnique) {
                itemName += ' (고유)';
            } else if (item.isSetItem) {
                itemName += ' (세트)';
            }
            itemDiv.innerHTML = `<span class="slot">${slotName}:</span> <span style="color: ${item.color || RARITY_CONFIG[item.rarity]?.color || '#fff'}">${itemName}</span>`;
        } else {
            itemDiv.innerHTML = `<span class="slot">${slotName}:</span> <span style="color: #666;">(없음)</span>`;
        }
        sidePanelEquipment.appendChild(itemDiv);
    }

    // Display active set bonuses
    if (gameState.playerStats.derived.setBonuses && gameState.playerStats.derived.setBonuses.length > 0) {
        const setBonusTitle = document.createElement('div');
        setBonusTitle.className = 'set-bonus-title';
        setBonusTitle.textContent = '활성 세트 보너스:';
        sidePanelEquipment.appendChild(setBonusTitle);

        const displayedSetBonuses = new Set(); // To avoid displaying the same set bonus multiple times

        gameState.playerStats.derived.setBonuses.forEach(setBonus => {
            const displayKey = `${setBonus.setId}-${setBonus.count}`;
            if (!displayedSetBonuses.has(displayKey)) {
                const setBonusDiv = document.createElement('div');
                setBonusDiv.className = 'set-bonus-item';
                setBonusDiv.style.color = setBonus.color || '#fff'; // Use set's color or default
                setBonusDiv.textContent = `${setBonus.setName} (${setBonus.count}세트): ${setBonus.special.description || setBonus.special.type}`; // Placeholder description
                sidePanelEquipment.appendChild(setBonusDiv);
                displayedSetBonuses.add(displayKey);
            }
        });
    }
}

export function logCombatMessage(message) {
    const p = document.createElement('p');
    p.innerHTML = message;
    
    // Append to both logs
    infoLogElement.appendChild(p.cloneNode(true));
    // Ensure scroll to bottom after DOM update
    setTimeout(() => {
        infoLogElement.scrollTop = infoLogElement.scrollHeight;
    }, 0); // Use setTimeout with 0 delay to defer until after current call stack clears

    battleLog.appendChild(p);
    // Ensure scroll to bottom after DOM update
    setTimeout(() => {
        battleLog.scrollTop = battleLog.scrollHeight;
    }, 0); // Use setTimeout with 0 delay to defer until after current call stack clears
}

export function clearCanvas() {
    const currentBiomeInfo = BIOMES[gameState.currentBiome];
    ctx.fillStyle = currentBiomeInfo ? currentBiomeInfo.baseColor : '#2e391b'; // Use biome base color
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height); // Fill the entire canvas
}

export function drawMap() {
    const activeTileSet = getCurrentActiveTileSet();
    if (!gameState.mapGrid || gameState.mapGrid.length === 0 || !activeTileSet) {
        return;
    }

    const defaultFallbackTileName = activeTileSet.walkableTileNames[0] || Object.values(activeTileSet.TILE_TYPES)[0];

    for (let y = 0; y < gameState.mapGrid.length; y++) {
        for (let x = 0; x < gameState.mapGrid[y].length; x++) {
            const tile = gameState.mapGrid[y][x];
            const tileName = tile ? tile.name : defaultFallbackTileName; // Fallback to a default walkable tile

            // Get properties for the specific tile
            const tileProps = activeTileSet.TILE_PROPERTIES[tileName];
            
            // If the tile is not defined or is meant to be a background tile, skip drawing.
            // This allows the clearCanvas color to show through.
            if (!tileProps || tileName === defaultFallbackTileName) { // Skip drawing if it's the generic background tile
                 // Check if the tile exists in TILE_PROPERTIES, if not it's invalid
                 if (!tileProps) {
                    console.warn(`Tile ${tileName} not found in TILE_PROPERTIES for ${gameState.currentBiome} biome.`);
                 }
                continue; 
            }

            // Only attempt to draw if there's an actual tile name
            if (tileName) { 
                const image = tileImageCache[tileName];
                const posX = x * TILE_SIZE;
                const posY = y * TILE_SIZE;

                if (image && image.naturalHeight !== 0) {
                    // console.log(`Drawing tile ${tileName}. Image: `, image, ` Natural Height: ${image.naturalHeight}`);
                    // Apply transparency if specified in tile properties
                    if (tileProps.drawTransparency) {
                        ctx.globalAlpha = tileProps.drawTransparency;
                    }
                    ctx.drawImage(image, posX, posY, TILE_SIZE, TILE_SIZE);
                    // Reset globalAlpha after drawing the transparent image
                    if (tileProps.drawTransparency) {
                        ctx.globalAlpha = 1.0;
                    }
                } else {
                    console.warn(`Fallback for tile ${tileName}. Image failed to load or is invalid. Biome: ${gameState.currentBiome}`);
                }
            }
        }
    }
}

export function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= gameCanvas.width; x += TILE_SIZE) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, gameCanvas.height); ctx.stroke(); }
    for (let y = 0; y <= gameCanvas.height; y += TILE_SIZE) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(gameCanvas.width, y); ctx.stroke(); }
}

export function drawPlayer() {
    if (playerImage.complete && playerImage.naturalHeight !== 0) {
        const playerX = gameState.player.x;
        const playerY = gameState.player.y;
        const playerSize = TILE_SIZE;

        // 캐릭터 중심점
        const cx = playerX + playerSize / 2;
        const cy = playerY + playerSize / 2;

        ctx.save();

        // 1) 원형 페이드아웃 발광 (Radial Gradient)
        const innerRadius = playerSize * 0.15; // 중심 밝은 영역 크기
        const outerRadius = playerSize * 0.55; // 빛이 퍼지는 최대 반경 (조절 포인트!)

        const g = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, outerRadius);

        // 중심은 밝고, 바깥으로 갈수록 투명해지게
        g.addColorStop(0.0, "rgba(0, 255, 255, 0.9)");
        g.addColorStop(0.4, "rgba(0, 255, 255, 0.35)");
        g.addColorStop(1.0, "rgba(0, 255, 255, 0.0)");

        // 깜빡임(알파) 적용
        ctx.globalAlpha = gameState.playerEffectAlpha;

        // 선택: 더 “빛 번짐” 느낌을 원하면 살짝 블러도 추가 가능
        // (그라데이션만으로도 충분히 부드러움)
        ctx.shadowBlur = 20;
        ctx.shadowColor = "rgba(0, 255, 255, 0.8)";

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2) 캐릭터는 선명하게
        ctx.shadowBlur = 0;
        ctx.shadowColor = "rgba(0,0,0,0)";
        ctx.globalAlpha = 1.0;

        ctx.drawImage(playerImage, playerX, playerY, playerSize, playerSize);

        ctx.restore();
    } else {
        ctx.fillStyle = "blue";
        ctx.fillRect(gameState.player.x, gameState.player.y, TILE_SIZE, TILE_SIZE);
    }
}



export function drawHealingBlock(block) {
    if (healingBlockImage.complete && healingBlockImage.naturalHeight !== 0) {
        ctx.drawImage(healingBlockImage, block.x, block.y, TILE_SIZE, TILE_SIZE);
    } else {
        ctx.fillStyle = 'white'; ctx.fillRect(block.x, block.y, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = 'red'; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(block.x + TILE_SIZE / 4, block.y + TILE_SIZE / 2); ctx.lineTo(block.x + TILE_SIZE * 3 / 4, block.y + TILE_SIZE / 2);
        ctx.moveTo(block.x + TILE_SIZE / 2, block.y + TILE_SIZE / 4); ctx.lineTo(block.x + TILE_SIZE / 2, block.y + TILE_SIZE * 3 / 4);
        ctx.stroke();
    }
}

export function drawGame() {
    clearCanvas();
    drawMap(); // Replaces drawGrid()

    // 플레이어 이펙트 투명도 업데이트
    gameState.playerEffectAlpha += gameState.playerEffectAlphaDirection * 0.03; // 깜빡임 속도 조절 (0.03)

    if (gameState.playerEffectAlpha <= 0.5) { // 최소 투명도 (완전히 사라지지 않도록)
        gameState.playerEffectAlpha = 0.5;
        gameState.playerEffectAlphaDirection = 1; // 다시 밝아지도록
    } else if (gameState.playerEffectAlpha >= 1.0) { // 최대 투명도
        gameState.playerEffectAlpha = 1.0;
        gameState.playerEffectAlphaDirection = -1; // 다시 어두워지도록
    }

    gameState.healingBlocks.forEach(drawHealingBlock);
    if (gameState.wanderingMerchant) {
        if (goldIconImage.complete && goldIconImage.naturalHeight !== 0) {
            ctx.drawImage(goldIconImage, 
                          gameState.wanderingMerchant.x, 
                          gameState.wanderingMerchant.y, 
                          TILE_SIZE, 
                          TILE_SIZE);
        } else {
            ctx.fillStyle = 'brown'; // Fallback: MERCHANT_COLOR
            ctx.fillRect(gameState.wanderingMerchant.x, gameState.wanderingMerchant.y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = 'gold';
            ctx.beginPath();
            ctx.arc(gameState.wanderingMerchant.x + TILE_SIZE / 2, 
                    gameState.wanderingMerchant.y + TILE_SIZE / 2, 
                    TILE_SIZE / 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    drawPlayer();
    const currentBiomeInfo = BIOMES[gameState.currentBiome]; // Get current biome info
    const monsterGradientColor = currentBiomeInfo ? currentBiomeInfo.baseColor : 'rgba(46, 57, 27, 0.4)'; // Use biome base color

    gameState.activeMonsters.forEach(monster => {
        const monsterImg = monsterImageCache[monster.monsterType];

        const centerX = monster.x + TILE_SIZE / 2;
        const centerY = monster.y + TILE_SIZE / 2;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, TILE_SIZE / 2);

        const hex = monster.threatColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
        gradient.addColorStop(1, monsterGradientColor); // Use biome base color for monster gradient
        
        ctx.fillStyle = gradient;
        ctx.fillRect(monster.x, monster.y, TILE_SIZE, TILE_SIZE);

        if (monsterImg && monsterImg.complete && monsterImg.naturalHeight !== 0) {
            ctx.drawImage(monsterImg, monster.x, monster.y, TILE_SIZE, TILE_SIZE);
        } else {
            console.warn(`Fallback for monster ${monster.name}. Image failed to load or is invalid.`);
            ctx.fillStyle = 'deeppink';
            ctx.fillRect(monster.x, monster.y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.fillText(monster.level, monster.x + TILE_SIZE / 2 - (ctx.measureText(monster.level).width / 2), monster.y + TILE_SIZE / 2 + 5);
        }
    });
}

export function updateStatusDisplay() {
    const { derived, base, equipment } = gameState.playerStats;

    if (!derived || Object.keys(derived).length === 0) {
        console.warn("Derived stats not calculated. Recalculating now.");
        return; 
    }

    // Calculate bonus stats from equipment
    const bonusStats = {
        strength: 0, intelligence: 0, agility: 0,
        vitality: 0, mentality: 0, luck: 0
    };

    for (const slot in equipment) {
        const item = equipment[slot];
        if (!item) continue;
        if (item.stats) {
            for (const stat in item.stats) {
                if (bonusStats.hasOwnProperty(stat)) {
                    bonusStats[stat] += item.stats[stat];
                }
            }
        }
        if (item.affixes) {
            item.affixes.forEach(affix => {
                const affixDef = AFFIX_TYPES[affix.type];
                if (affixDef && affixDef.type === 'stat' && bonusStats.hasOwnProperty(affixDef.stat)) {
                    bonusStats[affixDef.stat] += affix.value;
                }
            });
        }
    }

    const bonusPointsSpan = document.getElementById('statBonusPoints');

    document.getElementById('statLevel').textContent = base.level;
    document.getElementById('statHp').textContent = Math.round(base.hp);
    document.getElementById('statMaxHp').textContent = derived.maxHp;
    document.getElementById('playerStatusHpBar').style.width = `${(base.hp / derived.maxHp) * 100}%`;
    document.getElementById('statMp').textContent = Math.round(base.mp);
    document.getElementById('statMaxMp').textContent = derived.maxMp;
    document.getElementById('playerStatusMpBar').style.width = `${(base.mp / derived.maxMp) * 100}%`;
    document.getElementById('statGold').textContent = base.gold;

    // Update base stat displays with bonus in parentheses
    document.getElementById('statStrength').textContent = `${base.strength}${bonusStats.strength > 0 ? ` (+${bonusStats.strength})` : ''}`;
    document.getElementById('statIntelligence').textContent = `${base.intelligence}${bonusStats.intelligence > 0 ? ` (+${bonusStats.intelligence})` : ''}`;
    document.getElementById('statAgility').textContent = `${base.agility}${bonusStats.agility > 0 ? ` (+${bonusStats.agility})` : ''}`;
    document.getElementById('statVitality').textContent = `${base.vitality}${bonusStats.vitality > 0 ? ` (+${bonusStats.vitality})` : ''}`;
    document.getElementById('statMentality').textContent = `${base.mentality}${bonusStats.mentality > 0 ? ` (+${bonusStats.mentality})` : ''}`;
    document.getElementById('statLuck').textContent = `${base.luck}${bonusStats.luck > 0 ? ` (+${bonusStats.luck})` : ''}`;

    document.getElementById('statPA').textContent = derived.physicalAttack.toFixed(1);
    document.getElementById('statMA').textContent = derived.magicalAttack.toFixed(1);
    document.getElementById('statRA').textContent = derived.rangedAttack.toFixed(1);
    document.getElementById('statPD').textContent = derived.physicalDefense;
    document.getElementById('statMD').textContent = derived.magicalDefense;
    document.getElementById('statSpeed').textContent = derived.speed;
    document.getElementById('statCritChance').textContent = `${(derived.critChance * 100).toFixed(2)}%`;
    document.getElementById('statCritDamage').textContent = `${(derived.critDamage * 100).toFixed(0)}%`;
    document.getElementById('statEvasion').textContent = `${(derived.evasion * 100).toFixed(2)}%`;

    bonusPointsSpan.textContent = base.availableStatPoints;
    const bonusPointsSection = bonusPointsSpan.closest('.stat-item');
    if (bonusPointsSection) {
        bonusPointsSection.classList.toggle('has-bonus-points', base.availableStatPoints > 0);
    }
    
    document.getElementById('xpBar').style.width = `${(base.experience / base.experienceToNextLevel) * 100}%`;
    document.getElementById('currentXP').textContent = Math.floor(base.experience);
    document.getElementById('maxXP').textContent = base.experienceToNextLevel;

    allocateButtons.forEach(b => { b.disabled = (base.availableStatPoints <= 0); });
}

// --- New Battle UI Functions ---

export function initPokemonBattleUI(monster) {
    const { base, derived } = gameState.playerStats;

    // Clear old log
    battleLog.innerHTML = '';

    // Monster
    battleMonsterName.textContent = monster.name;
    battleMonsterLevel.textContent = monster.level;
    const monsterImg = monsterImageCache[monster.monsterType];
    if (monsterImg) {
        battleMonsterSprite.src = monsterImg.src;
    }
    updatePokemonBattleMonsterUI();
    
    // Player
    battlePlayerName.textContent = "Player"; // Or a character name if you have one
    battlePlayerLevel.textContent = base.level;
    if (playerImage) {
        battlePlayerSprite.src = playerImage.src;
    }
    updatePokemonBattlePlayerUI();
}

export function updatePokemonBattlePlayerUI() {
    const { base, derived } = gameState.playerStats;
    const hpPercent = (base.hp / derived.maxHp) * 100;
    const mpPercent = (base.mp / derived.maxMp) * 100;

    battlePlayerHpBar.style.width = `${hpPercent}%`;
    battlePlayerHp.textContent = Math.round(base.hp);
    battlePlayerMaxHp.textContent = derived.maxHp;

    battlePlayerMpBar.style.width = `${mpPercent}%`;
    battlePlayerMp.textContent = Math.round(base.mp);
    battlePlayerMaxMp.textContent = derived.maxMp;
}

export function updatePokemonBattleMonsterUI() {
    if (gameState.currentCombatMonster) {
        const monster = gameState.currentCombatMonster;
        const hpPercent = (monster.hp / monster.maxHp) * 100;

        battleMonsterHpBar.style.width = `${hpPercent}%`;
        battleMonsterHp.textContent = Math.round(monster.hp);
        battleMonsterMaxHp.textContent = monster.maxHp;
    }
}


// --- Legacy / Other UI Functions ---

export function toggleInventory(shouldOpen) {
    inventoryOverlayElement.classList.toggle('hidden', !shouldOpen);
}

// Helper to translate weaponType to Korean
function getWeaponTypeKorean(weaponType) {
    switch (weaponType) {
        case 'physical': return '물리';
        case 'magical': return '마법';
        case 'ranged': return '원거리';
        default: return '';
    }
}

export function createTooltipContent(item, title, equippedSetCounts = {}) { // Add equippedSetCounts parameter
    if (!item) return `<div class="tooltip-section"><h4>${title}</h4><div>(Empty)</div></div>`;
    let content = `<div class="tooltip-section">`;
    
    // New: Unique Item Tag
    if (item.isUnique) {
        content += `<div class="item-unique-tag" style="color: ${item.color || RARITY_CONFIG[item.rarity]?.color || '#FFD700'};">고유 아이템</div>`;
    }
    
    // Display Prefix if exists and not unique/set
    if (item.prefix && !item.isUnique && !item.isSetItem) {
        content += `<div class="item-prefix">${item.prefix}</div>`;
    }
    
    // Display Rarity (등급) - if not unique or set, use item.rarity, otherwise item.rarity is already set
    const displayRarity = item.rarityName || RARITY_CONFIG[item.rarity]?.name;
    const displayColor = item.color || RARITY_CONFIG[item.rarity]?.color || '#fff';
    content += `<div class="item-rarity" style="color: ${displayColor};">등급: ${displayRarity}</div>`;
    
    // Display Name
    content += `<h4 style="color: ${displayColor};">${item.name}</h4>`;
    
    // Display item level
    content += `<div class="item-level">아이템 레벨: ${item.level}</div>`; 
    
    // Add weapon type if applicable
    if (item.slot === 'mainWeapon' && item.weaponType) {
        content += `<div class="stat">공격 타입: ${getWeaponTypeKorean(item.weaponType)}</div>`;
    }

    // New: Display non-zero stats only
    for (const stat in item.stats) {
        if (item.stats[stat] !== 0) {
            content += `<div class="stat">${stat}: ${item.stats[stat]}</div>`;
        }
    }
    
    if (item.affixes && item.affixes.length > 0) {
        content += `<hr>`;
        item.affixes.forEach(affix => {
            const affixDefinition = AFFIX_TYPES[affix.type];
            if (affixDefinition) {
                // Check if value is non-zero for affixes too
                // let valueCheck = true; // Removed valueCheck logic
                // if (affixDefinition.minMax) {
                //     valueCheck = (affix.min !== 0 || affix.max !== 0);
                // } else if (affix.value !== undefined) {
                //     valueCheck = (affix.value !== 0);
                // } else if (affix.chanceVal && affix.magnitude !== undefined) {
                //     valueCheck = (affix.magnitude !== 0);
                // }
                
                // if (valueCheck) { // Removed valueCheck logic
                    if (affixDefinition.minMax) {
                        content += `<div class="affix">${affixDefinition.format(affix.min, affix.max, affix.elementType)}</div>`;
                    } else if (affixDefinition.chanceVal) {
                        if (affixDefinition.type === 'statusEffect') {
                            content += `<div class="affix">${affixDefinition.format(affix.chance, affix.magnitude, affix.duration)}</div>`;
                        } else if (affixDefinition.type === 'proc') {
                            content += `<div class="affix">${affixDefinition.format(affix.chance)}</div>`;
                        }
                    } else {
                        content += `<div class="affix">${affixDefinition.format(affix.value, affix.elementType)}</div>`;
                    }
                // } // Removed valueCheck logic
            }
        });
    }

    // New: Display Special Effects for Unique Items
    if (item.isUnique && item.specialEffects && item.specialEffects.length > 0) {
        content += `<hr>`;
        content += `<div class="special-effects-title">고유 효과:</div>`;
        item.specialEffects.forEach(effect => {
            const specialAffixDef = SPECIAL_AFFIX_TYPES[effect.type];
            if (specialAffixDef) {
                // Use the format function from SPECIAL_AFFIX_TYPES if available, otherwise fallback
                let effectText = specialAffixDef.format ? specialAffixDef.format(effect) : `${effect.type}: ${effect.value || effect.magnitude || ''}`;
                content += `<div class="special-effect-item">${effectText}</div>`;
            } else {
                content += `<div class="special-effect-item">${effect.type}</div>`;
            }
        });
    }

    // New: Detailed Set Bonus Information
    if (item.isSetItem && item.setId) {
        const setDefinition = EQUIPMENT_SETS.find(set => set.id === item.setId);
        if (setDefinition) {
            content += `<hr>`;
            content += `<div class="set-name" style="color: ${setDefinition.color || '#fff'};">${setDefinition.name}</div>`;
            content += `<div class="set-theme">${setDefinition.theme}</div>`;

            // List all pieces
            content += `<div class="set-pieces-title">세트 구성품:</div>`;
            setDefinition.pieces.forEach(piece => {
                // Determine if a piece with the same name is equipped
                let isPieceEquipped = false;
                for (const slotKey in gameState.playerStats.equipment) {
                    const equippedPiece = gameState.playerStats.equipment[slotKey];
                    if (equippedPiece && equippedPiece.name === piece.name) {
                        isPieceEquipped = true;
                        break;
                    }
                }
                const pieceColor = isPieceEquipped ? 'lime' : 'gray'; // Green for equipped, gray for not
                content += `<div class="set-piece-item" style="color: ${pieceColor};">- ${piece.name} (${piece.slot})</div>`;
            });

            // List all bonuses (active/inactive)
            content += `<div class="set-bonuses-title">세트 보너스:</div>`;
            setDefinition.bonuses.forEach(bonus => {
                const currentCount = equippedSetCounts[item.setId] || 0;
                const isActive = currentCount >= bonus.count;
                const bonusColor = isActive ? 'gold' : 'gray'; // Gold for active, gray for inactive
                let bonusText = `${bonus.count}세트: `;

                if (bonus.effect.stats) {
                    bonusText += Object.entries(bonus.effect.stats).map(([stat, val]) => `+${val} ${stat}`).join(', ');
                }
                if (bonus.effect.affixes) {
                    bonus.effect.affixes.forEach(affix => {
                        const affixDefinition = AFFIX_TYPES[affix.type];
                        if (affixDefinition) {
                            if (affixDefinition.minMax) {
                                bonusText += ` ${affixDefinition.format(affix.min, affix.max, affix.elementType)}`;
                            } else if (affixDefinition.chanceVal) {
                                if (affixDefinition.type === 'statusEffect') {
                                    bonusText += ` ${affixDefinition.format(affix.chance, affix.magnitude, affix.duration)}`;
                                } else if (affixDefinition.type === 'proc') {
                                    bonusText += ` ${affixDefinition.format(affix.chance)}`;
                                }
                            } else {
                                bonusText += ` ${affixDefinition.format(affix.value, affix.elementType)}`;
                            }
                        }
                    });
                }
                if (bonus.effect.special) {
                    bonusText += ` 특수 효과: ${bonus.effect.special.description || bonus.effect.special.type}`;
                }
                content += `<div class="set-bonus-detail" style="color: ${bonusColor};">${bonusText}</div>`;
            });
        }
    }

    // Add general description if exists and not part of unique/set special handling
    // Ensure that if a unique or set item already has its own description, we don't add the base item's description.
    if (item.description && !item.isUnique && !(item.isSetItem && setDefinition.theme)) { // If item.isSetItem, theme acts as description
        content += `<hr>`;
        content += `<div>${item.description}</div>`;
    }
    
    return content + `</div>`;
}

export function showItemTooltip(event, item) {
    let equippedItem = null;
    if (item.slot === 'ring') {
        equippedItem = gameState.playerStats.equipment.ring1;
        if (equippedItem === item && gameState.playerStats.equipment.ring2) {
            equippedItem = gameState.playerStats.equipment.ring2;
        } else if (equippedItem !== item && gameState.playerStats.equipment.ring2 === item) {
             equippedItem = gameState.playerStats.equipment.ring1;
        } else if (equippedItem === item) {
            equippedItem = null;
        }
    } else {
        equippedItem = gameState.playerStats.equipment[item.slot];
    }
    
    if (item.slot !== 'ring' && equippedItem === item) {
        equippedItem = null;
    } else if (item.slot === 'ring') {
        if (gameState.playerStats.equipment.ring1 === item) equippedItem = gameState.playerStats.equipment.ring2;
        else if (gameState.playerStats.equipment.ring2 === item) equippedItem = gameState.playerStats.equipment.ring1;
        else equippedItem = null;
    }

    // Calculate equipped set counts for passing to createTooltipContent
    const equippedSetCounts = {};
    for (const slotKey in gameState.playerStats.equipment) {
        const eqItem = gameState.playerStats.equipment[slotKey];
        if (eqItem && eqItem.isSetItem && eqItem.setId) {
            equippedSetCounts[eqItem.setId] = (equippedSetCounts[eqItem.setId] || 0) + 1;
        }
    }

    itemTooltipElement.innerHTML = createTooltipContent(item, 'Hovered', equippedSetCounts) + createTooltipContent(equippedItem, 'Equipped', equippedSetCounts);
    itemTooltipElement.classList.remove('hidden'); 
    itemTooltipElement.style.opacity = 1;

    // Use setTimeout to ensure offsetWidth and offsetHeight are correctly calculated
    setTimeout(() => {
        const tooltipWidth = itemTooltipElement.offsetWidth;
        const tooltipHeight = itemTooltipElement.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const padding = 20; // More generous padding

        let finalPosX;
        let finalPosY;

        // --- Horizontal positioning ---
        let initialPosX = event.pageX + padding;
        if (initialPosX + tooltipWidth + padding > viewportWidth) {
            // Flip to the left side of the cursor if it goes off right edge
            finalPosX = event.pageX - tooltipWidth - padding;
        } else {
            finalPosX = initialPosX;
        }
        // Ensure it doesn't go off the left edge (after potential flip)
        finalPosX = Math.max(padding, finalPosX);


        // --- Vertical positioning ---
        let initialPosY = event.pageY + padding;
        if (initialPosY + tooltipHeight + padding > viewportHeight) {
            // Flip to appear above the cursor if it goes off bottom edge
            finalPosY = event.pageY - tooltipHeight - padding;
        } else {
            finalPosY = initialPosY;
        }
        // Ensure it doesn't go off the top edge (after potential flip)
        finalPosY = Math.max(padding, finalPosY);
        
        itemTooltipElement.style.left = finalPosX + 'px';
        itemTooltipElement.style.top = finalPosY + 'px';
    }, 0); // Defer positioning
}

export function hideItemTooltip() {
    itemTooltipElement.classList.add('hidden');
}

export function renderBagGrid(containerElement, itemsArray, isSellContext = false) {
    containerElement.innerHTML = '';
    const { currentPage, itemsPerPage } = gameState.playerStats;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToDisplay = itemsArray.slice(startIndex, endIndex);

    for (let i = 0; i < itemsPerPage; i++) { // Loop itemsPerPage times for the current page
        const item = itemsToDisplay[i];
        const itemElement = document.createElement('div');
        itemElement.className = 'bag-slot';

        if (item) {
            itemElement.textContent = item.name; // Display only base name
            itemElement.dataset.itemIndex = startIndex + i; // Store original index
            if (item.rarity) {
                itemElement.style.borderColor = RARITY_CONFIG[item.rarity].color;
            }
        }
        containerElement.appendChild(itemElement);
    }
    updatePaginationControls(); // Update pagination buttons and display after rendering grid
}

export function renderEquipment() {
    document.querySelectorAll('.eq-slot').forEach(slotElement => {
        const slotName = slotElement.dataset.slot;
        const item = gameState.playerStats.equipment[slotName];
        if (item) {
            slotElement.textContent = item.name;
            slotElement.classList.add('equipped');
            slotElement.style.borderColor = RARITY_CONFIG[item.rarity].color;

            // Add glow effect for equipped set items
            if (item.isSetItem) {
                slotElement.classList.add('set-item-glow');
            } else {
                slotElement.classList.remove('set-item-glow');
            }

        } else {
            slotElement.textContent = slotElement.dataset.defaultText;
            slotElement.classList.remove('equipped');
            slotElement.classList.remove('set-item-glow'); // Remove glow if unequipped
            slotElement.style.borderColor = '';
        }
    });
}

export function renderMerchantStock(stock, buyItemCallback, showMerchantItemTooltipCallback) {
    merchantStockGridElement.innerHTML = '';
    stock.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'merchant-slot';
        itemElement.textContent = item.name; // Display only base name
        if (item.rarity) itemElement.style.borderColor = RARITY_CONFIG[item.rarity].color;
        itemElement.dataset.itemIndex = index;
        
        itemElement.addEventListener('mouseenter', (event) => showMerchantItemTooltipCallback(event, item));
        itemElement.addEventListener('mouseleave', hideItemTooltip);
        itemElement.addEventListener('click', () => buyItemCallback(item, index));
        merchantStockGridElement.appendChild(itemElement);
    });
}

export function renderPlayerSellInventory(inventory, sellItemCallback, showPlayerSellTooltipCallback) {
    playerSellGridElement.innerHTML = '';
    for (let i = 0; i < INVENTORY_SIZE; i++) {
        const item = inventory[i];
        const itemElement = document.createElement('div');
        itemElement.className = 'bag-slot';

        if (item) {
            itemElement.textContent = item.name; // Display only base name
            itemElement.dataset.itemIndex = i;
            if (item.rarity) {
                itemElement.style.borderColor = RARITY_CONFIG[item.rarity].color;
            }
            
            let isEquipped = false;
            for (const slot in gameState.playerStats.equipment) {
                if (gameState.playerStats.equipment[slot] === item) {
                    isEquipped = true;
                    break;
                }
            }

            if (!isEquipped) {
                itemElement.addEventListener('click', () => sellItemCallback(i));
                itemElement.addEventListener('mouseenter', (event) => showPlayerSellTooltipCallback(event, item));
                itemElement.addEventListener('mouseleave', hideItemTooltip);
            } else {
                itemElement.classList.add('equipped-for-sell');
                itemElement.title = "Cannot sell equipped item.";
                itemElement.style.opacity = "0.5";
            }
        }
        playerSellGridElement.appendChild(itemElement);
    }
}

export function updateMerchantPlayerGoldDisplay() {
    merchantPlayerGoldAmountElement.textContent = gameState.playerStats.base.gold;
}