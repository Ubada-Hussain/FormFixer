FROM python:3.11-slim

WORKDIR /app

# Only glib is needed — pdf2docx-headless uses opencv-python-headless
# so there's no libGL/display server dependency
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

# EXPOSE is documentation only — Railway routes traffic via $PORT
EXPOSE 8000

# Shell-form CMD so ${PORT:-8000} is expanded at container start.
# Railway injects $PORT at runtime; falls back to 8000 for local dev.
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
