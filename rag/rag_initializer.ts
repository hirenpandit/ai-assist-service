import "cheerio";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { openAIChat } from "./llm.ts";
import { prepareVectorStore } from "./vector_store.ts";

export async function init(url: string) {
  // Define prompt for question-answering
  const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");

  // Define state for application
  const InputStateAnnotation = Annotation.Root({
    question: Annotation<string>,
  });

  const StateAnnotation = Annotation.Root({
    question: Annotation<string>,
    context: Annotation<Document[]>,
    answer: Annotation<string>,
  });

  // Define application steps
  const retrieve = async (state: typeof InputStateAnnotation.State) => {
    const vectorStore = await prepareVectorStore(url);
    const retrievedDocs = await vectorStore.similaritySearch(state.question);
    return { context: retrievedDocs };
  };

  const generate = async (state: typeof StateAnnotation.State) => {
    const docsContent = state.context.map((doc) => doc.pageContent).join("\n");
    const messages = await promptTemplate.invoke({
      question: state.question,
      context: docsContent,
    });
    const response = await openAIChat.invoke(messages);
    return { answer: response.content };
  };
  // Compile application and test
  return new StateGraph(StateAnnotation)
    .addNode("retrieve", retrieve)
    .addNode("generate", generate)
    .addEdge("__start__", "retrieve")
    .addEdge("retrieve", "generate")
    .addEdge("generate", "__end__")
    .compile();
}
