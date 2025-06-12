FROM python:3.12-slim

# Install any extra tools your commands might need
RUN apt-get update && apt-get install -y --no-install-recommends \
        bash \
        curl \
        git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY container_src/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY container_src/app ./app

# TODO: Use a non-root user for a tiny bit more safety
# RUN adduser --disabled-password --gecos "" appuser
# USER appuser

EXPOSE 8000
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
