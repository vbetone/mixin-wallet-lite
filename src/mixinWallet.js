import NetworkMessage from './messages/networkMessage';
import * as NetworkMessageTypes from './messages/networkMessageTypes'
import * as PairingTags from './messages/pairingTags'
import uuid from 'uuid/v4';

const throws = (msg) => {
	throw new Error(msg);
};

class DanglingResolver {
	constructor(_id, _resolve, _reject) {
		this.id = _id;
		this.resolve = _resolve;
		this.reject = _reject;
	}
}

let stream = new WeakMap();
let resolvers = new WeakMap();
let publicKey = new WeakMap();

const throwIfNoIdentity = () => {
	if (!publicKey) throws('There is no identity with an account set on your Mixin wallet instance.');
};

const _subscribe = () => {
	stream.listenWith(msg => {
		if (!msg || !msg.hasOwnProperty('type')) return false;
		for (let i = 0; i < resolvers.length; i++) {
			if (resolvers[i].id === msg.resolver) {
				if (msg.type === 'error') {
					resolvers[i].reject(msg.payload);
				} else {
					resolvers[i].resolve(msg.payload);
				}
				resolvers = resolvers.slice(i, 1);
			}
		}
	});
};

const _send = (_type, _payload) => {
	return new Promise((resolve, reject) => {
		let id = uuid();
		let message = new NetworkMessage(_type, _payload, id);
		resolvers.push(new DanglingResolver(id, resolve, reject));
		stream.send(message, PairingTags.MIXIN_WALLET);
	});
};

export default class MixinWallet {

	constructor(_stream, _options) {
		this.useIdentity(_options.identity);
		stream = _stream;
		resolvers = [];
		_subscribe();
	}

	test() {
		return _send(NetworkMessageTypes.TEST, {
			detail: 'test'
		}).then(data => {
			return data;
		});
	}

	useIdentity(identity) {
		this.identity = identity;
		publicKey = identity ? identity.publicKey : '';
	}

	getIdentity() {
		return _send(NetworkMessageTypes.GET_OR_REQUEST_IDENTITY, {}).then(async identity => {
			this.useIdentity(identity);
			return identity;
		});
	}

	forgetIdentity() {
		throwIfNoIdentity();
		const identity = this.identity;
		return _send(NetworkMessageTypes.FORGET_IDENTITY, { identity }).then(() => {
			this.identity = null;
			publicKey = null;
			return true;
		});
	}

	transfer(params) {
		// const { asset, sendTo, sendAmount, sendMemo, traceId } = params;
		throwIfNoIdentity();
		params.identity = this.identity;
		return _send(NetworkMessageTypes.REQUEST_TRANSFER, params);
	}

	balance() {
		throwIfNoIdentity();
		const identity = this.identity;
		return _send(NetworkMessageTypes.REQUEST_BALANCE, { identity });
	}
}