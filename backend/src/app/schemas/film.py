from typing import Optional
from pydantic import BaseModel
from app.models.film import FilmType


class RatingOut(BaseModel):
    user_id: int
    display_name: str
    score: int
    review: Optional[str] = None

    model_config = {"from_attributes": True}


class FilmOut(BaseModel):
    id: int
    tmdb_id: int
    title: str
    type: FilmType
    year: Optional[int] = None
    poster_url: Optional[str] = None
    added_by_user_id: int
    added_by_display_name: str
    ratings: list[RatingOut]

    model_config = {"from_attributes": True}


class FilmCreate(BaseModel):
    tmdb_id: int
    title: str
    type: FilmType
    year: Optional[int] = None
    poster_url: Optional[str] = None


class RatingUpsert(BaseModel):
    score: int
    review: Optional[str] = None
