Cerealizer.QueryString = function QueryString() {};

Cerealizer.QueryString.prototype = {

	constructor: Cerealizer.QueryString,

	hashNotation: true,

	keysRegex: /[\[\].]+/,

	pairsRegex: /([^=&]+)=([^&]+)/g,

	regex: /([^=&]+)=([^&]+)/,

	_convert: function _convert(s) {
		s = typeof s === "string" ? unescape(s) : s;

		if (/^[-+0-9.]+$/.test(s) && !isNaN(s)) {
			return Number(s);
		}
		else if (/^(true|false)$/.test(s)) {
			return s === "true";
		}
		else if (s === "NaN") {
			return NaN;
		}
		else {
			return s;
		}
	},

	_convertAndHydrate: function _convertAndHydrate(data, key, value) {
		value = this._convert(unescape(value));

		if (this._isValid(value)) {
			keys = key
				.replace(/]$/, "")
				.split(this.keysRegex);

			this._hydrate(data, keys, value);
		}
	},

	deserialize: function deserialize(str) {
		var that = this;
		var data = {};
		var keys, values;

		str.replace(/^\?/, "").replace(this.pairsRegex, function(match, key, value) {
			if (/\[\]/.test(key)) {
				throw new Error("Cannot deserialize keys with empty array notation: " + key);
			}

			that._convertAndHydrate(data, key, value);
		});

		return data;
	},

	_hydrate: function _hydrate(data, keys, value) {
		var currData = data,
		    key, i = 0,
		    length = keys.length - 1,
		    lastKey = unescape( keys[ keys.length - 1 ] );

		// Find the object we want to set the value on
		for (i; i < length; i++) {
			key = unescape(keys[i]);

			if (!currData.hasOwnProperty(key)) {
				currData[key] = {};
			}

			currData = currData[key];
		}

		currData[lastKey] = value;
		currData = keys = null;

		return data;
	},

	_isValid: function _isValid(value) {
		if (value === null || value === undefined) {
			return false;
		}
		else {
			var t = typeof(value);

			if (t === "number") {
				return !isNaN(value);
			}
			else {
				return (t === "string" || t === "boolean") ? true : false;
			}
		}
	},

	_isObject: function _isObject(x) {
		return Object.prototype.toString.call(x) === "[object Object]";
	},

	serialize: function serialize(data) {
		var keyDelimeterLeft = this.hashNotation ? "[" : ".",
		    keyDelimeterRight = this.hashNotation ? "]" : "",
		    arrayKeyDelimeterLeft = "[",
		    arrayKeyDelimeterRight = "]",
		    params = [];

		return this._serialize(data, params, "", keyDelimeterLeft, keyDelimeterRight, arrayKeyDelimeterLeft, arrayKeyDelimeterRight).join("&");
	},

	_serialize: function _serialize(data, params, keyPrefix, keyDelimeterLeft, keyDelimeterRight, arrayKeyDelimeterLeft, arrayKeyDelimeterRight) {
		var nextKeyPrefix,
		    arrayKeyRegex = /^[0-9+]$/,
		    name, value;

		for (var key in data) {
			if (data.hasOwnProperty(key)) {
				if (this._isObject(data[key])) {
					if (keyPrefix) {
						if (arrayKeyRegex.test(key)) {
							nextKeyPrefix = keyPrefix + arrayKeyDelimeterLeft + key + arrayKeyDelimeterRight;
						}
						else {
							nextKeyPrefix = keyPrefix + keyDelimeterLeft + key + keyDelimeterRight;
						}
					}
					else {
						nextKeyPrefix = key;
					}

					this._serialize(data[key], params, nextKeyPrefix, keyDelimeterLeft, keyDelimeterRight, arrayKeyDelimeterLeft, arrayKeyDelimeterRight);
				}
				else if (this._isValid(data[key])) {
					if (keyPrefix) {
						if (arrayKeyRegex.test(key)) {
							name = keyPrefix + arrayKeyDelimeterLeft + escape(key) + arrayKeyDelimeterRight;
						}
						else {
							name = keyPrefix + keyDelimeterLeft + escape(key) + keyDelimeterRight;
						}
					}
					else {
						name = escape(key);
					}

					value = escape(data[key]);
					params.push(name + "=" + value);
				}
			}
		}

		return params;
	},

	test: function test(str) {
		return this.regex.test(str);
	},

	toString: function toString() {
		return "[object Cerealizer.QueryString]";
	}

};

Cerealizer.registerType(Cerealizer.QueryString, [
	"queryString",
	"application/x-www-form-urlencoded",
	"multipart/form-data"
]);
