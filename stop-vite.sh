#!/bin/bash

# Stop Vite Development Server
# This script stops all running Vite processes

echo "Stopping Vite dev server..."

# Kill processes by port (Vite default is 5173)
if lsof -ti:5173 > /dev/null 2>&1; then
    kill -9 $(lsof -ti:5173) 2>/dev/null
    echo "✓ Stopped Vite process on port 5173"
else
    echo "ℹ No process running on port 5173"
fi

# Alternative: Kill all node processes with 'vite' in command
pkill -f "vite" 2>/dev/null && echo "✓ Stopped Vite processes" || echo "ℹ No Vite processes found"

echo "Done!"
