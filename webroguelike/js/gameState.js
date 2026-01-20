// gameState.js
import { INVENTORY_SIZE } from './constants.js';

export const gameState = {
    playerStats: {
        base: {
            level: 1,
            experience: 0,
            experienceToNextLevel: 100,
            availableStatPoints: 0,
            hp: 0, // Current HP, will be set to maxHP on init
            mp: 0, // Current MP, will be set to maxMP on init
            gold: 0,

            // New 6 primary stats
            strength: 5,
            intelligence: 5,
            agility: 5,
            vitality: 5,
            mentality: 5,
            luck: 5,
        },
        derived: {},
        inventory: [],
        currentPage: 1, // Current page for inventory display
        itemsPerPage: INVENTORY_SIZE, // Items per page
        equipment: {
            hat: null, neck: null, shoulder: null, mainWeapon: null, chest: null, 
            subWeapon: null, wrist: null, legs: null, ring1: null, ring2: null, feet: null
        },
        statusEffects: []
    },
    player: { x: 0, y: 0 },
    activeMonsters: [],
    healingBlocks: [],
    wanderingMerchant: null,
    isInCombat: false,
    isUiVisible: false,
    currentCombatMonster: null,
    mapGrid: [],
    isAutoAttacking: false,
};

export let isInventoryOpen = false;

export function resetGameState() {
    gameState.playerStats = {
        base: {
            level: 1,
            experience: 0,
            experienceToNextLevel: 100,
            availableStatPoints: 0,
            hp: 0,
            mp: 0,
            gold: 0,

            strength: 5,
            intelligence: 5,
            agility: 5,
            vitality: 5,
            mentality: 5,
            luck: 5,
        },
        derived: {},
        inventory: [],
        currentPage: 1, // Current page for inventory display
        itemsPerPage: INVENTORY_SIZE, // Items per page
        equipment: {
            hat: null, neck: null, shoulder: null, mainWeapon: null, chest: null, 
            subWeapon: null, wrist: null, legs: null, ring1: null, ring2: null, feet: null
        },
        statusEffects: []
    };
    gameState.player = { x: 0, y: 0 };
    gameState.activeMonsters = [];
    gameState.healingBlocks = [];
    gameState.wanderingMerchant = null;
    gameState.isInCombat = false;
    gameState.isUiVisible = false;
    gameState.currentCombatMonster = null;
    gameState.isAutoAttacking = false;
    isInventoryOpen = false;
}
