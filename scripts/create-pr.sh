#!/bin/bash

# Script to help create pull request for Budget Reduction Tracking v1.0.0
# This script provides step-by-step guidance since AI cannot push to main branch

set -e

echo "=================================================="
echo "Budget Reduction Tracking - PR Creation Helper"
echo "=================================================="
echo ""

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
CURRENT_COMMIT=$(git rev-parse HEAD)

echo "Current branch: $CURRENT_BRANCH"
echo "Current commit: $CURRENT_COMMIT"
echo ""

# Check if main branch exists
echo "Checking for main branch..."
if git ls-remote --heads origin main | grep -q main; then
    echo "✅ Main branch exists on remote"
    MAIN_EXISTS=true
else
    echo "❌ Main branch does NOT exist on remote"
    MAIN_EXISTS=false
fi
echo ""

if [ "$MAIN_EXISTS" = false ]; then
    echo "=================================================="
    echo "STEP 1: Create Main Branch"
    echo "=================================================="
    echo ""
    echo "You need to create the 'main' branch first. Choose one option:"
    echo ""
    echo "Option A: GitHub Web Interface"
    echo "  1. Go to: https://github.com/dmcguire80/Budget-Reduction-Tracking"
    echo "  2. Click the branch dropdown"
    echo "  3. Type 'main' and click 'Create branch: main from $CURRENT_BRANCH'"
    echo ""
    echo "Option B: GitHub CLI (if installed)"
    echo "  Run this command:"
    echo "    gh api repos/dmcguire80/Budget-Reduction-Tracking/git/refs \\"
    echo "      -f ref='refs/heads/main' \\"
    echo "      -f sha='$CURRENT_COMMIT'"
    echo ""
    echo "Option C: Local Git Push (if you have different credentials)"
    echo "  Run these commands:"
    echo "    git checkout -b main"
    echo "    git push -u origin main"
    echo "    git checkout $CURRENT_BRANCH"
    echo ""
    read -p "Press Enter after you've created the main branch..."
    echo ""
fi

echo "=================================================="
echo "STEP 2: Create Pull Request"
echo "=================================================="
echo ""
echo "Choose one option:"
echo ""

# Check if gh CLI is available
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI (gh) detected"
    echo ""
    echo "Option A: GitHub CLI (Recommended)"
    echo "  Run this command:"
    echo ""
    echo "    gh pr create \\"
    echo "      --base main \\"
    echo "      --title \"feat: Budget Reduction Tracking v1.0.0 - Production Ready Application\" \\"
    echo "      --body-file .github/PR_TEMPLATE.md"
    echo ""
else
    echo "❌ GitHub CLI (gh) not installed"
    echo ""
    echo "To install gh:"
    echo "  Ubuntu/Debian: sudo apt install gh"
    echo "  macOS: brew install gh"
    echo "  Or visit: https://cli.github.com/"
    echo ""
fi

echo "Option B: GitHub Web Interface"
echo "  1. Go to: https://github.com/dmcguire80/Budget-Reduction-Tracking/pulls"
echo "  2. Click 'New pull request'"
echo "  3. Set Base: main"
echo "  4. Set Compare: $CURRENT_BRANCH"
echo "  5. Click 'Create pull request'"
echo "  6. Copy content from .github/PR_TEMPLATE.md for PR description"
echo ""

echo "=================================================="
echo "PR Template Location"
echo "=================================================="
echo ""
echo "PR template with complete description:"
echo "  📄 .github/PR_TEMPLATE.md"
echo ""
echo "You can view it with:"
echo "  cat .github/PR_TEMPLATE.md"
echo ""

echo "=================================================="
echo "After PR is Created"
echo "=================================================="
echo ""
echo "GitHub Actions will automatically:"
echo "  ✅ Run backend tests (with PostgreSQL container)"
echo "  ✅ Run frontend tests"
echo "  ✅ Run linting checks"
echo "  ✅ Run build verification"
echo "  ✅ Generate coverage reports"
echo ""
echo "All checks should pass! ✨"
echo ""

echo "=================================================="
echo "Next Steps Summary"
echo "=================================================="
echo ""
echo "1. Create 'main' branch (if not exists)"
echo "2. Create PR from $CURRENT_BRANCH to main"
echo "3. Wait for CI/CD checks to complete"
echo "4. Merge PR when ready"
echo "5. Deploy to production (see docs/DEPLOYMENT_CHECKLIST.md)"
echo ""
echo "For more help, see: docs/PULL_REQUESTS.md"
echo ""
