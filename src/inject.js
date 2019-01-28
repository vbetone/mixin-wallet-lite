import uuid from 'uuid/v4';
import { EncryptedStream } from './utils/extensionStreams';
import * as PairingTags from './messages/pairingTags'
import * as NetworkMessageTypes from './messages/networkMessageTypes'
import MixinWallet from './mixinWallet'

class Inject {

	constructor() {
		const stream = new EncryptedStream(PairingTags.INJECTED, uuid());
		stream.listenWith(msg => {
			if (msg && msg.hasOwnProperty('type') && msg.type === NetworkMessageTypes.PUSH_MIXIN_WALLET) {
				window.mixinWallet = new MixinWallet(stream, msg.payload);
			}
		});
		stream.sync(PairingTags.MIXIN_WALLET, stream.key);
	}
}

new Inject();