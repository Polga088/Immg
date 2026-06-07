import { ingestIrccCorpus, reembedMissingChunks } from "../apps/web/src/lib/rag/ingest";

async function main() {
  console.log("Starting IRCC corpus ingest (live fetch + pgvector embeddings)...");
  const stats = await ingestIrccCorpus({ useLiveFetch: true });
  console.log(JSON.stringify(stats, null, 2));

  const reembedded = await reembedMissingChunks();
  if (reembedded > 0) {
    console.log(`Re-embedded ${reembedded} chunks missing vectors.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
