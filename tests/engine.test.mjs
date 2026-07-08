import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";
import { analyzeSandhiWord } from "../server-dist/server/engine/analyzer.js";
import { handleAnalyzeRoute } from "../server-dist/server/routes/analyze.js";
import { normalizeSanskritInput } from "../server-dist/shared/core/sanskrit.js";

const RULE_CASES = [
  ["savarna-dirgha", "śivālayaḥ"],
  ["guna", "arka"],
  ["vrddhi", "jalaughaḥ"],
  ["yan", "svāgatam"],
  ["ayavayava", "haraye"],
  ["purvarupa", "me'cyuta"],
  ["pararupa", "prejate"],
];

test("normalizes equivalent words across IAST, Devanagari, and Telugu", () => {
  const iast = normalizeSanskritInput("śivālayaḥ", "iast");
  const devanagari = normalizeSanskritInput("शिवालयः", "devanagari");
  const telugu = normalizeSanskritInput("శివాలయః", "telugu");

  assert.ok(iast);
  assert.ok(devanagari);
  assert.ok(telugu);
  assert.equal(iast.iast, devanagari.iast);
  assert.equal(devanagari.iast, telugu.iast);
  assert.equal(iast.devanagari, "शिवालयः");
  assert.equal(telugu.devanagari, "शिवालयः");
});

for (const [ruleId, input] of RULE_CASES) {
  test(`finds a ${ruleId} candidate for ${input}`, () => {
    const response = analyzeSandhiWord(input, "iast");

    assert.ok(response);
    assert.ok(
      response.results.some((result) =>
        result.steps.some((step) => step.ruleId === ruleId),
      ),
    );
  });
}

test("returns deterministic candidate ordering", () => {
  const first = analyzeSandhiWord("jalaughaḥ", "iast");
  const second = analyzeSandhiWord("jalaughaḥ", "iast");

  assert.ok(first);
  assert.ok(second);
  assert.deepEqual(
    first.results.map((result) => result.signature),
    second.results.map((result) => result.signature),
  );
});

test("enforces result limits and truncation", () => {
  const limited = analyzeSandhiWord("au", "iast", 1);
  const capped = analyzeSandhiWord("au", "iast", 999);

  assert.ok(limited);
  assert.ok(capped);
  assert.equal(limited.results.length, 1);
  assert.ok(limited.truncated);
  assert.ok(capped.results.length <= 20);
});

const invokeAnalyzeRoute = async (body, method = "POST") => {
  const request = Readable.from([JSON.stringify(body)]);
  request.method = method;
  request.headers = {
    "content-type": "application/json",
  };

  const response = {
    statusCode: 200,
    headers: {},
    payload: "",
    writeHead(statusCode, headers = {}) {
      this.statusCode = statusCode;
      this.headers = headers;
      return this;
    },
    end(chunk = "") {
      this.payload += chunk.toString();
      return this;
    },
  };

  await handleAnalyzeRoute(request, response);

  return {
    statusCode: response.statusCode,
    headers: response.headers,
    json: response.payload ? JSON.parse(response.payload) : null,
  };
};

test("API returns normalized forms and candidates", async () => {
  const response = await invokeAnalyzeRoute({
    input: "శివాలయః",
    script: "telugu",
    maxResults: 3,
  });

  assert.equal(response.statusCode, 200);
  const payload = response.json;
  assert.equal(payload.engineVersion, "rule-v1");
  assert.equal(payload.normalized.devanagari, "शिवालयः");
  assert.ok(payload.results.length >= 1);
});

test("API rejects empty input with 400", async () => {
  const response = await invokeAnalyzeRoute({
    input: "   ",
  });

  assert.equal(response.statusCode, 400);
});

test("API returns empty results for a valid unsupported word", async () => {
  const response = await invokeAnalyzeRoute({
    input: "gajaḥ",
    script: "iast",
  });
  const payload = response.json;

  assert.equal(response.statusCode, 200);
  assert.deepEqual(payload.results, []);
});
