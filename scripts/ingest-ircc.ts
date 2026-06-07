import { ingestRegulationSources } from "../apps/web/src/lib/rag/search";

async function main() {
  console.log("Ingesting IRCC seed sources...");
  const count = await ingestRegulationSources();
  console.log(`Ingested ${count} new regulation chunks.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
