Cerealizer.Json = function Json() {};

Cerealizer.Json.prototype = {

	constructor: Cerealizer.Json,

	regex: /^[{\[]].*[}\]]$/g,

	deserialize: function deserialize(str) {
		return JSON.parse(str);
	},

	serialize: function serialize(data) {
		return JSON.stringify(data);
	},

	test: function test(str) {
		return this.regex.test(str);
	},

	toString: function toString() {
		return "[object Cerealizer.Json]";
	}

};
