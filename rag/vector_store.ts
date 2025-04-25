import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { embeddings } from "./embedding.ts";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

// Load and chunk contents of blog
//const pTagSelector = "p";

const vectorStoreMap: Map<string, MemoryVectorStore> = new Map<
  string,
  MemoryVectorStore
>();

export const prepareVectorStore = async (url: string) => {
  if (vectorStoreMap.has(url)) {
    return vectorStoreMap.get(url);
  }
  const vectorStore = new MemoryVectorStore(embeddings);
  const cheerioLoader = new CheerioWebBaseLoader(
    url,
    //{ selector: pTagSelector }, //HTML tag to load as document
  );
  const docs = await cheerioLoader.load();
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const allSplits = await splitter.splitDocuments(docs);
  // Index chunks
  await vectorStore.addDocuments(allSplits);

  vectorStoreMap.set(url, vectorStore);

  return vectorStore;
};
