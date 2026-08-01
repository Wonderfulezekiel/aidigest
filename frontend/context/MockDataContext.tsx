"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface DocumentItem {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  uploadDate: string;
  status: "processing" | "ready" | "failed";
  chunkCount: number;
  vectorCount: number;
}

export interface SummaryItem {
  id: string;
  documentId: string;
  shortSummary: string;
  detailedSummary: string;
  keyTopics: string[];
  importantConcepts: { term: string; explanation: string }[];
  definitions: { term: string; definition: string }[];
  mainIdeas: string[];
  conclusion: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  message: string;
  createdAt: string;
  citations?: { page: number; snippet: string }[];
}

export interface ConversationItem {
  id: string;
  documentId: string;
  documentTitle: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface UserProfile {
  fullName: string;
  email: string;
  avatarUrl: string;
}

interface MockDataContextType {
  documents: DocumentItem[];
  summaries: Record<string, SummaryItem>;
  conversations: ConversationItem[];
  userProfile: UserProfile;
  uploadDocument: (file: File) => Promise<string>;
  deleteDocument: (id: string) => void;
  getSummary: (documentId: string) => SummaryItem | undefined;
  getConversationByDocId: (documentId: string) => ConversationItem | undefined;
  getConversationById: (conversationId: string) => ConversationItem | undefined;
  sendMessage: (conversationId: string, messageText: string) => Promise<void>;
  deleteConversation: (conversationId: string) => void;
  clearAllConversations: () => void;
  updateUserProfile: (fullName: string) => void;
  isLoading: boolean;
}

const defaultProfile: UserProfile = {
  fullName: "Academic Scholar",
  email: "student@university.edu",
  avatarUrl: "",
};

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [summaries, setSummaries] = useState<Record<string, SummaryItem>>({});
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load initial real data from FastAPI backend
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const docsData = await api.getDocuments();
      const mappedDocs: DocumentItem[] = docsData.map((d: any) => ({
        id: d.id,
        title: d.title,
        fileName: d.file_name,
        fileSize: d.file_size,
        pageCount: d.page_count,
        uploadDate: d.upload_date,
        status: d.status || "ready",
        chunkCount: d.chunk_count || 0,
        vectorCount: d.vector_count || 0,
      }));
      setDocuments(mappedDocs);

      // Fetch conversations history
      const convsData = await api.getConversations();
      const mappedConvs: ConversationItem[] = convsData.map((c: any) => ({
        id: c.id,
        documentId: c.document_id,
        documentTitle: c.document_title || "Academic Document",
        title: c.title,
        createdAt: c.created_at,
        messages: (c.messages || []).map((m: any) => ({
          id: m.id,
          conversationId: m.conversation_id,
          role: m.role,
          message: m.message,
          createdAt: m.created_at,
          citations: m.citations || [],
        })),
      }));
      setConversations(mappedConvs);

      // Fetch User profile
      const profileData = await api.getProfile();
      setUserProfile({
        fullName: profileData.full_name || "Academic Scholar",
        email: profileData.email || "student@university.edu",
        avatarUrl: profileData.avatar_url || "",
      });
    } catch (err) {
      console.warn("[Backend API Connection Notice] Operating with fallback state until FastAPI backend is running:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const uploadDocument = async (file: File): Promise<string> => {
    try {
      const doc = await api.uploadDocument(file);
      const newDocId = doc.id;
      await refreshData();
      return newDocId;
    } catch (e) {
      console.error("Upload error:", e);
      throw e;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await api.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setConversations((prev) => prev.filter((c) => c.documentId !== id));
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  const getSummary = (documentId: string): SummaryItem | undefined => {
    if (summaries[documentId]) return summaries[documentId];

    // Asynchronously fetch summary from API if not loaded
    api.getSummary(documentId).then((res) => {
      if (res) {
        const item: SummaryItem = {
          id: res.id,
          documentId: res.document_id,
          shortSummary: res.short_summary,
          detailedSummary: res.detailed_summary,
          keyTopics: res.key_topics || [],
          importantConcepts: res.important_concepts || [],
          definitions: res.definitions || [],
          mainIdeas: res.main_ideas || [],
          conclusion: res.conclusion || "",
        };
        setSummaries((prev) => ({ ...prev, [documentId]: item }));
      }
    }).catch((err) => console.error(err));

    return summaries[documentId];
  };

  const getConversationByDocId = (documentId: string): ConversationItem | undefined => {
    let conv = conversations.find((c) => c.documentId === documentId);
    if (!conv) {
      // Trigger API to get or create conversation session
      api.getConversationByDocId(documentId).then((cRes) => {
        if (cRes) {
          const newConv: ConversationItem = {
            id: cRes.id,
            documentId: cRes.document_id,
            documentTitle: cRes.document_title || "Academic Document",
            title: cRes.title,
            createdAt: cRes.created_at,
            messages: (cRes.messages || []).map((m: any) => ({
              id: m.id,
              conversationId: m.conversation_id,
              role: m.role,
              message: m.message,
              createdAt: m.created_at,
              citations: m.citations || [],
            })),
          };
          setConversations((prev) => [newConv, ...prev.filter((item) => item.id !== newConv.id)]);
        }
      }).catch((e) => console.error(e));
    }
    return conv;
  };

  const getConversationById = (conversationId: string): ConversationItem | undefined => {
    return conversations.find((c) => c.id === conversationId);
  };

  const sendMessage = async (conversationId: string, messageText: string) => {
    try {
      const aiMsg = await api.sendMessage(conversationId, messageText);
      const newMsg: ChatMessage = {
        id: aiMsg.id,
        conversationId: aiMsg.conversation_id,
        role: aiMsg.role,
        message: aiMsg.message,
        createdAt: aiMsg.created_at,
        citations: aiMsg.citations || [],
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            // Append user message and AI response
            const hasUserMsg = c.messages.some((m) => m.message === messageText && m.role === "user");
            const userMsgObj: ChatMessage = {
              id: `user-${Date.now()}`,
              conversationId,
              role: "user",
              message: messageText,
              createdAt: new Date().toISOString(),
            };
            const updatedMsgs = hasUserMsg ? [...c.messages, newMsg] : [...c.messages, userMsgObj, newMsg];
            return { ...c, messages: updatedMsgs };
          }
          return c;
        })
      );
    } catch (e) {
      console.error("Send message error:", e);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await api.deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    } catch (e) {
      console.error("Delete conversation error:", e);
    }
  };

  const clearAllConversations = async () => {
    try {
      await api.clearAllConversations();
      setConversations([]);
    } catch (e) {
      console.error("Clear all conversations error:", e);
    }
  };

  const updateUserProfile = async (fullName: string) => {
    try {
      const updated = await api.updateProfile(fullName);
      setUserProfile((prev) => ({ ...prev, fullName: updated.full_name }));
    } catch (e) {
      setUserProfile((prev) => ({ ...prev, fullName }));
    }
  };

  return (
    <MockDataContext.Provider
      value={{
        documents,
        summaries,
        conversations,
        userProfile,
        uploadDocument,
        deleteDocument,
        getSummary,
        getConversationByDocId,
        getConversationById,
        sendMessage,
        deleteConversation,
        clearAllConversations,
        updateUserProfile,
        isLoading,
      }}
    >
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error("useMockData must be used within a MockDataProvider");
  }
  return context;
}
