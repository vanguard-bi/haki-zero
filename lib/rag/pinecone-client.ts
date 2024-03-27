import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "./config";
import { delay } from "./utils";

let pineconeInstance: Pinecone | null = null;

// Initialize index and ready to be accessed.
async function initPinecone() {
  try {
    const pinecone = new Pinecone();
    return pinecone;
  } catch (error) {
    console.error("error", error);
    throw new Error("Failed to initialize Pinecone Client");
  }
}

export async function getPinecone() {
  if (!pineconeInstance) {
    pineconeInstance = await initPinecone();
  }

  return pineconeInstance;
}
