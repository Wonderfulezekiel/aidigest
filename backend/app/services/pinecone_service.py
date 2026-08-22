from typing import List, Dict, Any
from ..config import settings

class PineconeService:
    def __init__(self):
        self.index_name = settings.PINECONE_INDEX_NAME
        self._local_vector_store: Dict[str, Dict[str, Any]] = {}

    async def upsert_vectors(self, vectors: List[Dict[str, Any]]):
        """
        Vectors format: [{'id': str, 'values': List[float], 'metadata': Dict[str, Any]}]
        """
        if settings.PINECONE_API_KEY and not settings.PINECONE_API_KEY.startswith("pcsk_fake"):
            try:
                from pinecone import Pinecone
                pc = Pinecone(api_key=settings.PINECONE_API_KEY)
                index = pc.Index(self.index_name)
                index.upsert(vectors=vectors)
                return
            except Exception as e:
                print(f"[PineconeService] Upsert error: {e}")

        # Local fallback store
        for vec in vectors:
            self._local_vector_store[vec["id"]] = vec

    async def query_similar_chunks(self, query_vector: List[float], document_id: str, top_k: int = 6) -> List[Dict[str, Any]]:
        """
        Retrieves top_k most semantically relevant chunks for a document.
        """
        if settings.PINECONE_API_KEY and not settings.PINECONE_API_KEY.startswith("pcsk_fake"):
            try:
                from pinecone import Pinecone
                pc = Pinecone(api_key=settings.PINECONE_API_KEY)
                index = pc.Index(self.index_name)
                res = index.query(
                    vector=query_vector,
                    top_k=top_k,
                    include_metadata=True,
                    filter={"document_id": document_id}
                )
                results = []
                for match in res.get("matches", []):
                    results.append({
                        "id": match["id"],
                        "score": match.get("score", 0.0),
                        "page_number": match.get("metadata", {}).get("page_number", 1),
                        "chunk_text": match.get("metadata", {}).get("chunk_text", ""),
                    })
                if results:
                    return results
            except Exception as e:
                print(f"[PineconeService] Query error: {e}")

        # Local fallback vector similarity search (cosine similarity)
        matched = []
        for vid, vdata in self._local_vector_store.items():
            if vdata.get("metadata", {}).get("document_id") == document_id:
                values = vdata["values"]
                score = sum(a * b for a, b in zip(query_vector, values))
                matched.append({
                    "id": vid,
                    "score": score,
                    "page_number": vdata["metadata"].get("page_number", 1),
                    "chunk_text": vdata["metadata"].get("chunk_text", ""),
                })

        matched.sort(key=lambda x: x["score"], reverse=True)
        return matched[:top_k]

    async def delete_document_vectors(self, document_id: str):
        """
        Deletes all vector embeddings associated with a document.
        """
        if settings.PINECONE_API_KEY and not settings.PINECONE_API_KEY.startswith("pcsk_fake"):
            try:
                from pinecone import Pinecone
                pc = Pinecone(api_key=settings.PINECONE_API_KEY)
                index = pc.Index(self.index_name)
                index.delete(filter={"document_id": document_id})
            except Exception as e:
                print(f"[PineconeService] Delete vector notice: {e}")

        # Clean local store
        keys_to_del = [k for k, v in self._local_vector_store.items() if v.get("metadata", {}).get("document_id") == document_id]
        for k in keys_to_del:
            self._local_vector_store.pop(k, None)

pinecone_service = PineconeService()
