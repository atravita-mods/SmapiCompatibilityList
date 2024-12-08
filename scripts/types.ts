export type Status = "ok" | "optional" | "unofficial" | "workaround" | "broken" | "abandoned" | "obsolete" | "unknown";
export type OverrideDataType = "updateKey" | "localVersion" | "remoteVersion";

export type ModDataOverride = {
	type: OverrideDataType;
	from: string;
	to: string;
	reason: string;
};

export type BaseMod = {
	name: string;
	author: string;
	id: string;
	nexus: number | null;
	github?: string | null;
	chucklefish?: number;
	curse?: number;
	moddrop?: number;
	url?: string;
	source?: string;
	warnings?: string[];
	developerNotes?: string;
	status?: Status;
	summary?: string;
	brokeIn?: string;
	unofficialUpdate?: {
		version: string;
		url: string;
	};
	contentPackFor?: string;
	overrideModData?: ModDataOverride[];
	retestWhenCompatible?: string[];
};

export type Mod = BaseMod & {
	jsonFilePath: string;
	mainName: string;
};

export type ModLink = {
	modName: string;
	url: string;
	markdown: string;
};
