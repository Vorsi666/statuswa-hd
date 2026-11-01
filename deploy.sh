#!/bin/bash
# Deploy script for StatusWA HD to Vercel
# Usage: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🚀 StatusWA HD - Deploy to Vercel"
echo "=================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Vercel CLI...${NC}"
    npm install -g vercel@latest
fi

# Check if logged in
echo -e "${YELLOW}🔐 Checking Vercel login...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}🔑 Please login to Vercel...${NC}"
    vercel login
fi

# Verify environment
echo -e "${YELLOW}🔍 Verifying environment...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found! Copy from .env.example${NC}"
    exit 1
fi

# Check required env vars
required_vars=("DATABASE_URL" "NEXTAUTH_URL" "NEXTAUTH_SECRET" "GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET" "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" "CLOUDINARY_API_KEY" "CLOUDINARY_API_SECRET")

for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env; then
        echo -e "${RED}❌ Missing required env var: ${var}${NC}"
        exit 1
    fi
done

# Run type check
echo -e "${YELLOW}🔍 Running TypeScript check...${NC}"
npx tsc --noEmit || {
    echo -e "${RED}❌ TypeScript check failed${NC}"
    exit 1
}

# Run lint
echo -e "${YELLOW}🧹 Running ESLint...${NC}"
npm run lint || {
    echo -e "${RED}❌ Lint failed${NC}"
    exit 1
}

# Generate Prisma client
echo -e "${YELLOW}🔧 Generating Prisma client...${NC}"
npx prisma generate

# Build
echo -e "${YELLOW}🏗️ Building application...${NC}"
npm run build || {
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
}

# Deploy to Vercel
echo -e "${YELLOW}🚀 Deploying to Vercel Production...${NC}"
vercel --prod --yes

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}🌐 Check your Vercel dashboard for the live URL${NC}"