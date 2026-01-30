import { gameState } from './gameState.js';
import { INVENTORY_SIZE } from './gameSettings.js';
import { RARITY_CONFIG } from './itemConstants.js';
import {
    logCombatMessage, renderMerchantStock, renderPlayerSellInventory,
    updateMerchantPlayerGoldDisplay, createTooltipContent, hideItemTooltip, updateStatusDisplay
} from './ui.js';
import { merchantOverlayElement, itemTooltipElement } from './domElements.js';
import { drawGame } from './ui.js';

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
    hideItemTooltip();
    drawGame();
}

export function buyItem(item, merchantItemIndex) {
    if (gameState.playerStats.base.gold >= item.price) {
        if (gameState.playerStats.inventory.length < INVENTORY_SIZE) {
            gameState.playerStats.base.gold -= item.price;
            const newItem = {...item};
            delete newItem.price;

            gameState.playerStats.inventory.push(newItem);
            gameState.wanderingMerchant.stock.splice(merchantItemIndex, 1);

            logCombatMessage(`<span style="color: mediumspringgreen;">${item.name}을(를) ${item.price} 골드에 구매했습니다.</span>`);

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