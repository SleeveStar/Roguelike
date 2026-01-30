// ui.js
import { gameState } from './gameState.js';
import { learnSkill, equipSkillToSlot } from './playerProgression.js';
import { useSkill, setCombatButtonsEnabled } from './combatLogic.js'; // Import gameLogic functions
import {
    ctx, inventoryOverlayElement, itemTooltipElement, skillTooltipElement, // skillTooltipElement 추가
    merchantOverlayElement, merchantStockGridElement, playerSellGridElement,
    merchantPlayerGoldAmountElement, gameCanvas, allocateButtons, eqSlotElements,
    // Removed old levelUpModal reference
    sidePanelEquipment, infoLogElement,
    skillTreeModal, closeSkillTreeModal, skillPointsDisplay, skillTreeTabs, skillTreeArea, skillSlotBarManagement, skillSlotBoxes, tabBtns, battleButtons, battleAttackBtn, battleAutoAttackBtn, battleRunAwayBtn // New Skill Tree UI elements & battle buttons for renderCombatSkillBar
} from './domElements.js';
import { SKILLS, MONSTER_SKILLS } from './skills.js'; // Import SKILLS and MONSTER_SKILLS
import { TILE_SIZE, INVENTORY_SIZE, ESCAPE_CHANCE } from './gameSettings.js';
import { RARITY_CONFIG, AFFIX_TYPES, EQUIPMENT_SETS } from './itemConstants.js';
import { BIOMES } from './monsterConstants.js';
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

    // fallback tile: drawMap에서 "바탕(배경)"처럼 쓰는 타일 이름
    const defaultFallbackTileName =
        activeTileSet.walkableTileNames?.[0] ||
        Object.values(activeTileSet.TILE_TYPES)?.[0] ||
        Object.keys(activeTileSet.TILE_PROPERTIES)?.[0];

    // 경고를 매 타일마다 찍으면 로그 폭발하니, 한 프레임에 요약만
    let missingNameCount = 0;
    let missingPropsCount = 0;

    for (let y = 0; y < gameState.mapGrid.length; y++) {
        for (let x = 0; x < gameState.mapGrid[y].length; x++) {
            const tile = gameState.mapGrid[y][x];
            const tileName = tile?.name;

            // tileName이 비어있으면 "깨진 맵" 신호. 배경으로 두고 넘어감.
            if (!tileName) {
                missingNameCount++;
                continue;
            }

            const tileProps = activeTileSet.TILE_PROPERTIES[tileName];
            if (!tileProps) {
                missingPropsCount++;
                continue;
            }

            // 배경 타일은 clearCanvas로 처리하고 싶다면 스킵
            // (원래 코드의 의도 유지)
            if (defaultFallbackTileName && tileName === defaultFallbackTileName) {
                continue;
            }

            const image = tileImageCache[tileName];
            const posX = x * TILE_SIZE;
            const posY = y * TILE_SIZE;

            if (image && image.naturalHeight !== 0) {
                if (tileProps.drawTransparency) {
                    ctx.globalAlpha = tileProps.drawTransparency;
                }
                ctx.drawImage(image, posX, posY, TILE_SIZE, TILE_SIZE);
                if (tileProps.drawTransparency) {
                    ctx.globalAlpha = 1.0;
                }
            } else {
                // 이미지 로딩 실패는 일단 지나가되, 필요하면 디버그용으로만 남김
                // console.warn(`Fallback for tile ${tileName}. Image failed to load or is invalid. Biome: ${gameState.currentBiome}`);
            }
        }
    }

    // 프레임 단위 요약 로그 (문제 있을 때만)
    if (missingNameCount > 0) {
        console.warn(`Tile undefined (missing tile.name) detected: ${missingNameCount} tiles in biome ${gameState.currentBiome}.`);
    }
    if (missingPropsCount > 0) {
        console.warn(`Tile not found in TILE_PROPERTIES: ${missingPropsCount} tiles in biome ${gameState.currentBiome}.`);
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
            // console.warn(`Fallback for monster ${monster.name}. Image failed to load or is invalid.`);
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
                    if (item.affixes) {            item.affixes.forEach(affix => {
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
    renderCombatSkillBar(); // Render the skill bar initially
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
    renderCombatSkillBar(); // Re-render the skill bar to update cooldowns/mana status
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

// New function to render combat skill bar
export function renderCombatSkillBar() {
    // 기존의 모든 버튼을 제거 (스킬 버튼 및 빈 슬롯 버튼만 해당. 고정 버튼은 다시 append)
    battleButtons.innerHTML = '';

    // 공격 버튼 업데이트 및 재사용
    battleAttackBtn.textContent = '공격';
    battleAttackBtn.disabled = false; // 기본 공격은 항상 활성화
    battleButtons.appendChild(battleAttackBtn);

    // 스킬 버튼들 추가
    gameState.playerStats.base.skillSlots.slots.forEach((skillId, index) => {
        if (skillId) {
            const skill = SKILLS[skillId];
            if (skill) {
                const skillBtn = document.createElement('button');
                skillBtn.classList.add('battle-action-btn', 'skill-combat-btn');
                skillBtn.dataset.skillIndex = index;
                skillBtn.addEventListener('click', () => {
                    useSkill(index); // Call useSkill from gameLogic.js
                });

                const onCooldown = gameState.skillCooldowns[skillId] && gameState.skillCooldowns[skillId] > 0;
                const notEnoughMana = gameState.playerStats.base.mp < skill.cost;
                skillBtn.disabled = onCooldown || notEnoughMana;

                let buttonText = skill.name;
                if (onCooldown) {
                    buttonText += ` (${gameState.skillCooldowns[skillId]})`; // 남은 턴 수 표시
                    skillBtn.title = `쿨다운 ${gameState.skillCooldowns[skillId]} 턴 남음`;
                } else if (notEnoughMana) {
                    skillBtn.title = `마나 부족 (${skill.cost} 필요)`;
                } else {
                    // 스킬 레벨에 맞는 설명이 배열로 되어있으므로, 현재 레벨 - 1 인덱스 사용
                    const playerSkillLevel = gameState.playerStats.base.learnedSkills[skillId];
                    if (playerSkillLevel > 0 && skill.description && skill.description[playerSkillLevel - 1]) {
                         skillBtn.title = skill.description[playerSkillLevel - 1];
                    } else {
                         skillBtn.title = skill.name; // Fallback to skill name if no description
                    }
                }
                skillBtn.textContent = buttonText;
                battleButtons.appendChild(skillBtn);
            }
        } else {
            // Empty slot visual
            const emptySlotBtn = document.createElement('button');
            emptySlotBtn.classList.add('battle-action-btn', 'skill-combat-btn', 'empty-slot');
            emptySlotBtn.textContent = `${index + 1} (비어있음)`;
            emptySlotBtn.disabled = true;
            battleButtons.appendChild(emptySlotBtn);
        }
    });

    // 자동 공격 버튼 업데이트 및 재사용
    battleAutoAttackBtn.textContent = gameState.isAutoAttacking ? '자동 공격 중...' : '자동 공격';
    battleAutoAttackBtn.disabled = false; // 항상 활성화
    battleButtons.appendChild(battleAutoAttackBtn);

    // 도망가기 버튼 업데이트 및 재사용
    battleRunAwayBtn.textContent = '도망가기';
    battleRunAwayBtn.disabled = false; // 항상 활성화
    battleButtons.appendChild(battleRunAwayBtn);

    // setCombatButtonsEnabled는 이 함수 밖에서 호출되어야 할 것 같습니다.
    setCombatButtonsEnabled(true); // 이 함수는 gameLogic.js에서 가져온 함수이므로 전역으로 노출되어 있다면 바로 사용 가능.
                               // renderCombatSkillBar가 전투 UI 렌더링의 주된 역할이므로 여기에 두는 것이 합리적.
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

export function createTooltipContent(item, title, equippedSetCounts = {}) {
    if (!item) return `<div class="tooltip-section"><h4>${title}</h4><div>(Empty)</div></div>`;
    let content = `<div class="tooltip-section">`;

    // SetDefinition은 아래에서 description 판단에도 쓰여서 여기서 미리 선언
    let setDefinition = null;

    // New: Unique Item Tag
    if (item.isUnique) {
        content += `<div class="item-unique-tag" style="color: ${item.color || RARITY_CONFIG[item.rarity]?.color || '#FFD700'};">고유 아이템</div>`;
    }

    // Display Prefix if exists and not unique/set
    if (item.prefix && !item.isUnique && !item.isSetItem) {
        content += `<div class="item-prefix">${item.prefix}</div>`;
    }

    // Display Rarity (등급)
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
            }
        });
    }

    // Detailed Set Bonus Information
    if (item.isSetItem && item.setId) {
        setDefinition = EQUIPMENT_SETS.find(set => set.id === item.setId) || null;
        if (setDefinition) {
            content += `<hr>`;
            content += `<div class="set-name" style="color: ${setDefinition.color || '#fff'};">${setDefinition.name}</div>`;
            content += `<div class="set-theme">${setDefinition.theme}</div>`;

            content += `<div class="set-pieces-title">세트 구성품:</div>`;
            setDefinition.pieces.forEach(piece => {
                let isPieceEquipped = false;
                for (const slotKey in gameState.playerStats.equipment) {
                    const equippedPiece = gameState.playerStats.equipment[slotKey];
                    if (equippedPiece && equippedPiece.name === piece.name) {
                        isPieceEquipped = true;
                        break;
                    }
                }
                const pieceColor = isPieceEquipped ? 'lime' : 'gray';
                content += `<div class="set-piece-item" style="color: ${pieceColor};">- ${piece.name} (${piece.slot})</div>`;
            });

            content += `<div class="set-bonuses-title">세트 보너스:</div>`;
            setDefinition.bonuses.forEach(bonus => {
                const currentCount = equippedSetCounts[item.setId] || 0;
                const isActive = currentCount >= bonus.count;
                const bonusColor = isActive ? 'gold' : 'gray';
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

    // Add general description if exists
    // 세트 아이템은 setDefinition.theme를 설명처럼 쓰는 구조였던 의도를 유지
    if (item.description && !item.isUnique && !(item.isSetItem && setDefinition && setDefinition.theme)) {
        content += `<hr>`;
        content += `<div>${item.description}</div>`;
    }

    return content + `</div>`;
}

export function showItemTooltip(event, item) {
    let equippedItem = null;
    // Determine equipped item for comparison
    if (item.slot === 'ring') {
        // Special handling for rings: compare with ring1 and ring2
        if (gameState.playerStats.equipment.ring1 === item) {
            equippedItem = gameState.playerStats.equipment.ring2;
        } else if (gameState.playerStats.equipment.ring2 === item) {
            equippedItem = gameState.playerStats.equipment.ring1;
        }
        // If the hovered item is not equipped in either ring slot, equippedItem remains null
    } else {
        // For other slots, directly compare with the equipped item in that slot
        if (gameState.playerStats.equipment[item.slot] === item) {
            equippedItem = null; // If the hovered item is the equipped one, don't show comparison
        } else {
            equippedItem = gameState.playerStats.equipment[item.slot];
        }
    }

    // Calculate equipped set counts for passing to createTooltipContent
    const equippedSetCounts = {};
    for (const slotKey in gameState.playerStats.equipment) {
        const eqItem = gameState.playerStats.equipment[slotKey];
        if (eqItem && eqItem.isSetItem && eqItem.setId) {
            equippedSetCounts[eqItem.setId] = (equippedSetCounts[eqItem.setId] || 0) + 1;
        }
    }

    // Generate tooltip content
    let tooltipHtml = createTooltipContent(item, 'Hovered', equippedSetCounts);
    if (equippedItem) {
        tooltipHtml += '<div class="tooltip-comparison-separator">--- 장착 아이템 ---</div>';
        tooltipHtml += createTooltipContent(equippedItem, 'Equipped', equippedSetCounts);
    }

    itemTooltipElement.innerHTML = tooltipHtml;
    itemTooltipElement.classList.remove('hidden');
    itemTooltipElement.style.opacity = 1; // Make visible for size calculation

    // Position tooltip
    // Use requestAnimationFrame to ensure layout is updated before calculations
    requestAnimationFrame(() => {
        const tooltipWidth = itemTooltipElement.offsetWidth;
        const tooltipHeight = itemTooltipElement.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const cursorX = event.pageX;
        const cursorY = event.pageY;
        const padding = 15; // Padding from cursor

        let finalPosX = cursorX + padding;
        let finalPosY = cursorY + padding;

        // Check if tooltip goes off right edge
        if (finalPosX + tooltipWidth > viewportWidth - padding) {
            finalPosX = cursorX - tooltipWidth - padding;
        }

        // Check if tooltip goes off bottom edge
        if (finalPosY + tooltipHeight > viewportHeight - padding) {
            finalPosY = cursorY - tooltipHeight - padding;
        }

        // Ensure it doesn't go off top edge
        if (finalPosY < padding) {
            finalPosY = padding;
        }

        // Ensure it doesn't go off left edge
        if (finalPosX < padding) {
            finalPosX = padding;
        }
        
        itemTooltipElement.style.left = finalPosX + 'px';
        itemTooltipElement.style.top = finalPosY + 'px';
    });
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

    for (let i = 0; i < itemsPerPage; i++) {
        const item = itemsToDisplay[i];
        const itemElement = document.createElement('div');
        itemElement.className = 'bag-slot';

        if (item) {
            itemElement.textContent = item.name;
            itemElement.dataset.itemIndex = startIndex + i;
            if (item.rarity) {
                itemElement.style.borderColor = RARITY_CONFIG[item.rarity].color;
            }
        }
        containerElement.appendChild(itemElement);
    }
    updatePaginationControls();
}

export function renderEquipment() {
    document.querySelectorAll('.eq-slot').forEach(slotElement => {
        const slotName = slotElement.dataset.slot;
        const item = gameState.playerStats.equipment[slotName];
        if (item) {
            slotElement.textContent = item.name;
            slotElement.classList.add('equipped');
            slotElement.style.borderColor = RARITY_CONFIG[item.rarity].color;

            if (item.isSetItem) {
                slotElement.classList.add('set-item-glow');
            } else {
                slotElement.classList.remove('set-item-glow');
            }

        } else {
            slotElement.textContent = slotElement.dataset.defaultText;
            slotElement.classList.remove('equipped');
            slotElement.classList.remove('set-item-glow');
            slotElement.style.borderColor = '';
        }
    });
}

export function renderMerchantStock(stock, buyItemCallback, showMerchantItemTooltipCallback) {
    merchantStockGridElement.innerHTML = '';
    stock.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'merchant-slot';
        itemElement.textContent = item.name;
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
            itemElement.textContent = item.name;
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

// New Skill Tree UI Functions
export function showSkillTreeModal() {
    skillTreeModal.classList.remove('hidden');
    // Set up tab event listeners once
    if (!skillTreeTabs.dataset.listenersAdded) {
        tabBtns.forEach(button => {
            button.addEventListener('click', () => {
                tabBtns.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                renderSkillTree(button.dataset.tree);
            });
        });
        skillTreeTabs.dataset.listenersAdded = 'true';
    }

    // Add drag-out functionality for skills from combat slots
    // This listener should be on the modal itself to catch drops outside of skill-slot-box elements
    if (!skillTreeModal.dataset.dragListenersAdded) {
        skillTreeModal.addEventListener('dragover', (e) => {
            e.preventDefault(); // Allow drop
        });

        skillTreeModal.addEventListener('drop', (e) => {
            e.preventDefault();
            const skillId = e.dataTransfer.getData('text/plain');
            const sourceSlotIndexStr = e.dataTransfer.getData('text/slotIndex');
            const droppedOnSkillSlotBox = e.target.closest('.skill-slot-box'); // Check if dropped directly on a skill slot box
            
            // Check if the drop target is not a skill slot box, indicating a drag-out
            if (skillId && sourceSlotIndexStr && !droppedOnSkillSlotBox) {
                const sourceSlotIndex = parseInt(sourceSlotIndexStr);
                equipSkillToSlot(null, sourceSlotIndex);
                renderSkillSlotManagementBar(); // Re-render the bar after unequipping
            }
        });
        skillTreeModal.dataset.dragListenersAdded = 'true';
    }

    // Call render functions for initial display
    document.getElementById('skillPointsDisplay').textContent = gameState.playerStats.base.availableSkillPoints;
    renderSkillTree(skillTreeTabs.querySelector('.tab-btn.active').dataset.tree || 'melee'); // Render active tab or default to melee
    renderSkillSlotManagementBar();
}

// Helper to create skill tooltip content
export function createSkillTooltipContent(skillId) {
    const skill = SKILLS[skillId];
    if (!skill) return "스킬 정보를 찾을 수 없습니다.";

    const playerBase = gameState.playerStats.base;
    const currentLevel = playerBase.learnedSkills[skillId] || 0;
    const nextLevel = currentLevel + 1;

    let content = `
        <div class="skill-tooltip-name">${skill.name}</div>
        <div class="skill-tooltip-type">${skill.type === 'active' ? '액티브' : '패시브'} 스킬</div>
    `;

    // 현재 레벨 정보
    if (currentLevel > 0) {
        content += `<div class="skill-tooltip-level">현재 레벨: ${currentLevel}/${skill.maxLevel}</div>`;
        content += `<div class="skill-tooltip-description">${skill.description[currentLevel - 1]}</div>`;
    } else {
        content += `<div class="skill-tooltip-level">습득 가능</div>`;
    }

    // 다음 레벨 정보 (최대 레벨이 아닌 경우)
    if (nextLevel <= skill.maxLevel) {
        content += `<div class="skill-tooltip-next-level-title">--- 다음 레벨 (${nextLevel}) ---</div>`;
        content += `<div class="skill-tooltip-next-description">${skill.description[nextLevel - 1]}</div>`;
        if (skill.costPerLevel) {
            content += `<div class="skill-tooltip-cost">요구 스킬 포인트: ${skill.costPerLevel}</div>`;
        }
    }

    // 종속성 정보
    if (skill.dependencies && skill.dependencies.length > 0) {
        content += `<div class="skill-tooltip-dependencies-title">--- 선행 스킬 ---</div>`;
        skill.dependencies.forEach(depId => {
            const depSkill = SKILLS[depId];
            const depLevel = playerBase.learnedSkills[depId] || 0;
            const metCondition = depSkill && depLevel === depSkill.maxLevel;
            content += `<div class="skill-tooltip-dependency ${metCondition ? 'met' : 'unmet'}">
                ${depSkill ? depSkill.name : '알 수 없는 스킬'} (${depLevel}/${depSkill.maxLevel})
            </div>`;
        });
    }

    return content;
}

export function showSkillTooltip(event, skillId) {

    skillTooltipElement.innerHTML = createSkillTooltipContent(skillId);
    skillTooltipElement.classList.remove('hidden');
    skillTooltipElement.style.opacity = 1;

    // Get the skill node that triggered the event
    const skillNode = event.currentTarget;
    const skillNodeRect = skillNode.getBoundingClientRect();

    const tooltipWidth = skillTooltipElement.offsetWidth;
    const tooltipHeight = skillTooltipElement.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const padding = 10; // Reduced padding for closer placement

    let finalPosX;
    let finalPosY;

    // Position tooltip below the skillNode, aligned with its left edge
    finalPosX = skillNodeRect.left;
    finalPosY = skillNodeRect.bottom + padding;

    // Adjust for right viewport boundary
    if (finalPosX + tooltipWidth + padding > viewportWidth) {
        finalPosX = viewportWidth - tooltipWidth - padding;
    }
    // Adjust for left viewport boundary
    if (finalPosX < padding) {
        finalPosX = padding;
    }

    // Adjust for bottom viewport boundary
    if (finalPosY + tooltipHeight + padding > viewportHeight) {
        // If it goes off screen at the bottom, try placing it above the skill node
        finalPosY = skillNodeRect.top - tooltipHeight - padding;
    }
    // Adjust for top viewport boundary
    if (finalPosY < padding) {
        finalPosY = padding; // If it still goes off screen at the top, just place it at the top with padding
    }

    skillTooltipElement.style.left = finalPosX + 'px';
    skillTooltipElement.style.top = finalPosY + 'px';
}

export function hideSkillTooltip() {
    skillTooltipElement.classList.add('hidden');
}


export function renderSkillTree(treeType) {
    skillTreeArea.innerHTML = ''; // Clear previous tree
    const skillsInTree = Object.values(SKILLS).filter(skill => skill.tree === treeType);
    const playerBase = gameState.playerStats.base;

    skillsInTree.forEach(skill => {
        const skillNode = document.createElement('div');
        skillNode.classList.add('skill-node');
        skillNode.dataset.skillId = skill.id; // 스킬 ID 저장

        const currentLevel = playerBase.learnedSkills[skill.id] || 0;
        const isLearned = currentLevel > 0;
        const isMaxLevel = currentLevel >= skill.maxLevel;

        const allDependenciesMet = skill.dependencies.every(depId => {
            const depSkill = SKILLS[depId];
            return depSkill && playerBase.learnedSkills[depId] === depSkill.maxLevel;
        });

        // 스킬 레벨 표시
        let levelText = '';
        if (isLearned) {
            levelText = `${currentLevel}/${skill.maxLevel}`;
        } else {
            levelText = `0/${skill.maxLevel}`;
        }

        skillNode.innerHTML = `
            <img src="${skill.icon}" alt="${skill.name}" draggable="false">
            <span class="skill-name">${skill.name}</span>
            <span class="skill-level">${levelText}</span>
        `;

        // 위치 설정
        // 이전에 좋았던 상태인 (100 * x + 20) 형태로 복원합니다.
        skillNode.style.left = `${skill.position.x * 100 + 20}px`;
        skillNode.style.top = `${skill.position.y * 100 + 20}px`;

        // 상태에 따른 클래스 추가
        if (isMaxLevel) {
            skillNode.classList.add('max-level');
        } else if (isLearned) {
            skillNode.classList.add('learned');
            // 스킬 레벨업 가능 여부
            if (playerBase.availableSkillPoints >= skill.costPerLevel && allDependenciesMet) {
                skillNode.classList.add('available');
                skillNode.classList.add('blinking'); // 레벨업 가능한 스킬은 반짝임
            }
        } else if (allDependenciesMet && playerBase.availableSkillPoints >= skill.costPerLevel) {
            skillNode.classList.add('available');
            skillNode.classList.add('blinking'); // 새로 배울 수 있는 스킬은 반짝임
        } else {
            skillNode.classList.add('locked');
        }
        
        // 스킬 노드 클릭 이벤트 (레벨업)
        if (!isMaxLevel && (allDependenciesMet && playerBase.availableSkillPoints >= skill.costPerLevel)) {
            skillNode.addEventListener('click', () => learnSkill(skill.id));
        }

        // 툴팁 이벤트
        skillNode.addEventListener('mouseenter', (e) => showSkillTooltip(e, skill.id));
        skillNode.addEventListener('mouseleave', hideSkillTooltip);

        // 액티브 스킬은 드래그 가능하게
        if (skill.type === 'active' && isLearned) {
            skillNode.setAttribute('draggable', true);
            skillNode.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', skill.id);
                e.dataTransfer.effectAllowed = 'move';
            });
        } else {
            skillNode.setAttribute('draggable', false);
        }

        skillTreeArea.appendChild(skillNode);
    });

    drawSkillTreeConnections(skillsInTree, treeType); // 연결선 그리기
}

// 스킬 노드 간 연결선을 그리는 함수
function drawSkillTreeConnections(skillsInTree, treeType) {
    let canvas = document.getElementById(`skill-tree-canvas-${treeType}`);
    if (!canvas) {
        // 캔버스 요소가 없으면 새로 생성
        const newCanvas = document.createElement('canvas');
        newCanvas.id = `skill-tree-canvas-${treeType}`;
        newCanvas.classList.add('skill-tree-connection-canvas');
        skillTreeArea.prepend(newCanvas); // 스킬 노드들보다 아래에 위치
        newCanvas.width = skillTreeArea.offsetWidth;
        newCanvas.height = skillTreeArea.offsetHeight;
        canvas = newCanvas;
    } else {
        // 기존 캔버스가 있으면 크기 업데이트 및 초기화
        canvas.width = skillTreeArea.offsetWidth;
        canvas.height = skillTreeArea.offsetHeight;
    }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 기존 그림 지우기

    const playerBase = gameState.playerStats.base;

    skillsInTree.forEach(skill => {
        skill.dependencies.forEach(depId => {
            const depSkill = SKILLS[depId];
            if (depSkill && depSkill.tree === treeType) { // 같은 트리 내의 종속성만
                const fromNode = document.querySelector(`.skill-node[data-skill-id="${depId}"]`);
                const toNode = document.querySelector(`.skill-node[data-skill-id="${skill.id}"]`);

                if (fromNode && toNode) {
                    const fromRect = fromNode.getBoundingClientRect();
                    const toRect = toNode.getBoundingClientRect();
                    const treeRect = skillTreeArea.getBoundingClientRect();

                    const startX = fromRect.left + fromRect.width / 2 - treeRect.left;
                    const startY = fromRect.top + fromRect.height / 2 - treeRect.top;
                    const endX = toRect.left + toRect.width / 2 - treeRect.left;
                    const endY = toRect.top + toRect.height / 2 - treeRect.top;

                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);

                    // 종속성 조건 충족 여부에 따라 선 스타일 변경
                    const depLevel = playerBase.learnedSkills[depId] || 0;
                    const isDependencyMet = depLevel === depSkill.maxLevel;

                    if (isDependencyMet) {
                        ctx.strokeStyle = 'lime'; // 조건 충족 시 밝은 색
                        ctx.lineWidth = 2;
                        ctx.setLineDash([]); // 실선
                    } else {
                        ctx.strokeStyle = 'gray'; // 조건 미충족 시 어두운 색
                        ctx.lineWidth = 1;
                        ctx.setLineDash([5, 5]); // 점선
                    }
                    ctx.stroke();
                }
            }
        });
    });
    ctx.setLineDash([]); // Reset line dash to default for other drawings
}

export function renderSkillSlotManagementBar() {
    skillSlotBarManagement.innerHTML = '';
    for (let i = 0; i < gameState.playerStats.base.skillSlots.max; i++) {
        const slotBox = document.createElement('div');
        slotBox.classList.add('skill-slot-box');
        slotBox.dataset.slotIndex = i;

        const skillIdInSlot = gameState.playerStats.base.skillSlots.slots[i];
        if (skillIdInSlot) {
            const skill = SKILLS[skillIdInSlot];
            if (skill) {
                const skillImg = document.createElement('img');
                skillImg.src = skill.icon;
                skillImg.alt = skill.name;
                skillImg.style.width = '50px'; // 명시적으로 크기 지정
                skillImg.style.height = '50px'; // 명시적으로 크기 지정
                // Make equipped skills draggable OUT of slot (to reorder or unequip)
                skillImg.setAttribute('draggable', true);
                skillImg.dataset.skillId = skill.id;
                skillImg.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', skill.id);
                    e.dataTransfer.effectAllowed = 'move';
                    // Store the original slot index for potential removal
                    e.dataTransfer.setData('text/slotIndex', i.toString());
                });
                slotBox.appendChild(skillImg);

                // 스킬 레벨 표시 (새로 추가)
                const skillLevel = gameState.playerStats.base.learnedSkills[skillIdInSlot] || 0;
                const levelSpan = document.createElement('span');
                levelSpan.classList.add('skill-slot-level');
                levelSpan.textContent = skillLevel;
                slotBox.appendChild(levelSpan);

                // 툴팁 이벤트
                slotBox.addEventListener('mouseenter', (e) => showSkillTooltip(e, skill.id));
                slotBox.addEventListener('mouseleave', hideSkillTooltip);

            }
        } else {
            slotBox.textContent = i + 1; // Display slot number
        }

        // Add drag & drop event listeners
        slotBox.addEventListener('dragover', (e) => { e.preventDefault(); slotBox.classList.add('drag-over'); });
        slotBox.addEventListener('dragleave', () => { slotBox.classList.remove('drag-over'); });
        slotBox.addEventListener('drop', (e) => {
            e.preventDefault();
            slotBox.classList.remove('drag-over');
            const skillId = e.dataTransfer.getData('text/plain');
            const sourceSlotIndexStr = e.dataTransfer.getData('text/slotIndex'); // Get source slot if dragging from another slot
            const targetSlotIndex = parseInt(slotBox.dataset.slotIndex);
            
            // Call gameLogic.equipSkillToSlot (new function to be created)
            equipSkillToSlot(skillId, targetSlotIndex, sourceSlotIndexStr ? parseInt(sourceSlotIndexStr) : null);
            renderSkillSlotManagementBar(); // Re-render after equip/move
        });

        // Add click listener to remove skill
        slotBox.addEventListener('dblclick', () => {
            const targetSlotIndex = parseInt(slotBox.dataset.slotIndex);
            if (gameState.playerStats.base.skillSlots.slots[targetSlotIndex]) {
                // Remove skill by setting skillId to null
                equipSkillToSlot(null, targetSlotIndex);
                renderSkillSlotManagementBar(); // Re-render to update UI
            }
        });

        skillSlotBarManagement.appendChild(slotBox);
    }
}

// Blinking Skill Button Logic
export function updateSkillTreeButtonState() {
    if (skillTreeBtn) { // 버튼이 존재할 경우에만 처리
        if (gameState.playerStats.base.availableSkillPoints > 0) {
            skillTreeBtn.classList.add('blinking');
        } else {
            skillTreeBtn.classList.remove('blinking');
        }
    }
}