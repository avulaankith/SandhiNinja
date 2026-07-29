type VercelLikeResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelLikeResponse;
  json: (payload: unknown) => void;
};

export default function handler(
  _request: unknown,
  response: VercelLikeResponse,
) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.status(200).json({ status: "ok" });
}
