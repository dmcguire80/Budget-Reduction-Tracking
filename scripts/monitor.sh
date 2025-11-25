#!/bin/bash
#
# Budget Reduction Tracking - System Monitoring Script
#
# This script monitors system resources, application health, and sends
# alerts when thresholds are exceeded. It can be run manually or via cron.
#
# Features:
#   - CPU, memory, and disk monitoring
#   - Application health checks
#   - Service status monitoring
#   - Alert notifications (email or webhook)
#   - Detailed reporting
#   - Historical data logging
#
# Usage:
#   chmod +x monitor.sh
#   ./monitor.sh [options]
#
# Options:
#   --email EMAIL     Send alerts to EMAIL
#   --webhook URL     Send alerts to webhook URL
#   --quiet           Suppress normal output
#   --verbose         Show detailed information
#
# Cron job example (every 15 minutes):
#   */15 * * * * /opt/budget-tracking/scripts/monitor.sh --email admin@example.com >> /var/log/monitoring.log 2>&1
#

set -u  # Exit on undefined variable

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default configuration
QUIET=false
VERBOSE=false
EMAIL_TO=""
WEBHOOK_URL=""
MONITORING_LOG="/var/log/budget-tracking-monitor.log"

# Thresholds
CPU_THRESHOLD=${CPU_THRESHOLD:-80}
MEMORY_THRESHOLD=${MEMORY_THRESHOLD:-85}
DISK_THRESHOLD=${DISK_THRESHOLD:-85}
LOAD_THRESHOLD=${LOAD_THRESHOLD:-4.0}

# Alert flags
ALERTS=()

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --email)
            EMAIL_TO="$2"
            shift 2
            ;;
        --webhook)
            WEBHOOK_URL="$2"
            shift 2
            ;;
        --quiet)
            QUIET=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Logging functions
log_info() {
    if [ "$QUIET" = false ]; then
        echo -e "${GREEN}[INFO]${NC} $1"
    fi
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_metric() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${CYAN}[METRIC]${NC} $1"
    fi
}

# Add alert
add_alert() {
    ALERTS+=("$1")
    log_error "$1"
}

# Log to file
log_to_file() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$MONITORING_LOG"
}

log_info "========================================="
log_info "Budget Reduction Tracking - Monitoring"
log_info "========================================="
log_info "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 1. CPU Monitoring
log_info "CPU Usage"
log_info "---------"

CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{printf "%.0f", 100 - $1}')
LOAD_AVG_1=$(uptime | awk -F'load average:' '{print $2}' | awk -F, '{print $1}' | xargs)
LOAD_AVG_5=$(uptime | awk -F'load average:' '{print $2}' | awk -F, '{print $2}' | xargs)
LOAD_AVG_15=$(uptime | awk -F'load average:' '{print $2}' | awk -F, '{print $3}' | xargs)

log_metric "CPU Usage: ${CPU_USAGE}%"
log_metric "Load Average (1/5/15): $LOAD_AVG_1 / $LOAD_AVG_5 / $LOAD_AVG_15"

if [ "$CPU_USAGE" -ge "$CPU_THRESHOLD" ]; then
    add_alert "High CPU usage detected: ${CPU_USAGE}% (threshold: ${CPU_THRESHOLD}%)"
fi

# Check load average (compare with number of CPU cores)
CPU_CORES=$(nproc)
LOAD_PER_CORE=$(echo "$LOAD_AVG_1 / $CPU_CORES" | bc -l | awk '{printf "%.2f", $1}')

if (( $(echo "$LOAD_AVG_1 > $LOAD_THRESHOLD" | bc -l) )); then
    add_alert "High load average detected: $LOAD_AVG_1 (threshold: $LOAD_THRESHOLD)"
fi

log_to_file "CPU: ${CPU_USAGE}%, Load: $LOAD_AVG_1"
echo ""

# 2. Memory Monitoring
log_info "Memory Usage"
log_info "------------"

MEMORY_TOTAL=$(free -h | grep Mem | awk '{print $2}')
MEMORY_USED=$(free -h | grep Mem | awk '{print $3}')
MEMORY_FREE=$(free -h | grep Mem | awk '{print $4}')
MEMORY_PERCENT=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')

log_metric "Total: $MEMORY_TOTAL, Used: $MEMORY_USED, Free: $MEMORY_FREE (${MEMORY_PERCENT}%)"

if [ "$MEMORY_PERCENT" -ge "$MEMORY_THRESHOLD" ]; then
    add_alert "High memory usage detected: ${MEMORY_PERCENT}% (threshold: ${MEMORY_THRESHOLD}%)"
fi

# Check swap usage
SWAP_TOTAL=$(free -h | grep Swap | awk '{print $2}')
SWAP_USED=$(free -h | grep Swap | awk '{print $3}')

if [ "$SWAP_USED" != "0B" ]; then
    log_warn "Swap is being used: $SWAP_USED of $SWAP_TOTAL"
fi

log_to_file "Memory: ${MEMORY_PERCENT}%, Swap: $SWAP_USED"
echo ""

# 3. Disk Space Monitoring
log_info "Disk Space"
log_info "----------"

DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
DISK_TOTAL=$(df -h / | tail -1 | awk '{print $2}')
DISK_USED=$(df -h / | tail -1 | awk '{print $3}')
DISK_AVAIL=$(df -h / | tail -1 | awk '{print $4}')

log_metric "Total: $DISK_TOTAL, Used: $DISK_USED, Available: $DISK_AVAIL (${DISK_USAGE}%)"

if [ "$DISK_USAGE" -ge "$DISK_THRESHOLD" ]; then
    add_alert "High disk usage detected: ${DISK_USAGE}% (threshold: ${DISK_THRESHOLD}%)"
fi

# Check specific directories
if [ -d "/backups" ]; then
    BACKUP_SIZE=$(du -sh /backups 2>/dev/null | cut -f1)
    log_metric "Backup directory: $BACKUP_SIZE"
fi

if [ -d "/opt/budget-tracking/logs" ]; then
    LOG_SIZE=$(du -sh /opt/budget-tracking/logs 2>/dev/null | cut -f1)
    log_metric "Log directory: $LOG_SIZE"
fi

log_to_file "Disk: ${DISK_USAGE}%, Available: $DISK_AVAIL"
echo ""

# 4. Application Health Monitoring
log_info "Application Health"
log_info "------------------"

# Backend API
if curl -f -s --max-time 5 http://localhost:3001/api/health > /dev/null 2>&1; then
    log_metric "Backend API: Online"

    # Measure response time
    RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}\n' http://localhost:3001/api/health)
    log_metric "API Response Time: ${RESPONSE_TIME}s"

    if (( $(echo "$RESPONSE_TIME > 2.0" | bc -l) )); then
        add_alert "Slow API response time: ${RESPONSE_TIME}s"
    fi
else
    add_alert "Backend API is not responding"
fi

# Frontend
if curl -f -s --max-time 5 http://localhost:3000 > /dev/null 2>&1; then
    log_metric "Frontend: Online"
else
    add_alert "Frontend is not accessible"
fi

# Database
if command -v psql &> /dev/null; then
    if sudo -u postgres psql -d budget_tracking -c "SELECT 1;" > /dev/null 2>&1; then
        log_metric "Database: Online"

        # Check connection count
        CONN_COUNT=$(sudo -u postgres psql -d budget_tracking -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname='budget_tracking';" 2>/dev/null | tr -d ' ')
        log_metric "Database Connections: $CONN_COUNT"

        # Check database size
        DB_SIZE=$(sudo -u postgres psql -d budget_tracking -t -c "SELECT pg_size_pretty(pg_database_size('budget_tracking'));" 2>/dev/null | tr -d ' ')
        log_metric "Database Size: $DB_SIZE"
    else
        add_alert "Database connection failed"
    fi
fi

log_to_file "Backend: Online, Response: ${RESPONSE_TIME:-N/A}s"
echo ""

# 5. Service Status Monitoring
log_info "Service Status"
log_info "--------------"

# PostgreSQL
if systemctl is-active --quiet postgresql; then
    log_metric "PostgreSQL: Active"
else
    add_alert "PostgreSQL service is not running"
fi

# Nginx
if systemctl is-active --quiet nginx; then
    log_metric "Nginx: Active"
else
    add_alert "Nginx service is not running"
fi

# PM2
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "budget-tracking-api"; then
        PM2_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="budget-tracking-api") | .pm2_env.status')

        if [ "$PM2_STATUS" = "online" ]; then
            log_metric "PM2 Process: Online"

            # Check restart count
            RESTARTS=$(pm2 jlist | jq -r '.[] | select(.name=="budget-tracking-api") | .pm2_env.restart_time')
            log_metric "PM2 Restarts: $RESTARTS"

            if [ "$RESTARTS" -gt 20 ]; then
                add_alert "High PM2 restart count: $RESTARTS"
            fi
        else
            add_alert "PM2 process status: $PM2_STATUS"
        fi
    else
        add_alert "PM2 process 'budget-tracking-api' not found"
    fi
fi

echo ""

# 6. Network Monitoring
log_info "Network Status"
log_info "--------------"

# Check if ports are listening
if netstat -tuln | grep -q ":3001 "; then
    log_metric "Backend port 3001: Listening"
else
    add_alert "Backend port 3001 is not listening"
fi

if netstat -tuln | grep -q ":3000 "; then
    log_metric "Frontend port 3000: Listening"
else
    add_alert "Frontend port 3000 is not listening"
fi

# Check network connectivity
if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
    log_metric "Internet Connectivity: OK"
else
    add_alert "Internet connectivity issue detected"
fi

echo ""

# Summary
log_info "========================================="
log_info "Monitoring Summary"
log_info "========================================="
echo "  CPU Usage:       ${CPU_USAGE}%"
echo "  Memory Usage:    ${MEMORY_PERCENT}%"
echo "  Disk Usage:      ${DISK_USAGE}%"
echo "  Load Average:    $LOAD_AVG_1"
echo "  Alerts:          ${#ALERTS[@]}"

if [ ${#ALERTS[@]} -gt 0 ]; then
    echo ""
    log_error "Active Alerts:"
    for alert in "${ALERTS[@]}"; do
        echo "  - $alert"
    done
fi

echo ""

# Send notifications if there are alerts
if [ ${#ALERTS[@]} -gt 0 ]; then
    # Send email notification
    if [ -n "$EMAIL_TO" ] && command -v mail &> /dev/null; then
        log_info "Sending email notification to $EMAIL_TO..."

        EMAIL_SUBJECT="[ALERT] Budget Tracking Monitoring - ${#ALERTS[@]} Alert(s)"
        EMAIL_BODY="Budget Reduction Tracking - Monitoring Alert

Timestamp: $(date '+%Y-%m-%d %H:%M:%S')
Server: $(hostname)

System Metrics:
  CPU Usage:       ${CPU_USAGE}%
  Memory Usage:    ${MEMORY_PERCENT}%
  Disk Usage:      ${DISK_USAGE}%
  Load Average:    $LOAD_AVG_1

Active Alerts (${#ALERTS[@]}):
$(printf '  - %s\n' "${ALERTS[@]}")

Please investigate and take appropriate action.
"

        echo "$EMAIL_BODY" | mail -s "$EMAIL_SUBJECT" "$EMAIL_TO"
        log_info "Email notification sent"
    fi

    # Send webhook notification
    if [ -n "$WEBHOOK_URL" ]; then
        log_info "Sending webhook notification..."

        WEBHOOK_PAYLOAD=$(cat <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "server": "$(hostname)",
  "alert_count": ${#ALERTS[@]},
  "metrics": {
    "cpu": ${CPU_USAGE},
    "memory": ${MEMORY_PERCENT},
    "disk": ${DISK_USAGE},
    "load": ${LOAD_AVG_1}
  },
  "alerts": $(printf '%s\n' "${ALERTS[@]}" | jq -R . | jq -s .)
}
EOF
)

        curl -X POST \
            -H "Content-Type: application/json" \
            -d "$WEBHOOK_PAYLOAD" \
            "$WEBHOOK_URL" > /dev/null 2>&1 || log_warn "Webhook notification failed"

        log_info "Webhook notification sent"
    fi

    log_to_file "ALERT: ${#ALERTS[@]} alert(s) detected"
    exit 1
else
    log_info "All systems operational"
    log_to_file "All systems operational"
    exit 0
fi
