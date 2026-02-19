
#!/bin/bash
# Check if Redis is running
if ! lsof -i:6379 -t >/dev/null; then
    echo "Starting Redis..."
    # Assuming redis-server is available, or use docker
    if command -v redis-server &> /dev/null; then
        redis-server --daemonize yes
    else
        echo "Redis not found. Please start Redis manually."
        exit 1
    fi
fi

echo "Starting Celery Worker..."
cd backend
celery -A app.worker.celery_app worker --loglevel=info --concurrency=1
