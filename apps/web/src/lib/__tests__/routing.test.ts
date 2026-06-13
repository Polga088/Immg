import { describe, expect, it } from "vitest";
import { resolveAgents, routeIntent, scoreAgents } from "@/lib/chat/routing";

describe("chat routing", () => {
  it("routes CRS questions to procedure", () => {
    expect(routeIntent("Quel est mon score CRS ?")).toBe("procedure");
  });

  it("routes IRCC questions to regulation", () => {
    expect(routeIntent("Quelle est la règle IRCC sur les fonds de subsistance ?")).toBe(
      "regulation",
    );
  });

  it("routes CV questions to cv", () => {
    expect(routeIntent("Comment optimiser mon CV pour ATS ?")).toBe("cv");
  });

  it("resolves multi-agent for mixed questions", () => {
    const agents = resolveAgents(
      "Mon score CRS est-il suffisant et quelle règle IRCC s'applique aux fonds ?",
    );
    expect(agents).toContain("procedure");
    expect(agents).toContain("regulation");
    expect(agents.length).toBe(2);
  });

  it("returns single agent for focused questions", () => {
    expect(resolveAgents("Améliore mon CV")).toEqual(["cv"]);
  });

  it("defaults to procedure when no pattern matches", () => {
    expect(resolveAgents("Bonjour")).toEqual(["procedure"]);
  });

  it("scores multiple domains for complex queries", () => {
    const scores = scoreAgents("CRS et CV et offre d'emploi");
    expect(scores.procedure).toBeGreaterThan(0);
    expect(scores.cv).toBeGreaterThan(0);
    expect(scores.job).toBeGreaterThan(0);
  });
});
