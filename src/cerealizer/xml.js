Cerealizer.Xml = function Xml() {
	this.parser = this.constructor.getParser();
};

Cerealizer.Xml.getParser = function getParser() {
	if (window.DOMParser) {
		return new DOMParser();
	}
	else {
		return null;
	}
};

Cerealizer.Xml.prototype = {

	constructor: Cerealizer.Xml,

	parser: null,

	regex: /^\s*<[a-zA-Z][a-zA-Z0-9:]*.*?<\/[a-zA-Z0-9:]+[a-zA-Z]>\s*$/,

	_deserializeMSIE: function _deserializeMSIE(str) {
		var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = false;
		xmlDoc.loadXML(str);

		return xmlDoc;
	},

	_deserializeStandard: function _deserializeStandard(str) {
		return this.parser.parseFromString(str, "text/xml");
	},

	_escape: function _escape(x) {
		return String(x)
			.replace(/\&/g, "&amp;")
			.replace(/"/g, "&quot;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	},

	_isObject: function _isObject(x) {
		return Object.prototype.toString.call(x) === "[object Object]";
	},

	serialize: function serialize(data) {
		var tags = this._serialize(data, []);
		return tags.join("");
	},

	_serialize: function _serialize(data, tags) {
		for (var key in data) {
			if (data.hasOwnProperty(key)) {
				if (this._isObject(data[key])) {
					tags.push("<" + key + ">");
					this._serialize(data[key], tags);
					tags.push("</" + key + ">");
				}
				else {
					tags.push("<" + key + ">" + this._escape(data[key]) + "</" + key + ">");
				}
			}
		}

		return tags;
	},

	test: function test(str) {
		return this.regex.test(str);
	},

	toString: function toString() {
		return "[object Cerealizer.Xml]";
	}

};

if (window.DOMParser) {
	Cerealizer.Xml.prototype.deserialize = Cerealizer.Xml.prototype._deserializeStandard;
}
else if (window.ActiveXObject) {
	Cerealizer.Xml.prototype.deserialize = Cerealizer.Xml.prototype._deserializeMSIE;
}
else {
	throw new Error("No native XML parser could be found.");
}

Cerealizer.registerType(Cerealizer.Xml, [
	"xml",
	"text/xml",
	"application/xml"
]);
