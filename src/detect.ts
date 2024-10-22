import domains from "../data/domains.json" with { type: "json" };
import subdomains from "../data/subdomains.json" with { type: "json" };
import paths from "../data/paths.json" with { type: "json" };
import { ImageCdn } from "./types.ts";
import { toUrl } from "./utils.ts";

const cdnDomains = new Map(Object.entries(domains)) as Map<string, ImageCdn>;
const cdnSubdomains = Object.entries(subdomains) as [string, ImageCdn][];
const cdnPaths = Object.entries(paths) as [string, ImageCdn][];

export function getProviderForUrl(
	url: string | URL,
): ImageCdn | false {
	return getProviderForUrlByDomain(url) || getProviderForUrlByPath(url);
}

export function getProviderForUrlByDomain(
	url: string | URL,
): ImageCdn | false {
	if (typeof url === "string" && !url.startsWith("https://")) {
		return false;
	}
	const { hostname } = toUrl(url);
	const cdn = cdnDomains.get(hostname);
	if (cdn) {
		return cdn;
	}
	return cdnSubdomains.find(([subdomain]) => hostname.endsWith(subdomain))
		?.[1] || false;
}

export function getProviderForUrlByPath(
	url: string | URL,
): ImageCdn | false {
	// Allow relative URLs
	const { pathname } = toUrl(url);
	return cdnPaths.find(([path]) => pathname.startsWith(path))?.[1] || false;
}
