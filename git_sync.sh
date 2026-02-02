#!/bin/bash
set -e
echo "Starting migration process..."
git checkout dev
git pull origin dev || echo "No remote dev branch yet"
git merge derive --no-edit
git push origin dev
echo "Pushed derive to dev"

git checkout main
git pull origin main || echo "No remote main branch yet"
git merge dev --no-edit
git push origin main
echo "Pushed dev to main"

git checkout derive
echo "Switched back to derive"
