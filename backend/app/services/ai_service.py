import httpx
import json
import re
from typing import Dict, Any, List
from app.config import settings

def extract_json_from_llm(text: str) -> Dict[str, Any]:
    """Extracts JSON dict from markdown codeblocks or raw text."""
    try:
        return json.loads(text)
    except Exception:
        pass
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            pass
    return {}

class AIService:
    @staticmethod
    async def generate_summary(doc_title: str, full_text: str) -> Dict[str, Any]:
        """
        Generates short and detailed summaries, key topics, concepts, definitions, and conclusions
        using OpenRouter AI Models.
        """
        truncated_text = full_text[:6000]

        system_prompt = (
            "You are an expert academic AI assistant. Analyze the provided document text and produce a JSON response with:\n"
            "1. 'short_summary': A 100-300 word executive overview of what this document covers.\n"
            "2. 'detailed_summary': A 500-1000 word in-depth academic breakdown.\n"
            "3. 'key_topics': Array of 4-6 strings.\n"
            "4. 'important_concepts': Array of objects with 'term' and 'explanation'.\n"
            "5. 'definitions': Array of objects with 'term' and 'definition'.\n"
            "6. 'main_ideas': Array of 3-5 strings.\n"
            "7. 'conclusion': A concluding synthesis string.\n\n"
            "Return valid JSON only."
        )

        user_prompt = f"Document Title: {doc_title}\n\nDocument Text Excerpt:\n{truncated_text}"

        if settings.OPENROUTER_API_KEY and not settings.OPENROUTER_API_KEY.startswith("sk-or-v1-fake"):
            try:
                async with httpx.AsyncClient(timeout=45.0) as client:
                    res = await client.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "model": settings.OPENROUTER_MODEL,
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_prompt},
                            ],
                        },
                    )
                    if res.status_code == 200:
                        content = res.json()["choices"][0]["message"]["content"]
                        parsed = extract_json_from_llm(content)
                        if parsed and "short_summary" in parsed:
                            return parsed
                    else:
                        print(f"[AIService] OpenRouter summary API status: {res.status_code}, response: {res.text}")
            except Exception as e:
                print(f"[AIService] OpenRouter summary exception: {e}")

        # Document-specific text summary fallback if OpenRouter is unreachable
        sentences = [s.strip() for s in full_text.split(".") if len(s.strip()) > 15]
        excerpt_summary = ". ".join(sentences[:5]) + "." if sentences else f"This document presents course material and requirements for {doc_title}."

        return {
            "short_summary": f"This handout on '{doc_title}' covers: {excerpt_summary}",
            "detailed_summary": f"Comprehensive Review of '{doc_title}':\n\n{full_text[:1200]}\n\nKey Takeaway: The document establishes foundational course principles and practical requirements.",
            "key_topics": [
                f"{doc_title} Overview",
                "Requirements & Objectives",
                "Core Methodology",
                "Academic Deliverables",
            ],
            "important_concepts": [
                {
                    "term": "Primary Objective",
                    "explanation": f"Understanding the core principles outlined in {doc_title}.",
                },
                {
                    "term": "Implementation Strategy",
                    "explanation": "Applying course requirements to design and evaluate solutions.",
                },
            ],
            "definitions": [
                {
                    "term": "Requirements Analysis",
                    "definition": "The process of identifying, documenting, and verifying project needs.",
                },
            ],
            "main_ideas": [
                f"Establishing core requirements for {doc_title}.",
                "Structuring academic deliverables and evaluation criteria.",
            ],
            "conclusion": f"The handout '{doc_title}' establishes clear requirements and study guidelines.",
        }

    @staticmethod
    async def generate_rag_answer(user_query: str, doc_title: str, retrieved_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generates a context-aware answer based on retrieved document passages.
        """
        context_passages = []
        citations = []
        for idx, chunk in enumerate(retrieved_chunks):
            page_num = chunk.get("page_number", 1)
            text = chunk.get("chunk_text", "")
            if text:
                context_passages.append(f"[Source Page {page_num}]: {text}")
                citations.append({
                    "page": page_num,
                    "snippet": text[:180] + "..." if len(text) > 180 else text,
                })

        context_str = "\n\n".join(context_passages)

        system_prompt = (
            f"You are PDF AIDigest, an academic AI assistant. Answer the student's question based strictly on the retrieved document context below.\n"
            f"Document Title: {doc_title}\n\n"
            f"Retrieved Document Passages:\n{context_str}\n\n"
            f"Formatting Instructions:\n"
            f"1. Use clean, beautifully structured markdown formatting.\n"
            f"2. Use subheadings (### Section Name), bullet points (- item), and bold text for key concepts.\n"
            f"3. If presenting section breakdowns, comparisons, or structured summaries, use Markdown tables (| Header | Header |) with clear column alignment.\n"
            f"4. Keep paragraphs short, clear, and well-spaced for easy reading."
        )

        if settings.OPENROUTER_API_KEY and not settings.OPENROUTER_API_KEY.startswith("sk-or-v1-fake"):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    res = await client.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "model": settings.OPENROUTER_MODEL,
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_query},
                            ],
                        },
                    )
                    if res.status_code == 200:
                        answer = res.json()["choices"][0]["message"]["content"]
                        return {"message": answer, "citations": citations}
                    else:
                        print(f"[AIService] OpenRouter RAG Chat status: {res.status_code}, response: {res.text}")
            except Exception as e:
                print(f"[AIService] OpenRouter RAG Chat exception: {e}")

        # Real passage text fallback answer
        if context_passages:
            passage_excerpt = "\n\n".join([c.get("chunk_text", "") for c in retrieved_chunks if c.get("chunk_text")][:2])
            fallback_answer = f"Based on **{doc_title}**:\n\nRegarding **\"{user_query}\"**, the document states:\n\n> \"{passage_excerpt[:400]}\""
        else:
            fallback_answer = f"Regarding **\"{user_query}\"** in **{doc_title}**, please review the uploaded handout section for specific details."

        return {"message": fallback_answer, "citations": citations}

ai_service = AIService()
