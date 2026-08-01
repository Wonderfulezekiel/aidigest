# PROJECT DOCUMENTATION

# PDF AIDigest
## An Intelligent Document Summarization and Conversational Academic Assistant for Students

---

## 1. Project Overview

### Introduction
PDF AIDigest is an AI-powered academic assistant designed to help students understand lengthy academic documents more efficiently. Instead of reading an entire textbook, lecture note, or research paper, students can upload a PDF, receive an AI-generated summary, and ask questions about the document in natural language.

The system uses Retrieval-Augmented Generation (RAG), where document content is converted into vector embeddings and stored in Pinecone. When a student asks a question, the system retrieves the most relevant sections before generating an answer with an OpenRouter AI model.

---

## 2. Objectives

The project aims to:
* Reduce the time students spend reading lengthy PDFs.
* Generate concise AI-powered summaries.
* Allow conversational interaction with uploaded documents.
* Improve learning and academic productivity.
* Demonstrate the application of Artificial Intelligence in education.

---

## 3. Target Users

* University Students
* College Students
* Researchers
* Lecturers
* Anyone studying from PDF documents

---

## 4. Architecture & Stack Overview

* **Frontend:** Next.js + React + Tailwind CSS + Shadcn UI + Tweakcn UI + TypeScript
* **Backend:** FastAPI (Python)
* **Authentication:** Supabase Auth
* **Database:** Supabase PostgreSQL
* **File Storage:** Supabase Storage
* **AI Model:** OpenRouter API (Free Models)
* **Vector Database:** Pinecone
* **PDF Processing:** PyMuPDF (`fitz`), LangChain Text Splitter (or custom chunking implementation)
* **Deployment:** Vercel (Frontend) + Render (Backend)

---

## 5. Core Features

### Authentication
* User Registration
* Login
* Logout
* Forgot Password
* Reset Password

### Dashboard
Shows:
* Welcome message
* Total uploaded PDFs
* Recent documents
* Quick upload button
* Recent AI conversations

### PDF Upload
Users can upload:
* Lecture Notes
* Textbooks
* Research Papers
* Assignments

System automatically:
* Stores PDF in Supabase Storage
* Extracts text using PyMuPDF
* Splits text into chunks
* Creates embeddings
* Stores vectors in Pinecone
* Saves metadata in Supabase

### AI Summary
Generate:
* **Short Summary:** 100–300 words
* **Detailed Summary:** 500–1000 words

Also generates:
* Key Topics
* Important Concepts
* Definitions
* Main Ideas
* Conclusion

### AI Chat
Students can ask:
* Explain Chapter 3
* What is Artificial Intelligence?
* Summarize this section
* Give examples
* Explain like I'm a beginner

### Conversation History
* Save conversations
* Continue previous chats
* Delete chats

### Document Library
Each document shows:
* Title
* Upload Date
* File Size
* Number of Conversations
* Delete

### Search
Search documents by:
* Title
* Upload Date

### User Profile
* Change Name
* Change Password
* View Email

### Settings
* Theme (Dark/Light)
* Delete All Chat History
* Delete Account

---

## 6. Page Navigation & Sitemap

### Public Pages
* Landing Page (`/`)
* Login (`/login`)
* Register (`/register`)
* Forgot Password (`/forgot-password`)
* Reset Password (`/reset-password`)
* 404 Page

### Protected Pages
* Dashboard (`/dashboard`)
* Upload PDF (`/upload`)
* My Documents (`/documents`)
* Document Details (`/documents/[id]`)
* AI Summary (`/documents/[id]/summary`)
* Chat with PDF (`/documents/[id]/chat`)
* Chat History (`/chat/history`)
* Profile (`/profile`)
* Settings (`/settings`)

---

## 7. Landing Page Structure

* **Hero Section:** Large heading ("Understand Academic PDFs in Minutes with AI"), CTA buttons ("Get Started", "Login"), and illustration of student chatting with AI beside a PDF.
* **Features Section:** Interactive cards showcasing the workflow (Upload PDFs → AI Reads Document → Generate Summary → Ask Questions).
* **Why Choose PDF AIDigest:** Highlights benefits (Saves Study Time, Understand Complex Topics, AI-Powered Learning, Fast & Accurate, Premium UI).
* **How It Works:** 4-step visually clear progression flow.
* **Screenshots Section:** High-fidelity previews of Dashboard, Upload, Summary, and Chat views.
* **FAQ:** Interactive accordion tackling common questions (multiple PDFs, scope of AI answers, supported file sizes).
* **Footer:** Quick links (About, Contact, Privacy Policy, GitHub).

---

## 8. Dashboard Layout

* **Metrics Cards:** Total Documents, Total Chats, Total Summaries.
* **Recent Uploads:** Quick access grid/table of recently processed documents.
* **Quick Upload Area:** Drag-and-drop file upload zone.
* **Continue Last Chat:** One-click resume for the user's active learning session.

---

## 9. Data Processing Pipeline (Upload Flow)

```text
Upload PDF ──> Store in Supabase Storage ──> Extract Text (PyMuPDF)
                                                     │
                                                     ▼
Pinecone Index <── Store Vector Embeddings <── Chunk Text & Embed
      │
      ▼
Generate Summary & Save Metadata to Supabase ──> Ready for AI Chat
```

---

## 10. RAG Query Architecture (Chat Flow)

```text
User Question ──> Embed Question ──> Query Pinecone Index
                                           │
                                           ▼
Save Conversation <── AI Response <── OpenRouter (Context + Question)
```

---

## 11. Database Schema (Supabase PostgreSQL)

### `profiles`
| Field | Type | Description |
|---|---|---|
| `id` | `UUID` | References Supabase Auth user ID |
| `full_name` | `TEXT` | User's full name |
| `avatar_url` | `TEXT` | User profile image URL |
| `created_at` | `TIMESTAMPTZ` | Record creation timestamp |

### `documents`
| Field | Type | Description |
|---|---|---|
| `id` | `UUID` | Document primary key |
| `user_id` | `UUID` | Owner ID |
| `title` | `TEXT` | Document title |
| `file_name` | `TEXT` | Original filename |
| `storage_path` | `TEXT` | Path in Supabase Storage |
| `file_size` | `INT` | File size in bytes |
| `page_count` | `INT` | Number of pages |
| `upload_date` | `TIMESTAMPTZ` | Timestamp of upload |
| `status` | `TEXT` | Processing status (e.g. `processing`, `ready`, `failed`) |

### `document_chunks`
| Field | Type | Description |
|---|---|---|
| `id` | `UUID` | Chunk primary key |
| `document_id` | `UUID` | Document reference |
| `chunk_index` | `INT` | Sequential order index |
| `chunk_text` | `TEXT` | Extracted text chunk |
| `pinecone_vector_id` | `TEXT` | Vector ID in Pinecone |

### `summaries`
| Field | Type | Description |
|---|---|---|
| `id` | `UUID` | Summary ID |
| `document_id` | `UUID` | Document reference |
| `short_summary` | `TEXT` | 100-300 word summary |
| `detailed_summary` | `TEXT` | 500-1000 word summary |
| `key_topics` | `JSONB` | Array of topics, concepts, definitions, main ideas |
| `created_at` | `TIMESTAMPTZ` | Creation timestamp |

### `conversations`
| Field | Type | Description |
|---|---|---|
| `id` | `UUID` | Conversation session ID |
| `document_id` | `UUID` | Associated document ID |
| `user_id` | `UUID` | User ID |
| `title` | `TEXT` | Conversation title |
| `created_at` | `TIMESTAMPTZ` | Session start time |

### `messages`
| Field | Type | Description |
|---|---|---|
| `id` | `UUID` | Message ID |
| `conversation_id` | `UUID` | Parent conversation |
| `role` | `TEXT` | Sender role (`user` or `assistant`) |
| `message` | `TEXT` | Message content |
| `created_at` | `TIMESTAMPTZ` | Message timestamp |

### `settings`
| Field | Type | Description |
|---|---|---|
| `id` | `UUID` | Settings record ID |
| `user_id` | `UUID` | User ID |
| `theme` | `TEXT` | Active theme (`light` or `dark`) |
| `created_at` | `TIMESTAMPTZ` | Timestamp |

---

## 12. API Module Structure

* **Authentication:** Register, Login, Logout, Reset Password
* **Documents:** Upload PDF, List Documents, Delete Document, Get Document
* **AI Engine:** Generate Summary, Chat with PDF, Generate Embeddings
* **Chat:** Create Conversation, Get Conversation, Delete Conversation
* **User:** Profile Management, Settings Preferences

---

## 13. Workspace Directory Structure

```text
frontend/
│
├── app/                  # Next.js App Router routes & page components
├── components/           # Reusable UI components (Shadcn/Tweakcn)
├── features/             # Feature-based components & state logic
│   ├── auth/             # Login, register, auth providers
│   ├── dashboard/        # Dashboard layout & analytics components
│   ├── documents/        # PDF viewer, document grid, document details
│   ├── upload/           # Drag & drop upload pipeline UI
│   ├── summary/          # AI summary view (short & detailed)
│   ├── chat/             # Chat interface & real-time streaming
│   ├── profile/          # User profile management
│   └── settings/         # App settings & preferences
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions & API clients
├── services/             # Supabase & backend service callers
├── types/                # TypeScript interfaces & types
└── utils/                # General helpers

backend/
│
├── app/
│   ├── api/              # FastAPI routers (auth, docs, chat, summary)
│   ├── auth/             # Supabase token validation middleware
│   ├── database/         # Supabase connection & DB access helpers
│   ├── services/         # Core business logic services
│   │   ├── pdf/          # PyMuPDF text extraction engine
│   │   ├── ai/           # OpenRouter API client integration
│   │   ├── embeddings/   # Text chunk embedding generator
│   │   ├── pinecone/     # Pinecone vector store manager
│   │   └── summarizer/   # Multi-tier document summarizer
│   ├── models/           # SQLAlchemy / Pydantic data models
│   ├── schemas/          # API request/response schemas
│   ├── utils/            # Shared utilities & loggers
│   └── main.py           # FastAPI entrypoint application
```

---

## 14. Functional Requirements

* **Authentication & Security:** Users can securely register, log in, manage sessions, and reset passwords via Supabase Auth.
* **Document Ingestion:** Users can upload PDF files; system stores raw files in Supabase Storage and extracts plain text.
* **Vector Indexing:** Document text is chunked and stored as embeddings in Pinecone for semantic retrieval.
* **AI Summarization:** System automatically generates both short (100–300 words) and detailed (500–1000 words) summaries with key concepts.
* **Conversational AI (RAG):** Users can chat directly with individual documents, obtaining contextual answers powered by OpenRouter models and Pinecone context retrieval.
* **Chat Management:** Full conversation history persistence with capability to start, resume, or delete chat threads.
* **Document Management:** Document library search, filtering, and deletion.
* **User Profile & Settings:** Customization of user details and UI theme preferences.

---

## 15. Non-Functional Requirements

* **Responsiveness:** Modern, fluid responsive UI built for desktop, tablet, and mobile displays.
* **Performance:** Fast sub-second vector retrieval using Pinecone vector database.
* **Reliability & Scalability:** Asynchronous background task execution in FastAPI for heavy PDF processing.
* **Aesthetics:** High-end visual design with Shadcn UI, Tweakcn UI, subtle animations, and sleek dark mode support.

---

## 16. Future Scope & Roadmap

* Multi-PDF combined knowledge bases.
* OCR support for scanned/rasterized academic PDFs.
* Voice-driven document query system.
* Precise page-level citation highlights inside the interactive PDF viewer.
* Multi-language translation & document query.
* Collaborative study groups & document sharing.
* Auto-generated study flashcards & revision quizzes.
