const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth API
  register: (fullName: string, email: string, pass: string) =>
    fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name: fullName, email, password: pass }),
    }),
  login: (email: string, pass: string) =>
    fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: pass }),
    }),
  forgotPassword: (email: string) =>
    fetchApi("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, newPass: string) =>
    fetchApi("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password: newPass }),
    }),

  // Documents API
  getDocuments: () => fetchApi("/documents"),
  getDocument: (id: string) => fetchApi(`/documents/${id}`),
  deleteDocument: (id: string) => fetchApi(`/documents/${id}`, { method: "DELETE" }),
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "PDF Upload failed");
    }
    return res.json();
  },

  // Summary API
  getSummary: (docId: string) => fetchApi(`/summary/${docId}`),

  // Chat API
  getConversations: () => fetchApi("/chat/history"),
  getConversationByDocId: (docId: string) => fetchApi(`/chat/document/${docId}`),
  sendMessage: (conversationId: string, message: string) =>
    fetchApi("/chat/send", {
      method: "POST",
      body: JSON.stringify({ conversation_id: conversationId, message }),
    }),
  deleteConversation: (convId: string) => fetchApi(`/chat/${convId}`, { method: "DELETE" }),
  clearAllConversations: () => fetchApi("/chat/clear/all", { method: "DELETE" }),

  // Quiz API
  generateQuiz: (docId: string) =>
    fetchApi(`/quiz/generate/${docId}`, { method: "POST" }),
  getQuizzesByDoc: (docId: string) => fetchApi(`/quiz/document/${docId}`),
  getQuiz: (quizId: string) => fetchApi(`/quiz/${quizId}`),
  submitQuiz: (quizId: string, answers: Record<string, string>, timeSpentSeconds: number = 0) =>
    fetchApi(`/quiz/${quizId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers, time_spent_seconds: timeSpentSeconds }),
    }),
  getQuizAttempts: () => fetchApi("/quiz/attempts/user"),
  deleteQuiz: (quizId: string) => fetchApi(`/quiz/${quizId}`, { method: "DELETE" }),

  // Flashcards API
  generateFlashcards: (docId: string) =>
    fetchApi(`/flashcards/generate/${docId}`, { method: "POST" }),
  getFlashcardsByDoc: (docId: string) => fetchApi(`/flashcards/document/${docId}`),
  getAllFlashcardSets: () => fetchApi("/flashcards/all"),
  deleteFlashcards: (setId: string) => fetchApi(`/flashcards/${setId}`, { method: "DELETE" }),

  // User Profile & Settings API
  getProfile: () => fetchApi("/user/profile"),
  updateProfile: (fullName: string, email?: string) =>
    fetchApi("/user/profile", {
      method: "PUT",
      body: JSON.stringify({ full_name: fullName, email }),
    }),
  changePassword: (currentPass: string, newPass: string) =>
    fetchApi("/user/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password: currentPass, new_password: newPass }),
    }),
  getSettings: () => fetchApi("/user/settings"),
  updateSettings: (theme: string) =>
    fetchApi("/user/settings", {
      method: "PUT",
      body: JSON.stringify({ theme }),
    }),
};
