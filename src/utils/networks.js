const MAINNET = 'MAINNET';
const TESTNET = 'TESTNET';
const DEFAULT_NETWORK = MAINNET;

const isMainnet = network => network === MAINNET;
const isTestnet = network => network === TESTNET;

const MAINNET_NODE_URL = 'https://api.mixin.one';
const getNodeUrl = network => {
  if (isMainnet(network)) {
    return MAINNET_NODE_URL;
  } else if (isTestnet(network)) {
    return 'https://testnet.is.not.support.yet';
  } else {
    return MAINNET_NODE_URL;
  }
};

export { MAINNET, TESTNET, DEFAULT_NETWORK, getNodeUrl, isMainnet, isTestnet };
