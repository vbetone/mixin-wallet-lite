/* eslint-disable no-restricted-globals */

export const strippedHost = () => {
  let host = location.hostname;
  if(host.indexOf('www.') === 0) host = host.replace('www.', '');
  return host;
};

export const strip = key => {
  if (key.indexOf('-----') !== -1) {
    return key.split('-----')[2].replace(/\r?\n|\r/g, '');
  }
};