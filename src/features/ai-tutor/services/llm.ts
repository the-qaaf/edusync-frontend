import {
  CreateWebWorkerMLCEngine,
  WebWorkerMLCEngine,
  InitProgressCallback,
  AppConfig,
} from "@mlc-ai/web-llm";

// 1. Using the standard model ID from the built-in registry
const SELECTED_MODEL_ID = "Llama-3.2-3B-Instruct-q4f16_1-MLC";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  image?: string; // Base64 data URL
}

export class LLMService {
  private engine: WebWorkerMLCEngine | null = null;
  private initializationPromise: Promise<void> | null = null;

  async initialize(onProgress: InitProgressCallback): Promise<void> {
    if (this.engine) return;

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        // Clean up any potentially corrupted cache
        // await this.deleteOldCache();

        const worker = new Worker(new URL("./worker.ts", import.meta.url), {
          type: "module",
        });

        // Using the built-in configuration to ensure correct model URLs and WASM versions
        // This resolves the "Failed to execute 'add' on 'Cache'" error caused by incorrect manual config
        this.engine = await CreateWebWorkerMLCEngine(
          worker,
          SELECTED_MODEL_ID,
          {
            initProgressCallback: onProgress,
            // appConfig is omitted to use the robust default registry
          }
        );
      } catch (error) {
        console.error("Failed to initialize LLM engine:", error);
        throw error;
      } finally {
        this.initializationPromise = null;
      }
    })();

    return this.initializationPromise;
  }

  // Helper to cleanup previous model versions from browser cache
  // private async deleteOldCache(): Promise<void> {
  //   try {
  //     if ("caches" in window) {
  //       const keys = await caches.keys();
  //       const oldModelId = "Llama-3.2-3B-Instruct-q4f16_1-MLC"; // Previous ID
  //       for (const key of keys) {
  //         if (key.includes(oldModelId)) {
  //           await caches.delete(key);
  //           console.log(`[LLMService] Deleted old cache: ${key}`);
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.warn("[LLMService] Failed to clean up old cache:", error);
  //   }
  // }

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
      max_tokens: 1024, // Reduced to 1024 for better mobile performance and battery life
      temperature: 0.3, // Lowered to 0.3 for more accurate, less hallucinatory responses
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
