import { OpenAI } from "langchain-gpt4all/llms/openai";
import { RetrievalQAChain, loadQARefineChain } from "langchain-gpt4all/chains";
import { HNSWLib } from "langchain-gpt4all/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain-gpt4all/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain-gpt4all/text_splitter";
import * as fs from "fs";

// Initialize the LLM to use to answer the question.
const model = new OpenAI({});
const text = fs.readFileSync("state_of_the_union.txt", "utf8");
const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
const docs = await textSplitter.createDocuments([text]);

// Create a vector store from the documents.
const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

// Create a chain that uses a Refine chain and HNSWLib vector store.
const chain = new RetrievalQAChain({
  combineDocumentsChain: loadQARefineChain(model),
  retriever: vectorStore.asRetriever(),
});
const res = await chain.call({
  query: "What did the president say about Justice Breyer?",
});
console.log({ res });
/*
{
  res: {
    output_text: '\n' +
      '\n' +
      "The president said that Justice Breyer has dedicated his life to serve his country, and thanked him for his service. He also said that Judge Ketanji Brown Jackson will continue Justice Breyer's legacy of excellence, emphasizing the importance of protecting the rights of citizens, especially women, LGBTQ+ Americans, and access to healthcare. He also expressed his commitment to supporting the younger transgender Americans in America and ensuring they are able to reach their full potential, offering a Unity Agenda for the Nation to beat the opioid epidemic and increase funding for prevention, treatment, harm reduction, and recovery."
  }
}
*/
