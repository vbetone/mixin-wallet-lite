import CryptoJS from 'crypto-js';
import Lockr from 'lockr';
import { DEFAULT_NETWORK } from '../networks';
import { WALLET_NAME } from '../../config/Constants';

const getOrCreateAppSalt = () => {
  return new Promise(resolve => {
    const appSalt = Lockr.get(`${WALLET_NAME}-appSalt`);
    if (appSalt) {
      resolve(appSalt);
    } else {
      const newAppSalt = CryptoJS.lib.WordArray.random(32).toString();
      Lockr.set(`${WALLET_NAME}-appSalt`, newAppSalt);
      resolve(newAppSalt);
    }
  });
};

const setPasswordHash = passwordHash => {
  return new Promise(resolve => {
    Lockr.set(`${WALLET_NAME}-passwordHash`, passwordHash);
    resolve(passwordHash);
  });
};

const getPasswordHash = () => {
  return new Promise(resolve => {
    const passwordHash = Lockr.get(`${WALLET_NAME}-passwordHash`);
    if (passwordHash) {
      resolve(passwordHash);
    } else {
      resolve(null);
    }
  });
};

const setAccounts = accounts => {
  return new Promise(resolve => {
    Lockr.set(`${WALLET_NAME}-accounts`, accounts);
    resolve(accounts);
  });
};

const getAccounts = () => {
  return new Promise(resolve => {
    const accounts = Lockr.get(`${WALLET_NAME}-accounts`);
    if (accounts) {
      resolve(accounts);
    } else {
      resolve([]);
    }
  });
};

const getAccount = (clientId) => {
  return getAccounts().then(accounts => {
    if (Array.isArray(accounts)) {
      return accounts.find(a => {
        return (a.clientId === clientId);
      });
    }
    return null;
  });
}

const setAccount = (account) => {
  return getAccounts().then(accounts => {
    if (Array.isArray(accounts)) {
      const i = accounts.findIndex(a => {
        return (a.clientId === account.clientId);
      });
      if (i > -1) {
        accounts[i] = accounts;
      } else {
        accounts.push(account);
      }
    } else {
      accounts = [account];
    }
    return setAccounts(accounts);
  });
}

const setNetwork = network => {
  return new Promise(resolve => {
    Lockr.set(`${WALLET_NAME}-network`, network);
    resolve(network);
  });
};

const getNetworkOrDefault = () => {
  return new Promise(resolve => {
    const network = Lockr.get(`${WALLET_NAME}-network`);
    if (network) {
      resolve(network);
    } else {
      resolve(DEFAULT_NETWORK);
    }
  });
};

export default {
  getOrCreateAppSalt,
  setPasswordHash,
  getPasswordHash,
  setAccounts,
  getAccounts,
  getAccount,
  setAccount,
  setNetwork,
  getNetworkOrDefault,
};
