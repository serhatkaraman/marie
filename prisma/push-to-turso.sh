#!/bin/bash
# Push local SQLite schema and data to Turso
# Usage: TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... bash prisma/push-to-turso.sh

set -e

echo "Generating Prisma client..."
npx prisma generate

echo "Pushing schema to Turso..."
DATABASE_URL="$TURSO_DATABASE_URL?authToken=$TURSO_AUTH_TOKEN" npx prisma db push --accept-data-loss

echo "Running seed..."
DATABASE_URL="$TURSO_DATABASE_URL?authToken=$TURSO_AUTH_TOKEN" TURSO_DATABASE_URL="$TURSO_DATABASE_URL" TURSO_AUTH_TOKEN="$TURSO_AUTH_TOKEN" npx tsx prisma/seed.ts

echo "Running content seed..."
DATABASE_URL="$TURSO_DATABASE_URL?authToken=$TURSO_AUTH_TOKEN" TURSO_DATABASE_URL="$TURSO_DATABASE_URL" TURSO_AUTH_TOKEN="$TURSO_AUTH_TOKEN" npx tsx prisma/seed-content.ts

echo "Done! Database is ready."
