import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './prompts/components/App';
import store from './prompts/store';
import { apis } from './utils/browserApis';
import Prompt from './models/prompts/prompt';
import { setPrompt } from './prompts/actions';

class PromptWindow {

  constructor(){
    let prompt = window.data || apis.extension.getBackgroundPage().notification || null;

    prompt = Prompt.fromJson(prompt);
    store.dispatch(setPrompt(prompt));
    ReactDOM.render(
      <Provider store={store}>
        <App />
      </Provider>,
      document.getElementById('root')
    );
  }

}

new PromptWindow();


