from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints import router as api_router
from app.config import settings as s

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=s.CORS_ALLOWED_ORIGINS,
    allow_credentials=s.CORS_ALLOWED_CREDENTIALS,
    allow_methods=s.CORS_ALLOWED_METHODS,
    allow_headers=s.CORS_ALLOWED_HEADERS,
)

# Adds the API endpoints to the application
app.include_router(api_router)
