import AES from 'crypto-js/aes';
import CryptoJS from 'crypto-js';

class AesOop {
	static encrypt(data, key) {
		if (typeof data === 'object') {
			data = JSON.stringify(data);
		}
		return AES.encrypt(data, key).toString();
	}
	static decrypt(encryptedData, key) {
		let clear = AES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8);
		try {
			return JSON.parse(clear);
		} catch (e) {
			return clear;
		}
	}
}

export default AesOop;