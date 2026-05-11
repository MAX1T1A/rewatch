from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.database import get_db
from app.models.film import Film
from app.models.rating import Rating
from app.models.user import User
from app.schemas.film import FilmCreate, FilmOut, RatingOut, RatingUpsert
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/films", tags=["films"])


def _build_film_out(film: Film) -> FilmOut:
    return FilmOut(
        id=film.id,
        tmdb_id=film.tmdb_id,
        title=film.title,
        type=film.type,
        year=film.year,
        poster_url=film.poster_url,
        added_by_user_id=film.added_by_user_id,
        added_by_display_name=film.added_by.display_name,
        ratings=[
            RatingOut(
                user_id=r.user_id,
                display_name=r.user.display_name,
                score=r.score,
                review=r.review,
            )
            for r in film.ratings
        ],
    )


@router.get("", response_model=list[FilmOut])
def list_films(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    films = (
        db.query(Film)
        .options(
            joinedload(Film.ratings).joinedload(Rating.user),
            joinedload(Film.added_by),
        )
        .all()
    )
    return [_build_film_out(f) for f in films]


@router.post("", response_model=FilmOut, status_code=status.HTTP_201_CREATED)
def add_film(
    body: FilmCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    film = Film(**body.model_dump(), added_by_user_id=current_user.id)
    db.add(film)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Film already added")
    db.refresh(film)
    # reload with relationships
    film = (
        db.query(Film)
        .options(joinedload(Film.added_by), joinedload(Film.ratings))
        .filter(Film.id == film.id)
        .one()
    )
    return _build_film_out(film)


@router.post("/{film_id}/ratings", response_model=RatingOut)
def upsert_rating(
    film_id: int,
    body: RatingUpsert,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.score < 1 or body.score > 10:
        raise HTTPException(status_code=422, detail="score must be between 1 and 10")

    if not db.get(Film, film_id):
        raise HTTPException(status_code=404, detail="Film not found")

    stmt = (
        pg_insert(Rating)
        .values(
            film_id=film_id,
            user_id=current_user.id,
            score=body.score,
            review=body.review,
        )
        .on_conflict_do_update(
            constraint="uq_ratings_film_user",
            set_={"score": body.score, "review": body.review},
        )
        .returning(Rating.score, Rating.review)
    )
    row = db.execute(stmt).fetchone()
    db.commit()
    return RatingOut(
        user_id=current_user.id,
        display_name=current_user.display_name,
        score=row.score,
        review=row.review,
    )


@router.delete("/{film_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_film(
    film_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    film = db.get(Film, film_id)
    if not film:
        raise HTTPException(status_code=404, detail="Film not found")
    if film.added_by_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the user who added this film can delete it")
    db.delete(film)
    db.commit()
