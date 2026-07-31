import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.firebase import initialize_firebase
from app.scheduler.manager import start_scheduler, shutdown_scheduler

# Routers imports
from app.api.auth import router as auth_router
from app.api.threats import router as threats_router
from app.api.analytics import router as analytics_router
from app.api.reports import router as reports_router
from app.api.scheduler import router as scheduler_router
from app.api.notifications import router as notifications_router

# Set up logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("cybervision.backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Core Base Startup Actions
    logger.info("Initializing CyberVision AI backend system...")
    initialize_firebase()
    start_scheduler()
    yield
    # Core Shutdown Actions
    logger.info("Shutting down CyberVision AI backend...")
    shutdown_scheduler()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# Configure CORS Middleware for Next.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict origins in production builds
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under standard v1 endpoint prefixes
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(threats_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(scheduler_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)

# API Root Diagnostics Endpoint
@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
