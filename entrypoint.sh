#!/bin/bash

set -e

if [ "$FLASK_ENV" = "development" ]; then
  echo "Running in development mode..."
  exec flask run --host=0.0.0.0 --port=8000
else
  echo "Running in production mode..."
  exec gunicorn --bind 0.0.0.0:8000 wsgi:app
fi
