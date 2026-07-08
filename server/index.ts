import { createServer } from "node:http";
import type { ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { handleAnalyzeRoute } from "./routes/analyze.ts";

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? "0.0.0.0";
const DIST_DIR = join(process.cwd(), "dist");

const MIME_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const send = (
  response: ServerResponse,
  statusCode: number,
  body: string | Buffer,
  contentType: string,
  method = "GET",
) => {
  response.writeHead(statusCode, {
    "Content-Type": contentType,
  });

  if (method === "HEAD") {
    response.end();
    return;
  }

  response.end(body);
};

const sendPlainText = (
  response: ServerResponse,
  statusCode: number,
  body: string,
  method = "GET",
) => send(response, statusCode, body, "text/plain; charset=utf-8", method);

const resolveStaticPath = (pathname: string) => {
  let decodedPathname: string;

  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const normalized = normalize(decodedPathname).replace(/^(\.\.(\/|\\|$))+/, "");
  const relative = normalized === "/" ? "index.html" : normalized.replace(/^\/+/, "");

  return join(DIST_DIR, relative);
};

const serveStatic = async (
  pathname: string,
  response: ServerResponse,
  method: string,
) => {
  const explicitPath = resolveStaticPath(pathname);
  const indexPath = join(DIST_DIR, "index.html");

  if (!explicitPath) {
    sendPlainText(response, 400, "Malformed path.", method);
    return;
  }

  try {
    const body = await readFile(explicitPath);
    const contentType =
      MIME_TYPES[extname(explicitPath)] ?? "application/octet-stream";
    send(response, 200, body, contentType, method);
    return;
  } catch {
    if (extname(pathname)) {
      sendPlainText(response, 404, "Not found.", method);
      return;
    }
  }

  try {
    const body = await readFile(indexPath);
    send(response, 200, body, MIME_TYPES[".html"], method);
  } catch {
    sendPlainText(
      response,
      404,
      "Frontend bundle not found. Run `npm run build:client` first.",
      method,
    );
  }
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    const method = request.method ?? "GET";

    if (url.pathname === "/api/sandhi/analyze") {
      await handleAnalyzeRoute(request, response);
      return;
    }

    if (url.pathname === "/api/health") {
      send(response, 200, JSON.stringify({ status: "ok" }), "application/json; charset=utf-8", method);
      return;
    }

    if (url.pathname.startsWith("/api/")) {
      sendPlainText(response, 404, "API route not found.", method);
      return;
    }

    if (method !== "GET" && method !== "HEAD") {
      sendPlainText(response, 405, "Method not allowed.", method);
      return;
    }

    await serveStatic(url.pathname, response, method);
  } catch (error) {
    console.error("Unhandled server request error.", error);

    if (!response.headersSent) {
      sendPlainText(response, 500, "Internal server error.");
      return;
    }

    response.end();
  }
});

server.on("error", (error) => {
  console.error("Sandhi Ninja server failed to start.", error);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`Sandhi Ninja server listening on http://${HOST}:${PORT}`);
});
