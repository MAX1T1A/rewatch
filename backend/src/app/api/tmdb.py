import os
import httpx
from fastapi import APIRouter, HTTPException, Query, Depends

from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/tmdb", tags=["tmdb"])

TMDB_BASE = "https://api.themoviedb.org/3"


@router.get("/search")
def tmdb_search(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
):
    api_key = os.environ["TMDB_API_KEY"]
    with httpx.Client(timeout=10.0) as client:
        resp = client.get(
            f"{TMDB_BASE}/search/multi",
            params={"query": q, "api_key": api_key, "language": "en-US"},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="TMDB upstream error")

    results = []
    for item in resp.json().get("results", []):
        media_type = item.get("media_type")
        if media_type not in ("movie", "tv"):
            continue
        poster = item.get("poster_path")
        year_raw = (item.get("release_date") or item.get("first_air_date") or "")[:4]
        results.append({
            "tmdb_id": item["id"],
            "title": item.get("title") or item.get("name", ""),
            "type": "film" if media_type == "movie" else "tv",
            "year": int(year_raw) if year_raw.isdigit() else None,
            "poster_url": f"https://image.tmdb.org/t/p/w300{poster}" if poster else None,
        })
    return results
