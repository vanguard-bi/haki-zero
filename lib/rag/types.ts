
export type HakiAgent = "user" | "assistant";

export interface HakiMessage {
  role: HakiAgent;
  content: string;
  sources?: string[];
}