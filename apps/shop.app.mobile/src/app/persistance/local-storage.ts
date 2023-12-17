import { Store } from '@reduxjs/toolkit';
import { MMKV } from 'react-native-mmkv';

export let storage: MMKV;

try {
  // This will not work on managed flow
  storage = new MMKV();
  console.log('MMKV storage initialized');
} catch (error) {
  console.error('MMKV storage initialization failed', error);
}

export interface PersistentState {
  persistent: boolean;
}

function instanceOfPersistent(object: any): object is PersistentState {
  return 'persistent' in object;
}

export const loadFromLocalStorage = () => {
  const state = storage?.getString('shop.app.state');
  if (state) {
    console.log('Restored from local storage', state);
    return JSON.parse(state);
  }
  return {};
};

export const saveToLocalStorage = (store: Store) => {
  const state = store.getState();
  const stateToPersist: any = {};
  for (const key in state) {
    if (instanceOfPersistent(state[key])) {
      if (state[key].persistent === true) {
        stateToPersist[key] = state[key];
      }
    }
  }
  storage?.set('shop.app.state', JSON.stringify(stateToPersist));
};
