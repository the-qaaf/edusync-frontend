import { useState, useEffect, useRef, useCallback } from "react";
import { useTesseract } from "react-tesseract";
import { dbService, ChatMessage, ChatSession } from "../services/db";
import { askAiTutor } from "../services/api";
import {
  getSchoolSettings,
  SchoolSettings,
} from "@/services/firebase/settings";
import { useToast } from "@/shared/ui";

const generateId = () => Math.random().toString(36).substring(2, 9);

const DEFAULT_GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Welcome! I am Lumina, your AI Tutor. I can help you understand complex topics, solve problems, or review for exams. What would you like to learn today?",
};

export const useAITutor = (schoolId?: string) => {
  // --- State ---
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Speech State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Image & OCR State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Tesseract
  const { recognize, isRecognizing } = useTesseract();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Derived
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  // --- Effects ---

  // Fetch Settings
  useEffect(() => {
    if (schoolId) {
      getSchoolSettings(schoolId).then(setSettings);
    }
  }, [schoolId]);

  // Init Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join("");
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Load History
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const storedSessions = await dbService.getAllSessions();
        if (storedSessions.length > 0) {
          const sorted = storedSessions.sort(
            (a, b) => b.updatedAt - a.updatedAt
          );
          setSessions(sorted);
          setActiveSessionId(sorted[0].id);
        } else {
          createNewSession();
        }
      } catch (err) {
        console.error("Failed to load sessions from DB", err);
        createNewSession();
      }
    };
    loadSessions();
  }, []);

  // --- Handlers ---

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setInput("");
    }
  }, [isListening]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size > 5 * 1024 * 1024) {
          alert("File too large. Please select an image under 5MB.");
          return;
        }
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleRemoveImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const createNewSession = useCallback(async () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: "New Chat",
      messages: [DEFAULT_GREETING],
      updatedAt: Date.now(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);

    await dbService.saveSession(newSession);
  }, []);

  const deleteSession = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      // UI Update
      setSessions((prev) => {
        const newSessions = prev.filter((s) => s.id !== id);
        return newSessions;
      });

      const sessionToDelete = sessions.find((s) => s.id === id);
      if (!sessionToDelete) return;

      const newSessions = sessions.filter((s) => s.id !== id);
      setSessions(newSessions); // Optimistic UI

      await dbService.deleteSession(id);

      if (activeSessionId === id) {
        if (newSessions.length > 0) {
          setActiveSessionId(newSessions[0].id);
        } else {
          const newSession: ChatSession = {
            id: generateId(),
            title: "New Chat",
            messages: [DEFAULT_GREETING],
            updatedAt: Date.now(),
          };
          setSessions([newSession]);
          setActiveSessionId(newSession.id);
          await dbService.saveSession(newSession);
        }
      }
    },
    [sessions, activeSessionId]
  );

  const handleSend = useCallback(
    async (textOverride?: string) => {
      const text = textOverride ?? input;

      if ((!text.trim() && !imageFile) || isLoading || !activeSessionId)
        return toast("Please enter a message or upload an image");

      const currentSession = sessions.find((s) => s.id === activeSessionId);
      if (!currentSession) return;

      setIsLoading(true);
      let finalContent = text;
      let base64Image = imagePreview || undefined;

      // Handle OCR
      if (imagePreview) {
        try {
          const response = await recognize(imagePreview, {
            lang: "eng+ara+tam+hin+deu+fra+spa",
          });

          let extractedText = "";
          if (response) {
            extractedText =
              (response as any).text ||
              (response.data && response.data.text) ||
              "";
          }

          if (extractedText && extractedText.trim().length > 0) {
            finalContent = text
              ? `${text}\n\n[Attached Image Content]: ${extractedText}`
              : `[Attached Image Content]: ${extractedText}`;
          } else {
            if (!finalContent) finalContent = "[Image Attached]";
          }
        } catch (err) {
          console.error("OCR Failed", err);
          if (!finalContent) finalContent = "[Image Attached]";
        }
      }

      if (!finalContent.trim()) {
        setIsLoading(false);
        return;
      }

      const currentMessages = currentSession.messages;
      const userMsg: ChatMessage = {
        role: "user",
        content: finalContent,
        image: base64Image,
      };

      // Update local state
      const updatedWithUser = [...currentMessages, userMsg];

      // Update title
      let newTitle = currentSession.title;
      if (currentSession.title === "New Chat") {
        newTitle = text.slice(0, 30) + (text.length > 30 ? "..." : "");
      }

      const updatedSession = {
        ...currentSession,
        messages: updatedWithUser,
        title: newTitle,
        updatedAt: Date.now(),
      };

      setSessions((prev) =>
        prev
          .map((s) => (s.id === activeSessionId ? updatedSession : s))
          .sort((a, b) => b.updatedAt - a.updatedAt)
      );

      await dbService.saveSession(updatedSession);

      setInput("");
      handleRemoveImage();
      setIsLoading(true);

      try {
        // Placeholder assistant message
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: [...updatedWithUser],
              };
            }
            return s;
          })
        );

        // Call the Cloud API
        const answer = await askAiTutor(finalContent);

        // Update with answer
        setSessions((prev) => {
          return prev.map((s) => {
            if (s.id === activeSessionId) {
              const newMsgs = [
                ...updatedWithUser,
                {
                  role: "assistant" as const, // explicit type casting
                  content: answer,
                },
              ];
              // Also update DB
              const sessionToSave = {
                ...s,
                messages: newMsgs,
                updatedAt: Date.now(),
              };
              dbService.saveSession(sessionToSave);
              return sessionToSave;
            }
            return s;
          });
        });
      } catch (error) {
        console.error("Chat error", error);
        toast("Failed to get response from AI Tutor");
      } finally {
        setIsLoading(false);
      }
    },
    [
      input,
      sessions,
      activeSessionId,
      isLoading,
      imageFile,
      imagePreview,
      recognize,
      handleRemoveImage,
      toast,
    ]
  );

  const updateFeedback = useCallback(
    (index: number, type: "like" | "dislike") => {
      if (!activeSessionId) return;

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            const newMsgs = [...s.messages];
            newMsgs[index] = {
              ...newMsgs[index],
              feedback: type,
            };
            return { ...s, messages: newMsgs };
          }
          return s;
        })
      );

      dbService.updateMessageFeedback(activeSessionId, index, type);
    },
    [activeSessionId]
  );

  return {
    settings,
    sessions,
    activeSessionId,
    setActiveSessionId,
    input,
    setInput,
    isLoading,
    isSidebarOpen,
    setIsSidebarOpen,
    isListening,
    imageFile,
    imagePreview,
    isRecognizing,
    fileInputRef,
    toggleListening,
    handleFileSelect,
    handleRemoveImage,
    createNewSession,
    deleteSession,
    handleSend,
    updateFeedback,
    messages,
  };
};
