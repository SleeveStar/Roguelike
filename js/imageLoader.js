// imageLoader.js
import {
  PLAYER_IMAGE_PATH,
  GOLD_ICON_PATH,
  HEALING_BLOCK_IMAGE_PATH,
  MONSTER_TYPES,
} from './constants.js';

export let playerImage = new Image();
export let goldIconImage = new Image();
export let healingBlockImage = new Image();
export const monsterImageCache = {};
export const tileImageCache = {};

let currentActiveTileSet = null;

/**
 * tiles.js에 있는 path가 "/img/..." (루트 기준)이라도
 * 실제 배포 폴더가 "/송프로젝트/img"처럼 하위경로일 수 있으므로
 * "현재 JS 파일 위치(import.meta.url)" 기준으로 ../img/... 로 변환한다.
 *
 * 예)
 *  - tileProp.path = "/img/forest/WOOD_1.png"
 *  - imageLoader.js 위치 = ".../송프로젝트/js/imageLoader.js"
 *  => new URL("../img/forest/WOOD_1.png", import.meta.url) => ".../송프로젝트/img/forest/WOOD_1.png"
 */
function resolveImgPath(path) {
  if (!path) return null;

  // 이미 절대 URL(http/https)이면 그대로
  if (/^https?:\/\//i.test(path)) return path;

  // "/img/..." 형태면 "img/" 이후만 떼서 "../img/..."로 재구성
  if (path.startsWith('/img/')) {
    const rest = path.slice('/img/'.length); // "forest/WOOD_1.png"
    return new URL(`../img/${rest}`, import.meta.url).href;
  }

  // 그 외(상대경로 등)는 그냥 import.meta.url 기준으로 해석
  return new URL(path, import.meta.url).href;
}

export function preloadGameAssets(activeTileSet) {
  return new Promise((resolve) => {
    currentActiveTileSet = activeTileSet;

    Object.keys(monsterImageCache).forEach(k => delete monsterImageCache[k]);
    Object.keys(tileImageCache).forEach(k => delete tileImageCache[k]);

    // ✅ 실제로 로드할 "타일 이미지(path가 있는 것)"만 카운트
    const tileNamesToLoad = Object.keys(activeTileSet.TILE_PROPERTIES).filter((tileName) => {
      const tileProp = activeTileSet.TILE_PROPERTIES[tileName];
      return !!tileProp?.path;
    });

    const totalToLoad = MONSTER_TYPES.length + tileNamesToLoad.length + 3;
    if (totalToLoad === 0) return resolve();

    let loadedCount = 0;
    const doneOne = () => {
      loadedCount++;
      if (loadedCount === totalToLoad) resolve();
    };

    const onLoad = (e) => {
      if (e.target.naturalHeight === 0) {
        console.error(`Loaded but unusable: ${e.target.src}`);
      }
      doneOne();
    };
    const onError = (e) => {
      console.error(`Error loading: ${e.target.src}, type=${e.type}`);
      doneOne();
    };

    // Player / Gold / Healing (constants도 "/img/..."이면 같은 방식으로 변환)
    playerImage.onload = onLoad;
    playerImage.onerror = onError;
    playerImage.src = resolveImgPath(PLAYER_IMAGE_PATH) ?? PLAYER_IMAGE_PATH;

    goldIconImage.onload = onLoad;
    goldIconImage.onerror = onError;
    goldIconImage.src = resolveImgPath(GOLD_ICON_PATH) ?? GOLD_ICON_PATH;

    healingBlockImage.onload = onLoad;
    healingBlockImage.onerror = onError;
    healingBlockImage.src = resolveImgPath(HEALING_BLOCK_IMAGE_PATH) ?? HEALING_BLOCK_IMAGE_PATH;

    // ✅ Tiles: tileProp.path를 그대로 쓰되 resolveImgPath로 변환해서 사용
    Object.keys(activeTileSet.TILE_PROPERTIES).forEach((tileName) => {
      const tileProp = activeTileSet.TILE_PROPERTIES[tileName];

      if (tileProp?.path) {
        const img = new Image();
        img.onload = onLoad;
        img.onerror = onError;
        img.src = resolveImgPath(tileProp.path);
        tileImageCache[tileName] = img;
      } else {
        tileImageCache[tileName] = null; // 이미지 없는 타일
      }
    });

    // Monsters: 기존에 "/img/..."로 잡아도 동일하게 변환 처리
    MONSTER_TYPES.forEach((monsterInfo) => {
      const img = new Image();
      img.onload = onLoad;
      img.onerror = onError;

      const monsterName = monsterInfo.name;
      img.src = resolveImgPath(`/img/${monsterName}.png`);

      monsterImageCache[monsterName] = img;
    });
  });
}

export function getCurrentActiveTileSet() {
  return currentActiveTileSet;
}
