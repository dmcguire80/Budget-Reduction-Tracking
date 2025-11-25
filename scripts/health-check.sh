#!/bin/bash
#
# Budget Reduction Tracking - System Health Check Script
#
# This script performs comprehensive health checks on the application
# and its dependencies. It checks backend API, database, Nginx, system
# resources, and reports overall health status.
#
# Features:
#   - Backend API health endpoint check
#   - PostgreSQL connection and performance
#   - Nginx status and configuration
#   - PM2 process monitoring
#   - Disk space check
#   - Memory usage check
#   - CPU usage check
#   - Log file monitoring
#
# Exit Codes:
#   0 - All checks passed (healthy)
#   1 - One or more checks failed (unhealthy)
#   2 - Critical failure
#
# Usage:
#   chmod +x health-check.sh
#   ./health-check.sh
#
# Cron job example (every 5 minutes):
#   */5 * * * * /opt/budget-tracking/scripts/health-check.sh >> /var/log/health-check.log 2>&1
#

set -u  # Exit on undefined variable

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

log_ok() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Configuration
APP_DIR="/opt/budget-tracking"
BACKEND_PORT="3001"
FRONTEND_PORT="3000"
DB_NAME="${DB_NAME:-budget_tracking}"

# Thresholds
DISK_THRESHOLD=90
MEMORY_THRESHOLD=90
CPU_THRESHOLD=90
LOG_SIZE_THRESHOLD=1048576  # 1GB in KB

# Health status
HEALTH_STATUS=0
CHECKS_PASSED=0
CHECKS_FAILED=0

# Load database credentials if available
if [ -f /root/.db_credentials ]; then
    source /root/.db_credentials
fi

# Function to increment failed checks
fail_check() {
    ((CHECKS_FAILED++))
    HEALTH_STATUS=1
}

# Function to increment passed checks
pass_check() {
    ((CHECKS_PASSED++))
}

log_info "========================================="
log_info "Budget Reduction Tracking - Health Check"
log_info "========================================="
log_info "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 1. Backend API Health Check
echo "1. Backend API Health"
echo "-------------------"
if curl -f -s --max-time 5 http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
    log_ok "Backend API is responding"
    pass_check

    # Get API response time
    RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}\n' http://localhost:$BACKEND_PORT/api/health)
    echo "   Response time: ${RESPONSE_TIME}s"

    if (( $(echo "$RESPONSE_TIME > 1.0" | bc -l) )); then
        log_warn "API response time is slow (>${RESPONSE_TIME}s)"
    fi
else
    log_fail "Backend API is not responding"
    fail_check
fi
echo ""

# 2. PostgreSQL Health Check
echo "2. PostgreSQL Database"
echo "---------------------"
if command -v psql &> /dev/null; then
    # Check if PostgreSQL is running
    if systemctl is-active --quiet postgresql; then
        log_ok "PostgreSQL service is running"
        pass_check

        # Check database connection
        if sudo -u postgres psql -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
            log_ok "Database connection successful"

            # Get database size
            DB_SIZE=$(sudo -u postgres psql -d "$DB_NAME" -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" | tr -d ' ')
            echo "   Database size: $DB_SIZE"

            # Get connection count
            CONN_COUNT=$(sudo -u postgres psql -d "$DB_NAME" -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname='$DB_NAME';" | tr -d ' ')
            echo "   Active connections: $CONN_COUNT"

            # Check for long-running queries
            LONG_QUERIES=$(sudo -u postgres psql -d "$DB_NAME" -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active' AND query_start < NOW() - INTERVAL '5 minutes';" | tr -d ' ')
            if [ "$LONG_QUERIES" -gt 0 ]; then
                log_warn "Found $LONG_QUERIES long-running query/queries"
            fi
        else
            log_fail "Cannot connect to database"
            fail_check
        fi
    else
        log_fail "PostgreSQL service is not running"
        fail_check
    fi
else
    log_warn "PostgreSQL client (psql) not found"
fi
echo ""

# 3. Nginx Health Check
echo "3. Nginx Web Server"
echo "-------------------"
if command -v nginx &> /dev/null; then
    if systemctl is-active --quiet nginx; then
        log_ok "Nginx service is running"
        pass_check

        # Check configuration syntax
        if nginx -t > /dev/null 2>&1; then
            log_ok "Nginx configuration is valid"
        else
            log_fail "Nginx configuration has errors"
            fail_check
        fi

        # Check frontend accessibility
        if curl -f -s --max-time 5 http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
            log_ok "Frontend is accessible"
            pass_check
        else
            log_fail "Frontend is not accessible"
            fail_check
        fi
    else
        log_fail "Nginx service is not running"
        fail_check
    fi
else
    log_warn "Nginx not found"
fi
echo ""

# 4. PM2 Process Health Check
echo "4. PM2 Process Manager"
echo "---------------------"
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "budget-tracking-api"; then
        STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="budget-tracking-api") | .pm2_env.status')

        if [ "$STATUS" = "online" ]; then
            log_ok "PM2 process is online"
            pass_check

            # Get process uptime
            UPTIME=$(pm2 jlist | jq -r '.[] | select(.name=="budget-tracking-api") | .pm2_env.pm_uptime' | xargs -I {} date -d @{} +%s)
            CURRENT_TIME=$(date +%s)
            UPTIME_SECONDS=$((CURRENT_TIME - UPTIME / 1000))
            UPTIME_HOURS=$((UPTIME_SECONDS / 3600))
            echo "   Uptime: ${UPTIME_HOURS} hours"

            # Get restart count
            RESTARTS=$(pm2 jlist | jq -r '.[] | select(.name=="budget-tracking-api") | .pm2_env.restart_time')
            echo "   Restarts: $RESTARTS"

            if [ "$RESTARTS" -gt 10 ]; then
                log_warn "High restart count detected ($RESTARTS)"
            fi

            # Get memory usage
            MEMORY=$(pm2 jlist | jq -r '.[] | select(.name=="budget-tracking-api") | .monit.memory' | awk '{printf "%.0f", $1/1024/1024}')
            echo "   Memory: ${MEMORY}MB"
        else
            log_fail "PM2 process is $STATUS"
            fail_check
        fi
    else
        log_fail "PM2 process 'budget-tracking-api' not found"
        fail_check
    fi
else
    log_warn "PM2 not found"
fi
echo ""

# 5. Disk Space Check
echo "5. Disk Space"
echo "-------------"
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
DISK_AVAILABLE=$(df -h / | tail -1 | awk '{print $4}')

if [ "$DISK_USAGE" -lt "$DISK_THRESHOLD" ]; then
    log_ok "Disk usage: ${DISK_USAGE}% (Available: $DISK_AVAILABLE)"
    pass_check
else
    log_fail "Disk usage: ${DISK_USAGE}% (Available: $DISK_AVAILABLE)"
    log_warn "Disk usage exceeds threshold of ${DISK_THRESHOLD}%"
    fail_check
fi

# Check backup directory
if [ -d "/backups" ]; then
    BACKUP_SIZE=$(du -sh /backups | cut -f1)
    echo "   Backup directory: $BACKUP_SIZE"
fi
echo ""

# 6. Memory Usage Check
echo "6. Memory Usage"
echo "---------------"
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
MEMORY_FREE=$(free -h | grep Mem | awk '{print $4}')

if [ "$MEMORY_USAGE" -lt "$MEMORY_THRESHOLD" ]; then
    log_ok "Memory usage: ${MEMORY_USAGE}% (Free: $MEMORY_FREE)"
    pass_check
else
    log_fail "Memory usage: ${MEMORY_USAGE}% (Free: $MEMORY_FREE)"
    log_warn "Memory usage exceeds threshold of ${MEMORY_THRESHOLD}%"
    fail_check
fi
echo ""

# 7. CPU Usage Check
echo "7. CPU Usage"
echo "------------"
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}' | cut -d'.' -f1)

if [ "$CPU_USAGE" -lt "$CPU_THRESHOLD" ]; then
    log_ok "CPU usage: ${CPU_USAGE}%"
    pass_check
else
    log_fail "CPU usage: ${CPU_USAGE}%"
    log_warn "CPU usage exceeds threshold of ${CPU_THRESHOLD}%"
    fail_check
fi

# Show load average
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | xargs)
echo "   Load average: $LOAD_AVG"
echo ""

# 8. Log File Check
echo "8. Log Files"
echo "------------"
if [ -d "$APP_DIR/logs" ]; then
    # Check backend log size
    if [ -f "$APP_DIR/logs/backend.log" ]; then
        LOG_SIZE=$(du -k "$APP_DIR/logs/backend.log" | cut -f1)
        LOG_SIZE_MB=$((LOG_SIZE / 1024))

        if [ "$LOG_SIZE" -lt "$LOG_SIZE_THRESHOLD" ]; then
            log_ok "Backend log size: ${LOG_SIZE_MB}MB"
        else
            log_warn "Backend log size: ${LOG_SIZE_MB}MB (exceeds 1GB)"
            log_warn "Consider rotating logs"
        fi
    fi

    # Check for recent errors in logs
    if [ -f "$APP_DIR/logs/backend-error.log" ]; then
        RECENT_ERRORS=$(tail -100 "$APP_DIR/logs/backend-error.log" 2>/dev/null | grep -c "ERROR" || echo 0)
        if [ "$RECENT_ERRORS" -gt 0 ]; then
            log_warn "Found $RECENT_ERRORS errors in recent logs"
        else
            log_ok "No recent errors in logs"
        fi
    fi
else
    log_warn "Log directory not found: $APP_DIR/logs"
fi
echo ""

# Summary
echo "========================================="
echo "Health Check Summary"
echo "========================================="
echo "  Checks Passed: ${GREEN}${CHECKS_PASSED}${NC}"
echo "  Checks Failed: ${RED}${CHECKS_FAILED}${NC}"
echo ""

if [ $HEALTH_STATUS -eq 0 ]; then
    log_ok "Overall Status: HEALTHY"
else
    log_fail "Overall Status: UNHEALTHY"
fi

echo ""
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="

exit $HEALTH_STATUS
