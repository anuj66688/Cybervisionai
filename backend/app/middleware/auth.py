from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
import logging
from app.core.firebase import get_db, MockFirestoreClient

logger = logging.getLogger("cybervision.auth")

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    db = get_db()

    # Mock authentication bypass for local sandboxes
    if isinstance(db, MockFirestoreClient):
        logger.debug("Bypassing Firebase Auth verification in Mock DB mode.")
        if token.startswith("cv_active_session_token_"):
            return {
                "uid": "mock-analyst-uuid",
                "email": "analyst.lead@cybervision.ai",
                "name": "SecOps Analyst - Tier 3",
                "role": "Analyst"
            }
        # In mock mode, permit any token for testing, returning a mock profile
        return {
            "uid": "mock-test-uuid",
            "email": "test-analyst@cybervision.ai",
            "name": "Test Analyst",
            "role": "Analyst"
        }

    try:
        # Verify Firebase ID token securely using Admin SDK
        decoded_token = auth.verify_id_token(token)
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name", "Unknown Analyst"),
            "role": decoded_token.get("role", "Analyst")
        }
    except Exception as e:
        logger.error(f"JWT verification token failure: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Analyst credentials token is invalid or has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
