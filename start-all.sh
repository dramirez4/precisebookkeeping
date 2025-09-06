#!/bin/bash

echo "🚀 Starting Precision Bookkeeping Platform..."

# Check if servers are already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Marketing Website already running on port 3000"
else
    echo "🔄 Starting Marketing Website (Main Landing Page)..."
    node marketing-server.js &
    sleep 3
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Client Portal already running on port 3001"
else
    echo "🔄 Starting Client Portal..."
    cd client && npm run dev &
    cd ..
    sleep 5
fi

if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Backend API already running on port 3002"
else
    echo "🔄 Starting Backend API..."
    node server/index.js &
    sleep 2
fi

echo ""
echo "🎉 All servers are running!"
echo ""
echo "📱 Access your platform:"
echo "   🌐 Marketing Website (Main): http://localhost:3000"
echo "   🔐 Client Portal:            http://localhost:3001"
echo "   🔧 API Health:               http://localhost:3002/health"
echo ""
echo "💡 Test credentials:"
echo "   Email: test@precisionbookkeeping.com"
echo "   Password: password123"
echo ""
echo "Press Ctrl+C to stop all servers"