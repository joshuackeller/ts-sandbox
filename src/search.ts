import { search } from "@orama/orama";
import { restoreFromFile } from "@orama/plugin-data-persistence/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "",
});

export const getEmbedding = async (text: string) => {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });

  return response.data[0].embedding;
};

const main = async () => {
  const db = await restoreFromFile(
    "binary",
    "/Users/joshuakeller/Repos/test/ts-sandbox/orama.msp"
  );

  const SEARCH_TERM = "dog";

  const searchEmbedding = await getEmbedding(SEARCH_TERM);

  const results = await search(db, {
    mode: "hybrid",
    term: SEARCH_TERM,
    vector: {
      value: searchEmbedding,
      property: "embedding",
    },
    similarity: 0.9, // Minimum similarity. Defaults to `0.8`
    includeVectors: false,
    limit: 3, // Defaults to `10`
    // offset: 0, // Defaults to `0`
  });

  console.log("RESULTS", results);
};

main();
