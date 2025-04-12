#!/bin/bash

# Gunicorn configuration script for Recruiter App
# This script starts the application using Gunicorn WSGI server

# Environment variables
export FLASK_APP=app.py
export FLASK_ENV=production

# Create log directory if it doesn't exist
mkdir -p logs

# Start Gunicorn with 4 worker processes
# Bind to all interfaces on port 5000
# Log to specified files
exec gunicorn \
    --workers 4 \
    --bind 0.0.0.0:5000 \
    --access-logfile logs/access.log \
    --error-logfile logs/error.log \
    --log-level info \
    --timeout 120 \
    --preload \
    "app:app"
