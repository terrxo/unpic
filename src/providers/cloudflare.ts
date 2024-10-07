import { options } from "https://esm.sh/v96/preact@10.11.2/src/index.js";
import { getImageCdnForUrlByPath } from "../detect.ts";
import {
	OperationExtractor,
	Operations,
	URLGenerator,
	URLTransformer,
} from "../types.ts";
import { ImageFormat } from "../types.ts";
import {
	createFormatter,
	createOperationsGenerator,
	toCanonicalUrlString,
	toUrl,
} from "../utils.ts";
import o from "https://deno.land/x/lz4@v0.1.2/wasm.js";

/**
 * Image transform options for Cloudflare URL-based image processing.
 */
export interface CloudflareOperations extends Operations<"auto" | "json"> {
	/** Preserve animation frames from GIFs, default true. */
	anim?: boolean;

	/** Background color for transparent images. Accepts CSS color values. */
	background?: string;

	/** Blur radius (1 to 250). */
	blur?: number;

	/** Border options, including color and width for each side. */
	border?: {
		color: string;
		width?: number;
		top?: number;
		right?: number;
		bottom?: number;
		left?: number;
	};

	/** Brightness factor, 1.0 means no change. */
	brightness?: number;

	/** Choose a faster but lower-quality compression method. */
	compression?: "fast";

	/** Contrast factor, 1.0 means no change. */
	contrast?: number;

	/** Device Pixel Ratio multiplier, default is 1. */
	dpr?: number;

	/** Resizing mode, preserving aspect ratio. */
	fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";

	/** Output image format, or "auto" to choose based on browser support. */
	format?: ImageFormat | "auto" | "json";

	/** Gamma correction factor. */
	gamma?: number;

	/** Cropping gravity (focal point) or alignment. */
	gravity?: "auto" | "left" | "right" | "top" | "bottom" | string;

	/** Maximum image height in pixels. */
	height?: number;

	/** Control the preservation of metadata. */
	metadata?: "keep" | "copyright" | "none";

	/** Redirect to original image if transformation fails. */
	onerror?: "redirect";

	/** Image quality level (1-100). */
	quality?: number;

	/** Rotate the image by 90, 180, or 270 degrees. */
	rotate?: 90 | 180 | 270;

	/** Strength of sharpening filter (0-10). */
	sharpen?: number;

	/** Trim options to remove pixels from edges. */
	trim?: {
		top?: number;
		right?: number;
		bottom?: number;
		left?: number;
		width?: number;
		height?: number;
	};

	/** Maximum image width in pixels. */
	width?: number;
}

export interface CloudflareOptions {
	/** The Cloudflare domain */
	domain?: string;
}

const operationsGenerator = createOperationsGenerator<
	CloudflareOperations
>({
	defaults: {
		format: "auto",
		fit: "cover",
	},
	formatMap: {
		jpg: "jpeg",
	},
	formatter: createFormatter(",", "="),
});

export const generate: URLGenerator<CloudflareOperations, CloudflareOptions> = (
	src,
	operations,
	{
		domain,
	},
) => {
	const modifiers = operationsGenerator(operations);
	const url = toUrl(domain ? `https://${domain}` : "/");
	url.pathname = `/cdn-cgi/image/${modifiers}/${src}`;
	return toCanonicalUrlString(url);
};

export const extract: OperationExtractor<
	CloudflareOperations,
	CloudflareOptions
> = (url, options) => {
	const parsedUrl = toUrl(url);
	const [, , modifiers, src] = parsedUrl.pathname.split("/");
	const operations = Object.fromEntries(
		modifiers.split(",").map((pair) => pair.split("=")),
	);
	return {
		src,
		operations,
		options: {
			domain: options?.domain || parsedUrl.hostname === "n"
				? undefined
				: parsedUrl.hostname,
		},
	};
};

export const transform: URLTransformer<
	CloudflareOperations,
	CloudflareOptions
> = (
	src,
	operations,
	options,
) => {
	const url = toUrl(src);
	if (getImageCdnForUrlByPath(url) === "cloudflare") {
		const base = extract(url, options);
		return generate(base.src, {
			...base.operations,
			...operations,
		}, base.options);
	}
	return generate(src, operations, options);
};
