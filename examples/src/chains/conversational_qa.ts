import { OpenAI } from "langchain-gpt4all/llms/openai";
import { ConversationalRetrievalQAChain } from "langchain-gpt4all/chains";
import { HNSWLib } from "langchain-gpt4all/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain-gpt4all/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain-gpt4all/text_splitter";
import * as fs from "fs";

export const run = async () => {
  /* Initialize the LLM to use to answer the question */
  const model = new OpenAI({});
  /* Load in the file we want to do question answering over */
  const text = fs.readFileSync("state_of_the_union.txt", "utf8");
  /* Split the text into chunks */
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([text]);
  /* Create the vectorstore */
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
  /* Create the chain */
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever()
  );
  /* Ask it a question */
  const question = "What did the president say about Justice Breyer?";
  const res = await chain.call({ question, chat_history: [] });
  console.log(res);
  /* Ask it a follow up question */
  const chatHistory = question + res.text;
  const followUpRes = await chain.call({
    question: "Was that nice?",
    chat_history: chatHistory,
  });
  console.log(followUpRes);
};
