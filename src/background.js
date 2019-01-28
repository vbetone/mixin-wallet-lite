import {
  LocalStream
} from './utils/extensionStreams';
import InternalMessage from './messages/internalMessage';
import * as InternalMessageTypes from './messages/internalMessageTypes';
import NotificationService from './services/notificationService'
import StorageService from './services/storageService';
import {
  transfer,
  loadAssets
} from './utils/mixin';
import {
  getUserData
} from './utils/crypto';
import Error from './models/errors/error';
import {
  ErrorCodes
} from './models/errors/error';
import * as ErrorTypes from './models/errors/errorTypes';
import Prompt from './models/prompts/prompt';
import * as PromptTypes from './models/prompts/promptTypes';
import {
  encryptPin,
  decryptPin
} from './utils/crypto';


let passwordHash = null;
let activeAccount = null;
let authorizations = {};

export default class Background {

  constructor() {
    this.initWindow();
    this.setupInternalMessaging();
  }

  initWindow() {
    window.getPasswordHash = () => {
      return passwordHash;
    };

    window.setPasswordHash = (data) => {
      passwordHash = data;
      return passwordHash;
    };

    window.getActiveAccount = () => {
      return activeAccount;
    };

    window.setActiveAccount = (data) => {
      activeAccount = data;
      return activeAccount;
    };

    window.resetAuthorizations = () => {
      authorizations = {};
    }
  }

  static setAuthorizations(data) {
    if (!data) {
      authorizations = {};
      return authorizations;
    }
    const { clientId, domain, value } = data;
    let client = authorizations[clientId] || {};
    let domainValue = Object.assign({}, client[domain] || {}, value);
    client[domain] = domainValue;
    authorizations[clientId] = client;
    return authorizations;
  }

  static getAuthorized(clientId, domain) {
    if (!authorizations[clientId]) {
      return false;
    }
    if (!authorizations[clientId][domain]) {
      return false;
    }
    return authorizations[clientId][domain].authorized || false;
  }

  static deleteAuthorization(clientId, domain) {
    if (authorizations[clientId] && authorizations[clientId][domain]) {
      authorizations[clientId][domain] = {};
    }
  }

  static async getPin(clientId, domain) {
    if (!authorizations[clientId]) {
      return null;
    }
    if (!authorizations[clientId][domain]) {
      return null;
    }
    const pin = authorizations[clientId][domain].pin || null;
    if (!pin) {
      return null;
    }
    try {
      return await decryptPin(clientId, domain, pin);
    } catch (e) {
      return null;
    }
  }

  setupInternalMessaging() {
    LocalStream.watch((request, sendResponse) => {
      const message = InternalMessage.fromJson(request);
      this.dispenseMessage(sendResponse, message);
    })
  }

  dispenseMessage(sendResponse, message) {
    switch (message.type) {
      case InternalMessageTypes.TEST:
        Background.test(sendResponse, message.payload);
        break;
      case InternalMessageTypes.GET_OR_REQUEST_IDENTITY:
        Background.getOrRequestIdentity(sendResponse, message.payload);
        break;
      case InternalMessageTypes.FORGET_IDENTITY:
        Background.forgetIdentity(sendResponse, message.payload);
        break;
      case InternalMessageTypes.REQUEST_TRANSFER:
        Background.requestTransfer(sendResponse, message.payload);
        break;
      case InternalMessageTypes.REQUEST_BALANCE:
        Background.requestBalance(sendResponse, message.payload);
        break;
      default:
        Background.malicious(sendResponse);
        break;
    }
  }

  static malicious(sendResponse) {
    sendResponse(Error.maliciousEvent());
  }

  static lockGuard(sendResponse, cb) {
    if (!passwordHash) {
      NotificationService.open(Prompt.locked());
      sendResponse(Error.locked());
    } else {
      cb();
    };
  }

  static test(sendResponse, payload) {
    NotificationService.open(Prompt.locked());
    sendResponse({ ...payload,
      message: 'background response'
    });
  }

  static getOrRequestIdentity(sendResponse, payload) {
    Background.lockGuard(sendResponse, () => {
      const { clientId, fullName, publicKey } = window.getActiveAccount();
      const { domain } = payload;

      if (Background.getAuthorized(clientId, domain)) {
        return sendResponse({ clientId, fullName, publicKey });
      }

      const prompt = new Prompt('Identity Request', PromptTypes.REQUEST_IDENTITY, domain, null, {
        clientId,
        fullName,
        publicKey
      }, (data) => {
        if (data && !data.isError) {
          Background.setAuthorizations({ clientId, domain, value: { authorized: true } });
          return sendResponse(data);
        }
        if (!data) {
          return sendResponse(Error.rejected());
        }
        return sendResponse(Error.promptClosedWithoutAction());
      });
      NotificationService.open(prompt);
    });
  }

  static forgetIdentity(sendResponse, payload) {
    Background.lockGuard(sendResponse, () => {
      const { identity, domain } = payload;
      Background.deleteAuthorization(identity.clientId, domain);
      return sendResponse(true);
    });
  }

  static requestTransfer(sendResponse, payload) {
    Background.lockGuard(sendResponse, async () => {

      const { identity, domain, asset, sendTo, sendAmount, sendMemo, traceId } = payload;

      const { clientId } = identity;

      if (!Background.getAuthorized(clientId, domain)) {
        return sendResponse(new Error(ErrorTypes.MIXIN_NETWORK, 'Unauthorized!', ErrorCodes.MIXIN_NETWORK));
      }
      const account = await StorageService.getAccount(clientId);

      const pin = await Background.getPin(clientId, domain);
      if (pin) {
        const transferData = { sendPin: pin, sendTo, sendAmount, sendMemo, traceId };
        const userData = await getUserData(account);
        const resp = await transfer(asset, userData, transferData);
        return sendResponse(resp);
      }
      if (account) {
        const prompt = new Prompt('Transfer Request', PromptTypes.REQUEST_TRANSFER, domain, {}, payload, async (data) => {

          if (data && !data.isError) {
            try {
              const { sendPin, rememberPin } = data;
              if (rememberPin) {
                const encryptedPin = await encryptPin(clientId, domain, sendPin);
                Background.setAuthorizations({ clientId, domain, value: { pin: encryptedPin } });
              }
              const transferData = { sendPin, sendTo, sendAmount, sendMemo, traceId };
              const userData = await getUserData(account);
              const resp = await transfer(asset, userData, transferData);
              return sendResponse(resp);
            } catch (e) {
              return sendResponse(new Error(ErrorTypes.MIXIN_NETWORK, e.message, ErrorCodes.MIXIN_NETWORK));
            }
          }

          if (!data) {
            return sendResponse(Error.rejected());
          }
          return sendResponse(new Error(ErrorTypes.INTERNAL_ERROR, 'Transfer failed', ErrorCodes.INTERNAL_ERROR));
        });
        NotificationService.open(prompt);
      } else {
        return sendResponse(new Error(ErrorTypes.INTERNAL_ERROR, 'Account does not exists', ErrorCodes.INTERNAL_ERROR));
      }
    });
  }

  static requestBalance(sendResponse, payload) {
    Background.lockGuard(sendResponse, async () => {
      const {
        identity,
        domain
      } = payload;
      const {
        clientId
      } = identity;
      if (!Background.getAuthorized(clientId, domain)) {
        return sendResponse(new Error(ErrorTypes.MIXIN_NETWORK, 'Unauthorized!', ErrorCodes.MIXIN_NETWORK));
      }
      const account = await StorageService.getAccount(identity.clientId);
      if (account) {
        try {
          const userData = await getUserData(account);
          const resp = await loadAssets(userData);
          return sendResponse(resp);
        } catch (e) {
          return sendResponse(new Error(ErrorTypes.MIXIN_NETWORK, e.message, ErrorCodes.MIXIN_NETWORK));
        }
      } else {
        return sendResponse(new Error(ErrorTypes.INTERNAL_ERROR, 'Account does not exists', ErrorCodes.INTERNAL_ERROR));
      }
    });
  }
}

new Background();