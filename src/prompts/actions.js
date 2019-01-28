
export const SET_PROMPT = 'setPrompt';

export const setPrompt = (prompt) => ({
  type: SET_PROMPT,
  payload: {
    ...prompt
  }
});