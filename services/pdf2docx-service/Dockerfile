FROM python:3.11-slim

WORKDIR /app

# Only glib is needed — pdf2docx-headless uses opencv-python-headless
# poppler-utils is needed for pdf2image to convert PDF to PNGs
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

# EXPOSE is documentation only
EXPOSE 8000

# Run python directly. main.py will parse $PORT programmatically.
CMD ["python", "main.py"]
