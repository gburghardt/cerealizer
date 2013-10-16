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

if (!window.JSON) {
	throw new Error("No native JSON parser was found. Consider using JSON2.js (https://github.com/douglascrockford/JSON-js)");
}

Cerealizer.registerType(Cerealizer.Json, [
	"json",
	"text/json",
	"application/json"
]);
