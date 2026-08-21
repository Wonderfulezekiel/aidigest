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

export interface QuizQuestion {
  id: string;
  quizId?: string;
  questionIndex?: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  pageCitation: number;
}

export interface QuizItem {
  id: string;
  documentId: string;
  documentTitle: string;
  title: string;
  description: string;
  questionCount: number;
  questions: QuizQuestion[];
}

export interface QuestionResult {
  questionId: string;
  question: string;
  chosenAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  topic: string;
  pageCitation: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  documentId: string;
  documentTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  grade: string;
  feedback: string;
  timeSpentSeconds: number;
  questionResults?: QuestionResult[];
  createdAt?: string;
}

export interface Flashcard {
  id: string;
  setId?: string;
  cardIndex?: number;
  front: string;
  back: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  pageCitation: number;
}

export interface FlashcardSet {
  id: string;
  documentId: string;
  documentTitle: string;
  title: string;
  cardCount: number;
  cards: Flashcard[];
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
  quizzes: Record<string, QuizItem[]>;
  flashcardSets: Record<string, FlashcardSet>;
  allFlashcardSets: FlashcardSet[];
  quizAttempts: QuizAttempt[];
  userProfile: UserProfile;
  uploadDocument: (file: File) => Promise<string>;
  deleteDocument: (id: string) => void;
  getSummary: (documentId: string) => SummaryItem | undefined;
  getConversationByDocId: (documentId: string) => ConversationItem | undefined;
  getConversationById: (conversationId: string) => ConversationItem | undefined;
  sendMessage: (conversationId: string, messageText: string) => Promise<void>;
  deleteConversation: (conversationId: string) => void;
  clearAllConversations: () => void;
  // Quiz Actions
  getQuizzesForDocument: (documentId: string) => Promise<QuizItem[]>;
  generateNewQuiz: (documentId: string) => Promise<QuizItem>;
  submitQuizAttempt: (quizId: string, answers: Record<string, string>, timeSpentSeconds?: number) => Promise<QuizAttempt>;
  // Flashcard Actions
  getFlashcardsForDocument: (documentId: string) => Promise<FlashcardSet>;
  generateNewFlashcards: (documentId: string) => Promise<FlashcardSet>;
  fetchAllFlashcardSets: () => Promise<FlashcardSet[]>;
  // Profile Actions
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
  const [quizzes, setQuizzes] = useState<Record<string, QuizItem[]>>({});
  const [flashcardSets, setFlashcardSets] = useState<Record<string, FlashcardSet>>({});
  const [allFlashcardSets, setAllFlashcardSets] = useState<FlashcardSet[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshData = async () => {
    try {
      const docsData = await api.getDocuments();
      if (Array.isArray(docsData)) {
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
      }

      // Fetch conversations history
      api.getConversations().then((convsData) => {
        if (Array.isArray(convsData)) {
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
        }
      }).catch(() => {});

      // Fetch quiz attempts history
      api.getQuizAttempts().then((attemptsData) => {
        if (Array.isArray(attemptsData)) {
          setQuizAttempts(attemptsData.map((a: any) => ({
            id: a.id,
            quizId: a.quiz_id,
            quizTitle: a.quiz_title || "Mastery Quiz",
            documentId: a.document_id,
            documentTitle: a.document_title || "Document",
            score: a.score,
            totalQuestions: a.total_questions,
            percentage: a.percentage,
            grade: a.grade,
            feedback: a.feedback,
            timeSpentSeconds: a.time_spent_seconds || 0,
            createdAt: a.created_at,
          })));
        }
      }).catch(() => {});

      // Fetch all flashcard sets
      api.getAllFlashcardSets().then((flashSets) => {
        if (Array.isArray(flashSets)) {
          const mappedSets: FlashcardSet[] = flashSets.map((s: any) => ({
            id: s.id,
            documentId: s.document_id,
            documentTitle: s.document_title || "Academic Document",
            title: s.title,
            cardCount: s.card_count || (s.cards ? s.cards.length : 0),
            cards: (s.cards || []).map((c: any) => ({
              id: c.id,
              setId: c.set_id,
              front: c.front,
              back: c.back,
              category: c.category || "General",
              difficulty: c.difficulty || "Medium",
              pageCitation: c.page_citation || 1,
            })),
          }));
          setAllFlashcardSets(mappedSets);
        }
      }).catch(() => {});

      // Fetch User profile
      api.getProfile().then((profileData) => {
        if (profileData) {
          setUserProfile({
            fullName: profileData.full_name || "Academic Scholar",
            email: profileData.email || "student@university.edu",
            avatarUrl: profileData.avatar_url || "",
          });
        }
      }).catch(() => {});
    } catch (err) {
      console.warn("[Backend API Notice]:", err);
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

      // Optimistically update document list immediately
      const newDocItem: DocumentItem = {
        id: doc.id,
        title: doc.title,
        fileName: doc.file_name,
        fileSize: doc.file_size,
        pageCount: doc.page_count,
        uploadDate: doc.upload_date || new Date().toISOString(),
        status: doc.status || "ready",
        chunkCount: doc.chunk_count || 0,
        vectorCount: doc.vector_count || 0,
      };
      setDocuments((prev) => [newDocItem, ...prev.filter((d) => d.id !== newDocId)]);

      // Background refresh
      refreshData().catch(() => {});
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

  // --- Quiz Context Methods ---
  const mapQuiz = (q: any): QuizItem => ({
    id: q.id,
    documentId: q.document_id,
    documentTitle: q.document_title || "Academic Document",
    title: q.title || "Mastery Quiz",
    description: q.description || "Interactive learning quiz.",
    questionCount: q.question_count || (q.questions ? q.questions.length : 0),
    questions: (q.questions || []).map((item: any) => ({
      id: item.id,
      quizId: item.quiz_id,
      questionIndex: item.question_index,
      question: item.question,
      options: item.options || [],
      correctAnswer: item.correct_answer,
      explanation: item.explanation,
      topic: item.topic || "General",
      pageCitation: item.page_citation || 1,
    })),
  });

  const getQuizzesForDocument = async (documentId: string): Promise<QuizItem[]> => {
    if (quizzes[documentId] && quizzes[documentId].length > 0) {
      return quizzes[documentId];
    }
    try {
      const res = await api.getQuizzesByDoc(documentId);
      const list = Array.isArray(res) ? res.map(mapQuiz) : [mapQuiz(res)];
      setQuizzes((prev) => ({ ...prev, [documentId]: list }));
      return list;
    } catch (e) {
      console.error("Fetch quizzes error:", e);
      return [];
    }
  };

  const generateNewQuiz = async (documentId: string): Promise<QuizItem> => {
    const res = await api.generateQuiz(documentId);
    const newQuiz = mapQuiz(res);
    setQuizzes((prev) => ({
      ...prev,
      [documentId]: [newQuiz, ...(prev[documentId] || [])],
    }));
    return newQuiz;
  };

  const submitQuizAttempt = async (
    quizId: string,
    answers: Record<string, string>,
    timeSpentSeconds: number = 0
  ): Promise<QuizAttempt> => {
    const res = await api.submitQuiz(quizId, answers, timeSpentSeconds);
    const attempt: QuizAttempt = {
      id: res.id,
      quizId: res.quiz_id,
      quizTitle: res.quiz_title,
      documentId: res.document_id,
      documentTitle: res.document_title,
      score: res.score,
      totalQuestions: res.total_questions,
      percentage: res.percentage,
      grade: res.grade,
      feedback: res.feedback,
      timeSpentSeconds: res.time_spent_seconds,
      questionResults: (res.question_results || []).map((r: any) => ({
        questionId: r.question_id,
        question: r.question,
        chosenAnswer: r.chosen_answer,
        correctAnswer: r.correct_answer,
        isCorrect: r.is_correct,
        explanation: r.explanation,
        topic: r.topic,
        pageCitation: r.page_citation,
      })),
      createdAt: new Date().toISOString(),
    };
    setQuizAttempts((prev) => [attempt, ...prev]);
    return attempt;
  };

  // --- Flashcard Context Methods ---
  const mapFlashcardSet = (s: any): FlashcardSet => ({
    id: s.id,
    documentId: s.document_id,
    documentTitle: s.document_title || "Academic Document",
    title: s.title || "Study Deck",
    cardCount: s.card_count || (s.cards ? s.cards.length : 0),
    cards: (s.cards || []).map((c: any) => ({
      id: c.id,
      setId: c.set_id,
      cardIndex: c.card_index,
      front: c.front,
      back: c.back,
      category: c.category || "Concept",
      difficulty: c.difficulty || "Medium",
      pageCitation: c.page_citation || 1,
    })),
  });

  const getFlashcardsForDocument = async (documentId: string): Promise<FlashcardSet> => {
    if (flashcardSets[documentId]) {
      return flashcardSets[documentId];
    }
    try {
      const res = await api.getFlashcardsByDoc(documentId);
      const set = mapFlashcardSet(res);
      setFlashcardSets((prev) => ({ ...prev, [documentId]: set }));
      return set;
    } catch (e) {
      console.error("Fetch flashcards error:", e);
      throw e;
    }
  };

  const generateNewFlashcards = async (documentId: string): Promise<FlashcardSet> => {
    const res = await api.generateFlashcards(documentId);
    const newSet = mapFlashcardSet(res);
    setFlashcardSets((prev) => ({ ...prev, [documentId]: newSet }));
    setAllFlashcardSets((prev) => [newSet, ...prev.filter((item) => item.id !== newSet.id)]);
    return newSet;
  };

  const fetchAllFlashcardSets = async (): Promise<FlashcardSet[]> => {
    try {
      const res = await api.getAllFlashcardSets();
      const list = (res || []).map(mapFlashcardSet);
      setAllFlashcardSets(list);
      return list;
    } catch (e) {
      console.error("Fetch all flashcard sets error:", e);
      return [];
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
        quizzes,
        flashcardSets,
        allFlashcardSets,
        quizAttempts,
        userProfile,
        uploadDocument,
        deleteDocument,
        getSummary,
        getConversationByDocId,
        getConversationById,
        sendMessage,
        deleteConversation,
        clearAllConversations,
        getQuizzesForDocument,
        generateNewQuiz,
        submitQuizAttempt,
        getFlashcardsForDocument,
        generateNewFlashcards,
        fetchAllFlashcardSets,
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
