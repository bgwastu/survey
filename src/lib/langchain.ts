import { ChatOpenAI } from "@langchain/openai";

export const createSurveyModel = new ChatOpenAI({
  modelName: "gpt-4",
  verbose: true,
  temperature: 0,
  maxRetries: 1,
  maxConcurrency: 1,
}, {
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_URL,
});
