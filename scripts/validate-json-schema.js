"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ajv_1 = __importDefault(require("ajv"));
const utilities_1 = require("./utilities");
// We need to load two or more files, the schema and the JSON
// file(s) to test. We'll load the schema from the first arg
// we got and the JSON to test from the remaining args. The
// first two entries in argv are the node executable and this
// script, so we skip those.
let schema;
try {
    schema = (0, utilities_1.loadJSONFile)(process.argv[2]);
}
catch (err) {
    console.error(`❌ Error loading schema: ${err?.message}`);
    process.exit(1);
}
// Now that we have a schema, let's validate it and create
// a validator for use.
const ajv = new ajv_1.default({
    allErrors: true,
    // strictTypes is set to false to stop ajv from logging
    // a complaint about the use of anyOf { requires }
    strictTypes: false
});
let validator;
try {
    validator = ajv.compile(schema);
}
catch (err) {
    console.error(`❌ Error loading schema: ${err?.message}`);
    process.exit(1);
}
// Now, for each remaining entry in argv, load that file
// and process it.
let count = 0, passed = 0;
for (let i = 3; i < process.argv.length; i++) {
    count++;
    let data;
    try {
        data = (0, utilities_1.loadJSONFile)(process.argv[3]);
    }
    catch (err) {
        console.error(`❌ Error loading data: ${err?.message}`);
        continue;
    }
    if (validator(data))
        passed++;
    else {
        console.error(`❌ Input "${process.argv[3]}" did not match the provided schema:`);
        if (validator.errors)
            for (const err of validator.errors) {
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
}
else
    console.log(`✅ ${passed} of ${count} input files matched the provided schema.`);
