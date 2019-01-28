const getBackgroundPage = () => window.chrome.extension.getBackgroundPage();

const getPasswordHash = () => {
  return new Promise(resolve => {
    const backgroundPage = getBackgroundPage();
    const hash = backgroundPage ? backgroundPage.getPasswordHash() : null;
    resolve(hash);
  });
};

const setPasswordHash = data => {
  return new Promise(resolve => {
    const backgroundPage = getBackgroundPage();
    const hash = backgroundPage ? backgroundPage.setPasswordHash(data) : null;
    resolve(hash);
  });
};

const getActiveAccount = () => {
  return new Promise(resolve => {
    const backgroundPage = getBackgroundPage();
    const activeAccount = backgroundPage
      ? backgroundPage.getActiveAccount()
      : null;
    resolve(activeAccount);
  });
};

const setActiveAccount = data => {
  return new Promise(resolve => {
    const backgroundPage = getBackgroundPage();
    const activeAccount = backgroundPage
      ? backgroundPage.setActiveAccount(data)
      : null;
    resolve(activeAccount);
  });
};

const resetAuthorizations = () => {
  return new Promise(resolve => {
    const backgroundPage = getBackgroundPage();
    backgroundPage && backgroundPage.resetAuthorizations();
    resolve(true);
  });
};

export default {
  getPasswordHash,
  setPasswordHash,
  getActiveAccount,
  setActiveAccount,
  resetAuthorizations,
};
