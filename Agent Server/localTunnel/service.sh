#!/bin/bash

echo "Starting Local tunnel with auto-restart..."

while true; do
    sleep 5
    echo "$(date): Starting Local tunnel..."
    lt --port 8000 --subdomain "effisend-local-tunnel"
    echo "$(date): Local tunnel stopped. Restarting in 5 second..."
done