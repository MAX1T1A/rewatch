import enum
from sqlalchemy import String, Integer, ForeignKey, UniqueConstraint
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class FilmType(str, enum.Enum):
    film = "film"
    tv = "tv"


class Film(Base, TimestampMixin):
    __tablename__ = "films"

    __table_args__ = (
        UniqueConstraint("tmdb_id", name="uq_films_tmdb_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tmdb_id: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    type: Mapped[FilmType] = mapped_column(SQLEnum(FilmType, name="film_type"), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=True)
    poster_url: Mapped[str] = mapped_column(String(1000), nullable=True)
    added_by_user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)

    added_by = relationship("User", back_populates="films", lazy="select")
    ratings = relationship("Rating", back_populates="film", lazy="select", cascade="all, delete-orphan")
