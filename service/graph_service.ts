import { create } from "../database/rag_repository.ts";
import { init } from "../rag/rag_initializer.ts";
import { InitRequest, QueryRequest } from "../types/request.ts";
import { InitResponse } from "../types/response.ts";
import crypto from "node:crypto";

const graphMap: Map<string, any> = new Map();

export async function initializeGraph(req: InitRequest): Promise<string> {
  const urlHash = crypto.hash("sha1", req.url);

  let graph: any;
  if (graphMap.has(urlHash)) {
    console.log("foound graph for url", req.url);
    graph = graphMap.get(urlHash);
  } else {
    graph = await init(req.url);
    graphMap.set(urlHash, graph);
  }

  create({ rag_session_id: urlHash, url: req.url });

  return urlHash;
}

export async function invokeQuery(req: QueryRequest): Promise<string> {
  const graph = graphMap.get(req.id);
  if (!graph) {
    throw new Error("graph not found for id" + req.id);
  }

  const input = { question: req.question };

  const result = await graph?.invoke(input);
  return result.answer;
}
