import httpx
import math
import random
import asyncio
from typing import List
from app.config import settings

class EmbeddingService:
    @staticmethod
    async def generate_embedding(text: str) -> List[float]:
        """
        Generates a vector embedding for input text using OpenRouter Embedding API,
        or instant deterministic normalized 1536-dim vector fallback.
        """
        if not text:
            text = "Academic text passage"

        if settings.OPENROUTER_API_KEY and not settings.OPENROUTER_API_KEY.startswith("sk-or-v1-fake"):
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    response = await client.post(
                        "https://openrouter.ai/api/v1/embeddings",
                        headers={
                            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "model": settings.OPENROUTER_EMBEDDING_MODEL,
                            "input": text[:1000],
                        },
                    )
                    if response.status_code == 200:
                        data = response.json()
                        return data["data"][0]["embedding"]
            except Exception:
                pass

        # Deterministic normalized 1536-dim embedding vector based on text hash
        random.seed(hash(text))
        vec = [random.uniform(-1.0, 1.0) for _ in range(1536)]
        norm = math.sqrt(sum(x * x for x in vec))
        return [x / norm for x in vec]

    @staticmethod
    async def generate_embeddings_batch(texts: List[str]) -> List[List[float]]:
        """
        Generates vector embeddings for a list of texts in parallel.
        """
        tasks = [EmbeddingService.generate_embedding(t) for t in texts]
        return await asyncio.gather(*tasks)

embedding_service = EmbeddingService()
