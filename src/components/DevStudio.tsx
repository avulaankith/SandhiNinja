import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { t } from "../data/uiText";
import type {
  SandhiAnalysisResult,
  SandhiAnalyzeSuccessResponse,
  SanskritInputScript,
} from "../../shared/contracts/sandhi.ts";
import type { Language, SandhiRule, SandhiRuleId, WordNode } from "../types/sandhi";
import {
  analysisResultToWordNode,
  requestSandhiAnalysis,
} from "../utils/sandhiAnalyzer";
import {
  devanagariToIast,
  makeWordId,
  splitDevanagariAksharas,
} from "../utils/sanskrit";

type DevStudioProps = {
  entries: WordNode[];
  language: Language;
  rules: SandhiRule[];
  customEntries: WordNode[];
  defaultEntryIds: string[];
  onSaveEntry: (entry: WordNode) => void;
  onDeleteEntry: (entryId: string) => void;
  onImportEntries: (payload: unknown) => void;
  onExportEntries: () => void;
};

type SplitStepDraft = {
  sourcePath: string;
  leftDevanagari: string;
  rightDevanagari: string;
  ruleId: SandhiRuleId;
};

type SourceOption = {
  path: string;
  word: string;
};

const ROOT_PATH = "root";
const MAX_SPLIT_STEPS = 5;
type AnalysisStatus = "idle" | "loading" | "success" | "empty" | "error";

const createStepDraft = (
  ruleId: SandhiRuleId,
  sourcePath = ROOT_PATH,
): SplitStepDraft => ({
  sourcePath,
  leftDevanagari: "",
  rightDevanagari: "",
  ruleId,
});

const ensureStepCount = (
  steps: SplitStepDraft[],
  count: number,
  fallbackRuleId: SandhiRuleId,
) => {
  const next = steps.slice(0, count);

  while (next.length < count) {
    next.push(
      createStepDraft(
        fallbackRuleId,
        next.length === 0 ? ROOT_PATH : next[next.length - 1].sourcePath,
      ),
    );
  }

  return next;
};

const describePath = (path: string, language: Language) => {
  if (path === ROOT_PATH) {
    return language === "te" ? "మూలం" : "root";
  }

  const suffix = path.slice(ROOT_PATH.length);
  if (language === "te") {
    const steps = suffix
      .split("")
      .map((step) => (step === "L" ? "ఎడమ" : "కుడి"))
      .join("-");
    return `మూలం-${steps}`;
  }

  return `root-${suffix.split("").join("-")}`;
};

const buildExplanation = (
  rule: SandhiRule,
  left: string,
  right: string,
) => ({
  en: `${left} + ${right} is being practiced here with ${rule.label.en} sandhi.`,
  sa: `अत्र ${left} + ${right} इति पदद्वयं ${rule.label.sa} इति नियमेन अभ्यास्यते।`,
  te: `ఇక్కడ ${left} + ${right} ను ${rule.label.te} నియమంతో అభ్యసించేందుకు ఇచ్చాము.`,
});

const deriveStepContexts = (rootWord: string, steps: SplitStepDraft[]) => {
  let openSources: SourceOption[] = rootWord.trim()
    ? [{ path: ROOT_PATH, word: rootWord.trim() }]
    : [];

  return steps.map((step) => {
    const options = openSources.length > 0 ? [...openSources] : [];
    const resolvedSourcePath =
      options.find((option) => option.path === step.sourcePath)?.path ??
      options[0]?.path ??
      ROOT_PATH;
    const sourceWord =
      options.find((option) => option.path === resolvedSourcePath)?.word ??
      rootWord.trim();

    if (sourceWord && step.leftDevanagari.trim() && step.rightDevanagari.trim()) {
      openSources = openSources.filter((option) => option.path !== resolvedSourcePath);
      openSources.push({
        path: `${resolvedSourcePath}L`,
        word: step.leftDevanagari.trim(),
      });
      openSources.push({
        path: `${resolvedSourcePath}R`,
        word: step.rightDevanagari.trim(),
      });
    }

    return {
      options,
      resolvedSourcePath,
      sourceWord,
    };
  });
};

const createNodeFactory = () => {
  const idCounts = new Map<string, number>();

  return (devanagari: string): WordNode => {
    const trimmed = devanagari.trim();
    const baseId = makeWordId(trimmed);
    const count = (idCounts.get(baseId) ?? 0) + 1;
    idCounts.set(baseId, count);

    return {
      id: count === 1 ? baseId : `${baseId}-${count}`,
      devanagari: trimmed,
      iast: devanagariToIast(trimmed) || trimmed,
      status: "final",
      aksharas: splitDevanagariAksharas(trimmed),
      cuts: [],
    };
  };
};

const finalizeTree = (node: WordNode): WordNode => {
  if (node.cuts.length === 0) {
    return {
      ...node,
      status: "final",
      aksharas: splitDevanagariAksharas(node.devanagari),
    };
  }

  const [firstCut] = node.cuts;
  const left = finalizeTree(firstCut.left);
  const right = finalizeTree(firstCut.right);

  return {
    ...node,
    status: "splittable",
    aksharas: [...left.aksharas, ...right.aksharas],
    cuts: [
      {
        ...firstCut,
        left,
        right,
        cutAfterAksharaIndex: Math.max(left.aksharas.length - 1, 0),
      },
    ],
  };
};

const buildEntryFromDraft = (
  rootWord: string,
  steps: SplitStepDraft[],
  rules: SandhiRule[],
  resolvedSourcePaths: string[],
) => {
  const compoundWord = rootWord.trim();

  if (!compoundWord) {
    return { errorKey: "studioWordRequired" as const };
  }

  const normalizedSteps = steps.map((step, index) => ({
    ...step,
    sourcePath: resolvedSourcePaths[index] ?? ROOT_PATH,
    leftDevanagari: step.leftDevanagari.trim(),
    rightDevanagari: step.rightDevanagari.trim(),
  }));

  if (
    normalizedSteps.some(
      (step) => !step.leftDevanagari || !step.rightDevanagari,
    )
  ) {
    return { errorKey: "studioPiecesRequired" as const };
  }

  const ruleMap = new Map(rules.map((rule) => [rule.id, rule]));
  const createNode = createNodeFactory();
  const root = createNode(compoundWord);
  const nodes = new Map<string, WordNode>([[ROOT_PATH, root]]);

  for (const step of normalizedSteps) {
    const sourceNode = nodes.get(step.sourcePath);
    const rule = ruleMap.get(step.ruleId);

    if (!sourceNode || !rule) {
      return { errorKey: "studioTargetInvalid" as const };
    }

    if (sourceNode.cuts.length > 0) {
      return { errorKey: "studioDuplicateSplit" as const };
    }

    const left = createNode(step.leftDevanagari);
    const right = createNode(step.rightDevanagari);

    sourceNode.status = "splittable";
    sourceNode.cuts = [
      {
        id: `${sourceNode.id}-split`,
        ruleId: step.ruleId,
        cutAfterAksharaIndex: Math.max(left.aksharas.length - 1, 0),
        left,
        right,
        explanation: buildExplanation(rule, left.devanagari, right.devanagari),
        sutra: { ...rule.sutra },
      },
    ];

    nodes.set(`${step.sourcePath}L`, left);
    nodes.set(`${step.sourcePath}R`, right);
  }

  return { entry: finalizeTree(root) };
};

const getEditableCut = (node: WordNode) =>
  node.cuts.find((entry) => !entry.reviewNeeded) ?? node.cuts[0] ?? null;

const isBuilderEditable = (node: WordNode): boolean => {
  const activeCuts = node.cuts.filter((entry) => !entry.reviewNeeded);

  if (activeCuts.length > 1) {
    return false;
  }

  const cut = activeCuts[0] ?? null;
  if (!cut) {
    return true;
  }

  return isBuilderEditable(cut.left) && isBuilderEditable(cut.right);
};

const flattenEntryToDraft = (entry: WordNode): SplitStepDraft[] => {
  const steps: SplitStepDraft[] = [];

  const walk = (node: WordNode, sourcePath = ROOT_PATH) => {
    const cut = getEditableCut(node);
    if (!cut) {
      return;
    }

    steps.push({
      sourcePath,
      leftDevanagari: cut.left.devanagari,
      rightDevanagari: cut.right.devanagari,
      ruleId: cut.ruleId,
    });

    walk(cut.left, `${sourcePath}L`);
    walk(cut.right, `${sourcePath}R`);
  };

  walk(entry);
  return steps;
};

export const DevStudio = ({
  entries,
  language,
  rules,
  customEntries,
  defaultEntryIds,
  onSaveEntry,
  onDeleteEntry,
  onImportEntries,
  onExportEntries,
}: DevStudioProps) => {
  const defaultRuleId = rules[0]?.id ?? "savarna-dirgha";
  const [analysisInput, setAnalysisInput] = useState("");
  const [analysisScript, setAnalysisScript] =
    useState<SanskritInputScript>("auto");
  const [analysisResponse, setAnalysisResponse] =
    useState<SandhiAnalyzeSuccessResponse | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [analysisMessage, setAnalysisMessage] = useState<string | null>(null);
  const [rootWord, setRootWord] = useState("");
  const [splitCount, setSplitCount] = useState(1);
  const [steps, setSteps] = useState<SplitStepDraft[]>([createStepDraft(defaultRuleId)]);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const defaultEntryIdSet = useMemo(() => new Set(defaultEntryIds), [defaultEntryIds]);
  const customEntryIdSet = useMemo(
    () => new Set(customEntries.map((entry) => entry.id)),
    [customEntries],
  );

  useEffect(() => {
    setSteps((current) => ensureStepCount(current, splitCount, defaultRuleId));
  }, [defaultRuleId, splitCount]);

  const stepContexts = useMemo(
    () => deriveStepContexts(rootWord, steps),
    [rootWord, steps],
  );

  const generatedPreview = useMemo(() => {
    const trimmed = rootWord.trim();

    if (!trimmed) {
      return null;
    }

    return {
      id: makeWordId(trimmed),
      iast: devanagariToIast(trimmed) || trimmed,
      aksharas: splitDevanagariAksharas(trimmed),
    };
  }, [rootWord]);

  const updateStep = (index: number, patch: Partial<SplitStepDraft>) => {
    setSteps((current) =>
      current.map((step, currentIndex) =>
        currentIndex === index ? { ...step, ...patch } : step,
      ),
    );
  };

  const displaySurface = (word: {
    devanagari: string;
    iast: string;
    telugu?: string;
  }) => (language === "te" && word.telugu ? word.telugu : word.devanagari);

  const handleAnalyze = async () => {
    if (!analysisInput.trim()) {
      setAnalysisResponse(null);
      setAnalysisStatus("error");
      setAnalysisMessage(t("analyzerInputRequired", language));
      return;
    }

    setAnalysisStatus("loading");
    setAnalysisMessage(null);

    try {
      const response = await requestSandhiAnalysis(analysisInput, analysisScript);
      setAnalysisResponse(response);

      if (response.results.length === 0) {
        setAnalysisStatus("empty");
        setAnalysisMessage(t("analyzerNoResults", language));
        return;
      }

      setAnalysisStatus("success");
      setAnalysisMessage(
        response.truncated ? t("analyzerTruncated", language) : null,
      );
    } catch (error) {
      setAnalysisResponse(null);
      setAnalysisStatus("error");
      setAnalysisMessage(
        error instanceof Error ? error.message : t("analyzerRequestFailed", language),
      );
    }
  };

  const handleSaveAnalysis = (result: SandhiAnalysisResult) => {
    if (!analysisResponse) {
      return;
    }

    onSaveEntry(analysisResultToWordNode(result, analysisResponse));
    setAnalysisMessage(t("analyzerSavedMessage", language));
  };

  const resetForm = () => {
    setRootWord("");
    setSplitCount(1);
    setSteps([createStepDraft(defaultRuleId)]);
    setEditingEntryId(null);
  };

  const handleEditEntry = (entry: WordNode) => {
    if (!isBuilderEditable(entry)) {
      setMessage(t("builderSinglePathOnly", language));
      return;
    }

    const draftSteps = flattenEntryToDraft(entry);

    setEditingEntryId(entry.id);
    setRootWord(entry.devanagari);
    setSplitCount(Math.max(draftSteps.length, 1));
    setSteps(
      draftSteps.length > 0 ? draftSteps : [createStepDraft(defaultRuleId)],
    );
    setMessage(t("studioEditingLoaded", language));
  };

  const handleSave = () => {
    const result = buildEntryFromDraft(
      rootWord,
      steps,
      rules,
      stepContexts.map((context) => context.resolvedSourcePath),
    );

    if (result.errorKey) {
      setMessage(t(result.errorKey, language));
      return;
    }

    if (!result.entry) {
      setMessage(t("studioBuildFailed", language));
      return;
    }

    const nextEntry =
      editingEntryId !== null
        ? {
            ...result.entry,
            id: editingEntryId,
          }
        : result.entry;

    onSaveEntry(nextEntry);
    resetForm();
    setMessage(
      t(editingEntryId !== null ? "studioUpdatedMessage" : "studioSavedMessage", language),
    );
  };

  const handleImport = async (file: File | null) => {
    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      onImportEntries(JSON.parse(content));
      setMessage(t("studioImportedMessage", language));
    } catch {
      setMessage(t("studioImportFailed", language));
    }
  };

  return (
    <motion.section
      className="dev-studio glass-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="panel-heading">
        <div>
          <span className="panel-kicker">{t("studioTitle", language)}</span>
          <h2>{t("studioBody", language)}</h2>
        </div>
        <div className="studio-actions">
          <button className="ghost-button" onClick={onExportEntries} type="button">
            {t("exportJson", language)}
          </button>
          <button
            className="ghost-button"
            onClick={() => fileRef.current?.click()}
            type="button"
          >
            {t("importJson", language)}
          </button>
          <input
            hidden
            accept="application/json"
            onChange={(event) => void handleImport(event.target.files?.[0] ?? null)}
            ref={fileRef}
            type="file"
          />
        </div>
      </div>

      <div className="analyzer-shell">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">{t("analyzerTitle", language)}</span>
            <h2>{t("analyzerBody", language)}</h2>
          </div>
        </div>

        <div className="note-box">{t("analyzerScope", language)}</div>

        <div className="input-grid analyzer-grid">
          <label className="field-stack analyzer-grid__word">
            <span>{t("analyzerWord", language)}</span>
            <input
              onChange={(event) => setAnalysisInput(event.target.value)}
              placeholder="parameśvarālayaḥ / परमेश्वरालयः / పరమేశ్వరాలయః"
              value={analysisInput}
            />
          </label>

          <label className="field-stack">
            <span>{t("analyzerScript", language)}</span>
            <select
              onChange={(event) =>
                setAnalysisScript(event.target.value as SanskritInputScript)
              }
              value={analysisScript}
            >
              <option value="auto">{t("analyzerAuto", language)}</option>
              <option value="iast">{t("analyzerIast", language)}</option>
              <option value="devanagari">{t("analyzerSanskrit", language)}</option>
              <option value="telugu">{t("analyzerTelugu", language)}</option>
            </select>
          </label>

          <div className="studio-actions analyzer-grid__action">
            <button className="primary-button" onClick={() => void handleAnalyze()} type="button">
              {analysisStatus === "loading"
                ? t("analyzerLoading", language)
                : t("analyzerRun", language)}
            </button>
          </div>
        </div>

        {analysisResponse ? (
          <div className="analyzer-normalized">
            <span>
              <strong>{t("analyzerNormalized", language)}</strong>
            </span>
            <span>
              <strong>{t("analyzerSanskrit", language)}</strong>{" "}
              {analysisResponse.normalized.devanagari}
            </span>
            <span>
              <strong>{t("analyzerIast", language)}</strong>{" "}
              {analysisResponse.normalized.iast}
            </span>
            <span>
              <strong>{t("analyzerTelugu", language)}</strong>{" "}
              {analysisResponse.normalized.telugu}
            </span>
          </div>
        ) : null}

        {analysisStatus === "loading" ? (
          <div className="note-box">{t("analyzerLoading", language)}</div>
        ) : null}

        {analysisMessage ? <div className="note-box">{analysisMessage}</div> : null}

        {analysisResponse ? (
          <div className="analyzer-results">
            <div className="panel-heading">
              <div>
                <span className="panel-kicker">{t("analyzerResults", language)}</span>
                <h2>
                  {analysisResponse.results.length} {t("analyzerCandidates", language)}
                </h2>
              </div>
            </div>

            {analysisResponse.results.length === 0 ? (
              <p className="muted-copy">{t("analyzerNoResults", language)}</p>
            ) : (
              analysisResponse.results.map((result, index) => (
                <article className="analysis-card" key={result.signature}>
                  <div className="analysis-card__header">
                    <div>
                      <span className="panel-kicker">
                        {t("analyzerCandidate", language)} {index + 1}
                      </span>
                      <h3>{displaySurface(analysisResponse.normalized)}</h3>
                      <p>{analysisResponse.normalized.iast}</p>
                    </div>
                    <button
                      className="ghost-button"
                      onClick={() => handleSaveAnalysis(result)}
                      type="button"
                    >
                      {t("analyzerSave", language)}
                    </button>
                  </div>

                  <div className="analysis-chip-group">
                    <span className="panel-kicker">{t("analyzerFinalWords", language)}</span>
                    <div className="analysis-chip-row">
                      {result.finalWords.map((word, wordIndex) => (
                        <div className="analysis-chip" key={`${result.id}-final-${wordIndex + 1}`}>
                          <strong>{displaySurface(word)}</strong>
                          <span>{word.iast}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="analysis-step-list">
                    {result.steps.map((step, stepIndex) => (
                      <div
                        className="analysis-step-card"
                        key={`${result.id}-step-${stepIndex + 1}`}
                        style={{ marginLeft: `${step.depth * 16}px` }}
                      >
                        <div className="analysis-step-card__header">
                          <strong>
                            {t("analyzerStep", language)} {stepIndex + 1}
                          </strong>
                          <span>
                            {step.label[language]} · {step.sutra.text} · {step.sutra.number}
                          </span>
                        </div>

                        <div className="analysis-step-card__split">
                          <strong>{displaySurface(step.surface)}</strong>
                          <span>→</span>
                          <strong>{displaySurface(step.left)}</strong>
                          <span>+</span>
                          <strong>{displaySurface(step.right)}</strong>
                        </div>

                        <div className="analysis-step-card__pattern">
                          <span>
                            <strong>{t("analyzerPattern", language)}</strong> {step.pattern}
                          </span>
                        </div>

                        <p>{step.why[language]}</p>

                        <div className="note-box analyzer-step-card__note">
                          <strong>{t("nimittam", language)}</strong> {step.nimitta[language]}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        ) : null}
      </div>

      <div className="studio-grid">
        <div className="studio-form">
          <div className="note-box">
            {t("studioAutoFill", language)}
          </div>

          <div className="input-grid input-grid--studio-top">
            <label className="field-stack">
              <span>{t("studioWord", language)}</span>
              <input
                onChange={(event) => setRootWord(event.target.value)}
                placeholder="परमेश्वरालयः"
                value={rootWord}
              />
            </label>

            <label className="field-stack">
              <span>{t("studioSteps", language)}</span>
              <select
                onChange={(event) => setSplitCount(Number(event.target.value))}
                value={splitCount}
              >
                {Array.from({ length: MAX_SPLIT_STEPS }, (_, index) => index + 1).map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {generatedPreview ? (
            <div className="studio-generated">
              <span>
                <strong>{t("studioId", language)}</strong> {generatedPreview.id}
              </span>
              <span>
                <strong>{t("studioIast", language)}</strong> {generatedPreview.iast}
              </span>
              <span>
                <strong>{t("studioAksharas", language)}</strong>{" "}
                {generatedPreview.aksharas.join(" | ")}
              </span>
            </div>
          ) : null}

          <div className="step-list">
            {steps.map((step, index) => {
              const context = stepContexts[index];
              const selectedRule = rules.find((rule) => rule.id === step.ruleId) ?? rules[0];

              return (
                <div className="step-card" key={`${index + 1}-${context?.resolvedSourcePath ?? ROOT_PATH}`}>
                  <div className="step-card__header">
                    <h3>
                      {t("studioStep", language)} {index + 1}
                    </h3>
                    <span className="panel-kicker">
                      {context?.sourceWord
                        ? `${context.sourceWord} · ${describePath(
                            context.resolvedSourcePath,
                            language,
                          )}`
                        : t("studioStepHint", language)}
                    </span>
                  </div>

                  <div className="input-grid">
                    <label className="field-stack">
                      <span>{t("studioSplitThis", language)}</span>
                      <select
                        disabled={!context || context.options.length === 0}
                        onChange={(event) =>
                          updateStep(index, { sourcePath: event.target.value })
                        }
                        value={context?.resolvedSourcePath ?? step.sourcePath}
                      >
                        {(context?.options ?? []).length === 0 ? (
                          <option value={ROOT_PATH}>{t("studioStepHint", language)}</option>
                        ) : (
                          (context?.options ?? []).map((option) => (
                            <option key={option.path} value={option.path}>
                              {option.word} · {describePath(option.path, language)}
                            </option>
                          ))
                        )}
                      </select>
                    </label>

                    <label className="field-stack">
                      <span>{t("studioRule", language)}</span>
                      <select
                        onChange={(event) =>
                          updateStep(index, {
                            ruleId: event.target.value as SandhiRuleId,
                          })
                        }
                        value={step.ruleId}
                      >
                        {rules.map((rule) => (
                          <option key={rule.id} value={rule.id}>
                            {rule.label[language]}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field-stack">
                      <span>{t("studioLeft", language)}</span>
                      <input
                        onChange={(event) =>
                          updateStep(index, { leftDevanagari: event.target.value })
                        }
                        placeholder="परम"
                        value={step.leftDevanagari}
                      />
                    </label>

                    <label className="field-stack">
                      <span>{t("studioRight", language)}</span>
                      <input
                        onChange={(event) =>
                          updateStep(index, { rightDevanagari: event.target.value })
                        }
                        placeholder="ईश्वरालयः"
                        value={step.rightDevanagari}
                      />
                    </label>
                  </div>

                  {selectedRule ? (
                    <div className="step-meta">
                      <span>{selectedRule.helper[language]}</span>
                      <strong>
                        {selectedRule.sutra.text} · {selectedRule.sutra.number}
                      </strong>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="studio-actions">
            <button className="primary-button" onClick={handleSave} type="button">
              {t(editingEntryId !== null ? "updateEntry" : "saveEntry", language)}
            </button>
            {editingEntryId !== null ? (
              <button className="ghost-button" onClick={resetForm} type="button">
                {t("cancelEdit", language)}
              </button>
            ) : null}
          </div>

          {message ? <div className="note-box">{message}</div> : null}
        </div>

        <div className="studio-sidebar">
          <div className="studio-list">
            <h3>
              {t("studioPlan", language)} ({steps.length})
            </h3>
            {steps.map((step, index) => {
              const context = stepContexts[index];
              const rule = rules.find((entry) => entry.id === step.ruleId);

              return (
                <div className="entry-preview" key={`preview-${index + 1}`}>
                  <strong>
                    {t("studioStep", language)} {index + 1}
                  </strong>
                  <span>
                    {(context?.sourceWord || "...")} → {step.leftDevanagari || "..."} +{" "}
                    {step.rightDevanagari || "..."}
                  </span>
                  <span>
                    {rule?.label[language]} · {rule?.sutra.number}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="studio-list">
            <h3>
              {t("customEntries", language)} ({customEntries.length})
            </h3>
            {customEntries.length === 0 ? (
              <p className="muted-copy">{t("studioEmpty", language)}</p>
            ) : (
              customEntries.map((entry) => (
                <div className="entry-preview" key={entry.id}>
                  <strong>{entry.devanagari}</strong>
                  <span>{entry.iast}</span>
                  <span>
                    {entry.aksharas.join(" | ")} · {t("studioCuts", language)} {entry.cuts.length}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="studio-list studio-list--admin">
            <h3>
              {t("adminExamples", language)} ({entries.length})
            </h3>
            {entries.map((entry) => {
              const isBuiltIn = defaultEntryIdSet.has(entry.id);
              const isCustom = customEntryIdSet.has(entry.id);
              const editable = isBuilderEditable(entry);
              const tags = [
                isBuiltIn ? t("builtInEntry", language) : null,
                isCustom && isBuiltIn
                  ? t("customOverrideEntry", language)
                  : isCustom
                    ? t("customEntry", language)
                    : null,
              ].filter((value): value is string => Boolean(value));

              return (
                <div className="entry-preview entry-preview--admin" key={`admin-${entry.id}`}>
                  <div className="entry-preview__row">
                    <strong>{entry.devanagari}</strong>
                    {tags.length > 0 ? (
                      <div className="entry-preview__tags">
                        {tags.map((tag) => (
                          <span className="entry-preview__tag" key={`${entry.id}-${tag}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <span>{entry.iast}</span>
                  <span>
                    {entry.aksharas.join(" | ")} · {t("studioCuts", language)} {entry.cuts.length}
                  </span>
                  {!editable ? (
                    <span>{t("builderSinglePathOnly", language)}</span>
                  ) : null}
                  <div className="studio-actions entry-preview__actions">
                    <button
                      className="ghost-button"
                      disabled={!editable}
                      onClick={() => handleEditEntry(entry)}
                      type="button"
                    >
                      {t("editInBuilder", language)}
                    </button>
                    {isCustom ? (
                      <button
                        className="ghost-button"
                        onClick={() => onDeleteEntry(entry.id)}
                        type="button"
                      >
                        {t("deleteEntry", language)}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default DevStudio;
