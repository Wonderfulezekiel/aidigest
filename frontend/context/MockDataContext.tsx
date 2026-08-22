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
  status: "ready" | "processing" | "error";
  chunkCount: number;
  vectorCount: number;
}

export interface SummaryItem {
  id?: string;
  documentId: string;
  shortSummary: string;
  detailedSummary: string;
  keyTopics: string[];
  importantConcepts: Array<{ term: string; explanation: string }>;
  definitions: Array<{ term: string; definition: string }>;
  mainIdeas: string[];
  conclusion: string;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  message: string;
  createdAt?: string;
  citations?: Array<{ page: number; snippet: string }>;
}

export interface ConversationItem {
  id: string;
  documentId: string;
  documentTitle: string;
  title: string;
  createdAt: string;
  messages: MessageItem[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  correctAnswer?: string;
  explanation: string;
  topic?: string;
  page_citation?: number;
  pageCitation?: number;
}

export interface QuizItem {
  id: string;
  documentId: string;
  documentTitle?: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  questionCount: number;
  createdAt?: string;
}

export interface QuizQuestionResult {
  questionId?: string;
  question: string;
  selected_option?: string;
  chosenAnswer?: string;
  correct_option?: string;
  correctAnswer?: string;
  is_correct?: boolean;
  isCorrect?: boolean;
  explanation: string;
  topic?: string;
  page_citation?: number;
  pageCitation?: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle?: string;
  documentId: string;
  documentTitle?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  grade: string;
  feedback: string;
  timeSpentSeconds?: number;
  questionResults?: QuizQuestionResult[];
  createdAt: string;
}

export interface Flashcard {
  id: string;
  setId?: string;
  front: string;
  back: string;
  category?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  pageCitation?: number;
}

export interface FlashcardSet {
  id: string;
  documentId: string;
  documentTitle?: string;
  title: string;
  cardCount: number;
  cards: Flashcard[];
  createdAt?: string;
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
  deleteDocument: (id: string) => Promise<void>;
  getSummary: (documentId: string) => SummaryItem | undefined;
  getConversationByDocId: (documentId: string) => ConversationItem | undefined;
  sendMessage: (conversationId: string, message: string) => Promise<MessageItem>;
  deleteConversation: (convId: string) => Promise<void>;
  clearAllConversations: () => Promise<void>;
  generateQuizForDoc: (documentId: string) => Promise<QuizItem>;
  generateNewQuiz: (documentId: string) => Promise<QuizItem>;
  getQuizzesForDoc: (documentId: string) => Promise<QuizItem[]>;
  getQuizzesForDocument: (documentId: string) => Promise<QuizItem[]>;
  submitQuizAnswers: (
    quizId: string,
    answers: Record<string, string>,
    timeSpentSeconds?: number
  ) => Promise<QuizAttempt>;
  submitQuizAttempt: (
    quizId: string,
    answers: Record<string, string>,
    timeSpentSeconds?: number
  ) => Promise<QuizAttempt>;
  generateFlashcardsForDoc: (documentId: string) => Promise<FlashcardSet>;
  generateNewFlashcards: (documentId: string) => Promise<FlashcardSet>;
  getFlashcardsForDoc: (documentId: string) => Promise<FlashcardSet | undefined>;
  getFlashcardsForDocument: (documentId: string) => Promise<FlashcardSet | undefined>;
  updateUserProfile: (fullName: string, email?: string) => void;
  refreshData: () => Promise<void>;
  logout: () => void;
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
            questionResults: (a.question_results || []).map((q: any) => ({
              questionId: q.question_id || q.questionId,
              question: q.question,
              selected_option: q.selected_option || q.chosenAnswer,
              chosenAnswer: q.chosenAnswer || q.selected_option,
              correct_option: q.correct_option || q.correctAnswer,
              correctAnswer: q.correctAnswer || q.correct_option,
              is_correct: q.is_correct ?? q.isCorrect ?? false,
              isCorrect: q.isCorrect ?? q.is_correct ?? false,
              explanation: q.explanation || "Review document context.",
              topic: q.topic || "General",
              page_citation: q.page_citation || q.pageCitation || 1,
              pageCitation: q.pageCitation || q.page_citation || 1,
            })),
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
      setAllFlashcardSets((prev) => prev.filter((s) => s.documentId !== id));
      setQuizAttempts((prev) => prev.filter((a) => a.documentId !== id));
      setSummaries((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setQuizzes((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setFlashcardSets((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (e) {
      console.error("Delete error:", e);
      throw e;
    }
  };

  const deleteConversation = async (convId: string) => {
    try {
      await api.deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
    } catch (e) {
      console.error("Delete conversation error:", e);
    }
  };

  const clearAllConversations = async () => {
    try {
      await api.clearAllConversations();
      setConversations([]);
    } catch (e) {
      console.error("Clear conversations error:", e);
    }
  };

  const logout = () => {
    setUserProfile(defaultProfile);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_email");
        sessionStorage.clear();
      } catch (e) {}
      window.location.href = "/login";
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
          setConversations((prev) => [newConv, ...prev.filter((c) => c.id !== newConv.id)]);
        }
      }).catch((err) => console.error(err));
    }
    return conv;
  };

  const sendMessage = async (conversationId: string, message: string): Promise<MessageItem> => {
    try {
      const res = await api.sendMessage(conversationId, message);
      const userMsg: MessageItem = {
        id: "usr-" + Date.now(),
        conversationId,
        role: "user",
        message,
        createdAt: new Date().toISOString(),
      };
      const aiMsg: MessageItem = {
        id: res.id || "ai-" + Date.now(),
        conversationId,
        role: "assistant",
        message: res.message,
        createdAt: res.created_at || new Date().toISOString(),
        citations: res.citations || [],
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, userMsg, aiMsg] }
            : c
        )
      );

      return aiMsg;
    } catch (e) {
      console.error("Chat send error:", e);
      throw e;
    }
  };

  const generateQuizForDoc = async (documentId: string): Promise<QuizItem> => {
    try {
      const res = await api.generateQuiz(documentId);
      const newQuiz: QuizItem = {
        id: res.id || "quiz-" + Date.now(),
        documentId,
        documentTitle: res.document_title || "Academic Document",
        title: res.title || "Mastery Quiz",
        description: res.description,
        questionCount: res.question_count || (res.questions ? res.questions.length : 5),
        questions: (res.questions || []).map((q: any, idx: number) => ({
          id: q.id || `q${idx + 1}`,
          question: q.question,
          options: q.options || [],
          correct_answer: q.correct_answer || q.correctAnswer || "",
          correctAnswer: q.correctAnswer || q.correct_answer || "",
          explanation: q.explanation || "Review relevant document sections.",
          topic: q.topic || "Core Concept",
          page_citation: q.page_citation || q.pageCitation || 1,
          pageCitation: q.pageCitation || q.page_citation || 1,
        })),
        createdAt: res.created_at || new Date().toISOString(),
      };

      setQuizzes((prev) => ({
        ...prev,
        [documentId]: [newQuiz, ...(prev[documentId] || [])],
      }));

      return newQuiz;
    } catch (e) {
      console.error("Quiz generate error:", e);
      throw e;
    }
  };

  const getQuizzesForDoc = async (documentId: string): Promise<QuizItem[]> => {
    if (quizzes[documentId] && quizzes[documentId].length > 0) {
      return quizzes[documentId];
    }
    try {
      const res = await api.getQuizzesByDoc(documentId);
      if (Array.isArray(res)) {
        const mapped: QuizItem[] = res.map((r: any) => ({
          id: r.id,
          documentId,
          documentTitle: r.document_title,
          title: r.title,
          description: r.description,
          questionCount: r.question_count,
          questions: (r.questions || []).map((q: any) => ({
            id: q.id,
            question: q.question,
            options: q.options || [],
            correct_answer: q.correct_answer || q.correctAnswer || "",
            correctAnswer: q.correctAnswer || q.correct_answer || "",
            explanation: q.explanation,
            topic: q.topic,
            page_citation: q.page_citation || q.pageCitation || 1,
            pageCitation: q.pageCitation || q.page_citation || 1,
          })),
          createdAt: r.created_at,
        }));
        setQuizzes((prev) => ({ ...prev, [documentId]: mapped }));
        return mapped;
      }
    } catch (err) {
      console.warn("Fetch quizzes warning:", err);
    }
    return [];
  };

  const submitQuizAnswers = async (
    quizId: string,
    answers: Record<string, string>,
    timeSpentSeconds: number = 0
  ): Promise<QuizAttempt> => {
    try {
      const res = await api.submitQuiz(quizId, answers, timeSpentSeconds);
      const newAttempt: QuizAttempt = {
        id: res.id || "att-" + Date.now(),
        quizId,
        quizTitle: res.quiz_title || "Mastery Quiz",
        documentId: res.document_id,
        documentTitle: res.document_title || "Document",
        score: res.score,
        totalQuestions: res.total_questions,
        percentage: res.percentage,
        grade: res.grade,
        feedback: res.feedback,
        timeSpentSeconds: res.time_spent_seconds || timeSpentSeconds,
        questionResults: (res.question_results || []).map((q: any) => ({
          questionId: q.question_id || q.questionId,
          question: q.question,
          selected_option: q.selected_option || q.chosenAnswer,
          chosenAnswer: q.chosenAnswer || q.selected_option,
          correct_option: q.correct_option || q.correctAnswer,
          correctAnswer: q.correctAnswer || q.correct_option,
          is_correct: q.is_correct ?? q.isCorrect ?? false,
          isCorrect: q.isCorrect ?? q.is_correct ?? false,
          explanation: q.explanation || "Review document context.",
          topic: q.topic || "General",
          page_citation: q.page_citation || q.pageCitation || 1,
          pageCitation: q.pageCitation || q.page_citation || 1,
        })),
        createdAt: res.created_at || new Date().toISOString(),
      };

      setQuizAttempts((prev) => [newAttempt, ...prev]);
      return newAttempt;
    } catch (e) {
      console.error("Submit quiz error:", e);
      throw e;
    }
  };

  const generateFlashcardsForDoc = async (documentId: string): Promise<FlashcardSet> => {
    try {
      const res = await api.generateFlashcards(documentId);
      const newSet: FlashcardSet = {
        id: res.id || "fset-" + Date.now(),
        documentId,
        documentTitle: res.document_title || "Academic Document",
        title: res.title || "Study Deck",
        cardCount: res.card_count || (res.cards ? res.cards.length : 8),
        cards: (res.cards || []).map((c: any, idx: number) => ({
          id: c.id || `c${idx + 1}`,
          setId: res.id,
          front: c.front,
          back: c.back,
          category: c.category || "General",
          difficulty: c.difficulty || "Medium",
          pageCitation: c.page_citation || 1,
        })),
        createdAt: res.created_at || new Date().toISOString(),
      };

      setFlashcardSets((prev) => ({ ...prev, [documentId]: newSet }));
      setAllFlashcardSets((prev) => [newSet, ...prev.filter((s) => s.id !== newSet.id)]);
      return newSet;
    } catch (e) {
      console.error("Flashcards generate error:", e);
      throw e;
    }
  };

  const getFlashcardsForDoc = async (documentId: string): Promise<FlashcardSet | undefined> => {
    if (flashcardSets[documentId]) return flashcardSets[documentId];

    try {
      const res = await api.getFlashcardsByDoc(documentId);
      if (res && res.id) {
        const item: FlashcardSet = {
          id: res.id,
          documentId,
          documentTitle: res.document_title || "Academic Document",
          title: res.title,
          cardCount: res.card_count || (res.cards ? res.cards.length : 0),
          cards: (res.cards || []).map((c: any) => ({
            id: c.id,
            setId: res.id,
            front: c.front,
            back: c.back,
            category: c.category || "General",
            difficulty: c.difficulty || "Medium",
            pageCitation: c.page_citation || 1,
          })),
          createdAt: res.created_at,
        };
        setFlashcardSets((prev) => ({ ...prev, [documentId]: item }));
        return item;
      }
    } catch (err) {
      console.warn("Get flashcards warning:", err);
    }
    return undefined;
  };

  const updateUserProfile = (fullName: string, email?: string) => {
    setUserProfile((prev) => ({
      ...prev,
      fullName,
      email: email || prev.email,
    }));
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
        sendMessage,
        deleteConversation,
        clearAllConversations,
        generateQuizForDoc,
        generateNewQuiz: generateQuizForDoc,
        getQuizzesForDoc,
        getQuizzesForDocument: getQuizzesForDoc,
        submitQuizAnswers,
        submitQuizAttempt: submitQuizAnswers,
        generateFlashcardsForDoc,
        generateNewFlashcards: generateFlashcardsForDoc,
        getFlashcardsForDoc,
        getFlashcardsForDocument: getFlashcardsForDoc,
        updateUserProfile,
        refreshData,
        logout,
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
