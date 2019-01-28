import AES from 'crypto-js/aes';
import CryptoJS from 'crypto-js';
import KJUR from 'jsrsasign';


import passwordValidator from 'password-validator';

import { backgroundPage } from './backgroundPage';

export const isAddress = address => {
  return address && address.length > 0;
};

export const isAppPasswordValid = password => {
  const schema = new passwordValidator();
  schema
    .is()
    .min(6) // Minimum length 6
    .is()
    .max(20) // Maximum length 20
    .has()
    .not()
    .spaces(); // Should not have spaces

  return password && schema.validate(password);
};

export const isPrivateKeyValid = privateKey => {
  return privateKey && privateKey.length >= 1000;
};

export const getTxAbbreviation = tx => {
  if (tx) {
    return tx.substr(0, 8) + '...' + tx.substr(tx.length - 8, 8);
  } else {
    return 'pending...';
  }
};

export const getAddressAbbreviation = address => {
  if (address) {
    return address.substr(0, 8) + '...' + address.substr(address.length - 8, 8);
  } else {
    return '';
  }
};

export const getActiveUserData = async activeAccount => {
  const passwordHashInBackground = await backgroundPage.getPasswordHash();
  const userDataStr = AES.decrypt(
    activeAccount.encryptedUserData,
    passwordHashInBackground
  ).toString(CryptoJS.enc.Utf8);
  return JSON.parse(userDataStr);
};

export const getUserData = async account => {
  const passwordHashInBackground = await backgroundPage.getPasswordHash();
  const userDataStr = AES.decrypt(
    account.encryptedUserData,
    passwordHashInBackground
  ).toString(CryptoJS.enc.Utf8);
  return JSON.parse(userDataStr);
};

export const encryptPin = async (clientId, domain, pin) => {
  const passwordHashInBackground = await backgroundPage.getPasswordHash();
  const pass = clientId + domain + passwordHashInBackground;
  return AES.encrypt(pin, pass).toString();
}

export const decryptPin = async (clientId, domain, pin) => {
  const passwordHashInBackground = await backgroundPage.getPasswordHash();
  const pass = clientId + domain + passwordHashInBackground;
  return AES.decrypt(pin, pass).toString(CryptoJS.enc.Utf8);
}

export const exportRsaPublicKeyFromPrivate = prk => {
  // https://github.com/kjur/jsrsasign/issues/328
  // TO DO
  // change to another library
  const prkObj = KJUR.KEYUTIL.getKey(prk);
  prkObj.isPrivate = false;
  prkObj.isPublic = true;
  return KJUR.KEYUTIL.getPEM(prkObj);
};