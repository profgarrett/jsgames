const DEBUG = true;

/*
	Schema is a class for building models.
	It's shared on both client and server sides.
*/

class Schema {
	/**
		Initialize model, using any JSON properties as pre-load the this value
		
		Automatically adds a type field for the record-type.
		@arg json: Data loaded from server.
	*/
	constructor( json={} ) {
		let schema = this.schema;
		//let methods = this.methods;

		this['type'] = this.constructor.name;

		// Validate json object entries to match against schema.
		// Allow 'type' key without a matching field schema definition.
		for(const key of Object.keys(json)) {
			if(typeof schema[key] === 'undefined' && key !== 'type' ) {
				//if(DEBUG) console.log( { schema, json });
				throw new Error('Invalid key "' + key + '" in ' + this['type']);
			}
		}

		// Load each default value from schema
		// Use the set to load the correct type of object, using json values to initialize
		for(const key of Object.keys(schema)) {
			this[key] = schema[key].initialize(json[key]);
		}
	}


	get schema() {
		throw Error('Inheriting classes must implement schema');
	}

	// Convert the object a JSON object, taking only valid properties.
	toJson() {
		let schema = this.schema;
		let json = {};

		for(const key of Object.keys(schema)) {
			json[key] = this[key];
		}		

		return json;
	}


	updateFields(json, filter='') {
		let schema = this.schema;

		for(const key of Object.keys(schema)) {
			if(typeof json[key] !== 'undefined' && (key==filter || filter=='')) {
				this[key] = json[key];
			}
		}

		return this; // allow method chaining.  Note that this doesn't return a new copy, but the initial one.
	}

	/**
		Create a clone of this item, updating fields as given in JSON
	*/
	clone( json={} ) {
		let schema = this.schema;
		//const clone = Object.assign( {}, this);
		//Object.setPrototypeOf( clone, this.prototype );
		const clone = Object.assign(Object.create(this), this);

		// Validate json object entries to match against schema.
		// Allow 'type' key without a matching field schema definition.
		for(const key of Object.keys(json)) {
			if(typeof schema[key] === 'undefined' && key !== 'type' ) {
				throw new Error('Invalid key "' + key + '" in ' + this['type']);
			}
			clone[key] = json[key];
		}

		return clone;
	}
} 


module.exports = {
	Schema
};

