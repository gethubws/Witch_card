// ============================================
// 魔女卡牌 — 存档管理 (IndexedDB)
// ============================================
import type { SaveData } from '../types';

const DB_NAME = 'witch_card_save';
const DB_VERSION = 1;
const STORE_NAME = 'saves';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: 'key' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveGame(slot: string, data: SaveData): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ key: slot, ...data });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadGame(slot: string): Promise<SaveData | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(slot);
    req.onsuccess = () => {
      if (!req.result) { resolve(null); return; }
      const { key, ...data } = req.result;
      resolve(data as SaveData);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteSave(slot: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(slot);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** 创建新存档 */
export function createNewSave(): SaveData {
  return {
    version: 1,
    timestamp: Date.now(),
    gold: 300,
    diamonds: 0,
    bag: [],
    warehouse: [],
    hospitalQueue: [],
    unlockedAreas: ['forest_trial'],
    tutorialDone: false,
    questFlags: {},
    engraveCopper: 1,
    engraveSilver: 0,
    engraveGold: 0,
  };
}
