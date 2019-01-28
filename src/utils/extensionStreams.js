/* eslint-disable no-undef */
import AES from './aesOop';

export class EncryptedStream {
	constructor(_eventName, _randomized) {
		this.eventName = _eventName;
		this.key = _randomized;
		this.synced = false;
		this.syncFn = null;
		this.listenForSync();
	}
	listenWith(func) {
		document.addEventListener(this.eventName, (event) => {
			if (!this.synced) return false;
			let msg = event.detail;
			try {
				msg = JSON.parse(event.detail);
			} catch (e) {

			}
			if (this.synced && typeof msg === 'string') {
				msg = AES.decrypt(msg, this.key);
			}
			if (func) {
				func(msg);
			}
		});
	}
	send(data, to) {
		const addSender = () => {
			data.from = this.eventName;
		};
		const encryptIfSynced = () => {
			data = (this.synced) ? AES.encrypt(data, this.key) : data;
		};
		if (typeof data !== 'object') {
			throw new Error("Payloads must be objects");
		}
		addSender();
		encryptIfSynced();
		this.dispatch(data, to);
	}
	onSync(fn) {
		this.syncFn = fn;
	}
	sync(to, handshake) {
		this.send({
			type: 'sync',
			handshake
		}, to);
	}
	listenForSync() {
		document.addEventListener(this.eventName, (event) => {
			let msg = event.detail;
			try {
				msg = JSON.parse(event.detail);
			} catch (e) {

			}
			if (!msg.hasOwnProperty('type')) {
				return false;
			}
			if (msg.type === 'sync') {
				this.ackSync(msg);
			}
			if (msg.type === 'synced') {
				this.synced = true;
			}
		});
	}
	ackSync(msg) {
		this.send({
			type: 'synced'
		}, msg.from);
		this.key = msg.handshake;
		this.synced = true;
		this.syncFn();
	}
	dispatch(encryptedData, to) {
		document.dispatchEvent(this.getEvent(encryptedData, to));
	}
	getEvent(encryptedData, to) {
		return new CustomEvent(to, this.getEventInit(encryptedData));
	}
	getEventInit(encryptedData) {
		return {
			detail: encryptedData
		};
	}
}

export class LocalStream {
	static send(msg) {
		return new Promise((resolve, reject) => {
			chrome.runtime.sendMessage(msg, (response) => resolve(response));
		});
	}
	static watch(callback) {
		chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			if (sender.id !== chrome.runtime.id) return;
			if (callback) callback(request, sendResponse);
			return true;
		});
	}
}