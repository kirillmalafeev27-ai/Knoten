import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildLevelPrompt } from "./src/services/promptBuilder.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 10000);
const HOST = "0.0.0.0";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
const ANTHROPIC_VERSION = process.env.ANTHROPIC_VERSION || "2023-06-01";
const ANTHROPIC_MAX_TOKENS = Number(process.env.ANTHROPIC_MAX_TOKENS || 1400);

const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
]);

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function sendText(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function sanitizePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

function resolveStaticPath(pathname) {
  if (pathname === "/" || pathname === "/index.html") {
    return path.join(__dirname, "index.html");
  }

  const isAllowedFolder = ["/src/", "/styles/", "/assets/"].some((prefix) => pathname.startsWith(prefix));
  if (!isAllowedFolder) {
    return null;
  }

  const relativePath = pathname.replace(/^\/+/, "");
  const absolutePath = path.resolve(__dirname, relativePath);
  const allowedRoots = [
    path.join(__dirname, "src"),
    path.join(__dirname, "styles"),
    path.join(__dirname, "assets"),
  ];

  if (!allowedRoots.some((root) => absolutePath.startsWith(root))) {
    return null;
  }

  return absolutePath;
}

function cacheControlFor(pathname, ext) {
  if (pathname.startsWith("/src/")) {
    return "no-cache";
  }

  if (ext === ".html" || ext === ".js" || ext === ".css") {
    return "no-cache";
  }

  return "public, max-age=3600";
}

async function serveStatic(response, pathname) {
  const filePath = resolveStaticPath(pathname);
  if (!filePath) {
    sendText(response, 404, "Not found");
    return;
  }

  try {
    await access(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES.get(ext) || "application/octet-stream";

    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": cacheControlFor(pathname, ext),
    });

    createReadStream(filePath).pipe(response);
  } catch {
    sendText(response, 404, "Not found");
  }
}

async function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });

    request.on("error", reject);
  });
}

function extractTextContent(payload) {
  if (!payload?.content || !Array.isArray(payload.content)) {
    throw new Error("Anthropic response did not include content");
  }

  const textBlock = payload.content.find((block) => block.type === "text" && typeof block.text === "string");
  if (!textBlock) {
    throw new Error("Anthropic response did not include text content");
  }

  return textBlock.text.trim();
}

function parseJsonFromText(text) {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : text;
  return JSON.parse(candidate);
}

function validateBlueprint(blueprint) {
  if (!Array.isArray(blueprint) || blueprint.length === 0) {
    throw new Error("Blueprint is required");
  }

  blueprint.forEach((level, levelIndex) => {
    if (typeof level.size !== "number" || !Array.isArray(level.sentences) || level.sentences.length !== level.size) {
      throw new Error(`Blueprint level ${levelIndex + 1} is invalid`);
    }

    level.sentences.forEach((sentence, sentenceIndex) => {
      if (typeof sentence.pathLength !== "number" || sentence.pathLength !== level.size) {
        throw new Error(`Blueprint sentence ${sentenceIndex + 1} in level ${levelIndex + 1} is invalid`);
      }
    });
  });
}

function validateGeneratedLevels(levels, blueprint) {
  if (!Array.isArray(levels)) {
    throw new Error("Generated payload must include levels");
  }

  levels.forEach((level, levelIndex) => {
    const schema = blueprint[levelIndex];
    if (!schema) {
      return;
    }

    if (!Array.isArray(level.sentences)) {
      throw new Error(`Generated level ${levelIndex + 1} is missing sentences`);
    }

    level.sentences.forEach((sentence, sentenceIndex) => {
      const expectedLength = schema.sentences[sentenceIndex]?.pathLength;
      if (!expectedLength) {
        return;
      }

      if (!Array.isArray(sentence.tokens) || sentence.tokens.length !== expectedLength) {
        throw new Error(
          `Generated sentence ${sentenceIndex + 1} in level ${levelIndex + 1} has ${sentence.tokens?.length ?? 0} tokens, expected ${expectedLength}`
        );
      }
    });
  });
}

async function handleGenerateLevels(request, response) {
  if (!process.env.ANTHROPIC_API_KEY) {
    sendJson(response, 503, {
      error: "ANTHROPIC_API_KEY is not configured on the server.",
    });
    return;
  }

  try {
    const { profile, blueprint } = await readJsonBody(request);
    validateBlueprint(blueprint);

    const prompt = buildLevelPrompt(profile, blueprint);
    const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: ANTHROPIC_MAX_TOKENS,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const payload = await anthropicResponse.json();
    if (!anthropicResponse.ok) {
      sendJson(response, anthropicResponse.status, {
        error: payload?.error?.message || "Anthropic request failed",
      });
      return;
    }

    const text = extractTextContent(payload);
    const parsed = parseJsonFromText(text);
    validateGeneratedLevels(parsed.levels, blueprint);

    sendJson(response, 200, {
      levels: parsed.levels,
      meta: {
        model: payload.model || ANTHROPIC_MODEL,
      },
    });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Unknown server error",
    });
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const pathname = sanitizePathname(url.pathname);

  if (request.method === "GET" && pathname === "/healthz") {
    sendJson(response, 200, {
      ok: true,
      model: ANTHROPIC_MODEL,
      hasApiKey: Boolean(process.env.ANTHROPIC_API_KEY),
    });
    return;
  }

  if (request.method === "POST" && pathname === "/api/levels") {
    await handleGenerateLevels(request, response);
    return;
  }

  if (request.method === "GET") {
    await serveStatic(response, pathname);
    return;
  }

  sendText(response, 405, "Method not allowed");
});

server.listen(PORT, HOST, () => {
  console.log(`Knot Words listening on http://${HOST}:${PORT}`);
});
