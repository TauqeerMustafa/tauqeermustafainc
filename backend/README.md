# Tauqeer Inc Backend

FastAPI backend foundation for Tauqeer Inc.

## Stack

- Python 3.12
- FastAPI
- SQLAlchemy 2.x
- PostgreSQL
- Alembic
- Pydantic v2
- Uvicorn
- python-dotenv
- python-jose
- passlib

## Setup

```bash
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
copy .env.example .env
```

## Run

```bash
.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Endpoints

- `GET /`
- `GET /health`
- `GET /version`

## Alembic

```bash
.venv\Scripts\python -m alembic revision --autogenerate -m "message"
.venv\Scripts\python -m alembic upgrade head
```
