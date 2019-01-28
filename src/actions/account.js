import { RESET_STATE } from './constants';

export const SET_ACCOUNT_INFO = 'SET_ACCOUNT_INFO';
export const SET_ASSETS = 'SET_ASSETS';

export const setAccountInfo = (accounts, activeAccount) => ({
  type: SET_ACCOUNT_INFO,
  payload: {
    accounts,
    activeAccount,
  },
});

export const setAssets = assets => ({
  type: SET_ASSETS,
  payload: {
    assets,
  },
});

export const resetAccount = () => ({
  type: RESET_STATE,
});
