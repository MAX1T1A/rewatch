#!/bin/sh
set -e

DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+)[:/].*|\1|')
DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*@[^:]+:([0-9]+)/.*|\1|')
DB_PORT=${DB_PORT:-5432}

echo "Waiting for postgres at $DB_HOST:$DB_PORT ..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" 2>/dev/null; do
  echo "  postgres not ready, retrying in 2s..."
  sleep 2
done
echo "Postgres is ready."

echo "Running Alembic migrations..."
cd /code/src/app
alembic upgrade head

echo "Starting server..."
exec "$@"
