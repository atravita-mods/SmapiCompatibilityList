import { Mod } from "./types";
import * as utilities from "./utilities";

// read args (format: `nodeExecutable scriptPath jsonFilePath`)
const jsonFilePath = process.argv[2];

// load data
let mods: Mod[];
try {
	mods = utilities.loadJSONFile<{ mods: Mod[] }>(jsonFilePath).mods;
	if (!Array.isArray(mods))
		throw new Error("mods list not present");
}
catch (error) {
	console.error(`❌ Error loading data file: ${(error as Error)?.message ?? error}`);
	process.exit(1);
}

// normalize data
for(const mod of mods) {
	mod.mainName = mod.name.split(",")[0].trim();
	mod.status = utilities.getModStatus(mod);
}
const modsByName = utilities.buildModLookupByName(mods);

// detect mod issues
let hasErrors = false;
for (const mod of mods) {
	// check mod links in summary
	for (const link of utilities.extractLocalModLinksFromMarkdown(mod.summary))	{
		// invalid format
		if (link.url != "#") {
			hasErrors = utilities.logModError(mod, `has a link with custom anchor URL '${link.url}'. To link to another mod on the list, set the link text to the exact mod name and the URL to '#'.`);
			continue;
		}

		// target not found
		const targets = modsByName[link.modName.toLowerCase()];
		if (!targets) {
			hasErrors = utilities.logModError(mod, `has a summary link to mod '${link.modName}', which wasn't found.`);
			continue;
		}

		// target not compatible (so shouldn't be listed as a workaround)
		const statuses = new Set(targets.map(target => target.status));
		if (!statuses.has("ok") && !statuses.has("optional") && !statuses.has("unofficial")) {
			let message = `❌ Mod '${mod.mainName}' has a summary link to mod '${link.modName}', which has status '${[... statuses].join("', '")}'.`;
			if (statuses.has("workaround"))
				message += " It should link directly to the working mod instead.";
			hasErrors = utilities.logModError(mod, message);
			continue;
		}
	}

	// check 'retest when compatible' field
	if (mod.retestWhenCompatible) {
		if (mod.status === "ok" || mod.status === "optional")
			hasErrors = utilities.logModError(mod, "is marked compatible, but still has the 'retestWhenCompatible' field set.");
		else {
			for (const otherName of mod.retestWhenCompatible) {
				// target not found
				const targets = modsByName[otherName.toLowerCase()];
				if (!targets) {
					hasErrors = utilities.logModError(mod, `has mod name '${otherName}' in the retestWhenCompatible field, but no such mod was found.`);
					continue;
				}

				// target already compatible
				const statuses = new Set(targets.map(target => target.status));
				if (statuses.has("ok") || statuses.has("optional") || statuses.has("unofficial")) {
					hasErrors = utilities.logModError(mod, `has mod name '${otherName}' in the retestWhenCompatible field, but that mod is already compatible.`);
					continue;
				}
			}
		}
	}
}

if (hasErrors)
	process.exit(1);

console.log("✅ No mod data issues detected.");
