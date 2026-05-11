"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-05-11

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import ENUM as PgEnum

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE film_type AS ENUM ('film', 'tv');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$
    """)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("display_name", sa.String(100), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "films",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tmdb_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("type", PgEnum("film", "tv", name="film_type", create_type=False), nullable=False),
        sa.Column("year", sa.Integer(), nullable=True),
        sa.Column("poster_url", sa.String(1000), nullable=True),
        sa.Column("added_by_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_unique_constraint("uq_films_tmdb_id", "films", ["tmdb_id"])

    op.create_table(
        "ratings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("film_id", sa.Integer(), sa.ForeignKey("films.id"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("review", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_unique_constraint("uq_ratings_film_user", "ratings", ["film_id", "user_id"])
    op.create_check_constraint("ck_ratings_score_range", "ratings", "score >= 1 AND score <= 10")


def downgrade() -> None:
    op.drop_table("ratings")
    op.drop_table("films")
    op.drop_table("users")
    op.execute("DROP TYPE film_type")
