/*
	Schema is a class for building models.
	It's shared on both client and server sides.
*/


// Used to declare that incoming json objects are addressable with a string value.
// See https://stackoverflow.com/questions/56833469/typescript-error-ts7053-element-implicitly-has-an-any-type
interface IStringIndexJsonObject {
	[key: string]: any
}

class Schema {
	[key: string]: any

	/* 
		Put in an error that will trigger unless TRUE is passed to the constructor.
		Used when transitioning from constructor to initialize due ot error described below.
	*/
	constructor( test: boolean ) {
		if(test !== true) throw new Error('You must over-ride constructor for schema to manually initialize all data.')
	}


	/**
		Initialize model, using any JSON properties as pre-load the this value
		
		Note: Used to use this as a constructor. However, ran into an issue on Dreamhost's version 
		of Node 12.18.3 (not replicated on my person laptop) where "this" in a constructor 
		for an extended class is only done for the parent, and isn't done on the sub-class. Results
		in undefined on all of the properties, even though they are properly set in the construction.
		Many hours down the drain trying to narrow that one down...

		Checks to make sure that the type field matches the json.type value.
		@arg json: Data loaded from server.
	*/
	initialize( json: any = {}, schema: any ) {

		if(typeof json === 'string') {
			// If a schema has an object as a field, it sometimes will be passed the stringified version (if loading from a db)
			//	or a json version (if being transmitted over the wire).
			// Go ahead and parse.
			json = JSON.parse(json);
			//throw new Error('Schema.constructor should not be passed a string. "' + json + '"');
		}

		if(this.type !== json.type) {
			console.log(this);
			console.log(json);
			throw Error('Schema.constructor: json.type ('+json.type+') !== '+this.type);
		}

		// Validate json object entries to match against schema.
		// Allow 'type' key without a matching field schema definition.
		for(const key of Object.keys(json)) {
			if(typeof schema[key] === 'undefined' && key !== 'type' ) {
				// Error.  Fail silently, unless we are on localhost. In that case,
				// throw a message to localhost.
				// @TODO: properly log.
				console.log(this);
				console.log( 'Invalid key ' + key + ' for object');
				// solution_feedback
				// throw new Error('Invalid key "' + key + '" in ' + this['type']);
			}
		}

		let v = null;
		// Load each default value from schema
		// Use the set to load the correct type of object, using json values to initialize
		for(const key of Object.keys(schema)) {
			if(typeof key !== 'undefined') {
				Object.defineProperty(this, key, {
						value : schema[key].initialize(json[key]),
						writable : true,
						enumerable : true,
						configurable : true});
				//console.log( 'Key: ' + key);
				//console.log( json[key] );
				//console.log(this[key]);
			}
		}

		//console.log('\nReturning from Schema.constructor\n');
		//console.log(this);
		return this;
	}

	get type(): string {
		throw Error('Inheriting classes must implement type');
	}

	get schema(): any {
		throw Error('Inheriting classes must implement schema');
	}


	/*
		Convert the object to a JSON object, taking only valid properties.

		Will take an option new_values dictionary that replaces existing values.

		Note that dates will be converted into UTC int values.  Date init from json
		will properly handle int initialize values.
	*/
	toJson(new_values_json?: any) {
		let schema = this.schema;
		let json: IStringIndexJsonObject = {
			type: this.type // make sure that we pick up the type, which is coded as getter.
		};

		// Copy all properties to the new item.
		for(const key of Object.keys(schema)) {
			if(this[key] instanceof Date) {
				// convert date to UTC int value.
				json[key] = this[key].getTime(); 

			} else if(this[key] instanceof Object && typeof this[key].toJson !== 'undefined') {
				// See if this is an object, which has a toJson property. If so, use that.
				json[key] = this[key].toJson();

			} else if(this[key] instanceof Array) {
				// If a contained array of objects have toJson function, use them

				// Do not encode functions.  Relies upon them being server-side only, set
				//		by the tutorial code.  They aren't serialized over the wire or 
				//		saved to the db.
				let items = this[key].filter( (obj: any) => typeof obj !== 'function');

				json[key] = items.map( 
						(item: any) => (typeof item.toJson === 'function') ? item.toJson() : item 
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
							(i: any) => (typeof i.toJson === 'function') ? i.toJson() : i 
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
	updateFields(json: any, filter: any = '') {
		let schema = this.schema;

		for(const key of Object.keys(schema)) {
			if(typeof json[key] !== 'undefined' && (key==filter || filter=='')) {
				// $FlowFixMe
				this[key] = json[key];
			}
		}

		return this; // allow method chaining.  Note that this doesn't return a new copy, but the initial one.
	}
} 

// Convenience function for initializing schema.
let isDef = function(v: any): boolean {
	return typeof v !== 'undefined';
};
let isArray = function(u: any): boolean {
	return (u instanceof Array);
};
let isObject = function(o: any): boolean {
	return typeof o === 'object'
};



// Go through the given obj or array, recursively matching items that look like a date
// back to the date() object. Works when dates are in '1981-12-20T04:00:14.000Z format, 
// not Unix seconds mode.  Needed, as some objects are dynamic, such as tests containing dates.
const revive_dates_recursively_datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const revive_dates_recursively_test = ( (o:any) => {
	return ( typeof o === 'string' && 
			o.length === 24 && 
			revive_dates_recursively_datePattern.test(o) );
});

// Must only be run on objects and arrays. No primitives.
function revive_dates_recursively(obj: any): any {

	if(Array.isArray(obj) ) {
		for(let i=0; i<obj.length; i++) {
			if( revive_dates_recursively_test(obj[i]) ) {
				obj[i] = new Date(obj[i]);
			} else {
				if( Array.isArray(obj[i]) || typeof obj[i] === 'object' ) revive_dates_recursively(obj[i]);
			}
		}
		return obj;
	}

	if(typeof obj === 'object' ) {
		for(let name in obj) {
			if(obj.hasOwnProperty(name)) {
				if( revive_dates_recursively_test(obj[name]) ) {
					obj[name] = new Date(obj[name]);
				} else if ( Array.isArray(obj[name]) || typeof obj[name] === 'object') {
					revive_dates_recursively(obj[name]);
				}
			}
		}
		return obj;
	}
}





export {
	Schema,
	isDef,
	isArray,
	isObject,
	revive_dates_recursively
};

