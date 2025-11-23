#!/bin/bash
#
# Budget Reduction Tracking - LXC Container Setup Script
#
# This script automates the setup of a Proxmox LXC container for the
# Budget Reduction Tracking application. It installs all required packages,
# configures services, and prepares the container for application deployment.
#
# Usage: Run this script inside a fresh Ubuntu 22.04 or Debian 12 LXC container
#   chmod +x setup-lxc.sh
#   sudo ./setup-lxc.sh
#
# Requirements:
#   - Ubuntu 22.04 LTS or Debian 12 LXC container
#   - Root or sudo access
#   - Internet connectivity
#

set -e  # Exit on error
set -u  # Exit on undefined variable

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root or with sudo"
   exit 1
fi

log_info "Starting LXC container setup for Budget Reduction Tracking..."

# Update system packages
log_info "Updating system packages..."
apt update
apt upgrade -y

# Install essential packages
log_info "Installing essential packages..."
apt install -y \
    curl \
    wget \
    git \
    build-essential \
    ca-certificates \
    gnupg \
    lsb-release \
    vim \
    nano \
    htop \
    net-tools \
    ufw \
    unzip

# Install Node.js 20 LTS
log_info "Installing Node.js 20 LTS..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    log_info "Node.js $(node --version) installed successfully"
else
    log_info "Node.js $(node --version) already installed"
fi

# Verify npm is installed
if ! command -v npm &> /dev/null; then
    log_error "npm not found. Installing npm..."
    apt install -y npm
fi

log_info "npm version: $(npm --version)"

# Install PM2 globally for process management
log_info "Installing PM2 process manager..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    log_info "PM2 installed successfully"
else
    log_info "PM2 already installed: $(pm2 --version)"
fi

# Install PostgreSQL 16
log_info "Installing PostgreSQL 16..."
if ! command -v psql &> /dev/null; then
    # Add PostgreSQL APT repository
    sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
    apt update
    apt install -y postgresql-16 postgresql-contrib-16
    log_info "PostgreSQL 16 installed successfully"
else
    log_info "PostgreSQL already installed"
fi

# Start and enable PostgreSQL
log_info "Starting PostgreSQL service..."
systemctl start postgresql
systemctl enable postgresql
systemctl status postgresql --no-pager

# Install Nginx
log_info "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    log_info "Nginx installed successfully"
else
    log_info "Nginx already installed: $(nginx -v 2>&1)"
fi

# Start and enable Nginx
log_info "Starting Nginx service..."
systemctl start nginx
systemctl enable nginx

# Configure PostgreSQL
log_info "Configuring PostgreSQL database..."
DB_NAME="budget_tracking"
DB_USER="budget_user"
DB_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 24)

# Create database and user
sudo -u postgres psql <<EOF
-- Create database
CREATE DATABASE ${DB_NAME};

-- Create user with password
CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};

-- Grant schema privileges (PostgreSQL 15+)
\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};
EOF

log_info "PostgreSQL database configured successfully"
log_info "Database credentials saved to /root/.db_credentials"

# Save database credentials securely
cat > /root/.db_credentials <<EOF
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
EOF

chmod 600 /root/.db_credentials

# Configure firewall (UFW)
log_info "Configuring firewall..."
ufw --force enable
ufw allow 22/tcp    # SSH
ufw allow 3000/tcp  # Frontend (Nginx)
ufw allow 3001/tcp  # Backend API (for internal access)
ufw status

# Create application directory
log_info "Creating application directory..."
mkdir -p /opt/budget-tracking
mkdir -p /opt/budget-tracking/logs
mkdir -p /backups

# Set up PM2 to start on boot
log_info "Configuring PM2 startup..."
pm2 startup systemd -u root --hp /root
pm2 save

# Create systemd reload helper
log_info "Creating systemd reload helper..."
systemctl daemon-reload

# System optimization for Node.js
log_info "Applying system optimizations..."
cat >> /etc/security/limits.conf <<EOF

# Increase file descriptor limits for Node.js
root soft nofile 65536
root hard nofile 65536
* soft nofile 65536
* hard nofile 65536
EOF

# Print summary
log_info "========================================="
log_info "LXC Container Setup Complete!"
log_info "========================================="
echo ""
log_info "Installed Software:"
echo "  - Node.js: $(node --version)"
echo "  - npm: $(npm --version)"
echo "  - PM2: $(pm2 --version)"
echo "  - PostgreSQL: $(psql --version | head -1)"
echo "  - Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo ""
log_info "Database Configuration:"
echo "  - Database Name: ${DB_NAME}"
echo "  - Database User: ${DB_USER}"
echo "  - Connection String: postgresql://${DB_USER}:****@localhost:5432/${DB_NAME}"
echo "  - Credentials saved to: /root/.db_credentials"
echo ""
log_info "Directories Created:"
echo "  - Application: /opt/budget-tracking"
echo "  - Logs: /opt/budget-tracking/logs"
echo "  - Backups: /backups"
echo ""
log_info "Services Status:"
systemctl status postgresql --no-pager | head -3
systemctl status nginx --no-pager | head -3
echo ""
log_warn "IMPORTANT: Save the database password from /root/.db_credentials"
log_warn "NEXT STEPS:"
echo "  1. Clone the application repository to /opt/budget-tracking"
echo "  2. Configure environment variables using the database credentials"
echo "  3. Run the deployment script (deploy-lxc.sh)"
echo ""
log_info "Setup completed successfully!"
