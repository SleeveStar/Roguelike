// eventHandlers.js
import { gameState } from './gameState.js';
import { TILE_SIZE, ESCAPE_CHANCE, HEALING_BLOCK_RECOVERY_PERCENT } from './constants.js';
import { gameCanvas, inventoryBtn, closeInventoryBtn, closeMerchantBtn, allocateButtons, itemTooltipElement, bagGridElement, eqSlotElements, levelUpModal, closeLevelUpModal, inventoryOverlayElement, battleAttackBtn, battleAutoAttackBtn, battleRunAwayBtn } from './domElements.js';
import { playerTurn, monsterTurn, startCombat, endCombat, allocateStatPoint, openMerchantUI, closeMerchantUI, equipItem, unequipItem, setCombatButtonsEnabled, hideLevelUpModal, toggleAutoAttack } from './gameLogic.js';
import { logCombatMessage, toggleInventory, showItemTooltip, hideItemTooltip, renderBagGrid, renderEquipment, updateStatusDisplay, drawGame } from './ui.js';
import { getCurrentActiveTileSet } from './imageLoader.js'; // Import getter for active tile set
import { transitionMap } from './map.js';
import { findPath } from './utils.js';

export function addEventListeners() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', (e) => {
        if (itemTooltipElement && !itemTooltipElement.classList.contains('hidden')) {
            itemTooltipElement.style.left = e.pageX + 15 + 'px';
            itemTooltipElement.style.top = e.pageY + 15 + 'px';
        }
    });

    // New battle buttons
    battleAttackBtn.addEventListener('click', () => playerTurn());
    battleAutoAttackBtn.addEventListener('click', () => toggleAutoAttack());
    battleRunAwayBtn.addEventListener('click', () => {
        logCombatMessage("You attempt to run away!");
        setCombatButtonsEnabled(false);
        if (Math.random() < ESCAPE_CHANCE) {
            logCombatMessage("You successfully escaped!");
            setTimeout(() => endCombat(false), 500); 
        } else {
            logCombatMessage("You failed to escape!");
            setTimeout(() => monsterTurn(), 1000); 
        }
    });

    inventoryBtn.addEventListener('click', () => {
        gameState.isUiVisible = !gameState.isUiVisible;
        // isInventoryOpen = !isInventoryOpen; // Use gameState.isInventoryOpen from gameState
        toggleInventory(gameState.isUiVisible);
        if (gameState.isUiVisible) {
            renderBagGrid(document.querySelector('.bag-grid'), gameState.playerStats.inventory, false);
            renderEquipment();
        } else {
            hideItemTooltip();
        }
    });
    closeInventoryBtn.addEventListener('click', () => {
        gameState.isUiVisible = false;
        toggleInventory(false);
        hideItemTooltip();
    });

    // Add a mouseleave event to the entire inventory overlay to ensure tooltips are hidden
    inventoryOverlayElement.addEventListener('mouseleave', hideItemTooltip);

    closeMerchantBtn.addEventListener('click', closeMerchantUI);

    allocateButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const statName = event.target.dataset.stat;
            allocateStatPoint(statName);
        });
    });

    // Event listeners for inventory slots for equipping/tooltips
    bagGridElement.addEventListener('click', (event) => {
        const itemElement = event.target.closest('.bag-slot');
        if (itemElement && itemElement.dataset.itemIndex) {
            const itemIndex = parseInt(itemElement.dataset.itemIndex);
            equipItem(itemIndex); // equipItem is in gameLogic.js
        }
    });
    bagGridElement.addEventListener('mouseenter', (event) => {
        const itemElement = event.target.closest('.bag-slot');
        if (itemElement && itemElement.dataset.itemIndex) {
            const itemIndex = parseInt(itemElement.dataset.itemIndex);
            const item = gameState.playerStats.inventory[itemIndex];
            if (item) showItemTooltip(event, item);
        }
    }, true); // Use capture phase
    bagGridElement.addEventListener('mouseleave', (event) => {
        const itemElement = event.target.closest('.bag-slot');
        if (itemElement && itemElement.dataset.itemIndex) {
            hideItemTooltip();
        }
    }, true);

    // Event listeners for equipment slots for unequipping/tooltips
    eqSlotElements.forEach(slotElement => {
        slotElement.addEventListener('click', () => {
            const slotName = slotElement.dataset.slot;
            unequipItem(slotName); // unequipItem is in gameLogic.js
        });
        slotElement.addEventListener('mouseenter', (event) => {
            const slotName = slotElement.dataset.slot;
            const item = gameState.playerStats.equipment[slotName];
            if (item) showItemTooltip(event, item);
        });
        slotElement.addEventListener('mouseleave', hideItemTooltip);
    });

    // Level up modal buttons
    closeLevelUpModal.addEventListener('click', () => {
        hideLevelUpModal();
        drawGame(); // Redraw the game to reflect the new state
    });

    // The restart button is no longer needed as gameOver() performs a full page reload.
    // restartButton.addEventListener('click', restartGame); // Removed
}

function handleKeyDown(event) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) event.preventDefault();
    if (gameState.isInCombat || gameState.isUiVisible) return;

    const oldX = gameState.player.x, oldY = gameState.player.y;
    let { x: newX, y: newY } = gameState.player;
    switch (event.key) {
        case 'ArrowUp': newY -= TILE_SIZE; break;
        case 'ArrowDown': newY += TILE_SIZE; break;
        case 'ArrowLeft': newX -= TILE_SIZE; break;
        case 'ArrowRight': newX += TILE_SIZE; break;
        default: return;
    }

    // Check for map transitions first
    if (!(newX >= 0 && newX < gameCanvas.width && newY >= 0 && newY < gameCanvas.height)) {
        if (newX < 0) transitionMap('left'); else if (newX >= gameCanvas.width) transitionMap('right');
        else if (newY < 0) transitionMap('up'); else if (newY >= gameCanvas.height) transitionMap('down');
        return;
    }

    // Check for walkable tiles
    const activeTileSet = getCurrentActiveTileSet();
    if (!activeTileSet) return; // Cannot check walkability if tile set is not loaded
    const TILE_PROPERTIES = activeTileSet.TILE_PROPERTIES;

    const gridX = newX / TILE_SIZE;
    const gridY = newY / TILE_SIZE;
    const targetTile = gameState.mapGrid[gridY][gridX];
    if (!targetTile || !TILE_PROPERTIES[targetTile.name] || !TILE_PROPERTIES[targetTile.name].walkable) {
        return; // Target tile is not walkable, cancel move
    }
    
    gameState.player.x = newX; gameState.player.y = newY;
    const healingBlockIndex = gameState.healingBlocks.findIndex(b => b.x === newX && b.y === newY);
    if (healingBlockIndex !== -1) {
        const healedAmount = Math.floor(gameState.playerStats.derived.maxHp * HEALING_BLOCK_RECOVERY_PERCENT);
        gameState.playerStats.base.hp = Math.min(gameState.playerStats.derived.maxHp, gameState.playerStats.base.hp + healedAmount);
        gameState.healingBlocks.splice(healingBlockIndex, 1);
        updateStatusDisplay(); logCombatMessage(`You recovered ${healedAmount} HP!`); drawGame(); return; // Call drawGame to redraw and remove item
    }
    const collidedMonster = gameState.activeMonsters.find(m => m.x === newX && m.y === newY);
    if (collidedMonster) {
        gameState.player.x = oldX; gameState.player.y = oldY;
        startCombat(collidedMonster); return;
    }

    if (gameState.wanderingMerchant && newX === gameState.wanderingMerchant.x && newY === gameState.wanderingMerchant.y) {
        gameState.player.x = oldX; gameState.player.y = oldY;
        logCombatMessage("<span style='color: purple;'>You found a wandering merchant!</span>");
        openMerchantUI();
        return;
    }

    // --- Monster Movement Turn ---
    const playerGridX = gameState.player.x / TILE_SIZE;
    const playerGridY = gameState.player.y / TILE_SIZE;

    for (const monster of gameState.activeMonsters) {
        const monsterGridX = monster.x / TILE_SIZE;
        const monsterGridY = monster.y / TILE_SIZE;

        const path = findPath(
            { x: monsterGridX, y: monsterGridY },
            { x: playerGridX, y: playerGridY },
            gameState.mapGrid
        );

        if (path.length > 0) {
            const nextStep = path[0];
            const newMonsterX = nextStep.x * TILE_SIZE;
            const newMonsterY = nextStep.y * TILE_SIZE;

            // Check for collision with player
            if (newMonsterX === gameState.player.x && newMonsterY === gameState.player.y) {
                startCombat(monster);
                return; // Stop further monster movement and redraw after combat starts
            }

            // Check for collision with other monsters
            const isOccupied = gameState.activeMonsters.some(otherMonster => 
                otherMonster.id !== monster.id && 
                otherMonster.x === newMonsterX && 
                otherMonster.y === newMonsterY
            );

            if (!isOccupied) {
                monster.x = newMonsterX;
                monster.y = newMonsterY;
            }
        }
    }

    drawGame();
}

