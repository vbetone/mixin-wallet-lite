
const initialState = {};

export function prompt(state = initialState, action) {
  return {
    ...state,
    ...action.payload,
  };
}

export default {
  prompt
};
