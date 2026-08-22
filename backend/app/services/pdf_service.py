import io
import re
from typing import List, Dict, Any

def clean_text(text: str) -> str:
    """Removes NULL bytes, control characters, and unsupported unicode for PostgreSQL text storage."""
    if not text:
        return ""
    text = text.replace("\x00", "").replace("\u0000", "")
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
    return text.strip()

def extract_with_pypdf(file_bytes: bytes, chunk_words: int = 220, overlap_words: int = 40, max_total_chunks: int = 300) -> Dict[str, Any]:
    """Uses pure-python pypdf to decompress and extract page text with overlapping semantic windows."""
    import pypdf
    reader = pypdf.PdfReader(io.BytesIO(file_bytes))
    page_count = len(reader.pages)
    chunks: List[Dict[str, Any]] = []
    full_text_list: List[str] = []
    chunk_index = 0
    step = max(chunk_words - overlap_words, 50)

    for page_num in range(page_count):
        if chunk_index >= max_total_chunks:
            break
        try:
            page = reader.pages[page_num]
            raw_page_text = page.extract_text() or ""
            text = clean_text(raw_page_text)
            if not text or len(text) < 10:
                continue

            full_text_list.append(f"--- Page {page_num + 1} ---\n{text}")
            words = text.split()

            for i in range(0, len(words), step):
                if chunk_index >= max_total_chunks:
                    break
                chunk_words_slice = words[i : i + chunk_words]
                chunk_str = clean_text(" ".join(chunk_words_slice))
                if len(chunk_str) < 15:
                    continue

                chunks.append({
                    "chunk_index": chunk_index,
                    "page_number": page_num + 1,
                    "chunk_text": chunk_str,
                })
                chunk_index += 1
        except Exception as page_err:
            print(f"[PDFService] pypdf page {page_num+1} warning: {page_err}")

    full_text = clean_text("\n\n".join(full_text_list))
    return {
        "page_count": max(page_count, 1),
        "full_text": full_text if full_text else "Academic Document Content",
        "chunks": chunks if chunks else [{
            "chunk_index": 0,
            "page_number": 1,
            "chunk_text": full_text[:1000] if full_text else "Academic Handout Content Passage",
        }],
    }

class PDFService:
    @staticmethod
    def extract_text_and_chunks(file_bytes: bytes, chunk_words: int = 220, overlap_words: int = 40, max_total_chunks: int = 300) -> Dict[str, Any]:
        """
        Extracts academic text from PDF bytes using overlapping semantic chunks for superior RAG context coverage.
        """
        # 1. Try pypdf
        try:
            res = extract_with_pypdf(file_bytes, chunk_words, overlap_words, max_total_chunks)
            if res["chunks"] and len(res["full_text"]) > 10:
                return res
        except Exception as e:
            print(f"[PDFService] pypdf extraction notice: {e}")

        # 2. Try fitz (PyMuPDF)
        try:
            import fitz
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            page_count = len(doc)
            chunks: List[Dict[str, Any]] = []
            full_text_list: List[str] = []
            chunk_index = 0
            step = max(chunk_words - overlap_words, 50)

            for page_num in range(page_count):
                if chunk_index >= max_total_chunks:
                    break
                try:
                    page = doc[page_num]
                    text = clean_text(page.get_text("text"))
                    if not text:
                        continue
                    full_text_list.append(text)
                    words = text.split()
                    for i in range(0, len(words), step):
                        if chunk_index >= max_total_chunks:
                            break
                        chunk_words_slice = words[i : i + chunk_words]
                        chunk_str = clean_text(" ".join(chunk_words_slice))
                        if chunk_str:
                            chunks.append({
                                "chunk_index": chunk_index,
                                "page_number": page_num + 1,
                                "chunk_text": chunk_str,
                            })
                            chunk_index += 1
                except Exception as p_err:
                    print(f"[PDFService] fitz page {page_num+1} warning: {p_err}")
            doc.close()
            full_text = clean_text("\n\n".join(full_text_list))
            if chunks:
                return {
                    "page_count": max(page_count, 1),
                    "full_text": full_text,
                    "chunks": chunks,
                }
        except Exception as e:
            print(f"[PDFService] fitz extraction notice: {e}")

        # 3. Fallback text extractor
        try:
            text_content = clean_text(file_bytes.decode("utf-8", errors="ignore"))
            words = [w for w in text_content.split() if len(w) > 1 and not w.startswith("obj") and not w.startswith("stream")]
            full_text = clean_text(" ".join(words[:3000]))
        except Exception:
            full_text = "Academic Handout Material"

        return {
            "page_count": 1,
            "full_text": full_text if full_text else "Academic Document Content",
            "chunks": [{
                "chunk_index": 0,
                "page_number": 1,
                "chunk_text": full_text[:1000] if full_text else "Academic Handout Material",
            }],
        }

pdf_service = PDFService()
