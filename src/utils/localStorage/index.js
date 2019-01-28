import chromeLocalStorage  from './chromeLocalStorage';
import debugLocalStorage from './debugLocalStorage';

let localStorage;
if (process.env.NODE_ENV === 'development') {
  localStorage = debugLocalStorage;
} else {
}
localStorage = chromeLocalStorage;

export { localStorage };
