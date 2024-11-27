import fs from "fs";
import path from "path";

import { Mod, ModLink, Status } from "./types";

/**
 * A regex pattern which matches a markdown anchor link in the form `[text](#id)`.
 */
const markdownAnchorLinkPattern = /\[([^\]]+)\]\((#[^\)]*)\)/g;

/**
 * Deserialize data from a JSON file.
 * @typedef TData The expected data type in the JSON file.
 * @param filePath The path to the file to load.
 */
export function loadJSONFile<TData = unknown>(filePath: string): TData {
	if (!filePath)
		throw new Error("no filename specified");

	const filepath = path.resolve(filePath);
	if (!fs.existsSync(filepath))
		throw new Error(`no file found at "${filepath}"`);

	let contents: string;
	try {
		contents = fs.readFileSync(filepath, "utf8");
	}
	catch(error) {
		throw new Error(`unable to read file at "${filepath}": ${(error as Error)?.message ?? error}`);
	}

	try {
		return JSON.parse(contents);
	}
	catch(error) {
		throw new Error(`unable to parse JSON from "${filepath}": ${(error as Error)?.message ?? error}`);
	}
}


/**
 * Get the compatibility status for a mod.
 * @param mod The mod data to parse
 */
export function getModStatus(mod: Mod): Status {
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
 * @param mods The mod entries to create a lookup for.
 */
export function buildModLookupByName(mods: Mod[]): Record<string, Mod[]> {
	const lookup: Record<string, Mod[]> = {};

	for(const mod of mods) {
		const key = mod.mainName.toLowerCase();
		if (!lookup[key])
			lookup[key] = [];
		lookup[key].push(mod);
	}

	return lookup;
}


/**
 * Extract the mod names referenced via Markdown local anchor links like `[Content Patcher](#)`.
 * @param summary The mod compatibility summary to parse
 */
export function extractLocalModLinksFromMarkdown(summary?: string): ModLink[] {
	if (!summary || !summary.includes("["))
		return [];

	const links: ModLink[] = [];
	for (const link of summary.matchAll(markdownAnchorLinkPattern))
		links.push({ modName: link[1], url: link[2], markdown: link[0] });
	return links;
}


/**
 * Log a validation error for a log entry.
 * @param mod The mod entry.
 * @param error A human-readable message describing the issue, formatted so it can appear after the mod name (like `<mod name> <error phrase>`).
 * @returns `true` for convenience.
 */
export function logModError(mod: Mod, error: string): true {
	console.error(`❌ Mod '${mod.mainName}' ${error}`);
	return true;
}
