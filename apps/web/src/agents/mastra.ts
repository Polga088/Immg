import { Mastra } from "@mastra/core/mastra";
import {
  supervisorAgent,
  regulationAgent,
  cvAgent,
  jobAgent,
  procedureAgent,
} from "./index";

export const mastra = new Mastra({
  agents: {
    supervisorAgent,
    regulationAgent,
    cvAgent,
    jobAgent,
    procedureAgent,
  },
});
