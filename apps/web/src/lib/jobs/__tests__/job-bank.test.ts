import { describe, expect, it } from "vitest";
import { parseJobBankSearchHtml } from "../job-bank";

const SAMPLE_HTML = `
<article id="article-49681586"><a href="/jobsearch/jobposting/49681586">
  <h3 class="title"><span class="noctitle"> software developer</span></h3>
  <span class="business">Binary Stream Software Inc.</span>
  <span class="location">Montreal (QC)</span>
  <span class="salary">$80,000 annually</span>
</a></article>
`;

describe("parseJobBankSearchHtml", () => {
  it("extracts listings from Job Bank HTML", () => {
    const results = parseJobBankSearchHtml(SAMPLE_HTML);
    expect(results).toHaveLength(1);
    expect(results[0].externalJobId).toBe("49681586");
    expect(results[0].company).toContain("Binary Stream");
    expect(results[0].title).toContain("software developer");
    expect(results[0].jobUrl).toContain("49681586");
  });
});
