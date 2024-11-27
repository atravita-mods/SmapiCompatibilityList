import Ajv, {JSONSchemaType, ValidateFunction} from "ajv";
import { loadJSONFile } from "./utilities";

// We need to load two or more files, the schema and the JSON
// file(s) to test. We'll load the schema from the first arg
// we got and the JSON to test from the remaining args. The
// first two entries in argv are the node executable and this
// script, so we skip those.

let schema: JSONSchemaType<unknown>;
try {
	schema = loadJSONFile(process.argv[2]);
} catch(err) {
	console.error(`❌ Error loading schema: ${(err as Error)?.message}`);
	process.exit(1);
}

// Now that we have a schema, let's validate it and create
// a validator for use.
const ajv = new Ajv({
	allErrors: true,
	// strictTypes is set to false to stop ajv from logging
	// a complaint about the use of anyOf { requires }
	strictTypes: false
});

let validator: ValidateFunction<unknown>;
try {
	validator = ajv.compile(schema);
} catch(err) {
	console.error(`❌ Error loading schema: ${(err as Error)?.message}`);
	process.exit(1);
}

// Now, for each remaining entry in argv, load that file
// and process it.
let count = 0,
	passed = 0;

for(let i = 3; i < process.argv.length; i++) {
	count++;

	let data: unknown;
	try {
		data = loadJSONFile(process.argv[3]);
	} catch(err) {
		console.error(`❌ Error loading data: ${(err as Error)?.message}`);
		continue;
	}

	if (validator(data))
		passed++;
	else {
		console.error(`❌ Input "${process.argv[3]}" did not match the provided schema:`);
		if (validator.errors)
			for(const err of validator.errors) {
				console.error(`   ${ajv.errorsText([err])}`);
			}
	}

}

console.log('');

// Log the final passed files count, and possibly exit(1)
// if there were any failures.

if (passed < count) {
	console.log(`❌ ${passed} of ${count} input files matched the provided schema.`);
	process.exit(1);
} else
	console.log(`✅ ${passed} of ${count} input files matched the provided schema.`);
