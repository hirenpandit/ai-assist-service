import { Router } from "jsr:@oak/oak/router";
import { Application } from "jsr:@oak/oak/application";
import { InitRequest, QueryRequest } from "./types/request.ts";
import { initializeGraph, invokeQuery } from "./service/graph_service.ts";
import { InitResponse, QueryResponse } from "./types/response.ts";
import { getAll } from "./database/rag_repository.ts";

if (import.meta.main) {
  const router = new Router();

  //root router
  router.get("/", async (cxt) => {
    getAll();

    cxt.response.headers.set("content-type", "application/json");
    const resp: any = {
      greeting: "Hello, from deno",
    };
    cxt.response.body = JSON.stringify(resp);
  });

  router.post("/init", async (cxt) => {
    const request: InitRequest = await cxt.request.body.json();
    console.log("starting new session for URL :", request.url);

    getAll();

    const sessionId = await initializeGraph(request);

    cxt.response.headers.set("content-type", "application/json");
    const resp: InitResponse = {
      id: sessionId,
    };
    cxt.response.body = JSON.stringify(resp);
  });

  router.post("/query", async (cxt) => {
    const request: QueryRequest = await cxt.request.body.json();
    const answer = await invokeQuery(request);
    cxt.response.headers.set("content-type", "application/json");
    const resp: QueryResponse = {
      answer: answer,
    };
    cxt.response.body = JSON.stringify(resp);
  });

  const app = new Application();
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.listen({ port: 8080 });
}
