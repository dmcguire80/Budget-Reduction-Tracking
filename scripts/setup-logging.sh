#!/bin/bash
#
# Budget Reduction Tracking - Logging Setup Script
#
# This script configures log rotation for all application logs including
# PM2 logs, Nginx logs, and application-specific logs. It ensures logs
# don't consume excessive disk space while maintaining historical data.
#
# Features:
#   - PM2 log rotation configuration
#   - Nginx log rotation
#   - Application log rotation
#   - Configurable retention policies
#   - Compression for archived logs
#   - Proper permissions
#
# Usage:
#   chmod +x setup-logging.sh
#   sudo ./setup-logging.sh
#

set -e  # Exit on error
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

log_step() {
    echo -e "${BLUE}==>${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root or with sudo"
   exit 1
fi

log_info "========================================="
log_info "Budget Reduction Tracking - Logging Setup"
log_info "========================================="
echo ""

# Configuration
APP_DIR="/opt/budget-tracking"
LOG_DIR="$APP_DIR/logs"

# Create log directory if it doesn't exist
log_step "Creating log directories..."
mkdir -p "$LOG_DIR"
mkdir -p /var/log/budget-tracking
chmod 755 "$LOG_DIR"
chmod 755 /var/log/budget-tracking
log_info "Log directories created"
echo ""

# 1. Setup PM2 Log Rotation
log_step "Configuring PM2 log rotation..."

if command -v pm2 &> /dev/null; then
    # Install PM2 log rotate module
    if ! pm2 ls | grep -q "pm2-logrotate"; then
        log_info "Installing pm2-logrotate module..."
        pm2 install pm2-logrotate

        # Configure pm2-logrotate
        log_info "Configuring pm2-logrotate..."
        pm2 set pm2-logrotate:max_size 10M
        pm2 set pm2-logrotate:retain 7
        pm2 set pm2-logrotate:compress true
        pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
        pm2 set pm2-logrotate:workerInterval 30
        pm2 set pm2-logrotate:rotateInterval '0 0 * * *'
        pm2 set pm2-logrotate:rotateModule true

        log_info "PM2 log rotation configured successfully"
    else
        log_info "pm2-logrotate already installed"
    fi
else
    log_warn "PM2 not found, skipping PM2 log rotation setup"
fi
echo ""

# 2. Setup Nginx Log Rotation
log_step "Configuring Nginx log rotation..."

cat > /etc/logrotate.d/budget-tracking-nginx <<'EOF'
/var/log/nginx/budget-tracking-*.log {
    daily
    rotate 14
    missingok
    notifempty
    compress
    delaycompress
    dateext
    dateformat -%Y%m%d
    create 0640 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
EOF

chmod 644 /etc/logrotate.d/budget-tracking-nginx
log_info "Nginx log rotation configured"
echo ""

# 3. Setup Application Log Rotation
log_step "Configuring application log rotation..."

cat > /etc/logrotate.d/budget-tracking-app <<EOF
$LOG_DIR/*.log /var/log/budget-tracking/*.log {
    daily
    rotate 14
    missingok
    notifempty
    compress
    delaycompress
    dateext
    dateformat -%Y%m%d
    create 0644 root root
    sharedscripts
    postrotate
        # Reload PM2 logs if running
        if command -v pm2 > /dev/null 2>&1; then
            pm2 reloadLogs
        fi
    endscript
}
EOF

chmod 644 /etc/logrotate.d/budget-tracking-app
log_info "Application log rotation configured"
echo ""

# 4. Test log rotation configuration
log_step "Testing log rotation configuration..."

log_info "Testing Nginx log rotation..."
if logrotate -d /etc/logrotate.d/budget-tracking-nginx > /dev/null 2>&1; then
    log_info "Nginx log rotation test passed"
else
    log_warn "Nginx log rotation test failed"
fi

log_info "Testing application log rotation..."
if logrotate -d /etc/logrotate.d/budget-tracking-app > /dev/null 2>&1; then
    log_info "Application log rotation test passed"
else
    log_warn "Application log rotation test failed"
fi
echo ""

# 5. Create logging utilities
log_step "Creating logging utilities..."

# Create log viewer script
cat > "$APP_DIR/scripts/view-logs.sh" <<'EOF'
#!/bin/bash
#
# Log Viewer Utility
# Quick access to various application logs
#

case "${1:-}" in
    backend|api)
        echo "Viewing backend logs (Ctrl+C to exit)..."
        tail -f /opt/budget-tracking/logs/backend.log
        ;;
    pm2)
        echo "Viewing PM2 logs (Ctrl+C to exit)..."
        pm2 logs budget-tracking-api
        ;;
    nginx-access)
        echo "Viewing Nginx access logs (Ctrl+C to exit)..."
        tail -f /var/log/nginx/budget-tracking-access.log
        ;;
    nginx-error)
        echo "Viewing Nginx error logs (Ctrl+C to exit)..."
        tail -f /var/log/nginx/budget-tracking-error.log
        ;;
    all)
        echo "Viewing all logs (Ctrl+C to exit)..."
        tail -f /opt/budget-tracking/logs/*.log /var/log/nginx/budget-tracking-*.log
        ;;
    *)
        echo "Budget Reduction Tracking - Log Viewer"
        echo ""
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  backend        - View backend application logs"
        echo "  pm2            - View PM2 process logs"
        echo "  nginx-access   - View Nginx access logs"
        echo "  nginx-error    - View Nginx error logs"
        echo "  all            - View all logs combined"
        echo ""
        echo "Examples:"
        echo "  $0 backend"
        echo "  $0 pm2"
        echo "  $0 nginx-error"
        ;;
esac
EOF

chmod +x "$APP_DIR/scripts/view-logs.sh"
log_info "Created log viewer utility: $APP_DIR/scripts/view-logs.sh"
echo ""

# 6. Create log cleanup script
log_step "Creating log cleanup script..."

cat > "$APP_DIR/scripts/cleanup-logs.sh" <<'EOF'
#!/bin/bash
#
# Log Cleanup Utility
# Manual log cleanup for troubleshooting or maintenance
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_warn "This script should be run as root or with sudo"
fi

log_info "Budget Reduction Tracking - Log Cleanup"
echo ""
log_warn "This will clear all application logs (backups will be preserved)"
echo ""

read -p "Are you sure you want to continue? (type 'yes' to proceed): " CONFIRMATION

if [ "$CONFIRMATION" != "yes" ]; then
    log_info "Log cleanup cancelled"
    exit 0
fi

# Clear PM2 logs
if command -v pm2 > /dev/null 2>&1; then
    log_info "Flushing PM2 logs..."
    pm2 flush
fi

# Truncate application logs
log_info "Truncating application logs..."
find /opt/budget-tracking/logs -name "*.log" -type f -exec truncate -s 0 {} \;

# Truncate Nginx logs
log_info "Truncating Nginx logs..."
find /var/log/nginx -name "budget-tracking-*.log" -type f -exec truncate -s 0 {} \;

# Remove old compressed logs
log_info "Removing old compressed logs..."
find /opt/budget-tracking/logs -name "*.log.*.gz" -type f -delete
find /var/log/nginx -name "budget-tracking-*.log.*.gz" -type f -delete

log_info "Log cleanup completed successfully"
EOF

chmod +x "$APP_DIR/scripts/cleanup-logs.sh"
log_info "Created log cleanup utility: $APP_DIR/scripts/cleanup-logs.sh"
echo ""

# 7. Setup systemd journal limits (optional)
log_step "Configuring systemd journal limits..."

if [ -f /etc/systemd/journald.conf ]; then
    # Backup original config
    if [ ! -f /etc/systemd/journald.conf.bak ]; then
        cp /etc/systemd/journald.conf /etc/systemd/journald.conf.bak
    fi

    # Configure journal limits
    cat > /etc/systemd/journald.conf.d/budget-tracking.conf <<EOF
[Journal]
SystemMaxUse=500M
SystemMaxFileSize=50M
RuntimeMaxUse=100M
RuntimeMaxFileSize=10M
MaxRetentionSec=2week
EOF

    systemctl restart systemd-journald
    log_info "Systemd journal limits configured"
else
    log_warn "systemd-journald not found, skipping journal configuration"
fi
echo ""

# Summary
log_info "========================================="
log_info "Logging Configuration Summary"
log_info "========================================="
echo ""
log_info "Log Rotation:"
echo "  PM2 Logs:        10MB max, 7 days retention, compressed"
echo "  Nginx Logs:      Daily rotation, 14 days retention, compressed"
echo "  App Logs:        Daily rotation, 14 days retention, compressed"
echo ""
log_info "Log Locations:"
echo "  Application:     $LOG_DIR/"
echo "  Nginx:           /var/log/nginx/budget-tracking-*.log"
echo "  System:          /var/log/budget-tracking/"
echo ""
log_info "Utilities:"
echo "  View logs:       $APP_DIR/scripts/view-logs.sh [option]"
echo "  Cleanup logs:    $APP_DIR/scripts/cleanup-logs.sh"
echo ""
log_info "Configuration Files:"
echo "  Nginx rotation:  /etc/logrotate.d/budget-tracking-nginx"
echo "  App rotation:    /etc/logrotate.d/budget-tracking-app"
echo "  Journal limits:  /etc/systemd/journald.conf.d/budget-tracking.conf"
echo ""
log_info "Useful Commands:"
echo "  Test rotation:   logrotate -d /etc/logrotate.d/budget-tracking-app"
echo "  Force rotation:  logrotate -f /etc/logrotate.d/budget-tracking-app"
echo "  PM2 logs:        pm2 logs budget-tracking-api"
echo "  View backend:    $APP_DIR/scripts/view-logs.sh backend"
echo ""
log_info "Logging setup completed successfully!"
