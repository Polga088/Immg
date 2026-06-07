import { Agent } from "@mastra/core/agent";
import { loadPrompt } from "./prompts/loader";
import { getChatModel } from "@/lib/ai/ollama";

const model = getChatModel();

export const regulationAgent = new Agent({
  id: "regulation",
  name: "Regulation Agent",
  description:
    "Monitors IRCC regulations, analyzes changes, and explains impact with citations",
  instructions: loadPrompt("regulation"),
  model,
});

export const cvAgent = new Agent({
  id: "cv",
  name: "CV ATS Agent",
  description: "Parses resumes, scores ATS compatibility, suggests improvements",
  instructions: loadPrompt("cv"),
  model,
});

export const jobAgent = new Agent({
  id: "job",
  name: "Job Agent",
  description: "Job search, cover letters, application tracking",
  instructions: loadPrompt("job"),
  model,
});

export const procedureAgent = new Agent({
  id: "procedure",
  name: "Procedure Agent",
  description: "Immigration pathway, CRS calculator, checklists",
  instructions: loadPrompt("procedure"),
  model,
});

export const supervisorAgent = new Agent({
  id: "supervisor",
  name: "Supervisor",
  description: "Coordinates specialized immigration agents",
  instructions: loadPrompt("supervisor"),
  model,
  agents: {
    regulationAgent,
    cvAgent,
    jobAgent,
    procedureAgent,
  },
});

export const agents = {
  supervisor: supervisorAgent,
  regulation: regulationAgent,
  cv: cvAgent,
  job: jobAgent,
  procedure: procedureAgent,
};

export type AgentKey = keyof typeof agents;
