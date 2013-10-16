var Cerealizer = {

	_instances: {},

	objectFactory: null,

	_types: {},

	getInstance: function getInstance(name) {
		if (this._types[name]) {
			if (!this._instances[name]) {
				var instance;

				if (this.objectFactory) {
					instance = this.objectFactory.getInstance(name);

					if (!instance) {
						throw new Error("Could not get serializer instance from object factory for type: " + name);
					}
				}
				else {
					instance = new this._types[name]();
				}

				this._instances[name] = instance;
			}

			return this._instances[name];
		}
		else {
			throw new Error("Cannot get instance for unregistered type: " + name);
		}
	},

	registerType: function registerType(klass, names) {
		for (var i = 0, length = names.length; i < length; i++) {
			this._types[ names[i] ] = klass;
		}
	}

};
