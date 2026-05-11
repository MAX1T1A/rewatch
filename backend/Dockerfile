FROM python:3.12-slim

WORKDIR /code

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=/code/src

RUN chmod +x /code/entrypoint.sh

ENTRYPOINT ["/code/entrypoint.sh"]
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
