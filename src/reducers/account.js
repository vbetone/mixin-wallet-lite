import { RESET_STATE } from '../actions/constants';
import { SET_ACCOUNT_INFO, SET_ASSETS } from '../actions/account';

import presetAssets from '../config/preset-assets';

const initialState = {
  accounts: [],
  assets: presetAssets,
  activeAccount: null,
};

export function accountReducer(state = initialState, action) {
  switch (action.type) {
    case SET_ACCOUNT_INFO:
    case SET_ASSETS: {
      return {
        ...state,
        ...action.payload,
      };
    }
    case RESET_STATE:
      return initialState;
    default:
      return state;
  }
}
