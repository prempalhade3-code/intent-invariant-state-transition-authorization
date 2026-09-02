FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=.

EXPOSE 10000

CMD uvicorn serve:app --host 0.0.0.0 --port ${PORT:-10000}
