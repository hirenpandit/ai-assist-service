import { ChatOpenAI } from "@langchain/openai";

export const openAIChat = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});
