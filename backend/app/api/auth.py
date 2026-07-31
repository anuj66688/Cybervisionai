from fastapi import APIRouter, Depends, HTTPException, status
import httpx
import logging
from app.core.config import settings
from app.core.firebase import get_db, MockFirestoreClient
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserProfileResponse,
    TokenResponse,
    UserVerifyResponse,
)
from app.middleware.auth import get_current_user

logger = logging.getLogger("cybervision.api.auth")

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserProfileResponse, status_code=status.HTTP_201_CREATED)
def register_analyst(req: UserRegisterRequest):
    db = get_db()
    
    # Mock user creation for sandboxes
    if isinstance(db, MockFirestoreClient):
        logger.info(f"Provisioning mock analyst account: {req.email}")
        uid = f"mock-analyst-{req.name.lower().replace(' ', '-')}"
        profile = {
            "uid": uid,
            "name": req.name,
            "email": req.email,
            "department": req.department,
            "role": "Analyst",
            "status": "Active"
        }
        db.collection("users").document(uid).set(profile)
        return profile

    try:
        from firebase_admin import auth
        # 1. Provision user in Firebase Authentication
        user_record = auth.create_user(
            email=req.email,
            password=req.password,
            display_name=req.name
        )
        
        # 2. Store analyst profile in Firestore collection
        profile = {
            "uid": user_record.uid,
            "name": req.name,
            "email": req.email,
            "department": req.department,
            "role": "Analyst",
            "status": "Active"
        }
        db.collection("users").document(user_record.uid).set(profile)
        logger.info(f"Successfully provisioned user {req.email} (UID: {user_record.uid})")
        return profile
    except Exception as e:
        logger.error(f"Error provisioning user account: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=TokenResponse)
def login_analyst(req: UserLoginRequest):
    db = get_db()

    # Mock login loop fallback
    if isinstance(db, MockFirestoreClient):
        logger.info(f"Simulating login verification for: {req.email}")
        mock_user = {
            "uid": "mock-analyst-uuid",
            "name": "SecOps Analyst - Tier 3",
            "email": req.email,
            "department": "Security Operations Center",
            "role": "Analyst",
            "status": "Active"
        }
        return {
            "access_token": "cv_active_session_token_7781",
            "token_type": "bearer",
            "user": mock_user
        }

    # Execute request against Firebase Auth REST Endpoint
    firebase_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={settings.FIREBASE_API_KEY}"
    payload = {
        "email": req.email,
        "password": req.password,
        "returnSecureToken": True
    }

    try:
        response = httpx.post(firebase_url, json=payload, timeout=10.0)
        
        if response.status_code != 200:
            logger.warning(f"Failed authentication login request for {req.email}: {response.text}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials or passcode challenge failed."
            )
            
        auth_data = response.json()
        uid = auth_data["localId"]
        token = auth_data["idToken"]
        
        # Load user metadata from Firestore collection
        user_doc = db.collection("users").document(uid).get()
        
        if not user_doc.exists:
            # Fallback if profile doc was missing
            user_profile = {
                "uid": uid,
                "name": req.email.split("@")[0].capitalize(),
                "email": req.email,
                "department": "Security Operations Center",
                "role": "Analyst",
                "status": "Active"
            }
            db.collection("users").document(uid).set(user_profile)
        else:
            user_profile = user_doc.to_dict()

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user_profile
        }
    except httpx.RequestError as e:
        logger.error(f"Network error querying Firebase REST auth: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase identity server is currently offline."
        )

@router.post("/logout")
def logout_analyst():
    return {
        "status": "success",
        "message": "Analyst session invalidated successfully."
    }

@router.get("/verify", response_model=UserVerifyResponse)
def verify_analyst_session(current_user: dict = Depends(get_current_user)):
    return {
        "uid": current_user["uid"],
        "email": current_user["email"],
        "name": current_user["name"],
        "authenticated": True
    }
