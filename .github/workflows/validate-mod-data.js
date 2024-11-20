const fs = require("fs");
const path = require("path");

//********
// Main script
//*******/
// load data
const mods = loadDataFile().mods;
for (const mod of mods) {
	mod.mainName = mod.name.split(",")[0].trim();
	mod.status = getModStatus(mod);
}
const modsByName = buildModLookupByName(mods);

// detect mod issues
let hasErrors = false;
for (const mod of mods) {
	// check mod links in summary
	for (const link of extractLocalModLinksFromMarkdown(mod.summary))	{
		// invalid format
		if (link.url != "#") {
			hasErrors = logModError(mod, `has a link with custom anchor URL '${link.url}'. To link to another mod on the list, set the link text to the exact mod name and the URL to '#'.`);
			continue;
		}

		// target not found
		const targets = modsByName[link.modName.toLowerCase()];
		if (!targets) {
			hasErrors = logModError(mod, `has a summary link to mod '${link.modName}', which wasn't found.`);
			continue;
		}

		// target not compatible (so shouldn't be listed as a workaround)
		const statuses = new Set(targets.map(target => target.status));
		if (!statuses.has("ok") && !statuses.has("optional") && !statuses.has("unofficial")) {
			let message = `❌ Mod '${mod.mainName}' has a summary link to mod '${link.modName}', which has status '${[... statuses].join("', '")}'.`;
			if (statuses.has("workaround"))
				message += " It should link directly to the working mod instead.";
			hasErrors = logModError(mod, message);
			continue;
		}
	}

	// check 'retest when compatible' field
	if (mod.retestWhenCompatible) {
		if (mod.status === 'ok' || mod.status === 'optional')
			hasErrors = logModError(mod, "is marked compatible, but still has the 'retestWhenCompatible' field set.");
		else {
			for (const otherName of mod.retestWhenCompatible) {
				// target not found
				const targets = modsByName[otherName.toLowerCase()];
				if (!targets) {
					hasErrors = logModError(mod, `has mod name '${otherName}' in the retestWhenCompatible field, but no such mod was found.`);
					continue;
				}

				// target already compatible
				const statuses = new Set(targets.map(target => target.status));
				if (statuses.has("ok") || statuses.has("optional") || statuses.has("unofficial")) {
					hasErrors = logModError(mod, `has mod name '${otherName}' in the retestWhenCompatible field, but that mod is already compatible.`);
					continue;
				}
			}
		}
	}
}

if (hasErrors)
	process.exit(1);

console.log("✅ No mod data issues detected.");


//********
// Helper methods
//*******/
/**
 * Load the JSON data based on the provided argument.
 * @returns {object} The loaded JSON data.
 */
function loadDataFile() {
	let filePath = process.argv.slice(2)[0];
	if (!filePath) {
		console.error("❌ Error: no data file path specified.");
		process.exit(1);
	}
	filePath = path.resolve(filePath);
	if (!fs.existsSync(filePath)) {
		console.error(`❌ Error: no data file found at "${filePath}".`);
		process.exit(1);
	}

	// load JSON
	try {
		return JSON.parse(
			fs.readFileSync(filePath, "utf8")
		);
	}
	catch (err) {
		console.error(`❌ Error: couldn't parse data file: ${err.message}`);
		process.exit(1);
	}
}

/**
 * Get the compatibility status for a mod.
 * @param {object} mod The mod data to parse.
 */
function getModStatus(mod) {
	if (mod.status)
		return mod.status;

	if (mod.unofficialUpdate)
		return "unofficial";

	if (mod.brokeIn)
		return "broken";

	return "ok";
}

/**
 * Create a lookup of mods by their main name.
 * @param {object[]} mods The mod entries to create a lookup for.
 * @returns {object}
 */
function buildModLookupByName(mods) {
	const lookup = {};

	for (const mod of mods) {
		const key = mod.mainName.toLowerCase();
		if (!lookup[key])
			lookup[key] = [];
		lookup[key].push(mod);
	}

	return lookup;
}

/**
 * Extract the mod names referenced via Markdown local anchor links like `[Content Patcher](#)`.
 * @param {string} summary The mod compatibility summary to parse.
 * @returns {object[]}
 */
function extractLocalModLinksFromMarkdown(summary) {
	if (!summary || !summary.includes("["))
		return [];

	const linkPattern = /\[([^\]]+)\]\((#[^\)]*)\)/g;

	const links = [];
	for (const link of summary.matchAll(linkPattern))
		links.push({ modName: link[1], url: link[2], markdown: link[0] });
	return links;
}

/**
 * Log a validation error for a log entry.
 * @param {object} mod The mod entry.
 * @param {string} error A human-readable message describing the issue, formatted so it can appear after the mod name (like `<mod name> <error phrase>`).
 * @returns {true} Returns `true` for convenience.
 */
function logModError(mod, error) {
	console.error(`❌ Mod '${mod.mainName}' ${error}`);
	return true;
}
