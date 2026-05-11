# Rewatch

Collaborative film and TV tracking app. Add films from TMDB, rate them 1–10, and see everyone's ratings in one place.

## Setup

### 1. Get a TMDB API key

Register or log in at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) and copy your **API Key (v3 auth)**.

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in all fields:

| Variable | Description |
|---|---|
| `POSTGRES_DB` | Database name (e.g. `rewatch`) |
| `POSTGRES_USER` | Database user |
| `POSTGRES_PASSWORD` | Database password |
| `DATABASE_URL` | Full connection string — must match the three values above |
| `SECRET_KEY` | Random secret for JWT signing — use a long random string in production |
| `TMDB_API_KEY` | Your TMDB v3 API key |

### 3. Run

```bash
docker compose up --build
```

On first start the backend waits for PostgreSQL to be ready, then runs Alembic migrations automatically before starting the API server.

## Access

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API docs | http://localhost:8000/api/docs |

## Caddy configuration

The backend listens on port **8000** and the frontend dev server on port **5173**. A typical Caddy reverse proxy config:

```
rewatch.example.com {
    handle /api/* {
        reverse_proxy localhost:8000
    }
    handle {
        reverse_proxy localhost:5173
    }
}
```
