import {
  CreateWebWorkerMLCEngine,
  WebWorkerMLCEngine,
  InitProgressCallback,
} from "@mlc-ai/web-llm";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  image?: string;
}

// 1. Dynamic Model Selection based on RAM
// 1. Dynamic Model Selection based on RAM
function getBestModelId(): string {
  const ram = (navigator as any).deviceMemory || 4; // Default to 4GB if undetected

  if (ram >= 8) {
    // High-End: Llama 3.2 3B (Excellent reasoning, fits in 8GB)
    // Note: Replaced Phi-4 as it's not yet in standard WebLLM registry
    return "Llama-3.2-3B-Instruct-q4f16_1-MLC";
  } else if (ram >= 4) {
    // Mid-Range: Llama 3.2 1B (Fast, efficient)
    return "Llama-3.2-1B-Instruct-q4f16_1-MLC";
  } else {
    // Low-End: Qwen 2.5 0.5B (Ultra lightweight)
    return "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";
  }
}

export class LLMService {
  private engine: WebWorkerMLCEngine | null = null;
  private initializationPromise: Promise<void> | null = null;
  private selectedModelId: string = getBestModelId();

  async initialize(onProgress: InitProgressCallback): Promise<void> {
    if (this.engine) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = (async () => {
      try {
        const worker = new Worker(new URL("./worker.ts", import.meta.url), {
          type: "module",
        });

        this.engine = await CreateWebWorkerMLCEngine(
          worker,
          this.selectedModelId,
          { initProgressCallback: onProgress }
        );
      } catch (error) {
        console.error("LLM Init Failed:", error);
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
    if (!this.engine) throw new Error("Engine not initialized");

    // RAM Optimization: Reduce context window for lower-end phones
    const isLowRam = ((navigator as any).deviceMemory || 4) <= 4;

    const chunks = await this.engine.chat.completions.create({
      messages,
      stream: true,
      max_tokens: isLowRam ? 512 : 1024,
      temperature: 0.2, // Low temperature for academic accuracy
    });

    let finalMessage = "";
    for await (const chunk of chunks) {
      finalMessage += chunk.choices[0]?.delta?.content || "";
      onUpdate(finalMessage);
    }
    return finalMessage;
  }

  isReady(): boolean {
    return !!this.engine;
  }
}

export const llmService = new LLMService();
