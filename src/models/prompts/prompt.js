import * as PromptTypes from './promptTypes'

export default class Prompt {

	constructor(_title = '', _type = '', _domain = '', _network = null, _data = {}, _responder = null) {
		this.title = _title;
		this.type = _type;
		this.domain = _domain;
		this.network = _network;
		this.data = _data;
		this.responder = _responder;
	}

	static placeholder() {
		return new Prompt();
	}
	static fromJson(json) {
		return Object.assign(this.placeholder(), json);
	}

	static locked() {
		return new Prompt('Unlock Request', PromptTypes.REQUEST_UNLOCK, '', {
			host: '',
			port: 0
		}, {}, function () {});
	}
}