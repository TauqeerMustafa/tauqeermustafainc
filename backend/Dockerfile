FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Render (and most PaaS providers) inject $PORT at runtime and expect the
# process to bind to it; falling back to 8000 keeps local `docker run` usage
# unchanged. Using the shell form so ${PORT} is expanded at container start.
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
