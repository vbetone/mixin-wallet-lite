import Lockr from 'lockr';
import { WALLET_NAME } from '../../config/Constants';

const getPasswordHash = () => {
  return new Promise(resolve => {
    const passwordHash = Lockr.get(`${WALLET_NAME}-bg-passwordHash`);
    if (passwordHash) {
      resolve(passwordHash);
    } else {
      resolve(null);
    }
  });
};

const setPasswordHash = passwordHash => {
  return new Promise(resolve => {
    Lockr.set(`${WALLET_NAME}-bg-passwordHash`, passwordHash);
    resolve(passwordHash);
  });
};

const getActiveAccount = () => {
  return new Promise(resolve => {
    const activeAccount = Lockr.get(`${WALLET_NAME}-bg-activeAccount`);
    if (activeAccount) {
      resolve(activeAccount);
    } else {
      resolve(null);
    }
  });
};

const setActiveAccount = activeAccount => {
  return new Promise(resolve => {
    Lockr.set(`${WALLET_NAME}-bg-activeAccount`, activeAccount);
    resolve(activeAccount);
  });
};

const resetAuthorizations = () => {

};

export default {
  getPasswordHash,
  setPasswordHash,
  getActiveAccount,
  setActiveAccount,
  resetAuthorizations,
};
