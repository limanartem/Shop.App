import { Store } from '@reduxjs/toolkit';

export interface PersistentState {
  persistent: boolean;
}

function instanceOfPersistent(object: any): object is PersistentState {
  return 'persistent' in object;
}

export const loadFromLocalStorage = () => {
  const state = localStorage.getItem('shop.app.state');
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
  localStorage.setItem('shop.app.state', JSON.stringify(stateToPersist));
};
