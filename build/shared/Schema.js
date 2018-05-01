//       
/*
	Schema is a class for building models.
	It's shared on both client and server sides.
*/

class Schema {
	/**
		Initialize model, using any JSON properties as pre-load the this value
		
		Checks to make sure that the type field matches the json.type value.
		@arg json: Data loaded from server.
	*/
	constructor( json={} ) {
		let schema = this.schema;
		//let methods = this.methods;

		if(this.type !== json.type) {
			throw Error('Schema.constructor: json.type ('+json.type+') !== '+this.type);
		}

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

	get type() {
		throw Error('Inheriting classes must implement type');
	}

	get schema() {
		throw Error('Inheriting classes must implement schema');
	}

	/*
		Convert the object a JSON object, taking only valid properties.

		Will take an option new_values dictionary that replaces existing values.

		Note that dates will be converted into UTC int values.  Date init from json
		will properly handle int initialize values.
	*/
	toJson(new_values_json) {
		let schema = this.schema;
		let json = {
			type: this.type // make sure that we pick up the type, which is coded as getter.
		};

		// Copy all properties to the new item.
		for(const key of Object.keys(schema)) {
			if(this[key] instanceof Date) {
				// convert date to UTC int value.
				json[key] = this[key].getTime(); 
				
			} else if(this[key] instanceof Array) {
				// If a contained array of objects have toJson function, use them

				// Do not encode functions.  Relies upon them being server-side only, set
				//		by the tutorial code.  They aren't serialized over the wire or 
				//		saved to the db.
				let items = this[key].filter( i => typeof i !== 'function');

				json[key] = items.map( 
						i => (typeof i.toJson === 'function') ? i.toJson() : i 
						);

			} else if(typeof this[key] === 'function') {
				// Do not encode functions.  Relies upon them being server-side only, set
				//		by the tutorial code.  They aren't serialized over the wire or 
				//		saved to the db.
			} else {
				// Normal conversion.
				json[key] = this[key];
			}

			
		}

		// Copy any new_values provided.
		if(typeof new_values_json !== 'undefined') {
			for(const key of Object.keys(new_values_json)) {
				if(new_values_json[key] instanceof Date) {
					// convert date to UTC int value.
					json[key] = new_values_json[key].getTime(); 

				} else if(new_values_json[key] instanceof Array) {
					// If a contained array of objects have toJson function, use them.
					json[key] = new_values_json[key].map( 
							i => (typeof i.toJson === 'function') ? i.toJson() : i 
							);

				} else {
					// Normal conversion
					json[key] = new_values_json[key];
				}
			}
		}

		return json;
	}

	// Convert to a string for use as a body in a JSON post request.
	toJsonString() {
		let json = this.toJson();
		return JSON.stringify(json);
	}

	// Update all fields.
	updateFields(json, filter='') {
		let schema = this.schema;

		for(const key of Object.keys(schema)) {
			if(typeof json[key] !== 'undefined' && (key==filter || filter=='')) {
				this[key] = json[key];
			}
		}

		return this; // allow method chaining.  Note that this doesn't return a new copy, but the initial one.
	}
} 

// Convenience function for initializing schema.
let isDef = function(v     )          {
	return typeof v !== 'undefined';
};
let isArray = function(u     )          {
	return (u instanceof Array);
};


// Go through the given obj or array, recursively matching items that look like a date
// back to the date() object. Works when dates are in '1981-12-20T04:00:14.000Z format, 
// not Unix seconds mode.  Needed, as some objects are dynamic, such as tests containing dates.
function revive_dates_recursively(obj     )      {
	var datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

	if(obj instanceof Array ) {
		return obj.map( (o     )      => revive_dates_recursively(o) );
	}

	if(typeof obj === 'object' ) {
		for(let name in obj) {
			if(obj.hasOwnProperty(name)) {
				obj[name] = revive_dates_recursively(obj[name]);
			}
		}
		return obj;
	}

	if(typeof obj === 'string') {
		if(datePattern.test(obj)) {
			return new Date(obj);
		}
	}
	return obj;
}


module.exports = {
	Schema,
	isDef,
	isArray,
	revive_dates_recursively
};

