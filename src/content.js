import uuid from 'uuid/v4';
import { EncryptedStream } from './utils/extensionStreams';
import * as PairingTags from './messages/pairingTags';
import InternalMessage from './messages/internalMessage';
import * as InternalMessageTypes from './messages/internalMessageTypes';
import NetworkMessage from './messages/networkMessage';
import * as NetworkMessageTypes from './messages/networkMessageTypes'
import { apis } from './utils/browserApis';
import { strippedHost } from './utils/misc';

let stream = new WeakMap();

const INJECTION_SCRIPT_FILENAME = 'inject.js';

let isReady = false;


class Content {

	constructor() {
		this.setupEncryptedStream();
		this.injectInteractionScript();
	}

	setupEncryptedStream() {
		stream = new EncryptedStream(PairingTags.MIXIN_WALLET, uuid());
		stream.onSync(async () => {
			stream.send(NetworkMessage.payload(NetworkMessageTypes.PUSH_MIXIN_WALLET, {}), PairingTags.INJECTED);
			isReady = true;
			document.dispatchEvent(new CustomEvent("MixinWalletLoaded"));
		});
		stream.listenWith((msg) => this.contentListener(msg));
	}

	injectInteractionScript() {
		const script = document.createElement('script');
		script.src = apis.extension.getURL(INJECTION_SCRIPT_FILENAME);
		(document.head || document.documentElement).appendChild(script);
		script.onload = () => script.remove();
	}

	contentListener(msg) {
		if (!isReady) return;
		if (!msg) return;
		if (!stream.synced && (!msg.hasOwnProperty('type') || msg.type !== 'sync')) {
			stream.send(new Error('Error'), PairingTags.INJECTED);
			return;
		}

		msg.domain = strippedHost();
		if (msg.hasOwnProperty('payload')) {
			msg.payload.domain = strippedHost();
		}

		let nonSyncMessage = NetworkMessage.fromJson(msg);
		switch (msg.type) {
			case 'sync':
				this.sync(msg);
				break;
			case NetworkMessageTypes.TEST:
				this.test(nonSyncMessage);
				break;
			default:
				this.forwardToBackground(msg.type, nonSyncMessage);
				break;
		}
	}

	forwardToBackground(type, message) {
		if (!isReady) return;
		InternalMessage.payload(type, message.payload)
			.send().then(res => this.respond(message, res));
	}

	test(message) {
		if (!isReady) return;
		InternalMessage.payload(InternalMessageTypes.TEST, message.payload)
			.send().then(res => this.respond(message, res));
	}

	respond(message, payload) {
		if (!isReady) return;
		const response = (!payload || payload.hasOwnProperty('isError')) ?
			message.error(payload) :
			message.respond(payload);
		stream.send(response, PairingTags.INJECTED);
	}

	sync(message) {
		stream.key = message.handshake.length ? message.handshake : null;
		stream.send({ type: 'sync' }, PairingTags.INJECTED);
		stream.synced = true;
	}
}

new Content();
