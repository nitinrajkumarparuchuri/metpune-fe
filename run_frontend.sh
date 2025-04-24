#!/bin/bash

# Install dependencies
npm install || {
  echo "Failed to install dependencies with npm, trying with yarn..."
  yarn install || {
    echo "Failed to install dependencies with yarn, trying with bun..."
    bun install || {
      echo "Failed to install dependencies. Please install them manually."
      exit 1
    }
  }
}

# Start the development server
echo "Starting the development server..."
npm run dev || {
  echo "Failed to start with npm run dev, trying with yarn..."
  yarn dev || {
    echo "Failed to start with yarn dev, trying with bun..."
    bun dev || {
      echo "Failed to start the development server. Please start it manually."
      exit 1
    }
  }
}