#!/bin/bash
export NODE_ENV=development
npx tsx server/index.ts &
exec npx vite --host 0.0.0.0 --port 5000
