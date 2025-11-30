#!/bin/bash
#
# Budget Reduction Tracking - One-Liner Installer
#
# Usage:
#   bash -c "$(curl -fsSL https://raw.githubusercontent.com/dmcguire80/Budget-Reduction-Tracking/main/install.sh)"
#
# Or with options:
#   curl -fsSL https://raw.githubusercontent.com/dmcguire80/Budget-Reduction-Tracking/main/install.sh | bash -s -- [OPTIONS]
#
# Options:
#   --dev          Install in development mode
#   --production   Install in production mode (default)
#   --skip-db      Skip PostgreSQL setup
#   --help         Show this help message
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
REPO_URL="https://github.com/dmcguire80/Budget-Reduction-Tracking.git"
INSTALL_DIR="/opt/budget-tracking"
MODE="production"
SKIP_DB=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dev)
            MODE="development"
            shift
            ;;
        --production)
            MODE="production"
            shift
            ;;
        --skip-db)
            SKIP_DB=true
            shift
            ;;
        --help)
            head -n 16 "$0" | tail -n 14
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

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
    echo -e "\n${BLUE}==>${NC} ${GREEN}$1${NC}\n"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root or with sudo"
   exit 1
fi

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VER=$VERSION_ID
else
    log_error "Cannot detect OS. /etc/os-release not found."
    exit 1
fi

log_step "Budget Reduction Tracking Installer"
log_info "Operating System: $OS $VER"
log_info "Installation Mode: $MODE"
log_info "Installation Directory: $INSTALL_DIR"

# Verify OS compatibility
case $OS in
    ubuntu)
        if [[ "$VER" != "22.04" && "$VER" != "24.04" ]]; then
            log_warn "This script is tested on Ubuntu 22.04/24.04. You're running $VER."
            read -p "Continue anyway? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
        ;;
    debian)
        if [[ "$VER" != "11" && "$VER" != "12" ]]; then
            log_warn "This script is tested on Debian 11/12. You're running $VER."
            read -p "Continue anyway? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
        ;;
    *)
        log_error "Unsupported OS: $OS. This script supports Ubuntu and Debian."
        exit 1
        ;;
esac

# Update system
log_step "Updating system packages"
apt update && apt upgrade -y

# Install curl first if not present (needed for this script to be downloaded)
if ! command -v curl &> /dev/null; then
    log_info "Installing curl..."
    apt install -y curl
fi

# Install dependencies
log_step "Installing system dependencies"
apt install -y wget git build-essential ca-certificates gnupg lsb-release \
    vim htop net-tools ufw unzip

# Install Node.js 20 LTS
log_step "Installing Node.js 20 LTS"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
log_info "Node.js: $(node --version)"
log_info "npm: $(npm --version)"

# Install PM2
log_step "Installing PM2 process manager"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
log_info "PM2: $(pm2 --version)"

# Install PostgreSQL
if [ "$SKIP_DB" = false ]; then
    log_step "Installing PostgreSQL 16"
    if ! command -v psql &> /dev/null; then
        sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
        wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
        apt update
        apt install -y postgresql-16 postgresql-contrib-16
        systemctl start postgresql
        systemctl enable postgresql
    fi
    log_info "PostgreSQL: $(psql --version | head -1)"
fi

# Install Nginx
log_step "Installing Nginx"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
fi
log_info "Nginx: $(nginx -v 2>&1)"

# Configure PostgreSQL database
if [ "$SKIP_DB" = false ]; then
    log_step "Configuring PostgreSQL database"
    DB_NAME="budget_tracking"
    DB_USER="budget_user"
    DB_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 24)

    sudo -u postgres psql <<EOF
CREATE DATABASE ${DB_NAME};
CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};
EOF

    # Save credentials
    mkdir -p /root/.budget-tracking
    cat > /root/.budget-tracking/credentials <<EOF
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
EOF
    chmod 600 /root/.budget-tracking/credentials

    log_info "Database credentials saved to /root/.budget-tracking/credentials"
fi

# Clone repository
log_step "Cloning application repository"
if [ -d "$INSTALL_DIR" ]; then
    log_warn "Directory $INSTALL_DIR already exists. Backing up..."
    mv "$INSTALL_DIR" "${INSTALL_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
fi

git clone "$REPO_URL" "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Install backend dependencies
log_step "Installing backend dependencies"
cd "$INSTALL_DIR/backend"
npm install

# Configure backend environment
log_step "Configuring backend environment"
if [ "$SKIP_DB" = false ]; then
    source /root/.budget-tracking/credentials
fi

# Set CORS origin based on mode and environment
if [ "$MODE" = "production" ]; then
    # Use container IP if available (Proxmox deployment)
    if [ -n "$CONTAINER_IP" ]; then
        CORS_ORIGIN="http://$CONTAINER_IP:3000"
        log_info "Container deployment - CORS origin: $CORS_ORIGIN"
    else
        CORS_ORIGIN="https://budget.yourdomain.com"
    fi
else
    CORS_ORIGIN="http://localhost:5173"
fi

cat > "$INSTALL_DIR/backend/.env" <<EOF
NODE_ENV=${MODE}
PORT=3001
DATABASE_URL=${DATABASE_URL:-postgresql://user:pass@localhost:5432/budget_tracking}
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=${CORS_ORIGIN}
EOF

# Run database migrations
if [ "$SKIP_DB" = false ]; then
    log_step "Running database migrations"
    npx prisma migrate deploy
    npx prisma generate
fi

# Build backend
log_step "Building backend"
npm run build

# Install frontend dependencies
log_step "Installing frontend dependencies"
cd "$INSTALL_DIR/frontend"
npm install

# Configure frontend environment
log_step "Configuring frontend environment"

# Set API URL based on mode and environment
if [ "$MODE" = "production" ]; then
    # Use container IP if available (Proxmox deployment)
    if [ -n "$CONTAINER_IP" ]; then
        VITE_API_URL="http://$CONTAINER_IP:3001"
        log_info "Container deployment - using IP: $CONTAINER_IP"
    else
        VITE_API_URL="https://budget.yourdomain.com/api"
    fi
else
    VITE_API_URL="http://localhost:3001"
fi

cat > "$INSTALL_DIR/frontend/.env" <<EOF
VITE_API_URL=${VITE_API_URL}
VITE_APP_NAME=Budget Reduction Tracker
EOF

# Build frontend
log_step "Building frontend"
npm run build

# Configure Nginx
log_step "Configuring Nginx"
cat > /etc/nginx/sites-available/budget-tracking <<'EOF'
server {
    listen 3000;
    server_name _;

    # Frontend
    location / {
        root /opt/budget-tracking/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/budget-tracking /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Start backend with PM2
log_step "Starting backend with PM2"
cd "$INSTALL_DIR/backend"
pm2 start dist/index.js --name budget-tracking-api
pm2 save
pm2 startup systemd -u root --hp /root

# Configure firewall
log_step "Configuring firewall"
ufw --force enable
ufw allow 22/tcp
ufw allow 3000/tcp
ufw allow 3001/tcp

# Create backup script
log_step "Creating backup script"
mkdir -p /backups
cat > /usr/local/bin/backup-budget-tracking <<'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U budget_user budget_tracking | gzip > "$BACKUP_DIR/budget_tracking_$DATE.sql.gz"
find "$BACKUP_DIR" -name "budget_tracking_*.sql.gz" -mtime +7 -delete
EOF
chmod +x /usr/local/bin/backup-budget-tracking

# Setup cron for backups
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/backup-budget-tracking") | crontab -

# Print summary
log_step "Installation Complete!"
echo ""
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "  Budget Reduction Tracking v1.0.0"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
log_info "✅ Installation Directory: $INSTALL_DIR"
log_info "✅ Backend API: http://localhost:3001"
log_info "✅ Frontend: http://localhost:3000"
log_info "✅ Database: PostgreSQL (budget_tracking)"
log_info "✅ Process Manager: PM2 (budget-tracking-api)"
echo ""
log_info "Configuration Files:"
echo "   • Backend: $INSTALL_DIR/backend/.env"
echo "   • Frontend: $INSTALL_DIR/frontend/.env"
echo "   • Database: /root/.budget-tracking/credentials"
echo "   • Nginx: /etc/nginx/sites-available/budget-tracking"
echo ""
log_info "Useful Commands:"
echo "   • Check status: pm2 status"
echo "   • View logs: pm2 logs budget-tracking-api"
echo "   • Restart: pm2 restart budget-tracking-api"
echo "   • Database backup: backup-budget-tracking"
echo ""
log_warn "NEXT STEPS:"
echo "   1. Update CORS_ORIGIN in backend/.env with your domain"
echo "   2. Update VITE_API_URL in frontend/.env with your API URL"
echo "   3. Configure Nginx Proxy Manager for external access"
echo "   4. Set up SSL certificate"
echo "   5. Test the application: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "Installation completed successfully! 🎉"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
