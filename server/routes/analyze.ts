import type { IncomingMessage, ServerResponse } from "node:http";
import {
  createAnalyzeRouteResult,
  internalErrorResult,
  malformedJsonResult,
  parseJsonText,
} from "./analyze-core.ts";

const json = (
  response: ServerResponse,
  statusCode: number,
  payload: object,
  headers: Record<string, string>,
) => {
  response.writeHead(statusCode, {
    ...headers,
  });
  response.end(JSON.stringify(payload));
};

const readJsonBody = async (request: IncomingMessage) => {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return null;
  }

  return parseJsonText(Buffer.concat(chunks).toString("utf8"));
};

export const handleAnalyzeRoute = async (
  request: IncomingMessage,
  response: ServerResponse,
) => {
  try {
    const body = await readJsonBody(request);
    const result = createAnalyzeRouteResult(request.method, body);
    json(response, result.statusCode, result.payload, result.headers);
  } catch (error) {
    if (error instanceof SyntaxError) {
      const result = malformedJsonResult();
      json(response, result.statusCode, result.payload, result.headers);
      return;
    }

    const result = internalErrorResult();
    json(response, result.statusCode, result.payload, result.headers);
  }
};
