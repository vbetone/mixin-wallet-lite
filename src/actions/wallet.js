import { RESET_STATE } from './constants';
import uuid from 'uuid/v4';

export const SHOW_IMPORT_PRIVATE_KEY = 'SHOW_IMPORT_PRIVATE_KEY';
export const SHOW_CREATE_ACCOUNT = 'SHOW_CREATE_ACCOUNT';
export const SHOW_SEND_TOKEN = 'SHOW_SEND_TOKEN';
export const SHOW_RECEIVE_TOKEN = 'SHOW_RECEIVE_TOKEN';
export const SHOW_DEPOSIT_TOKEN = 'SHOW_DEPOSIT_TOKEN';
export const SHOW_WITHDRAW_TOKEN = 'SHOW_WITHDRAW_TOKEN';
export const SHOW_BACKUP_KEYSTORE = 'SHOW_BACKUP_KEYSTORE';
export const SHOW_WALLET_BACKUP = 'SHOW_WALLET_BACKUP';
export const SHOW_WALLET_RESET = 'SHOW_WALLET_RESET';

export const IMPORT_PRIVATE_KEY = 'IMPORT_PRIVATE_KEY';
export const RELOAD_ACCOUNT = 'RELOAD_ACCOUNT';

export const showImportPrivateKey = () => ({
  type: SHOW_IMPORT_PRIVATE_KEY,
  payload: {
    importPrivateKeyOpen: true,
  },
});

export const hideImportPrivateKey = () => ({
  type: SHOW_IMPORT_PRIVATE_KEY,
  payload: {
    importPrivateKeyOpen: false,
  },
});

export const showCreateAccount = () => ({
  type: SHOW_CREATE_ACCOUNT,
  payload: {
    createAccountOpen: true,
  },
});

export const hideCreateAccount = () => ({
  type: SHOW_CREATE_ACCOUNT,
  payload: {
    createAccountOpen: false,
  },
});

export const showSendToken = () => ({
  type: SHOW_SEND_TOKEN,
  payload: {
    sendTokenOpen: true,
  },
});

export const hideSendToken = () => ({
  type: SHOW_SEND_TOKEN,
  payload: {
    sendTokenOpen: false,
  },
});

export const showReceiveToken = () => ({
  type: SHOW_RECEIVE_TOKEN,
  payload: {
    receiveTokenOpen: true,
  },
});

export const hideReceiveToken = () => ({
  type: SHOW_RECEIVE_TOKEN,
  payload: {
    receiveTokenOpen: false,
  },
});

export const showDepositToken = asset => ({
  type: SHOW_DEPOSIT_TOKEN,
  payload: {
    depositTokenOpen: true,
    asset,
  },
});

export const hideDepositToken = () => ({
  type: SHOW_DEPOSIT_TOKEN,
  payload: {
    depositTokenOpen: false,
  },
});

export const showWithdrawToken = asset => ({
  type: SHOW_WITHDRAW_TOKEN,
  payload: {
    withdrawTokenOpen: true,
    asset,
  },
});

export const hideWithdrawToken = () => ({
  type: SHOW_WITHDRAW_TOKEN,
  payload: {
    withdrawTokenOpen: false,
  },
});

export const showBackupKeystore = () => ({
  type: SHOW_BACKUP_KEYSTORE,
  payload: {
    backupKeystoreOpen: true,
  },
});

export const hideBackupKeystore = () => ({
  type: SHOW_BACKUP_KEYSTORE,
  payload: {
    backupKeystoreOpen: false,
  },
});

export const importPrivateKey = privateKey => ({
  type: IMPORT_PRIVATE_KEY,
  payload: {
    privateKey,
  },
});

export const showWalletBackup = privateKey => ({
  type: SHOW_WALLET_BACKUP,
  payload: {
    walletBackupOpen: true,
    privateKey,
  },
});

export const hideWalletBackup = () => ({
  type: SHOW_WALLET_BACKUP,
  payload: {
    walletBackupOpen: false,
  },
});

export const showWalletReset = () => ({
  type: SHOW_WALLET_RESET,
  payload: {
    walletResetOpen: true,
  },
});

export const hideWalletReset = () => ({
  type: SHOW_WALLET_RESET,
  payload: {
    walletResetOpen: false,
  },
});

export const reloadAccount = () => ({
  type: RELOAD_ACCOUNT,
  payload: {
    reloadAccountNonce: uuid(),
  },
});

export const resetWallet = () => ({
  type: RESET_STATE,
});
