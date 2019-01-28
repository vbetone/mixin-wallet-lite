import uuid from 'uuid/v4';
import KJUR from 'jsrsasign';
import $ from 'jquery';
import MixinUtils from 'bot-api-js-client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import presetAssets from '../config/preset-assets';
import { getNodeUrl, MAINNET } from './networks';

const config = {
  clientId: 'aa241c98-a545-4115-8dc2-b665a4734996',
  sessionId: '5d75bc72-c5ea-40cf-93c3-b20779679a7d',
  privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIICWwIBAAKBgQCFbi7wut8o3jDMtTR/N7HD/4vovDk8e21FhJYb7EyDFGKi17Ka
fJ/yN3X2TfsXkm9A3OIBbABdMbMjNrTRr+cB4gTrEMzFzgqtqIf07cxY629TxTNf
adtcnzQA0p62IN8zRR5kdvCGlWEgqC1o1LHkd+Xbj2XU8/CcOrb56UBBzwIDAQAB
AoGAOW6o08OL5LpmxOZGV2/wm022uhGyjT8PVLnyJsi6Uj2HC1LOtMJp0kdfBgqg
xo+oRYIN4dDMA1EuKz0T7aHKS50LpQfd3yudy6S9GtPW4jL/+O9EYMTBDDHYgB/D
CQFvDhK6A71iJOWxeLRpXIWW6kYpLogrxytK+M9TEqof04kCQQC8i5usRzlwNrXX
VVsOkw/jjRrEMQkzu0StfyIB9GUTaNW+X0qNIOpuRDT96lubsZbPWWmWkSXfzHit
S/5oIDFDAkEAtSq8sFFkrTVXeSA8qXTRVL+VYu+WVcNNCNnQwV9Nxa/MEoVJ2oLp
4fUMylLexH/7gCtVzLRrNIm+MuUIpwcOhQJAFlJ1AMWB8F4Z0z+gwy34EJmxFI81
prFCJURK825K1SxxOdOwUNsXxiw/Fdy8McepsizEynWuxTtBAktf+FXvXwJAWteJ
Meg+UVPz/rqZcGcxKAvA/pEgkvSRRiTiNnRxbPUPoSHQvI70c+cKeNFA/ssl80jH
hxPYxclj4+VQh2BUeQJABzOhwvXGDDlBXS28aJhYc/CgKMtd8ejTyT9gkQAwxjIL
XJwYu660OprQGpCxZ2i+iXyuQjnq9ydIB7gNB5LxDQ==
-----END RSA PRIVATE KEY-----`,
};

const MIXIN_URL = getNodeUrl(MAINNET);
const TIMEOUT = 3600;
const mixinUtils = new MixinUtils();

const getRequestSignature = (method, uri, body) => {
  if (!body) {
    body = '';
  }
  const payload =
    method +
    uri +
    (typeof body === 'object' ? JSON.stringify(body) : body.toString());
  const signature = crypto
    .createHash('sha256')
    .update(payload)
    .digest('hex');
  return signature;
};

const getJwtToken = (clientId, sessionId, privateKey, method, uri, body) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expireAt = issuedAt + TIMEOUT;
  const payload = {
    uid: clientId,
    sid: sessionId,
    iat: issuedAt,
    exp: expireAt,
    jti: uuid(),
    sig: getRequestSignature(method, uri, body),
  };
  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS512'
  });
  return token;
};

const strip = key => {
  if (key.indexOf('-----') !== -1) {
    return key.split('-----')[2].replace(/\r?\n|\r/g, '');
  }
};

const signPin = (pin, userData) => {
  return mixinUtils.signEncryptedPin(
    pin,
    userData.pinToken,
    userData.sessionId,
    userData.privateKey
  );
};

const error = (resp, callback) => {
  console.error(resp.error);
};

const send = (token, method, url, params, callback) => {
  const requestObject = {
    type: method,
    url: url,
    contentType: 'application/json',
    beforeSend: xhr => {
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    },
    success: resp => {
      let consumed = false;
      if (typeof callback === 'function') {
        consumed = callback(resp);
      }
      if (!consumed && resp.error !== null && resp.error !== undefined) {
        error(resp);
      }
    },
    error: event => {
      error(event.responseJSON, callback);
    },
  };

  if (params) {
    requestObject.data = JSON.stringify(params);
  }
  $.ajax(requestObject);
};

const request = (method, path, params, userData, callback) => {
  const url = MIXIN_URL + path;
  let token = '';
  if (userData) {
    token = getJwtToken(
      userData.clientId,
      userData.sessionId,
      userData.privateKey,
      method,
      path,
      params
    );
  } else {
    token = getJwtToken(
      config.clientId,
      config.sessionId,
      config.privateKey,
      method,
      path,
      params
    );
  }
  return send(token, method, url, params, callback);
};

// https://developers.mixin.one/api/alpha-mixin-network/app-user/
export const createUser = (fullName) => {
  const keyPair = KJUR.KEYUTIL.generateKeypair('RSA', 1024);
  keyPair.prvKeyObj.isPrivate = true;
  const privateKey = KJUR.KEYUTIL.getPEM(keyPair.prvKeyObj, 'PKCS1PRV');
  const publicKey = strip(KJUR.KEYUTIL.getPEM(keyPair.pubKeyObj));
  let full_name = uuid().toLowerCase();
  if (fullName) {
    full_name = fullName;
  }
  const params = {
    session_secret: publicKey,
    full_name,
  };

  return new Promise((resolve, reject) => {
    request('POST', '/users', params, null, resp => {
      if (resp.error) {
        reject(resp.error);
        return;
      }
      resp.data.privateKey = privateKey;
      resp.data.publicKey = publicKey;
      resolve(resp.data);
    });
  });
};

// https://developers.mixin.one/api/alpha-mixin-network/create-pin/
export const updatePin = (userData, oldPin, newPin) => {
  let old_pin = '';
  if (oldPin !== '') {
    old_pin = signPin(oldPin, userData);
  }
  const params = {
    old_pin: old_pin,
    pin: signPin(newPin, userData),
  };

  return new Promise((resolve, reject) => {
    request('POST', '/pin/update', params, userData, resp => {
      if (resp.error) {
        reject(resp.error);
        return;
      }
      resolve(resp.data);
    });
  });
};

// https://developers.mixin.one/api/alpha-mixin-network/read-assets/
export const loadAssets = userData => {
  return new Promise((resolve, reject) => {
    request('GET', '/assets', undefined, userData, resp => {
      if (resp.error) {
        reject(resp.error);
        return;
      }
      resolve(resp.data);
    });
  });
};

export const loadAssetsWithPreset = async userData => {
  const assets = await loadAssets(userData);
  let mergedAssets = presetAssets;
  for (const asset of assets) {
    // remove the preset one, then re-add
    mergedAssets = mergedAssets.filter(a => a.asset_id !== asset.asset_id);
    mergedAssets.push(asset);
  }
  mergedAssets = mergedAssets.sort((a, b) => {
    if (!a.balance && !b.balance) {
      return 0;
    } else if (!b.balance) {
      return -1;
    } else {
      return b.balance - a.balance;
    }
  });
  return mergedAssets;
};

// https://developers.mixin.one/api/alpha-mixin-network/read-asset/
export const loadAsset = (asset, userData) => {
  return new Promise((resolve, reject) => {
    request('GET', `/assets/${asset.asset_id}`, undefined, userData, resp => {
      if (resp.error) {
        reject(resp.error);
        return;
      }
      resolve(resp.data);
    });
  });
};

// https://developers.mixin.one/api/alpha-mixin-network/deposit/
export const loadDepositInfo = (asset, userData) => {
  return loadAsset(asset, userData);
};

const loadWithdrawalInfo = (asset, userData) => {
  return loadAsset(asset, userData);
};

// https://developers.mixin.one/api/alpha-mixin-network/withdrawal/
export const withdraw = async (asset, userData, withdrawData) => {
  const data = await loadWithdrawalInfo(asset, userData);
  return new Promise((resolve, reject) => {
    let params = {
      asset_id: asset.asset_id,
      pin: signPin(withdrawData.withdrawPin, userData),
    };

    if (data.public_key) {
      // Non-EOS
      params['label'] = asset.symbol;
      params['public_key'] = withdrawData.withdrawTo;
    } else if (data.account_name && data.account_tag) {
      // EOS
      params['account_name'] = withdrawData.withdrawTo;
      params['account_tag'] = withdrawData.withdrawMemo;
    } else {
      reject('Token not supported!');
      return;
    }

    request('POST', '/addresses', params, userData, resp => {
      if (resp.error) {
        reject(resp.error);
        return;
      }
      params = {
        address_id: resp.data.address_id,
        amount: withdrawData.withdrawAmount,
        pin: signPin(withdrawData.withdrawPin, userData),
        trace_id: uuid().toLowerCase(),
        memo: withdrawData.withdrawMemo,
      };

      request('POST', '/withdrawals', params, userData, resp => {
        if (resp.error) {
          reject(resp.error);
          return;
        }
        resolve(resp.data);
      });
    });
  });
};

// https://developers.mixin.one/api/alpha-mixin-network/transfer/
export const transfer = async (asset, userData, transferData) => {
  return new Promise((resolve, reject) => {
    let traceId = transferData.traceId;
    if (!traceId) {
      traceId = uuid();
    }
    const params = {
      asset_id: asset.asset_id,
      opponent_id: transferData.sendTo,
      amount: transferData.sendAmount,
      pin: signPin(transferData.sendPin, userData),
      trace_id: traceId.toLowerCase(),
      memo: transferData.sendMemo,
    };

    request('POST', '/transfers', params, userData, resp => {
      if (resp.error) {
        reject(resp.error);
        return;
      }
      resolve(resp.data);
    });
  });
};

export const exportPrivateKey = userData => {
  return Buffer.from(
    JSON.stringify({
      key: userData.privateKey,
      uid: userData.clientId,
      pintoken: userData.pinToken,
      sid: userData.sessionId,
    })
  ).toString('base64');
};

// https://developers.mixin.one/api/alpha-mixin-network/verify-pin/
export const verifyPin = (pin, userData) => {
  return new Promise((resolve, reject) => {
    const params = {
      pin: signPin(pin, userData),
    };
    request('POST', '/pin/verify', params, userData, resp => {
      if (resp.error) {
        reject(resp.error);
        return;
      }
      resolve(resp.data);
    });
  });
};

// No doc yet
export const loadTransactions = (userData, limit = 500, offset = 0) => {
  return new Promise((resolve, reject) => {
    const path = `/snapshots?limit=${limit}&offset=${offset}`;
    request('GET', path, null, userData, resp => {
      if (resp.error) {
        reject(resp.error);
        return;
      }
      resolve(resp.data);
    });
  });
};