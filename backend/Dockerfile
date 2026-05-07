FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Added uvicorn here so gunicorn can use the UvicornWorker class
RUN pip install --no-cache-dir -r requirements.txt gunicorn uvicorn

COPY . .

RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# FIX: Added -k uvicorn.workers.UvicornWorker
# This translates Gunicorn's management into FastAPI's async language
CMD ["gunicorn", "-w", "2", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-", "main:app"]