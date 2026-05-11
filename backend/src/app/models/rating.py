from sqlalchemy import Integer, Text, ForeignKey, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class Rating(Base, TimestampMixin):
    __tablename__ = "ratings"

    __table_args__ = (
        UniqueConstraint("film_id", "user_id", name="uq_ratings_film_user"),
        CheckConstraint("score >= 1 AND score <= 10", name="ck_ratings_score_range"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    film_id: Mapped[int] = mapped_column(Integer, ForeignKey("films.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    review: Mapped[str] = mapped_column(Text, nullable=True)

    film = relationship("Film", back_populates="ratings", lazy="select")
    user = relationship("User", back_populates="ratings", lazy="select")
