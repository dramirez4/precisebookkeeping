#!/bin/bash

echo "🚀 Setting up Precision Bookkeeping Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd ../client
npm install

# Go back to root
cd ..

# Create environment file
echo "⚙️ Creating environment configuration..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Created .env file. Please update with your actual values."
else
    echo "⚠️ .env file already exists. Skipping creation."
fi

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Create database
echo "🗄️ Setting up database..."
echo "Please create a PostgreSQL database named 'precision_bookkeeping' and update your .env file with the credentials."

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your database credentials and API keys"
echo "2. Create PostgreSQL database: precision_bookkeeping"
echo "3. Run: npm run dev (starts both server and client)"
echo "4. Visit: http://localhost:3000"
echo ""
echo "For QuickBooks integration:"
echo "1. Create QuickBooks app at https://developer.intuit.com"
echo "2. Add your client ID and secret to .env"
echo ""
echo "For AWS S3 (document storage):"
echo "1. Create S3 bucket and add credentials to .env"
echo ""
echo "For Plaid (bank connections):"
echo "1. Create Plaid account and add credentials to .env"