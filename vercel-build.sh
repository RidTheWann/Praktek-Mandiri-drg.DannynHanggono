#!/bin/bash

# Build the client
npm run build

# Copy the index.html to the root of the dist directory
cp dist/public/index.html dist/

# Copy the assets directory to the root of the dist directory
cp -r dist/public/assets dist/

# Create src/assets directory structure and copy assets there too
# This ensures paths like /src/assets/... work in production
mkdir -p dist/src/assets
cp -r client/src/assets/* dist/src/assets/