from typing import List, Dict, Any, Optional
from app.core.firebase import get_db

class ThreatRepository:
    def __init__(self):
        self.collection_name = "threats"

    def get_all(self, limit: int = 100) -> List[Dict[str, Any]]:
        db = get_db()
        docs = db.collection(self.collection_name).limit(limit).stream()
        results = []
        for d in docs:
            data = d.to_dict()
            data["id"] = d.id
            results.append(data)
        return results

    def get_by_id(self, threat_id: str) -> Optional[Dict[str, Any]]:
        db = get_db()
        doc = db.collection(self.collection_name).document(threat_id).get()
        if doc.exists:
            data = doc.to_dict()
            data["id"] = doc.id
            return data
        return None

    def save(self, data: Dict[str, Any]) -> str:
        db = get_db()
        # Find document matching CVE or create new ID
        cve = data.get("cve", "CVE-TEMP")
        doc_id = cve.lower().replace("-", "")
        
        # Save to threats
        db.collection(self.collection_name).document(doc_id).set(data)
        return doc_id

    def search(self, query: str) -> List[Dict[str, Any]]:
        db = get_db()
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
        bookmark_ref = db.collection("bookmarks").document(f"{user_id}_{threat_id}")
        doc = bookmark_ref.get()
        
        if doc.exists:
            bookmark_ref.delete()
            return False # Removed bookmark
        else:
            bookmark_ref.set({
                "userId": user_id,
                "threatId": threat_id,
                "timestamp": datetime.utcnow().isoformat() # wait, import datetime
            })
            return True # Bookmarked

from datetime import datetime # Import helper
threat_repo = ThreatRepository()
