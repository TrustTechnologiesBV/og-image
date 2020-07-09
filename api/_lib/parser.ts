import { IncomingMessage } from "http";
import { parse } from "url";
import { ParsedRequest, Theme } from "./types";
import absoluteUrl from "next-absolute-url";

export function parseRequest(req: IncomingMessage) {
  const fullUrl = absoluteUrl(
    req,
    `${process.env.HOSTNAME || "localhost"}:3000`
  );
  console.log("HTTP " + req.url);
  const { pathname, query } = parse(req.url || "/", true);
  const { fontSize, images, widths, heights, theme, md } = query || {};

  if (Array.isArray(fontSize)) {
    throw new Error("Expected a single fontSize");
  }
  if (Array.isArray(theme)) {
    throw new Error("Expected a single theme");
  }

  const arr = (pathname || "/i/").slice(3).split(".");
  let extension = "";
  let text = "";
  if (arr.length === 0) {
    text = "";
  } else if (arr.length === 1) {
    text = arr[0];
  } else {
    extension = arr.pop() as string;
    text = arr.join(".");
  }

  const parsedRequest: ParsedRequest = {
    fileType: extension === "jpeg" ? extension : "png",
    text: decodeURIComponent(text),
    theme: theme === "dark" ? "dark" : "light",
    md: md === "1" || md === "true",
    fontSize: fontSize || "96px",
    images: getArray(images),
    widths: getArray(widths),
    heights: getArray(heights),
  };
  parsedRequest.images = getDefaultImages(
    parsedRequest.images,
    parsedRequest.theme,
    fullUrl.origin
  );
  return parsedRequest;
}

function getArray(stringOrArray: string[] | string | undefined): string[] {
  if (typeof stringOrArray === "undefined") {
    return [];
  } else if (Array.isArray(stringOrArray)) {
    return stringOrArray;
  } else {
    return [stringOrArray];
  }
}

function getDefaultImages(
  images: string[],
  theme: Theme,
  fullUrl = ""
): string[] {
  const defaultImage =
    theme === "light"
      ? fullUrl + "/images/logo-black.svg"
      : fullUrl + "/images/logo-white.svg";

  if (!images || !images[0]) {
    return [defaultImage];
  }

  if (!images[0].startsWith("/images/")) {
    images[0] = defaultImage;
  }

  const imagesConverted = images.map((i) => {
    if (i.startsWith("/images/")) {
      return fullUrl + i;
    }
    return fullUrl;
  });
  return imagesConverted;
}
