export interface RegulationHit {
  title: string;
  content: string;
  sourceUrl: string;
  score: number;
}

export function formatSourcesBlock(results: RegulationHit[]): string {
  return results
    .map(
      (r, i) =>
        `[Source ${i + 1}: ${r.sourceUrl}]\nTitle: ${r.title}\n${r.content}`,
    )
    .join("\n\n---\n\n");
}

export function ensureCitationsInAnswer(
  answer: string,
  sources: RegulationHit[],
): string {
  if (sources.length === 0) return answer;

  const hasCitation = sources.some(
    (s) =>
      answer.includes(s.sourceUrl) ||
      /\[Source[\s\d]*:/i.test(answer) ||
      answer.includes(s.title),
  );

  if (hasCitation) return answer;

  const refs = sources
    .map((s, i) => `[Source ${i + 1}: ${s.sourceUrl}] ${s.title}`)
    .join("\n");

  return `${answer.trim()}\n\n---\nSources:\n${refs}`;
}

export function noSourceMessage(locale: "fr" | "en"): string {
  return locale === "fr"
    ? "Aucune source officielle IRCC trouvée pour cette question. Consultez canada.ca/immigration ou un consultant réglementé (RCIC)."
    : "No official IRCC source found for this question. Consult canada.ca/immigration or a regulated consultant (RCIC).";
}

export function buildRegulationSystemPrompt(locale: "fr" | "en"): string {
  const lang = locale === "fr" ? "French" : "English";
  return `You MUST answer ONLY using the provided IRCC sources (TOOL: searchRegulations).
Every factual claim MUST include an inline citation: [Source: URL].
Paraphrase sources in your own words — never copy more than 15 words verbatim from a source.
Use at most one short quote per source; prefer paraphrase.
If sources do not cover the question, refuse a substantive answer and say so clearly.
Never invent thresholds, dates, fees, or procedures.
Respond in ${lang}.
You are an informational assistant — NOT a lawyer, NOT an RCIC, NOT legal advice.`;
}
