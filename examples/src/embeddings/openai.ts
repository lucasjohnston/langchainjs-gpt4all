import { OpenAIEmbeddings } from "langchain-gpt4all/embeddings/openai";

export const run = async () => {
  const model = new OpenAIEmbeddings();
  const res = await model.embedQuery(
    "What would be a good company name a company that makes colorful socks?"
  );
  console.log({ res });
};
