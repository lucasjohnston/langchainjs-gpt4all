import { OpenAI } from "langchain-gpt4all/llms/openai";
import { HNSWLib } from "langchain-gpt4all/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain-gpt4all/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain-gpt4all/text_splitter";
import * as fs from "fs";
import {
  VectorStoreToolkit,
  createVectorStoreAgent,
  VectorStoreInfo,
} from "langchain-gpt4all/agents";

export const run = async () => {
  const model = new OpenAI({ temperature: 0 });

  /* Load in the file we want to do question answering over */
  const text = fs.readFileSync("state_of_the_union.txt", "utf8");

  /* Split the text into chunks */
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([text]);
  console.log(docs);

  /* Create the vectorstore */
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

  /* Create the agent */
  const vectorStoreInfo: VectorStoreInfo = {
    name: "state_of_union_address",
    description: "the most recent state of the Union address",
    vectorStore,
  };

  const toolkit = new VectorStoreToolkit(vectorStoreInfo, model);
  const agent = createVectorStoreAgent(model, toolkit);

  const input =
    "What did biden say about Ketanji Brown Jackson is the state of the union address?";
  console.log(`Executing: ${input}`);

  const result = await agent.call({ input });
  console.log(`Got output ${result.output}`);
  console.log(
    `Got intermediate steps ${JSON.stringify(
      result.intermediateSteps,
      null,
      2
    )}`
  );
};
