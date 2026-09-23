#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const designSystemDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(designSystemDir, "..");
const sourceExtensions = new Set([".css", ".html", ".jsx"]);
const ignoredDirectories = new Set([".agents", ".claude", ".git", "node_modules", "vendor"]);

const allowedFontSizes = new Set([12, 14, 16, 20, 24, 32, 40]);
const allowedFontWeights = new Set([400, 500, 600, 700]);
const allowedLineHeights = new Set([16, 20, 24, 28, 32, 40, 48]);
const allowedDuplicateTokens = new Set(["--ds-motion-fast", "--ds-motion-base", "--ds-motion-slow"]);
const findings = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignoredDirectories.has(entry.name)) return [];
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolutePath);
    return sourceExtensions.has(path.extname(entry.name)) ? [absolutePath] : [];
  });
}

function relativePath(file) {
  return path.relative(repoRoot, file).split(path.sep).join("/");
}

function lineNumber(source, index) {
  return source.slice(0, index).split("\n").length;
}

function addFinding(file, source, index, message) {
  findings.push(`${relativePath(file)}:${lineNumber(source, index)} — ${message}`);
}

function declarationMatches(source, propertySource) {
  const pattern = new RegExp(`\\b(${propertySource})\\s*:`, "g");
  const matches = [];
  let match;

  while ((match = pattern.exec(source)) !== null) {
    const valueStart = pattern.lastIndex;
    let cursor = valueStart;
    let depth = 0;
    let quote = null;
    let escaped = false;

    for (; cursor < source.length; cursor += 1) {
      const character = source[cursor];
      if (quote) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === quote) quote = null;
        continue;
      }
      if (character === "\"" || character === "'" || character === "`") {
        quote = character;
        continue;
      }
      if (character === "(" || character === "[") depth += 1;
      else if (character === ")" || character === "]") depth = Math.max(0, depth - 1);
      else if (depth === 0 && (character === "," || character === ";" || character === "}")) break;
    }

    matches.push({ index: match.index, property: match[1], rawValue: source.slice(valueStart, cursor).trim() });
  }

  return matches;
}

function literalNumbers(value) {
  const numbers = [];
  const branchValues = value.includes("?") ? value.slice(value.indexOf("?") + 1) : value;
  const numberPattern = /(?:^|[^\w.\-*\/\[])(-?\d+(?:\.\d+)?)(px)?(?=$|[^\w%*\/\]])/g;
  for (const match of branchValues.matchAll(numberPattern)) {
    numbers.push(Number(match[1]));
  }
  return numbers;
}

function nonPixelUnits(value) {
  return [...value.matchAll(/(-?\d+(?:\.\d+)?)(rem|em|vh|vw|vmin|vmax|%)/g)]
    .map((match) => `${match[1]}${match[2]}`)
    .filter((unitValue) => Number.parseFloat(unitValue) !== 0);
}

function isAriaHiddenInlineIcon(source, index) {
  const tagStart = source.lastIndexOf("<", index);
  const previousTagEnd = source.lastIndexOf(">", index);
  const tagEnd = source.indexOf(">", index);
  if (tagStart < 0 || tagStart < previousTagEnd || tagEnd < index) return false;
  return /\baria-hidden\s*=/.test(source.slice(tagStart, tagEnd + 1));
}

function isAllowedSpacingException(file, source, index, property, value) {
  const relative = relativePath(file);
  const context = source.slice(Math.max(0, index - 240), index + 240);
  return value === -1 && (
    (relative === "wireframe-primitives.jsx" && property === "marginBottom" && context.includes("borderBottom: t === active")) ||
    (relative === "screens/where-when-step1.jsx" && property === "marginLeft" && context.includes("borderRadius: '0 7px 7px 0'"))
  );
}

function validateSpacing(file, source) {
  const spacingProperties = "(?:margin|padding)(?:Top|Right|Bottom|Left|Inline|InlineStart|InlineEnd|Block|BlockStart|BlockEnd|-(?:top|right|bottom|left|inline(?:-start|-end)?|block(?:-start|-end)?))?|gap|rowGap|columnGap|row-gap|column-gap";

  for (const match of declarationMatches(source, spacingProperties)) {
    const { property, rawValue } = match;
    if (/clamp\s*\(/.test(rawValue)) {
      addFinding(file, source, match.index, `${property} uses fluid clamp(); spacing must resolve to a discrete 4px step`);
    }
    for (const unitValue of nonPixelUnits(rawValue)) {
      addFinding(file, source, match.index, `${property} uses ${unitValue}; spacing must use a discrete px token`);
    }
    for (const value of literalNumbers(rawValue)) {
      if (value === 0 || Math.abs(value) % 4 === 0) continue;
      if (isAllowedSpacingException(file, source, match.index, property, value)) continue;
      addFinding(file, source, match.index, `${property} contains off-grid spacing ${value}px`);
    }
  }

  for (const match of source.matchAll(/calc\(\s*100%\s*\+\s*(-?\d+(?:\.\d+)?)px\s*\)/g)) {
    const value = Number(match[1]);
    if (Math.abs(value) % 4 !== 0) addFinding(file, source, match.index, `overlay offset ${value}px is off the 4px grid`);
  }
  for (const match of source.matchAll(/\b(?:rect|r)\.bottom\s*\+\s*(-?\d+(?:\.\d+)?)/g)) {
    const value = Number(match[1]);
    if (Math.abs(value) % 4 !== 0) addFinding(file, source, match.index, `runtime popover offset ${value}px is off the 4px grid`);
  }
}

function validateTypography(file, source) {
  for (const match of declarationMatches(source, "fontSize|font-size")) {
    const { rawValue } = match;
    if (isAriaHiddenInlineIcon(source, match.index)) continue;
    if (/clamp\s*\(/.test(rawValue)) {
      addFinding(file, source, match.index, "font size uses fluid clamp(); typography must resolve to a discrete scale role");
    }
    for (const unitValue of nonPixelUnits(rawValue)) {
      addFinding(file, source, match.index, `font size uses ${unitValue}; typography must use an approved px role`);
    }
    for (const value of literalNumbers(rawValue)) {
      if (!allowedFontSizes.has(value)) {
        addFinding(file, source, match.index, `font size ${value}px is outside 12/14/16/20/24/32/40`);
      }
    }
  }

  for (const match of declarationMatches(source, "font")) {
    const sizeMatch = match.rawValue.match(/(-?\d+(?:\.\d+)?)px/);
    if (sizeMatch && !allowedFontSizes.has(Number(sizeMatch[1]))) {
      addFinding(file, source, match.index, `font shorthand uses ${sizeMatch[1]}px outside 12/14/16/20/24/32/40`);
    }
  }

  for (const match of declarationMatches(source, "fontWeight|font-weight")) {
    for (const value of literalNumbers(match.rawValue)) {
      if (!allowedFontWeights.has(value)) {
        addFinding(file, source, match.index, `font weight ${value} is not one of the loaded 400/500/600/700 weights`);
      }
    }
  }

  for (const match of declarationMatches(source, "lineHeight|line-height")) {
    for (const value of literalNumbers(match.rawValue)) {
      if (value === 1 || allowedLineHeights.has(value)) continue;
      addFinding(file, source, match.index, `line height ${value}px is outside the paired 16/20/24/28/32/40/48 scale`);
    }
  }

}

function validateKnownIndirection(file, source) {
  for (const match of source.matchAll(/\bgap\s*=\s*(-?\d+(?:\.\d+)?)/g)) {
    const value = Number(match[1]);
    if (value !== 0 && Math.abs(value) % 4 !== 0) addFinding(file, source, match.index, `gap default ${value}px is off the 4px grid`);
  }

  for (const match of source.matchAll(/\b(?:const|let)\s+(?:pad|padding[A-Za-z0-9_]*)\s*=\s*([^;]+)/g)) {
    for (const value of literalNumbers(match[1])) {
      if (value !== 0 && Math.abs(value) % 4 !== 0) addFinding(file, source, match.index, `indirect padding value ${value}px is off the 4px grid`);
    }
  }

  for (const match of source.matchAll(/\b(?:const|let)\s+(?:fs|fontSize[A-Za-z0-9_]*)\s*=\s*([^;]+)/g)) {
    for (const value of literalNumbers(match[1])) {
      if (!allowedFontSizes.has(value)) addFinding(file, source, match.index, `indirect font size ${value}px is outside the approved scale`);
    }
  }

  for (const match of source.matchAll(/\bconst\s+SP\s*=\s*(?:Object\.freeze\()?\s*\{([\s\S]*?)\}\s*\)?\s*;/g)) {
    for (const value of literalNumbers(match[1])) {
      if (value !== 0 && Math.abs(value) % 4 !== 0) addFinding(file, source, match.index, `SP scale value ${value}px is off the 4px grid`);
    }
  }
}

function maskComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "))
    .replace(/^\s*\/\/.*$/gm, (comment) => comment.replace(/[^\n]/g, " "));
}

function validateLegacyTokens(file, source) {
  const maskedSource = maskComments(source);
  const legacyPattern = /--ds-primitive-(?:space-(?:0-5|1-5|2-5)|font-size-(?:11|13|22)|leading-[a-z-]+)\b/g;
  for (const match of maskedSource.matchAll(legacyPattern)) {
    addFinding(file, source, match.index, `legacy token ${match[0]} is no longer part of the foundation`);
  }
}

const files = walk(repoRoot);
for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const scanSource = maskComments(source);
  validateSpacing(file, scanSource);
  validateTypography(file, scanSource);
  validateKnownIndirection(file, scanSource);
  validateLegacyTokens(file, scanSource);
}

const tokenFile = path.join(designSystemDir, "tokens.css");
const tokenSource = fs.readFileSync(tokenFile, "utf8");
const maskedTokenSource = maskComments(tokenSource);

for (const match of maskedTokenSource.matchAll(/(--ds-primitive-space-(\d+))\s*:\s*([^;]+);/gi)) {
  const literal = match[3].trim();
  const valueMatch = literal.match(/^(-?\d+(?:\.\d+)?)(px)?$/);
  const expected = Number(match[2]) * 4;
  const value = valueMatch ? Number(valueMatch[1]) : Number.NaN;
  if (!valueMatch || (value !== 0 && !valueMatch[2]) || Math.abs(value) % 4 !== 0 || value !== expected) {
    addFinding(tokenFile, tokenSource, match.index, `${match[1]} must equal ${expected === 0 ? "0" : `${expected}px`}`);
  }
}

for (const match of maskedTokenSource.matchAll(/(--ds-primitive-font-size-(\d+))\s*:\s*([^;]+);/gi)) {
  const valueMatch = match[3].trim().match(/^(\d+(?:\.\d+)?)px$/);
  const value = valueMatch ? Number(valueMatch[1]) : Number.NaN;
  if (!allowedFontSizes.has(value) || value !== Number(match[2])) {
    addFinding(tokenFile, tokenSource, match.index, `${match[1]} must equal its approved px suffix`);
  }
}

for (const match of maskedTokenSource.matchAll(/(--ds-primitive-font-weight-[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
  if (!allowedFontWeights.has(Number(match[2].trim()))) {
    addFinding(tokenFile, tokenSource, match.index, `${match[1]} must use a loaded Inter weight`);
  }
}

for (const match of maskedTokenSource.matchAll(/(--ds-primitive-line-height-(\d+))\s*:\s*([^;]+);/gi)) {
  const valueMatch = match[3].trim().match(/^(\d+(?:\.\d+)?)px$/);
  const value = valueMatch ? Number(valueMatch[1]) : Number.NaN;
  if (!allowedLineHeights.has(value) || value !== Number(match[2])) {
    addFinding(tokenFile, tokenSource, match.index, `${match[1]} must equal its approved px suffix`);
  }
}

const definitionMatches = [...maskedTokenSource.matchAll(/(--ds-[a-z0-9-]+)\s*:/gi)];
const definitionCounts = new Map();
for (const match of definitionMatches) definitionCounts.set(match[1], (definitionCounts.get(match[1]) || 0) + 1);
for (const [token, count] of definitionCounts) {
  if (count > 1 && !allowedDuplicateTokens.has(token)) {
    addFinding(tokenFile, tokenSource, maskedTokenSource.indexOf(`${token}:`), `${token} is defined ${count} times`);
  }
}
const definedTokens = new Set(definitionMatches.map((match) => match[1]));

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const maskedSource = maskComments(source);
  for (const match of maskedSource.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/gi)) {
    if (!definedTokens.has(match[1])) {
      addFinding(file, source, match.index, `undefined design token ${match[1]}`);
    }
  }
}

const uniqueFindings = [...new Set(findings)].sort();
if (uniqueFindings.length > 0) {
  console.error(`Design foundation validation failed (${uniqueFindings.length} finding${uniqueFindings.length === 1 ? "" : "s"}):`);
  for (const finding of uniqueFindings) console.error(`- ${finding}`);
  process.exitCode = 1;
} else {
  console.log(`Design foundation validation passed across ${files.length} product source files.`);
  console.log("Spacing: strict 4px margin/padding/gap scale (two documented -1px overlap seams allowed).");
  console.log("Typography: 12/14/16/20/24/32/40px, paired line heights, and 400/500/600/700 weights.");
}
