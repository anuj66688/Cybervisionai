from typing import List, Dict, Any, Optional
from datetime import datetime
from app.core.firebase import get_db, MockFirestoreClient
import logging

logger = logging.getLogger("cybervision.repository")

def _get_safe_db():
    """Returns DB client, falling back to MockFirestoreClient on Firestore quota errors."""
    from app.core import firebase as _fb
    db = get_db()
    return db

class ThreatRepository:
    def __init__(self):
        self.collection_name = "threats"

    def _fallback_to_mock(self):
        """Switch the global db to MockFirestoreClient when Firestore quota is exceeded."""
        from app.core import firebase as _fb
        import app.core.firebase as _fbm
        if not isinstance(_fbm.db, MockFirestoreClient):
            logger.warning("Firestore quota exceeded — switching to in-memory MockFirestoreClient.")
            _fbm.db = MockFirestoreClient()
        return _fbm.db

    def get_all(self, limit: int = 100) -> List[Dict[str, Any]]:
        db = get_db()
        try:
            docs = db.collection(self.collection_name).limit(limit).stream()
            results = []
            for d in docs:
                data = d.to_dict()
                data["id"] = d.id
                results.append(data)
            return results
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "Quota" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                db = self._fallback_to_mock()
                docs = db.collection(self.collection_name).limit(limit).stream()
                results = []
                for d in docs:
                    data = d.to_dict()
                    data["id"] = d.id
                    results.append(data)
                return results
            raise

    def get_by_id(self, threat_id: str) -> Optional[Dict[str, Any]]:
        db = get_db()
        try:
            doc = db.collection(self.collection_name).document(threat_id).get()
            if doc.exists:
                data = doc.to_dict()
                data["id"] = doc.id
                return data
            return None
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "Quota" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                db = self._fallback_to_mock()
                doc = db.collection(self.collection_name).document(threat_id).get()
                if doc.exists:
                    data = doc.to_dict()
                    data["id"] = doc.id
                    return data
                return None
            raise

    def save(self, data: Dict[str, Any]) -> str:
        db = get_db()
        cve = data.get("cve", "CVE-TEMP")
        doc_id = cve.lower().replace("-", "")
        try:
            db.collection(self.collection_name).document(doc_id).set(data)
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "Quota" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                db = self._fallback_to_mock()
                db.collection(self.collection_name).document(doc_id).set(data)
            else:
                raise
        return doc_id

    def search(self, query: str) -> List[Dict[str, Any]]:
        all_threats = self.get_all(limit=100)
        query_lower = query.lower()
        results = []
        for t in all_threats:
            if (
                query_lower in t.get("cve", "").lower() or
                query_lower in t.get("vendor", "").lower() or
                query_lower in t.get("product", "").lower() or
                query_lower in t.get("summary", "").lower() or
                query_lower in t.get("threatType", "").lower()
            ):
                results.append(t)
        return results

    def toggle_bookmark(self, user_id: str, threat_id: str) -> bool:
        db = get_db()
        try:
            bookmark_ref = db.collection("bookmarks").document(f"{user_id}_{threat_id}")
            doc = bookmark_ref.get()
            if doc.exists:
                bookmark_ref.delete()
                return False
            else:
                bookmark_ref.set({
                    "userId": user_id,
                    "threatId": threat_id,
                    "timestamp": datetime.utcnow().isoformat()
                })
                return True
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "Quota" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                db = self._fallback_to_mock()
                bookmark_ref = db.collection("bookmarks").document(f"{user_id}_{threat_id}")
                doc = bookmark_ref.get()
                if doc.exists:
                    bookmark_ref.delete()
                    return False
                else:
                    bookmark_ref.set({
                        "userId": user_id,
                        "threatId": threat_id,
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    return True
            raise

threat_repo = ThreatRepository()
