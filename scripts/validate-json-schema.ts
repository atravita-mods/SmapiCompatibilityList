import Ajv, {JSONSchemaType, ValidateFunction} from "ajv";
import { loadJSONFile } from "./utilities";

// read args (format: `nodeExecutable scriptPath schemaPath jsonFilePath+`)
const schemaFilePath = process.argv[2];
const jsonFilePaths = process.argv.splice(3);

// load schema
let schema: JSONSchemaType<unknown>;
try {
	schema = loadJSONFile(schemaFilePath);
} catch(err) {
	console.error(`❌ Error loading schema: ${(err as Error)?.message}`);
	process.exit(1);
}

// load schema validator
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

// load & validate each data file
let passed = 0;
for (const jsonFilePath of jsonFilePaths) {
	let data: unknown;
	try {
		data = loadJSONFile(jsonFilePath);
	} catch(err) {
		console.error(`❌ Error loading data: ${(err as Error)?.message}`);
		continue;
	}

	if (validator(data))
		passed++;
	else {
		console.error(`❌ Input "${jsonFilePath}" did not match the provided schema:`);
		if (validator.errors)
			for(const err of validator.errors) {
				console.error(`   ${ajv.errorsText([err])}`);
			}
	}

}

console.log('');

// log final result
if (passed < jsonFilePaths.length) {
	console.log(`❌ ${passed} of ${jsonFilePaths.length} input files matched the provided schema.`);
	process.exit(1);
} else
	console.log(`✅ ${passed} of ${jsonFilePaths.length} input files matched the provided schema.`);
