#!/bin/bash
#
# Budget Reduction Tracking - Database Restore Script
#
# This script restores a PostgreSQL database from a backup file created
# by backup-db.sh. It includes safety checks and verification steps.
#
# Features:
#   - Lists available backups
#   - Interactive backup selection
#   - Safety confirmation before restore
#   - Automatic backup before restore (safety backup)
#   - Verification after restore
#   - Rollback capability
#
# Usage:
#   chmod +x restore-db.sh
#   ./restore-db.sh [backup-file]
#
# Examples:
#   ./restore-db.sh                                    # Interactive mode
#   ./restore-db.sh /backups/budget_tracking_20231123_030000.sql.gz
#

set -e  # Exit on error
set -u  # Exit on undefined variable
set -o pipefail  # Catch errors in pipes

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}==>${NC} $1"
}

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups}"
DB_NAME="${DB_NAME:-budget_tracking}"
DB_USER="${DB_USER:-budget_user}"

# Load database credentials if available
if [ -f /root/.db_credentials ]; then
    source /root/.db_credentials
fi

log_info "========================================="
log_info "Database Restore Script"
log_info "========================================="
echo ""

# Check if running as root or with appropriate permissions
if [[ $EUID -ne 0 ]] && ! sudo -n true 2>/dev/null; then
   log_warn "This script may require sudo access for PostgreSQL operations"
fi

# List available backups
log_step "Available backups in $BACKUP_DIR:"
echo ""

BACKUPS=($(ls -t "$BACKUP_DIR"/${DB_NAME}_*.sql.gz 2>/dev/null || true))

if [ ${#BACKUPS[@]} -eq 0 ]; then
    log_error "No backup files found in $BACKUP_DIR"
    exit 1
fi

# Display backups with numbers
for i in "${!BACKUPS[@]}"; do
    BACKUP_FILE="${BACKUPS[$i]}"
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    BACKUP_DATE=$(stat -c %y "$BACKUP_FILE" 2>/dev/null || stat -f "%Sm" "$BACKUP_FILE")
    echo "  [$((i+1))] $(basename "$BACKUP_FILE") - $BACKUP_SIZE - $BACKUP_DATE"
done

echo ""

# Select backup file
if [ $# -eq 0 ]; then
    # Interactive mode
    read -p "Enter backup number to restore (1-${#BACKUPS[@]}) or press Ctrl+C to cancel: " BACKUP_NUM

    if ! [[ "$BACKUP_NUM" =~ ^[0-9]+$ ]] || [ "$BACKUP_NUM" -lt 1 ] || [ "$BACKUP_NUM" -gt ${#BACKUPS[@]} ]; then
        log_error "Invalid backup number"
        exit 1
    fi

    RESTORE_FILE="${BACKUPS[$((BACKUP_NUM-1))]}"
else
    # Command line argument
    RESTORE_FILE="$1"

    if [ ! -f "$RESTORE_FILE" ]; then
        log_error "Backup file not found: $RESTORE_FILE"
        exit 1
    fi
fi

log_info "Selected backup: $(basename "$RESTORE_FILE")"
echo ""

# Verify backup file integrity
log_step "Verifying backup file integrity..."
if ! gzip -t "$RESTORE_FILE"; then
    log_error "Backup file is corrupted and cannot be restored"
    exit 1
fi
log_info "Backup file integrity verified"
echo ""

# Warning and confirmation
log_warn "========================================="
log_warn "WARNING: DATABASE RESTORE OPERATION"
log_warn "========================================="
echo ""
log_warn "This operation will:"
echo "  1. Create a safety backup of the current database"
echo "  2. Drop and recreate the database"
echo "  3. Restore data from: $(basename "$RESTORE_FILE")"
echo ""
log_warn "Database: $DB_NAME"
log_warn "This action cannot be undone (except via the safety backup)"
echo ""

read -p "Are you sure you want to continue? (type 'yes' to proceed): " CONFIRMATION

if [ "$CONFIRMATION" != "yes" ]; then
    log_info "Restore cancelled by user"
    exit 0
fi

echo ""

# Create safety backup before restore
SAFETY_BACKUP="$BACKUP_DIR/${DB_NAME}_pre-restore_$(date +%Y%m%d_%H%M%S).sql.gz"
log_step "Creating safety backup before restore..."
log_info "Safety backup: $SAFETY_BACKUP"

if [ -n "${DATABASE_URL:-}" ]; then
    pg_dump "$DATABASE_URL" | gzip > "$SAFETY_BACKUP"
else
    PGPASSWORD="${DB_PASSWORD:-}" pg_dump \
        -h localhost \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-owner \
        --no-acl \
        | gzip > "$SAFETY_BACKUP"
fi

if [ ! -f "$SAFETY_BACKUP" ]; then
    log_error "Failed to create safety backup"
    exit 1
fi

chmod 600 "$SAFETY_BACKUP"
log_info "Safety backup created successfully"
echo ""

# Stop application to prevent database access during restore
log_step "Stopping application..."
if command -v pm2 &> /dev/null && pm2 list | grep -q "budget-tracking-api"; then
    pm2 stop budget-tracking-api
    APP_WAS_RUNNING=true
    log_info "Application stopped"
else
    APP_WAS_RUNNING=false
    log_info "Application not running"
fi
echo ""

# Perform restore
log_step "Restoring database from backup..."

# Terminate existing connections
log_info "Terminating existing database connections..."
sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" || true

# Drop and recreate database
log_info "Dropping and recreating database..."
sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS ${DB_NAME};
CREATE DATABASE ${DB_NAME};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
EOF

# Restore data
log_info "Restoring data from backup..."
if [ -n "${DATABASE_URL:-}" ]; then
    gunzip < "$RESTORE_FILE" | psql "$DATABASE_URL"
else
    gunzip < "$RESTORE_FILE" | PGPASSWORD="${DB_PASSWORD:-}" psql \
        -h localhost \
        -U "$DB_USER" \
        -d "$DB_NAME"
fi

log_info "Database restore completed"
echo ""

# Verify restore
log_step "Verifying database restore..."

# Check if database exists and is accessible
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    log_info "Database exists and is accessible"
else
    log_error "Database verification failed"
    exit 1
fi

# Count tables (basic sanity check)
TABLE_COUNT=$(sudo -u postgres psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
log_info "Restored $TABLE_COUNT table(s)"

if [ "$TABLE_COUNT" -eq 0 ]; then
    log_warn "No tables found in restored database"
    log_warn "This may indicate a problem with the restore"
fi

echo ""

# Restart application if it was running
if [ "$APP_WAS_RUNNING" = true ]; then
    log_step "Restarting application..."
    pm2 start budget-tracking-api
    sleep 2
    pm2 status
fi

echo ""

# Summary
log_info "========================================="
log_info "Restore Summary"
log_info "========================================="
echo "  Database: $DB_NAME"
echo "  Restored From: $(basename "$RESTORE_FILE")"
echo "  Safety Backup: $(basename "$SAFETY_BACKUP")"
echo "  Tables Restored: $TABLE_COUNT"
echo ""
log_info "Database restore completed successfully!"
echo ""
log_warn "IMPORTANT: Safety backup location:"
echo "  $SAFETY_BACKUP"
echo ""
log_warn "If you need to rollback, run:"
echo "  ./restore-db.sh $SAFETY_BACKUP"
echo ""

# Test database connection
log_info "Testing database connection..."
if sudo -u postgres psql -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    log_info "Database connection test successful"
else
    log_warn "Database connection test failed"
fi

log_info "Restore operation completed!"
