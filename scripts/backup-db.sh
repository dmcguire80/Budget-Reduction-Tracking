#!/bin/bash
#
# Budget Reduction Tracking - Database Backup Script
#
# This script creates compressed backups of the PostgreSQL database
# and implements a retention policy to manage backup storage.
#
# Features:
#   - Compressed backups using gzip
#   - Timestamped filenames
#   - Automatic retention policy (keeps last N days)
#   - Verification of backup integrity
#   - Optional email notifications
#   - Logging
#
# Usage:
#   chmod +x backup-db.sh
#   ./backup-db.sh
#
# Cron job example (daily at 3 AM):
#   0 3 * * * /opt/budget-tracking/scripts/backup-db.sh >> /var/log/budget-backup.log 2>&1
#

set -e  # Exit on error
set -u  # Exit on undefined variable
set -o pipefail  # Catch errors in pipes

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
DB_NAME="${DB_NAME:-budget_tracking}"
DB_USER="${DB_USER:-budget_user}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"
LOG_FILE="$BACKUP_DIR/backup.log"

# Email notification (optional)
ENABLE_EMAIL="${ENABLE_EMAIL:-false}"
EMAIL_TO="${EMAIL_TO:-}"

# Load database credentials if available
if [ -f /root/.db_credentials ]; then
    source /root/.db_credentials
fi

log_info "Starting database backup for $DB_NAME"

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    log_info "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    chmod 750 "$BACKUP_DIR"
fi

# Check disk space
log_info "Checking available disk space..."
AVAILABLE_SPACE=$(df "$BACKUP_DIR" | tail -1 | awk '{print $4}')
REQUIRED_SPACE=102400  # 100MB in KB

if [ "$AVAILABLE_SPACE" -lt "$REQUIRED_SPACE" ]; then
    log_error "Insufficient disk space. Available: ${AVAILABLE_SPACE}KB, Required: ${REQUIRED_SPACE}KB"
    exit 1
fi

log_info "Disk space check passed"

# Perform backup
log_info "Creating backup: $BACKUP_FILE"

if [ -n "${DATABASE_URL:-}" ]; then
    # Use connection string if available
    pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"
else
    # Use individual parameters
    PGPASSWORD="${DB_PASSWORD:-}" pg_dump \
        -h localhost \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        | gzip > "$BACKUP_FILE"
fi

# Verify backup was created
if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Backup file was not created"
    exit 1
fi

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log_info "Backup created successfully: $BACKUP_FILE ($BACKUP_SIZE)"

# Verify backup integrity
log_info "Verifying backup integrity..."
if gzip -t "$BACKUP_FILE"; then
    log_info "Backup integrity verified"
else
    log_error "Backup integrity check failed"
    exit 1
fi

# Set permissions
chmod 600 "$BACKUP_FILE"

# Apply retention policy
log_info "Applying retention policy (keeping last $RETENTION_DAYS days)..."

CUTOFF_DATE=$(date -d "$RETENTION_DAYS days ago" +%Y%m%d 2>/dev/null || date -v -${RETENTION_DAYS}d +%Y%m%d)

DELETED_COUNT=0
for backup in "$BACKUP_DIR"/${DB_NAME}_*.sql.gz; do
    if [ -f "$backup" ]; then
        # Extract date from filename
        BACKUP_DATE=$(basename "$backup" | sed "s/${DB_NAME}_//" | cut -d'_' -f1)

        # Compare dates
        if [ "$BACKUP_DATE" -lt "$CUTOFF_DATE" ]; then
            log_info "Removing old backup: $(basename "$backup")"
            rm -f "$backup"
            ((DELETED_COUNT++))
        fi
    fi
done

if [ "$DELETED_COUNT" -gt 0 ]; then
    log_info "Removed $DELETED_COUNT old backup(s)"
else
    log_info "No old backups to remove"
fi

# List current backups
log_info "Current backups:"
ls -lh "$BACKUP_DIR"/${DB_NAME}_*.sql.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'

# Count total backups
TOTAL_BACKUPS=$(ls -1 "$BACKUP_DIR"/${DB_NAME}_*.sql.gz 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log_info "Total backups: $TOTAL_BACKUPS (Total size: $TOTAL_SIZE)"

# Log to file
echo "$(date '+%Y-%m-%d %H:%M:%S') - Backup completed: $BACKUP_FILE ($BACKUP_SIZE)" >> "$LOG_FILE"

# Send email notification (if enabled)
if [ "$ENABLE_EMAIL" = "true" ] && [ -n "$EMAIL_TO" ]; then
    log_info "Sending email notification..."

    EMAIL_SUBJECT="Database Backup Completed - $DB_NAME"
    EMAIL_BODY="Database backup completed successfully.

Backup Details:
  Database: $DB_NAME
  File: $BACKUP_FILE
  Size: $BACKUP_SIZE
  Timestamp: $TIMESTAMP

Retention Policy:
  Retention Days: $RETENTION_DAYS
  Total Backups: $TOTAL_BACKUPS
  Total Size: $TOTAL_SIZE
  Backups Deleted: $DELETED_COUNT

Server: $(hostname)
"

    # Send email (requires mailutils or mail command)
    if command -v mail &> /dev/null; then
        echo "$EMAIL_BODY" | mail -s "$EMAIL_SUBJECT" "$EMAIL_TO"
        log_info "Email notification sent to $EMAIL_TO"
    else
        log_warn "mail command not found, skipping email notification"
    fi
fi

# Summary
log_info "========================================="
log_info "Backup Summary"
log_info "========================================="
echo "  Database: $DB_NAME"
echo "  Backup File: $BACKUP_FILE"
echo "  Size: $BACKUP_SIZE"
echo "  Total Backups: $TOTAL_BACKUPS"
echo "  Total Size: $TOTAL_SIZE"
echo "  Retention: $RETENTION_DAYS days"
log_info "Backup completed successfully!"

exit 0
