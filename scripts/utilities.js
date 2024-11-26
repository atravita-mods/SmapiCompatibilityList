"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadJSONFile = loadJSONFile;
exports.getModStatus = getModStatus;
exports.buildModLookupByName = buildModLookupByName;
exports.extractLocalModLinksFromMarkdown = extractLocalModLinksFromMarkdown;
exports.logModError = logModError;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function loadJSONFile(filename) {
    if (!filename)
        throw new Error(`no filename specified`);
    const filepath = path_1.default.resolve(filename);
    if (!fs_1.default.existsSync(filepath))
        throw new Error(`no file found at "${filepath}"`);
    let contents;
    try {
        contents = fs_1.default.readFileSync(filepath, 'utf8');
    }
    catch (err) {
        throw new Error(`unable to read file at "${filepath}": ${err?.message}`);
    }
    try {
        return JSON.parse(contents);
    }
    catch (err) {
        throw new Error(`unable to parse JSON from "${filepath}": ${err?.message}`);
    }
}
/**
 * Get the compatibility status for a mod.
 * @param mod The mod data to parse
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
 * @param mods The mod entries to create a lookup for.
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
const linkPattern = /\[([^\]]+)\]\((#[^\)]*)\)/g;
/**
 * Extract the mod names referenced via Markdown local anchor links like `[Content Patcher](#)`.
 * @param summary The mod compatibility summary to parse
 */
function extractLocalModLinksFromMarkdown(summary) {
    if (!summary || !summary.includes("["))
        return [];
    const links = [];
    for (const link of summary.matchAll(linkPattern))
        links.push({ modName: link[1], url: link[2], markdown: link[0] });
    return links;
}
/**
 * Log a validation error for a log entry.
 * @param mod The mod entry.
 * @param error A human-readable message describing the issue, formatted so it can appear after the mod name (like `<mod name> <error phrase>`).
 * @returns `true` for convenience.
 */
function logModError(mod, error) {
    console.error(`❌ Mod '${mod.mainName}' ${error}`);
    return true;
}
