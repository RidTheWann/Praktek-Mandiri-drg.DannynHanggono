#!/bin/bash

# Build the client
npm run build

# Copy the index.html to the root of the dist directory
cp dist/public/index.html dist/

# Copy the assets directory to the root of the dist directory
cp -r dist/public/assets dist/