import { openDB, DBSchema, IDBPDatabase } from "idb";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  feedback?: "like" | "dislike";
  image?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
  studentGrade?: string; // e.g., "10", "LKG", "5"
  subject?: string;
}

interface AIDatabase extends DBSchema {
  chats: {
    key: string;
    value: ChatSession;
    indexes: { "by-date": number };
  };
}

const DB_NAME = "ai-tutor-db";
const DB_VERSION = 1;

class DBService {
  private dbPromise: Promise<IDBPDatabase<AIDatabase>>;

  constructor() {
    this.dbPromise = openDB<AIDatabase>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore("chats", { keyPath: "id" });
        store.createIndex("by-date", "updatedAt");
      },
    });
  }

  async getAllSessions(): Promise<ChatSession[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex("chats", "by-date");
  }

  async getSession(id: string): Promise<ChatSession | undefined> {
    const db = await this.dbPromise;
    return db.get("chats", id);
  }

  async saveSession(session: ChatSession): Promise<void> {
    const db = await this.dbPromise;
    await db.put("chats", session);
  }

  async deleteSession(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete("chats", id);
  }

  async updateMessageFeedback(
    sessionId: string,
    messageIndex: number,
    feedback: "like" | "dislike" | undefined
  ): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction("chats", "readwrite");
    const store = tx.objectStore("chats");

    const session = await store.get(sessionId);
    if (session && session.messages[messageIndex]) {
      session.messages[messageIndex].feedback = feedback;
      await store.put(session);
    }
    await tx.done;
  }
}

export const dbService = new DBService();
