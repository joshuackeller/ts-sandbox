// @ts-ignore
import data from "../data.json";
import OpenAI from "openai";
import { create, insertMultiple } from "@orama/orama";
import { persistToFile } from "@orama/plugin-data-persistence/server";

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

const getEmbeddingStructure = async (item) => {
  const embedding = await getEmbedding(`${item.name} ${item.description}`);

  return {
    ...item,
    embedding,
  };
};

const main = async () => {
  const db = await create({
    schema: {
      name: "string",
      description: "string",
      embedding: "vector[1536]",
    },
  } as const);

  let totalTime = 0;
  const start = Date.now();

  const results = await Promise.all(
    data.map((item) => getEmbeddingStructure(item))
  );

  totalTime += Date.now() - start;
  console.log("TIME ", totalTime);

  await insertMultiple(db, results);

  await persistToFile(
    db,
    "binary",
    "/Users/joshuakeller/Repos/test/ts-sandbox/orama.msp"
  );
  Bun.write(
    "/Users/joshuakeller/Repos/test/ts-sandbox/data-with-embeddings.json",
    JSON.stringify(results, null, 2)
  );
};

main();
