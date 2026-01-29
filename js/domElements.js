// domElements.js
export const gameContainer = document.getElementById('gameContainer');
export const gameCanvas = document.getElementById('gameCanvas');
export const ctx = gameCanvas.getContext('2d');

// Modals
// Removed old levelUpModal references
export const restartModal = document.getElementById('restartModal');
export const finalScoreSpan = document.getElementById('finalScore');
export const restartButton = document.getElementById('restartButton');


// Right-side Info Panel
export const infoPanelElement = document.getElementById('infoPanel');
export const infoLogElement = document.getElementById('infoLog');
export const sidePanelEquipment = document.getElementById('side-panel-equipment');

// Inventory Elements
export const inventoryOverlayElement = document.getElementById('inventoryOverlay');
export const inventoryBtn = document.getElementById('inventoryBtn');
export const closeInventoryBtn = document.getElementById('closeInventoryBtn');
export const bagGridElement = document.querySelector('.bag-grid');
export const itemTooltipElement = document.getElementById('itemTooltip');
export const skillTooltipElement = document.getElementById('skillTooltip'); // New skill tooltip element
export const eqSlotElements = document.querySelectorAll('.eq-slot');
export const prevPageBtn = document.getElementById('prevPageBtn');
export const pageNumberDisplay = document.getElementById('pageNumberDisplay');
export const nextPageBtn = document.getElementById('nextPageBtn');

// Merchant Elements
export const merchantOverlayElement = document.getElementById('merchantOverlay');
export const merchantStockGridElement = document.querySelector('.merchant-grid');
export const playerSellGridElement = document.querySelector('.player-sell-grid');
export const merchantPlayerGoldAmountElement = document.getElementById('merchantPlayerGoldAmount');
export const closeMerchantBtn = document.getElementById('closeMerchantBtn');

// Stat Allocation
export const allocateButtons = document.querySelectorAll('.allocate-btn');

// --- New Pokémon Battle UI Elements ---
export const pokemonBattleOverlay = document.getElementById('pokemonBattleOverlay');

// Monster UI
export const battleMonsterArea = document.getElementById('battleMonsterArea');
export const battleMonsterStatus = document.getElementById('battleMonsterStatus');
export const battleMonsterName = document.getElementById('battleMonsterName');
export const battleMonsterLevel = document.getElementById('battleMonsterLevel');
export const battleMonsterHpBar = document.getElementById('battleMonsterHpBar');
export const battleMonsterHp = document.getElementById('battleMonsterHp');
export const battleMonsterMaxHp = document.getElementById('battleMonsterMaxHp');
export const battleMonsterSprite = document.getElementById('battleMonsterSprite');

// Player UI
export const battlePlayerArea = document.getElementById('battlePlayerArea');
export const battlePlayerStatus = document.getElementById('battlePlayerStatus');
export const battlePlayerName = document.getElementById('battlePlayerName');
export const battlePlayerLevel = document.getElementById('battlePlayerLevel');
export const battlePlayerHpBar = document.getElementById('battlePlayerHpBar');
export const battlePlayerHp = document.getElementById('battlePlayerHp');
export const battlePlayerMaxHp = document.getElementById('battlePlayerMaxHp');
export const battlePlayerMpBar = document.getElementById('battlePlayerMpBar');
export const battlePlayerMp = document.getElementById('battlePlayerMp');
export const battlePlayerMaxMp = document.getElementById('battlePlayerMaxMp');
export const battlePlayerSprite = document.getElementById('battlePlayerSprite');

// Action Bar UI
export const battleActionBar = document.getElementById('battleActionBar');
export const battleLog = document.getElementById('battleLog');
export const battleButtons = document.getElementById('battleButtons');
export const battleAttackBtn = document.getElementById('battleAttackBtn');
export const battleAutoAttackBtn = document.getElementById('battleAutoAttackBtn');
export const battleRunAwayBtn = document.getElementById('battleRunAwayBtn');

// Skill Tree Modal Elements
export const skillTreeBtn = document.getElementById('skillTreeBtn');
export const skillTreeModal = document.getElementById('skillTreeModal');
export const closeSkillTreeModal = document.getElementById('closeSkillTreeModal');
export const skillPointsDisplay = document.getElementById('skillPointsDisplay');
export const skillTreeTabs = document.querySelector('.skill-tree-tabs');
export const skillTreeArea = document.getElementById('skill-tree-area');
export const skillSlotBarManagement = document.getElementById('skill-slot-bar-management');
export const skillSlotBoxes = document.querySelectorAll('.skill-slot-box');
export const tabBtns = document.querySelectorAll('.tab-btn');
