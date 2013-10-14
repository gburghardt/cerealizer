Cerealizer.QueryString = function QueryString() {};

Cerealizer.QueryString.prototype = {

	constructor: Cerealizer.QueryString,

	hashNotation: true,

	keysRegex: /[\[\].]+/,

	pairsRegex: /([^=&]+)=([^&]+)/g,

	regex: /([^=&]+)=([^&]+)/,

	_convert: function _convert(s) {
		s = unescape(s);

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
			if (/,/.test(value)) {
				values = value.split(/,/g);

				for (var i = 0, length = values.length; i < length; i++) {
					that._convertAndHydrate(data, key, values[i]);
				}
			}
			else {
				that._convertAndHydrate(data, key, value);
			}
		});

		return data;
	},

	_hydrate: function _hydrate(data, keys, value) {
		var currData = data, key, prevKey = "";
		var i = 0, length = keys.length, last = length - 1;

		for (i; i < length; i++) {
			key = keys[i]

			// if (key === "") {
			// 	if (prevKey) {
			// 		currData[prevKey] = currData[prevKey] instanceof Array ? currData[prevKey] : [ currData[prevKey] ];

			// 	}
			// 	else {
			// 		throw new Error("Invalid key detected - Empty array notation is not supported.");
			// 	}
			// }

			key = unescape(keys[i]);

			if (currData.hasOwnProperty(key)) {
				if (i === last) {
					if (currData[key] instanceof Array) {
						currData[key].push(value);
					}
					else {
						(currData[key] = [ currData[key] ]).push(value);
					}
				}
				else {
					currData = currData[key];
				}
			}
			else if (i < last) {
				if (key === "") {
					if (!(currData[prevKey] instanceof Array)) {
						currData[prevKey] = currData[prevKey] ? [ currData[prevKey] ] : [];
					}

					currData[prevKey].push({});
					currData = currData[prevKey][ currData[prevKey].length - 1 ];
				}
				else {
					currData = (currData[key] = currData[key] || {});
				}
			}
			else {
				// TODO: Test the hell out of this
				if (currData[key] instanceof Array) {
					currData[key].push(value);
				}
				else if (/[0-9]+/.test(key)) {
					currData[prevKey] = currData[prevKey] ? [ currData[prevKey] ] : [];
					currData[prevKey].push(value);
				}
				else {
					currData[key] = value;
				}

				break;
			}

			prevKey = key;
		}

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

	serialize: function serialize(data) {
		throw new Error("Not Implemented");
	},

	test: function test(str) {
		return this.regex.test(str);
	},

	toString: function toString() {
		return "[object Cerealizer.QueryString]";
	}

};
