import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.films import router as films_router
from app.api.tmdb import router as tmdb_router

app = FastAPI(title="Rewatch API", docs_url="/api/docs", redoc_url="/api/redoc")

_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
if frontend_url := os.environ.get("FRONTEND_URL"):
    _origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(auth_router)
app.include_router(films_router)
app.include_router(tmdb_router)
