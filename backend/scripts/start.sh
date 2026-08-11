#!/usr/bin/env sh
set -e

alembic upgrade head
# Render (and most PaaS providers) inject $PORT at runtime; fall back to
# 8000 for local use so this script still works outside of a deploy.
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
