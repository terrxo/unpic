/**
 * Options to transform an image URL
 */
export interface UrlTransformerOptions {
	/** The original URL of the image */
	url: string | URL;
	/** The desired width of the image */
	width?: number;
	/** The desired height of the image */
	height?: number;
	/** The desired format of the image. Default is auto-detect */
	format?: string;
	/** Recursively find the the canonical CDN for a source image. Default is true */
	recursive?: boolean;
	/** Specify a CDN rather than auto-detecting */
	cdn?: ImageCdn;
	/** CDN-specific options. */
	cdnOptions?: CdnOptions;
}

export interface CanonicalCdnUrl {
	/** The source image URL */
	url: string | URL;
	/** The CDN to use */
	cdn: ImageCdn;
}

/**
 * Asks a CDN if there is a different canonical CDN for the given URL
 * @param url The URL to check
 * @returns The canonical CDN URL, or false if the given CDN will handle it itself
 */
export interface ShouldDelegateUrl {
	(url: string | URL): CanonicalCdnUrl | false;
}

export type CdnOptions = {
	[key in ImageCdn]?: Record<string, unknown>;
};
export interface UrlGeneratorOptions<TParams = Record<string, string>> {
	base: string | URL;
	width?: number;
	height?: number;
	format?: string;
	params?: TParams;
}

export interface UrlGenerator<TParams = Record<string, string>> {
	(options: UrlGeneratorOptions<TParams>): URL | string;
}

export interface ParsedUrl<TParams = Record<string, string>> {
	/** The URL of the image with no transforms */
	base: string;
	/** The width of the image */
	width?: number;
	/** The height of the image */
	height?: number;
	/** The format of the image */
	format?: string;
	/** Other CDN-specific parameters */
	params?: TParams;
	cdn: ImageCdn;
}
/**
 * Parse an image URL into its components
 */
export interface UrlTransformer {
	(options: UrlTransformerOptions): string | URL | undefined;
}

export interface UrlParser<
	TParams = Record<string, unknown>,
> {
	(url: string | URL): ParsedUrl<TParams>;
}

export type ImageCdn =
	| "contentful"
	| "builder.io"
	| "cloudimage"
	| "cloudinary"
	| "cloudflare"
	| "imgix"
	| "shopify"
	| "wordpress"
	| "bunny"
	| "storyblok"
	| "kontent.ai"
	| "vercel"
	| "nextjs"
	| "scene7"
	| "keycdn"
	| "directus"
	| "imageengine"
	| "contentstack"
	| "cloudflare_images"
	| "ipx"
	| "astro"
	| "netlify"
	| "imagekit"
	| "uploadcare"
	| "supabase";

export type SupportedImageCdn = ImageCdn;

export type OperationFormatter<T extends Operations = Operations> = (
	operations: T,
) => string;

export interface OperationMap<TOperations extends Operations = Operations> {
	width?: keyof TOperations | false;
	height?: keyof TOperations | false;
	format?: keyof TOperations | false;
	quality?: keyof TOperations | false;
}

export interface FormatMap {
	jpeg?: string;
	jpg?: never;
	[key: string]: string | undefined;
}

export interface Operations {
	width?: number;
	height?: number;
	format?: string;
	quality?: number;
}

export interface OperationGeneratorConfig<
	TOperations extends Operations = Operations,
> {
	keyMap?: OperationMap<TOperations>;
	defaults?: Partial<TOperations>;
	formatMap?: FormatMap;
	formatter?: OperationFormatter<TOperations>;
}

export type URLGenerator<
	TOperations extends Operations = Operations,
	TOptions = undefined,
> = (
	src: string | URL,
	operations?: TOperations,
	options?: TOptions,
) => string;

export type URLTransformer<
	TOperations extends Operations = Operations,
	TOptions = undefined,
> = (
	src: string | URL,
	operations?: TOperations,
	options?: TOptions,
) => string;
