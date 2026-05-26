FROM python:3.12-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends nodejs npm \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY frontend/package*.json frontend/
RUN cd frontend && npm ci --legacy-peer-deps

COPY frontend frontend
RUN cd frontend && npm run build

COPY backend backend

ENV APP_ENV=production
ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend

CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]
