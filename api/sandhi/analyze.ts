import {
  createAnalyzeRouteResult,
  internalErrorResult,
  malformedJsonResult,
  parseJsonText,
} from "../../server/routes/analyze-core.ts";

type VercelLikeRequest = {
  body?: unknown;
  method?: string;
};

type VercelLikeResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelLikeResponse;
  json: (payload: unknown) => void;
};

const sendResult = (
  response: VercelLikeResponse,
  statusCode: number,
  payload: object,
  headers: Record<string, string>,
) => {
  Object.entries(headers).forEach(([name, value]) => {
    response.setHeader(name, value);
  });
  response.status(statusCode).json(payload);
};

export default function handler(
  request: VercelLikeRequest,
  response: VercelLikeResponse,
) {
  try {
    const body =
      typeof request.body === "string" ? parseJsonText(request.body) : request.body ?? null;
    const result = createAnalyzeRouteResult(request.method, body);
    sendResult(response, result.statusCode, result.payload, result.headers);
  } catch (error) {
    if (error instanceof SyntaxError) {
      const result = malformedJsonResult();
      sendResult(response, result.statusCode, result.payload, result.headers);
      return;
    }

    const result = internalErrorResult();
    sendResult(response, result.statusCode, result.payload, result.headers);
  }
}
