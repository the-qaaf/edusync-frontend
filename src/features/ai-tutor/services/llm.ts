import {
  CreateMLCEngine,
  MLCEngine,
  InitProgressCallback,
} from "@mlc-ai/web-llm";

// Using Llama-3.2-3B-Instruct-q4f16_1-MLC for a balance of speed and quality in browser
const SELECTED_MODEL = "Llama-3.2-3B-Instruct-q4f16_1-MLC";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  image?: string; // Base64 data URL
}

export class LLMService {
  private engine: MLCEngine | null = null;
  private initializationPromise: Promise<void> | null = null;

  async initialize(onProgress: InitProgressCallback): Promise<void> {
    if (this.engine) return;

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        this.engine = await CreateMLCEngine(SELECTED_MODEL, {
          initProgressCallback: onProgress,
        });
      } catch (error) {
        console.error("Failed to initialize LLM engine:", error);
        throw error;
      } finally {
        this.initializationPromise = null;
      }
    })();

    return this.initializationPromise;
  }

  async generateResponse(
    messages: ChatMessage[],
    onUpdate: (currentResponse: string) => void
  ): Promise<string> {
    if (!this.engine) {
      throw new Error("Engine not initialized");
    }

    const chunks = await this.engine.chat.completions.create({
      messages,
      stream: true,
      max_tokens: 2048, // Increased for longer, more detailed educational responses
      temperature: 0.7,
    });

    let finalMessage = "";
    for await (const chunk of chunks) {
      const content = chunk.choices[0]?.delta?.content || "";
      finalMessage += content;
      onUpdate(finalMessage);
    }
    return finalMessage;
  }

  isReady(): boolean {
    return !!this.engine;
  }
}

export const llmService = new LLMService();
