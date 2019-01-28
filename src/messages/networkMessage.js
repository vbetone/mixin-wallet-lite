import * as NetworkMessageTypes from './networkMessageTypes';

export default class NetworkMessage {

	constructor(_type = '', _payload = {}, _resolver = '', _domain = '') {
		this.type = _type;
		this.payload = _payload;
		this.resolver = _resolver;
		this.domain = _domain;
	}

	static placeholder() {
		return new NetworkMessage();
	}
	static fromJson(json) {
		return Object.assign(this.placeholder(), json);
	}

	static payload(type, payload) {
		const p = this.placeholder();
		p.type = type;
		p.payload = payload;
		return p;
	}

	static signal(type) {
		const p = this.placeholder();
		p.type = type;
		return p;
	}

	respond(payload) {
		return new NetworkMessage(this.type, payload, this.resolver);
	}
	error(payload) {
		return new NetworkMessage(NetworkMessageTypes.ERROR, payload, this.resolver);
	}
}