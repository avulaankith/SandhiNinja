import type { IncomingMessage, ServerResponse } from "node:http";
import type {
  SandhiAnalyzeErrorResponse,
  SandhiAnalyzeRequest,
  SanskritInputScript,
} from "../../shared/contracts/sandhi.ts";
import { analyzeSandhiWord } from "../engine/analyzer.ts";

const SCRIPT_OPTIONS = new Set<SanskritInputScript>([
  "auto",
  "iast",
  "devanagari",
  "telugu",
]);

const json = (
  response: ServerResponse,
  statusCode: number,
  payload: object,
) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
};

const badRequest = (response: ServerResponse, message: string) =>
  json(response, 400, {
    error: "bad_request",
    message,
  } satisfies SandhiAnalyzeErrorResponse);

const readJsonBody = async (request: IncomingMessage) => {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return null;
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseRequest = (value: unknown): SandhiAnalyzeRequest | null => {
  if (!isObject(value) || typeof value.input !== "string") {
    return null;
  }

  const script =
    value.script === undefined
      ? undefined
      : SCRIPT_OPTIONS.has(value.script as SanskritInputScript)
        ? (value.script as SanskritInputScript)
        : null;
  const maxResults =
    value.maxResults === undefined
      ? undefined
      : typeof value.maxResults === "number"
        ? value.maxResults
        : null;

  if (script === null || maxResults === null) {
    return null;
  }

  return {
    input: value.input,
    script,
    maxResults,
  };
};

export const handleAnalyzeRoute = async (
  request: IncomingMessage,
  response: ServerResponse,
) => {
  if (request.method !== "POST") {
    response.writeHead(405, {
      Allow: "POST",
      "Content-Type": "application/json; charset=utf-8",
    });
    response.end(
      JSON.stringify({
        error: "bad_request",
        message: "Use POST for /api/sandhi/analyze.",
      } satisfies SandhiAnalyzeErrorResponse),
    );
    return;
  }

  try {
    const body = await readJsonBody(request);
    const parsed = parseRequest(body);

    if (!parsed) {
      badRequest(response, "Request body must include a valid input string.");
      return;
    }

    if (!parsed.input.trim()) {
      badRequest(response, "Input cannot be empty.");
      return;
    }

    const result = analyzeSandhiWord(
      parsed.input,
      parsed.script ?? "auto",
      parsed.maxResults,
    );

    if (!result) {
      badRequest(response, "Input could not be normalized.");
      return;
    }

    json(response, 200, result);
  } catch (error) {
    if (error instanceof SyntaxError) {
      badRequest(response, "Malformed JSON request body.");
      return;
    }

    json(response, 500, {
      error: "internal_error",
      message: "Sandhi analysis failed.",
    } satisfies SandhiAnalyzeErrorResponse);
  }
};
