#!/bin/bash
# Environment Configuration Validation Script
# Checks if all required environment variables are properly configured

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track errors
ERRORS=0
WARNINGS=0

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Environment Configuration Validation${NC}"
echo -e "${BLUE}======================================${NC}\n"

#############################################
# BACKEND ENVIRONMENT
#############################################
echo -e "${YELLOW}Checking Backend Environment...${NC}\n"

cd "$PROJECT_ROOT/backend"

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${RED}✗ backend/.env file missing${NC}"
  echo -e "  ${YELLOW}→ Run: cp .env.example .env${NC}"
  ((ERRORS++))
else
  echo -e "${GREEN}✓ backend/.env file exists${NC}"

  # Source the .env file for validation
  set -a
  source .env
  set +a

  # Required variables
  BACKEND_REQUIRED_VARS=(
    "NODE_ENV"
    "PORT"
    "DATABASE_URL"
    "JWT_SECRET"
    "REFRESH_TOKEN_SECRET"
    "CORS_ORIGIN"
  )

  # Check each required variable
  for VAR in "${BACKEND_REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
      echo -e "${RED}✗ Missing required variable: $VAR${NC}"
      ((ERRORS++))
    else
      # Check for example/placeholder values
      VALUE="${!VAR}"
      if [[ "$VAR" == "JWT_SECRET" && "$VALUE" == *"change-in-production"* ]]; then
        echo -e "${YELLOW}⚠ $VAR contains example value - change for production${NC}"
        ((WARNINGS++))
      elif [[ "$VAR" == "REFRESH_TOKEN_SECRET" && "$VALUE" == *"change-in-production"* ]]; then
        echo -e "${YELLOW}⚠ $VAR contains example value - change for production${NC}"
        ((WARNINGS++))
      elif [[ "$VAR" == "DATABASE_URL" && "$VALUE" == *"dev_password"* ]]; then
        echo -e "${YELLOW}⚠ $VAR contains dev password - change for production${NC}"
        ((WARNINGS++))
      else
        echo -e "${GREEN}✓ $VAR is set${NC}"
      fi
    fi
  done

  # Optional but recommended variables
  BACKEND_OPTIONAL_VARS=(
    "LOG_LEVEL"
    "JWT_EXPIRES_IN"
    "REFRESH_TOKEN_EXPIRES_IN"
  )

  echo ""
  for VAR in "${BACKEND_OPTIONAL_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
      echo -e "${YELLOW}ℹ Optional variable not set: $VAR (will use default)${NC}"
    else
      echo -e "${GREEN}✓ $VAR is set: ${!VAR}${NC}"
    fi
  done

  # Validate specific values
  echo ""
  echo -e "${BLUE}Validating configuration values...${NC}"

  # Check NODE_ENV
  if [[ ! "$NODE_ENV" =~ ^(development|production|test)$ ]]; then
    echo -e "${YELLOW}⚠ NODE_ENV should be 'development', 'production', or 'test' (current: $NODE_ENV)${NC}"
    ((WARNINGS++))
  else
    echo -e "${GREEN}✓ NODE_ENV is valid: $NODE_ENV${NC}"
  fi

  # Check PORT
  if ! [[ "$PORT" =~ ^[0-9]+$ ]] || [ "$PORT" -lt 1024 ] || [ "$PORT" -gt 65535 ]; then
    echo -e "${YELLOW}⚠ PORT should be between 1024-65535 (current: $PORT)${NC}"
    ((WARNINGS++))
  else
    echo -e "${GREEN}✓ PORT is valid: $PORT${NC}"
  fi

  # Check DATABASE_URL format
  if [[ ! "$DATABASE_URL" =~ ^postgresql:// ]]; then
    echo -e "${RED}✗ DATABASE_URL should start with 'postgresql://'${NC}"
    ((ERRORS++))
  else
    echo -e "${GREEN}✓ DATABASE_URL format is valid${NC}"
  fi

  # Check JWT_SECRET strength (should be long)
  if [ ${#JWT_SECRET} -lt 32 ]; then
    echo -e "${YELLOW}⚠ JWT_SECRET is too short (${#JWT_SECRET} chars). Recommended: 64+ chars${NC}"
    echo -e "  ${YELLOW}→ Generate: openssl rand -base64 64 | tr -d '\\n'${NC}"
    ((WARNINGS++))
  else
    echo -e "${GREEN}✓ JWT_SECRET length is adequate (${#JWT_SECRET} chars)${NC}"
  fi

  # Check REFRESH_TOKEN_SECRET strength
  if [ ${#REFRESH_TOKEN_SECRET} -lt 32 ]; then
    echo -e "${YELLOW}⚠ REFRESH_TOKEN_SECRET is too short (${#REFRESH_TOKEN_SECRET} chars). Recommended: 64+ chars${NC}"
    echo -e "  ${YELLOW}→ Generate: openssl rand -base64 64 | tr -d '\\n'${NC}"
    ((WARNINGS++))
  else
    echo -e "${GREEN}✓ REFRESH_TOKEN_SECRET length is adequate (${#REFRESH_TOKEN_SECRET} chars)${NC}"
  fi

  # Check if JWT_SECRET and REFRESH_TOKEN_SECRET are different
  if [ "$JWT_SECRET" == "$REFRESH_TOKEN_SECRET" ]; then
    echo -e "${RED}✗ JWT_SECRET and REFRESH_TOKEN_SECRET must be different${NC}"
    ((ERRORS++))
  else
    echo -e "${GREEN}✓ JWT_SECRET and REFRESH_TOKEN_SECRET are different${NC}"
  fi

  # Check CORS_ORIGIN format
  if [[ ! "$CORS_ORIGIN" =~ ^https?:// ]]; then
    echo -e "${YELLOW}⚠ CORS_ORIGIN should start with 'http://' or 'https://'${NC}"
    ((WARNINGS++))
  else
    echo -e "${GREEN}✓ CORS_ORIGIN format is valid${NC}"
  fi

  # Production-specific checks
  if [ "$NODE_ENV" == "production" ]; then
    echo ""
    echo -e "${BLUE}Running production-specific checks...${NC}"

    if [[ "$CORS_ORIGIN" == "http://localhost"* ]]; then
      echo -e "${RED}✗ CORS_ORIGIN should not be localhost in production${NC}"
      ((ERRORS++))
    fi

    if [[ "$DATABASE_URL" == *"dev_password"* ]]; then
      echo -e "${RED}✗ DATABASE_URL should not contain dev_password in production${NC}"
      ((ERRORS++))
    fi

    if [[ "$JWT_SECRET" == *"change-in-production"* ]]; then
      echo -e "${RED}✗ JWT_SECRET must be changed for production${NC}"
      ((ERRORS++))
    fi

    if [[ "$REFRESH_TOKEN_SECRET" == *"change-in-production"* ]]; then
      echo -e "${RED}✗ REFRESH_TOKEN_SECRET must be changed for production${NC}"
      ((ERRORS++))
    fi
  fi
fi

#############################################
# FRONTEND ENVIRONMENT
#############################################
echo -e "\n${YELLOW}Checking Frontend Environment...${NC}\n"

cd "$PROJECT_ROOT/frontend"

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${RED}✗ frontend/.env file missing${NC}"
  echo -e "  ${YELLOW}→ Run: cp .env.example .env${NC}"
  ((ERRORS++))
else
  echo -e "${GREEN}✓ frontend/.env file exists${NC}"

  # Source the .env file for validation
  set -a
  source .env 2>/dev/null || true
  set +a

  # Required variables
  FRONTEND_REQUIRED_VARS=(
    "VITE_API_URL"
    "VITE_APP_NAME"
  )

  # Check each required variable
  for VAR in "${FRONTEND_REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
      echo -e "${RED}✗ Missing required variable: $VAR${NC}"
      ((ERRORS++))
    else
      echo -e "${GREEN}✓ $VAR is set${NC}"
    fi
  done

  # Validate VITE_API_URL format
  echo ""
  echo -e "${BLUE}Validating configuration values...${NC}"

  if [ -n "$VITE_API_URL" ]; then
    if [[ ! "$VITE_API_URL" =~ ^https?:// ]]; then
      echo -e "${YELLOW}⚠ VITE_API_URL should start with 'http://' or 'https://'${NC}"
      ((WARNINGS++))
    else
      echo -e "${GREEN}✓ VITE_API_URL format is valid${NC}"
    fi

    # Check if VITE_API_URL matches backend CORS_ORIGIN
    # Frontend points to backend, backend allows frontend origin
    # So we just warn if they don't seem to match environments
    if [[ "$VITE_API_URL" == "http://localhost"* ]] && [[ "$CORS_ORIGIN" != "http://localhost"* ]]; then
      echo -e "${YELLOW}⚠ Frontend is pointing to localhost but backend CORS is not${NC}"
      ((WARNINGS++))
    fi
  fi

  # Optional variables
  FRONTEND_OPTIONAL_VARS=(
    "VITE_APP_VERSION"
    "VITE_ENV_LABEL"
    "VITE_DEBUG"
    "VITE_API_TIMEOUT"
  )

  echo ""
  for VAR in "${FRONTEND_OPTIONAL_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
      echo -e "${YELLOW}ℹ Optional variable not set: $VAR (will use default)${NC}"
    else
      echo -e "${GREEN}✓ $VAR is set: ${!VAR}${NC}"
    fi
  done
fi

#############################################
# FILE PERMISSIONS CHECK
#############################################
echo -e "\n${YELLOW}Checking File Permissions...${NC}\n"

cd "$PROJECT_ROOT"

# Check backend .env permissions
if [ -f backend/.env ]; then
  BACKEND_PERMS=$(stat -c "%a" backend/.env 2>/dev/null || stat -f "%A" backend/.env 2>/dev/null)
  if [ "$BACKEND_PERMS" != "600" ] && [ "$BACKEND_PERMS" != "400" ]; then
    echo -e "${YELLOW}⚠ backend/.env permissions are $BACKEND_PERMS (recommended: 600)${NC}"
    echo -e "  ${YELLOW}→ Run: chmod 600 backend/.env${NC}"
    ((WARNINGS++))
  else
    echo -e "${GREEN}✓ backend/.env permissions are secure ($BACKEND_PERMS)${NC}"
  fi
fi

# Check frontend .env permissions (less critical as no secrets)
if [ -f frontend/.env ]; then
  FRONTEND_PERMS=$(stat -c "%a" frontend/.env 2>/dev/null || stat -f "%A" frontend/.env 2>/dev/null)
  echo -e "${GREEN}✓ frontend/.env permissions: $FRONTEND_PERMS${NC}"
fi

#############################################
# GIT IGNORE CHECK
#############################################
echo -e "\n${YELLOW}Checking .gitignore...${NC}\n"

if [ -f .gitignore ]; then
  if grep -q "^\.env$" .gitignore; then
    echo -e "${GREEN}✓ .env files are in .gitignore${NC}"
  else
    echo -e "${RED}✗ .env is not in .gitignore - SECURITY RISK!${NC}"
    ((ERRORS++))
  fi
else
  echo -e "${YELLOW}⚠ .gitignore file not found${NC}"
  ((WARNINGS++))
fi

#############################################
# SUMMARY
#############################################
echo -e "\n${BLUE}======================================${NC}"
echo -e "${BLUE}Validation Summary${NC}"
echo -e "${BLUE}======================================${NC}\n"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✓ Environment configuration is valid!${NC}"
  echo -e "${GREEN}  No errors or warnings found.${NC}\n"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠ Environment configuration is valid with warnings${NC}"
  echo -e "  ${RED}Errors: $ERRORS${NC}"
  echo -e "  ${YELLOW}Warnings: $WARNINGS${NC}\n"
  exit 0
else
  echo -e "${RED}✗ Environment configuration has errors!${NC}"
  echo -e "  ${RED}Errors: $ERRORS${NC}"
  echo -e "  ${YELLOW}Warnings: $WARNINGS${NC}\n"
  echo -e "${RED}Please fix the errors above before continuing.${NC}\n"
  exit 1
fi
