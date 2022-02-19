#!/usr/bin/env node

import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import fs from "node:fs/promises";
import sharp from "sharp";

const src = await fs.readFile("pride.svg", "utf-8");
const dom = new DOMParser().parseFromString(src, "text/svg+xml");

const $svg = dom.getElementsByTagName("svg").item(0);
const $g = $svg.getElementsByTagName("g").item(0);

await fs.mkdir("icons", { recursive: true });

// Export 48x48 SVG favicon.
$svg.setAttribute("width", "48");
$svg.setAttribute("height", "48");
await fs.writeFile(
  "icons/favicon.svg",
  new XMLSerializer().serializeToString(dom)
);

// Export fallback favicon.
await sharp(Buffer.from($svg.toString())).toFile("icons/favicon.ico");

// Remove rounded mask and export 180x180 touch icon.
$g.removeAttribute("mask");
$svg.setAttribute("width", "180");
$svg.setAttribute("height", "180");
await sharp(Buffer.from($svg.toString())).toFile("icons/apple-touch-icon.png");
