#!/bin/bash

# Cosmic Watch - Start Development Environment
# Runs backend on port 3000, frontend on port 8787

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting Cosmic Watch..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kill existing processes on ports using fuser if available, otherwise skip
echo -e "${YELLOW}Checking for existing processes...${NC}"
if command -v fuser &> /dev/null; then
    fuser -k 3000/tcp 2>/dev/null || true
    fuser -k 8787/tcp 2>/dev/null || true
else
    echo -e "${YELLOW}fuser not found, skipping port check...${NC}"
fi

# Start Backend
echo -e "${GREEN}Starting backend on port 3000...${NC}"
cd "$SCRIPT_DIR/apps/api"
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend running on http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  Backend may still be starting...${NC}"
fi

# Start Frontend
echo -e "${GREEN}Starting frontend on port 8787...${NC}"
cd "$SCRIPT_DIR/apps/web"
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 3

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Cosmic Watch is running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  Frontend: ${GREEN}http://localhost:8787${NC}"
echo -e "  Backend:  ${GREEN}http://localhost:3000${NC}"
echo -e "  API:      ${GREEN}http://localhost:3000/api${NC}"
echo ""
echo -e "Press ${RED}Ctrl+C${NC} to stop all services"
echo ""

# Handle cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping services...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    if command -v fuser &> /dev/null; then
        fuser -k 3000/tcp 2>/dev/null || true
        fuser -k 8787/tcp 2>/dev/null || true
    fi
    echo -e "${GREEN}✅ All services stopped${NC}"
}

trap cleanup EXIT INT TERM

# Wait for both processes
wait
