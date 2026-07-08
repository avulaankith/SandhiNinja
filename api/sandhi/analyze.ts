import {
  createAnalyzeRouteResult,
  internalErrorResult,
  malformedJsonResult,
  parseJsonText,
} from "../../server/routes/analyze-core.ts";

const toResponse = (statusCode: number, payload: object, headers: Record<string, string>) =>
  new Response(JSON.stringify(payload), {
    status: statusCode,
    headers,
  });

export default {
  async fetch(request: Request) {
    try {
      const body = parseJsonText(await request.text());
      const result = createAnalyzeRouteResult(request.method, body);
      return toResponse(result.statusCode, result.payload, result.headers);
    } catch (error) {
      if (error instanceof SyntaxError) {
        const result = malformedJsonResult();
        return toResponse(result.statusCode, result.payload, result.headers);
      }

      const result = internalErrorResult();
      return toResponse(result.statusCode, result.payload, result.headers);
    }
  },
};
