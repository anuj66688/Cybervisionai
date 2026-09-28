import firebase_admin
from firebase_admin import credentials, firestore
import os
from pathlib import Path
import logging
from app.core.config import settings

logger = logging.getLogger("cybervision.firebase")

# In-memory mock DB client fallback for local sandbox environments
class MockFirestoreCollection:
    def __init__(self, name):
        self.name = name
        self._store = {}

    def document(self, doc_id=None):
        if not doc_id:
            import uuid
            doc_id = str(uuid.uuid4())
        return MockFirestoreDocument(self, doc_id)

    def stream(self):
        return [MockFirestoreDocumentSnapshot(k, v) for k, v in self._store.items()]

    def limit(self, count):
        return self

    def order_by(self, field, direction=None):
        return self

    def where(self, field_path, op_string, value):
        return self

class MockFirestoreDocument:
    def __init__(self, collection, doc_id):
        self.collection = collection
        self.id = doc_id

    def get(self):
        data = self.collection._store.get(self.id)
        return MockFirestoreDocumentSnapshot(self.id, data)

    def set(self, data, merge=False):
        if merge and self.id in self.collection._store:
            self.collection._store[self.id].update(data)
        else:
            self.collection._store[self.id] = data
        return self

    def update(self, data):
        if self.id in self.collection._store:
            self.collection._store[self.id].update(data)
        else:
            self.collection._store[self.id] = data
        return self

    def delete(self):
        if self.id in self.collection._store:
            del self.collection._store[self.id]
        return self

class MockFirestoreDocumentSnapshot:
    def __init__(self, doc_id, data):
        self.id = doc_id
        self._data = data
        self.exists = data is not None

    def to_dict(self):
        return self._data or {}

class MockFirestoreClient:
    def __init__(self):
        self._collections = {}
        logger.warning("Mock Firestore Client active. Data is transient in-memory.")

    def collection(self, name):
        if name not in self._collections:
            self._collections[name] = MockFirestoreCollection(name)
        return self._collections[name]

# Global DB reference
db = None

def initialize_firebase():
    global db
    try:
        # Avoid duplicate initializations
        if firebase_admin._apps:
            db = firestore.client()
            return db

        cred_path = settings.FIREBASE_CREDENTIALS_PATH
        # Normalize path using pathlib to handle forward-slash paths on Windows
        if cred_path:
            cred_path = str(Path(cred_path).resolve())
        if cred_path and Path(cred_path).exists():
            logger.info(f"Loading Firebase credentials from Certificate: {cred_path}")
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
        else:
            logger.warning("FIREBASE_CREDENTIALS_PATH not configured or not found. Falling back to Mock DB.")
            db = MockFirestoreClient()
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin SDK: {e}. Activating Mock DB.")
        db = MockFirestoreClient()
    return db

def get_db():
    global db
    if db is None:
        initialize_firebase()
    return db
