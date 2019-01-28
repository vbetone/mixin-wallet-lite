import debugBackgroundPage from './debugBackgroundPage';
import chromeBackgroundPage from './chromeBackgroundPage';

let backgroundPage;
if (process.env.NODE_ENV === 'development') {
  backgroundPage = debugBackgroundPage;
} else {
}
backgroundPage = chromeBackgroundPage;

export { backgroundPage };
