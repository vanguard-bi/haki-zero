import { env } from "./config";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";

const pinecone = new Pinecone();

const pineconeIndex = pinecone.Index(env.PINECONE_INDEX_NAME);

export async function getVectorStore(client: Pinecone) {
  try {
    const embeddings = new OpenAIEmbeddings();
    const index = client.Index(env.PINECONE_INDEX_NAME);

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex, textKey: "text" }
    );

    return vectorStore;
  } catch (error) {
    console.log("pinecone error", error);
    throw new Error("Something went wrong while getting vector store !");
  }
}

