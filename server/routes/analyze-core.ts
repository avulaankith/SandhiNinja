import type {
  SandhiAnalyzeErrorResponse,
  SandhiAnalyzeRequest,
  SandhiAnalyzeSuccessResponse,
  SanskritInputScript,
} from "../../shared/contracts/sandhi.ts";
import { analyzeSandhiWord } from "../engine/analyzer.ts";

const SCRIPT_OPTIONS = new Set<SanskritInputScript>([
  "auto",
  "iast",
  "devanagari",
  "telugu",
]);

export type AnalyzeRoutePayload =
  | SandhiAnalyzeSuccessResponse
  | SandhiAnalyzeErrorResponse;

export type AnalyzeRouteResult = {
  statusCode: number;
  payload: AnalyzeRoutePayload;
  headers: Record<string, string>;
};

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
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

const result = (
  statusCode: number,
  payload: AnalyzeRoutePayload,
  headers: Record<string, string> = JSON_HEADERS,
): AnalyzeRouteResult => ({
  statusCode,
  payload,
  headers,
});

const badRequest = (message: string) =>
  result(400, {
    error: "bad_request",
    message,
  } satisfies SandhiAnalyzeErrorResponse);

export const parseJsonText = (text: string) => {
  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text) as unknown;
};

export const methodNotAllowedResult = () =>
  result(
    405,
    {
      error: "bad_request",
      message: "Use POST for /api/sandhi/analyze.",
    } satisfies SandhiAnalyzeErrorResponse,
    {
      ...JSON_HEADERS,
      Allow: "POST",
    },
  );

export const malformedJsonResult = () =>
  badRequest("Malformed JSON request body.");

export const internalErrorResult = () =>
  result(500, {
    error: "internal_error",
    message: "Sandhi analysis failed.",
  } satisfies SandhiAnalyzeErrorResponse);

export const createAnalyzeRouteResult = (
  method: string | undefined,
  body: unknown,
): AnalyzeRouteResult => {
  if (method !== "POST") {
    return methodNotAllowedResult();
  }

  const parsed = parseRequest(body);

  if (!parsed) {
    return badRequest("Request body must include a valid input string.");
  }

  if (!parsed.input.trim()) {
    return badRequest("Input cannot be empty.");
  }

  const analysis = analyzeSandhiWord(
    parsed.input,
    parsed.script ?? "auto",
    parsed.maxResults,
  );

  if (!analysis) {
    return badRequest("Input could not be normalized.");
  }

  return result(200, analysis);
};
