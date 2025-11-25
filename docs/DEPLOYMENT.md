# Budget Reduction Tracking - Deployment Guide

This comprehensive guide covers the complete deployment of the Budget Reduction Tracking application on a Proxmox LXC container with external access through Nginx Proxy Manager, Cloudflare, and UniFi Gateway.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Proxmox LXC Setup](#proxmox-lxc-setup)
4. [System Package Installation](#system-package-installation)
5. [Application Deployment](#application-deployment)
6. [Nginx Proxy Manager Configuration](#nginx-proxy-manager-configuration)
7. [Cloudflare Configuration](#cloudflare-configuration)
8. [UniFi Network Configuration](#unifi-network-configuration)
9. [Backup and Restore Procedures](#backup-and-restore-procedures)
10. [Monitoring and Maintenance](#monitoring-and-maintenance)
11. [Update and Rollback Procedures](#update-and-rollback-procedures)
12. [Troubleshooting](#troubleshooting)

---

## Overview

### Architecture

The Budget Reduction Tracking application is deployed using a multi-layer architecture for security, performance, and reliability:

```
Internet Users
    ↓
Cloudflare (DNS + CDN + DDoS Protection + SSL)
    ↓
Your Public IP (Home/Office Network)
    ↓
UniFi Gateway/Firewall (Port Forwarding: 80, 443)
    ↓
Nginx Proxy Manager (Proxmox LXC - Reverse Proxy + SSL Termination)
    ↓
Budget Tracking App (Proxmox LXC - Port 3000)
    ├── Nginx (Frontend Server)
    ├── Node.js Backend (Port 3001)
    └── PostgreSQL Database (Port 5432 - localhost only)
```

### Technology Stack

- **Container**: Proxmox LXC (Ubuntu 22.04 or Debian 12)
- **Frontend**: React + Vite (served by Nginx on port 3000)
- **Backend**: Node.js 20 + Express (port 3001)
- **Database**: PostgreSQL 16
- **Process Manager**: PM2 or systemd
- **Web Server**: Nginx
- **Reverse Proxy**: Nginx Proxy Manager
- **DNS/CDN**: Cloudflare
- **Network**: UniFi Gateway

---

## Prerequisites

Before beginning deployment, ensure you have:

### Required Access

- [ ] Proxmox VE server access (root or sudo)
- [ ] Domain name registered
- [ ] Cloudflare account (free tier is sufficient)
- [ ] UniFi controller access
- [ ] Nginx Proxy Manager installed (separate LXC)

### Network Information Needed

- [ ] Internal network subnet (e.g., 192.168.1.0/24)
- [ ] Available static IP for Budget Tracking LXC
- [ ] NPM LXC internal IP address
- [ ] Public IP address of your network
- [ ] Router/Gateway IP address

### Skills Required

- Basic Linux command line
- Understanding of networking concepts
- Familiarity with Proxmox
- Basic Git knowledge

---

## Proxmox LXC Setup

### Step 1: Create LXC Container

#### Using Proxmox Web Interface

1. Log in to Proxmox web interface
2. Select your node in the left sidebar
3. Click **"Create CT"** button

#### Container Configuration

**General Tab:**
```
Hostname: budget-tracking
Password: [Set strong password]
SSH Public Key: [Optional]
```

**Template Tab:**
```
Template: ubuntu-22.04-standard_22.04-1_amd64.tar.zst
(or debian-12-standard_12.x-x_amd64.tar.zst)
```

**Root Disk Tab:**
```
Storage: local-lvm (or your preferred storage)
Disk size: 20 GB (minimum)
```

**CPU Tab:**
```
Cores: 2
(or 4 for better performance)
```

**Memory Tab:**
```
Memory (RAM): 4096 MB
Swap: 512 MB
```

**Network Tab:**
```
Bridge: vmbr0
IPv4: Static
IPv4 Address: 192.168.1.100/24 (choose an available IP)
Gateway: 192.168.1.1 (your router IP)
IPv6: SLAAC (or disable)
Firewall: Enabled (optional)
```

**DNS Tab:**
```
DNS domain: local (optional)
DNS servers: 8.8.8.8 1.1.1.1 (or your preferred DNS)
```

4. Click **"Finish"** to create the container

#### Using Proxmox CLI (Alternative)

```bash
# SSH into Proxmox host
ssh root@proxmox-ip

# Create LXC container
pct create 100 local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
  --hostname budget-tracking \
  --memory 4096 \
  --swap 512 \
  --cores 2 \
  --net0 name=eth0,bridge=vmbr0,ip=192.168.1.100/24,gw=192.168.1.1 \
  --storage local-lvm \
  --rootfs local-lvm:20 \
  --nameserver 8.8.8.8 \
  --searchdomain local \
  --password

# Note: Replace 100 with your desired VMID
```

### Step 2: Configure LXC Features (Optional)

For enhanced capabilities, enable nesting:

```bash
# In Proxmox shell
pct set 100 -features nesting=1
```

### Step 3: Start the Container

```bash
# Start container
pct start 100

# Check status
pct status 100

# Enter container console
pct enter 100
```

### Step 4: Initial Container Configuration

Once inside the container:

```bash
# Update package lists
apt update && apt upgrade -y

# Set timezone
timedatectl set-timezone America/New_York

# Verify network connectivity
ping -c 4 8.8.8.8
ping -c 4 google.com

# Check IP configuration
ip addr show
```

---

## System Package Installation

### Automated Installation

The easiest way to install all required packages is using the provided setup script:

```bash
# Inside the LXC container
cd /tmp

# Download the setup script
wget https://raw.githubusercontent.com/dmcguire80/Budget-Reduction-Tracking/main/lxc/setup-lxc.sh

# Make executable
chmod +x setup-lxc.sh

# Run the script
./setup-lxc.sh
```

The script will install:
- Node.js 20 LTS
- PostgreSQL 16
- Nginx
- PM2
- Build tools
- Configure PostgreSQL database
- Set up firewall rules

### Manual Installation (Alternative)

If you prefer manual installation or the script fails:

#### 1. Install Essential Packages

```bash
apt update
apt install -y \
    curl \
    wget \
    git \
    build-essential \
    ca-certificates \
    gnupg \
    lsb-release \
    vim \
    htop \
    net-tools \
    ufw
```

#### 2. Install Node.js 20 LTS

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Node.js
apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x
```

#### 3. Install PostgreSQL 16

```bash
# Add PostgreSQL APT repository
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

# Import repository signing key
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -

# Update package list
apt update

# Install PostgreSQL 16
apt install -y postgresql-16 postgresql-contrib-16

# Start and enable service
systemctl start postgresql
systemctl enable postgresql

# Verify installation
sudo -u postgres psql --version
```

#### 4. Install Nginx

```bash
# Install Nginx
apt install -y nginx

# Start and enable service
systemctl start nginx
systemctl enable nginx

# Verify installation
nginx -v
```

#### 5. Install PM2 Process Manager

```bash
# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version

# Configure PM2 to start on boot
pm2 startup systemd
```

#### 6. Configure Firewall

```bash
# Enable UFW
ufw --force enable

# Allow SSH
ufw allow 22/tcp

# Allow frontend (Nginx)
ufw allow 3000/tcp

# Allow backend API (internal access)
ufw allow 3001/tcp

# Check status
ufw status
```

### Post-Installation Configuration

#### Create PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside PostgreSQL prompt:
CREATE DATABASE budget_tracking;
CREATE USER budget_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE budget_tracking TO budget_user;

# Connect to database and grant schema privileges
\c budget_tracking
GRANT ALL ON SCHEMA public TO budget_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO budget_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO budget_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO budget_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO budget_user;

\q
```

**IMPORTANT**: Save your database credentials securely. You'll need them for the application configuration.

---

## Application Deployment

### Automated Deployment

Use the provided deployment script for quick setup:

```bash
# Clone the repository
cd /opt
git clone https://github.com/dmcguire80/Budget-Reduction-Tracking.git budget-tracking

# Run deployment script
cd budget-tracking
chmod +x scripts/deploy-lxc.sh
./scripts/deploy-lxc.sh
```

### Manual Deployment

For more control or troubleshooting:

#### 1. Clone Repository

```bash
# Create application directory
mkdir -p /opt/budget-tracking

# Clone repository
git clone https://github.com/dmcguire80/Budget-Reduction-Tracking.git /opt/budget-tracking

# Navigate to directory
cd /opt/budget-tracking
```

#### 2. Configure Backend

```bash
cd /opt/budget-tracking/backend

# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

**Backend .env Configuration:**

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://budget_user:your_secure_password@localhost:5432/budget_tracking
JWT_SECRET=[Generate with: openssl rand -base64 64]
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=[Generate with: openssl rand -base64 64]
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=https://budget-tracking.yourdomain.com
LOG_LEVEL=info
```

**Generate Secure Secrets:**

```bash
# Generate JWT secret
openssl rand -base64 64 | tr -d '\n'

# Generate refresh token secret (must be different)
openssl rand -base64 64 | tr -d '\n'
```

**Install Dependencies:**

```bash
# Install production dependencies
npm ci --omit=dev

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build backend
npm run build
```

#### 3. Configure Frontend

```bash
cd /opt/budget-tracking/frontend

# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

**Frontend .env Configuration:**

```env
VITE_API_URL=https://budget-tracking.yourdomain.com
VITE_APP_NAME=Budget Reduction Tracker
```

**Install Dependencies and Build:**

```bash
# Install production dependencies
npm ci --omit=dev

# Build frontend for production
npm run build

# Verify build directory exists
ls -la dist/
```

#### 4. Configure Nginx

```bash
# Copy Nginx configuration
cp /opt/budget-tracking/lxc/nginx-site.conf /etc/nginx/sites-available/budget-tracking

# Create symbolic link
ln -s /etc/nginx/sites-available/budget-tracking /etc/nginx/sites-enabled/budget-tracking

# Remove default site (optional)
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

#### 5. Start Backend with PM2

```bash
cd /opt/budget-tracking/backend

# Copy PM2 ecosystem config
cp ../lxc/pm2-ecosystem.config.js .

# Start application with PM2
pm2 start pm2-ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Configure PM2 to start on boot
pm2 startup systemd

# Verify status
pm2 status
pm2 logs budget-tracking-api
```

#### 6. Verify Deployment

```bash
# Check backend health
curl http://localhost:3001/api/health

# Check frontend
curl http://localhost:3000

# Check PM2 status
pm2 status

# Check Nginx status
systemctl status nginx

# Check logs
pm2 logs budget-tracking-api --lines 50
tail -f /var/log/nginx/budget-tracking-access.log
```

---

## Nginx Proxy Manager Configuration

### Prerequisites

- NPM installed in a separate LXC container on Proxmox
- NPM accessible via web interface (usually http://npm-ip:81)
- Budget Tracking LXC running and accessible

### Step 1: Access NPM Web Interface

```bash
# Open browser to NPM admin interface
http://[NPM-LXC-IP]:81

# Default credentials (change immediately after first login):
Email: admin@example.com
Password: changeme
```

### Step 2: Create Proxy Host

1. Click **"Hosts"** → **"Proxy Hosts"**
2. Click **"Add Proxy Host"**

**Details Tab:**

```
Domain Names: budget-tracking.yourdomain.com
Scheme: http
Forward Hostname/IP: [Budget-Tracking-LXC-IP]  # e.g., 192.168.1.100
Forward Port: 3000

☑ Cache Assets
☑ Block Common Exploits
☑ Websockets Support
Access List: None (or create custom list)
```

**SSL Tab:**

```
SSL Certificate: Request a new SSL Certificate

☑ Force SSL
☑ HTTP/2 Support
☑ HSTS Enabled
☑ HSTS Subdomains

Email Address for Let's Encrypt: your-email@example.com
☑ I Agree to the Let's Encrypt Terms of Service
```

3. Click **"Save"**

NPM will automatically request an SSL certificate from Let's Encrypt. This may take 1-2 minutes.

### Step 3: Advanced Configuration (Optional)

Click the **"Advanced"** tab and add custom Nginx directives:

```nginx
# Increase upload size limit
client_max_body_size 10M;

# Increase timeouts
proxy_connect_timeout 600;
proxy_send_timeout 600;
proxy_read_timeout 600;
send_timeout 600;

# Additional security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

# Cache static assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Step 4: Verify NPM Setup

1. Check SSL certificate status (should show green checkmark)
2. Test access from external network (use mobile data or different network)
3. Verify SSL certificate is valid:
   - Go to https://budget-tracking.yourdomain.com
   - Check for SSL lock icon in browser
   - Click lock icon to view certificate details

**Troubleshooting NPM:**

```bash
# SSH into NPM LXC container
pct enter [NPM-VMID]

# Check Nginx logs
tail -f /data/logs/proxy-host-*.log

# Check NPM logs
docker logs -f nginx-proxy-manager

# Restart NPM
docker restart nginx-proxy-manager
```

---

## Cloudflare Configuration

### Step 1: Add Domain to Cloudflare

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **"Add a Site"**
3. Enter your domain name (e.g., `yourdomain.com`)
4. Select **Free** plan
5. Click **"Continue"**

### Step 2: Update Nameservers

Cloudflare will provide two nameservers (e.g., `ns1.cloudflare.com` and `ns2.cloudflare.com`).

**Update at your domain registrar:**

1. Log in to your domain registrar (GoDaddy, Namecheap, Google Domains, etc.)
2. Find DNS/Nameserver settings
3. Replace existing nameservers with Cloudflare's nameservers
4. Save changes
5. Wait for propagation (can take up to 24 hours, usually 15-30 minutes)

**Verify nameserver update:**

```bash
# Check nameservers
dig NS yourdomain.com

# Check DNS propagation
# Visit: https://www.whatsmydns.net/
```

### Step 3: Create DNS Record

Once nameservers are active:

1. Go to **DNS** → **Records** in Cloudflare dashboard
2. Click **"Add record"**

**DNS Record Configuration:**

```
Type: A
Name: budget-tracking (or @ for root domain)
IPv4 address: [Your-Public-IP]
Proxy status: ✓ Proxied (Orange Cloud)
TTL: Auto
```

**Finding Your Public IP:**

```bash
curl ifconfig.me
# or
curl icanhazip.com
# or
# Visit: https://www.whatismyip.com/
```

3. Click **"Save"**

### Step 4: Configure SSL/TLS Settings

**SSL/TLS Overview:**

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode: **"Full (strict)"**

**SSL/TLS Edge Certificates:**

1. Go to **SSL/TLS** → **Edge Certificates**
2. Configure:
   - ☑ **Always Use HTTPS**: On
   - ☑ **Automatic HTTPS Rewrites**: On
   - **Minimum TLS Version**: TLS 1.2
   - ☑ **TLS 1.3**: Enabled
   - ☑ **Opportunistic Encryption**: On

### Step 5: Configure Security Settings

**Security Settings:**

1. Go to **Security** → **Settings**
2. Configure:
   ```
   Security Level: Medium
   Challenge Passage: 30 minutes
   Browser Integrity Check: ✓ On
   Privacy Pass Support: ✓ On
   ```

**WAF (Web Application Firewall):**

1. Go to **Security** → **WAF**
2. Enable managed rulesets:
   - ☑ Cloudflare Managed Ruleset
   - ☑ Cloudflare OWASP Core Ruleset

**Bot Fight Mode (Free tier):**

1. Go to **Security** → **Bots**
2. ☑ Enable Bot Fight Mode

### Step 6: Configure Speed/Performance Settings

**Auto Minify:**

1. Go to **Speed** → **Optimization**
2. Enable:
   - ☑ JavaScript
   - ☑ CSS
   - ☑ HTML

**Brotli Compression:**

- ☑ **Brotli**: On

**Caching:**

1. Go to **Caching** → **Configuration**
2. Settings:
   ```
   Caching Level: Standard
   Browser Cache TTL: Respect Existing Headers
   ```

### Step 7: Create Page Rules (Optional)

Page rules allow custom configuration per URL pattern:

1. Go to **Rules** → **Page Rules**
2. Click **"Create Page Rule"**

**Example Rule:**

```
URL pattern: budget-tracking.yourdomain.com/*

Settings:
  SSL: Full (strict)
  Security Level: Medium
  Cache Level: Standard
  Browser Cache TTL: Respect Existing Headers
  Always Use HTTPS: On
```

---

## UniFi Network Configuration

### Step 1: Access UniFi Controller

1. Log in to UniFi controller
   - Cloud: https://unifi.ui.com
   - Local: https://[controller-ip]:8443
2. Select your network site

### Step 2: Create Port Forwarding Rules

Navigate to: **Settings** → **Routing** → **Port Forwarding**

#### Rule 1: HTTP (Port 80)

```
Name: NPM-HTTP
Enabled: ✓
From: Any
Port: 80
Forward IP: [NPM-LXC-INTERNAL-IP]  # e.g., 192.168.1.50
Forward Port: 80
Protocol: TCP
Logging: ✓ (optional)
```

#### Rule 2: HTTPS (Port 443)

```
Name: NPM-HTTPS
Enabled: ✓
From: Any
Port: 443
Forward IP: [NPM-LXC-INTERNAL-IP]  # e.g., 192.168.1.50
Forward Port: 443
Protocol: TCP
Logging: ✓ (optional)
```

Click **"Apply Changes"** after creating each rule.

### Step 3: Configure Firewall Rules (Optional - Advanced)

For enhanced security, restrict access to only Cloudflare IP ranges:

Navigate to: **Settings** → **Security** → **Firewall**

**Create Firewall Rule Group: Allow Cloudflare IPs**

1. Create new rule: **"Allow Cloudflare to NPM"**
2. Add Cloudflare IPv4 ranges as sources
3. Destination: NPM LXC IP
4. Ports: 80, 443
5. Action: Accept

**Cloudflare IPv4 Ranges (update from [Cloudflare IPs](https://www.cloudflare.com/ips/)):**

```
173.245.48.0/20
103.21.244.0/22
103.22.200.0/22
103.31.4.0/22
141.101.64.0/18
108.162.192.0/18
190.93.240.0/20
188.114.96.0/20
197.234.240.0/22
198.41.128.0/17
162.158.0.0/15
104.16.0.0/13
104.24.0.0/14
172.64.0.0/13
131.0.72.0/22
```

**Block All Other Traffic to NPM (Optional):**

Create a rule to block all other inbound traffic to NPM on ports 80/443:

```
Rule: Block Non-Cloudflare Traffic
From: Any
To: [NPM-LXC-IP]
Ports: 80, 443
Action: Drop
Position: Below Cloudflare allow rule
```

### Step 4: Local DNS Entry (Optional - Recommended)

Create local DNS record for internal access:

Navigate to: **Settings** → **Networks** → **[Your LAN]**

**DNS Settings:**

1. Enable **DHCP DNS Server**
2. Add custom DNS record:
   ```
   Hostname: budget-tracking.yourdomain.com
   IP Address: [NPM-LXC-IP]  # Internal IP
   ```

This allows devices on your local network to access the application directly via NPM without going through the internet.

### Step 5: Verify UniFi Configuration

**Test port forwarding from external network:**

```bash
# From a device outside your network (mobile data)
curl -I http://[YOUR-PUBLIC-IP]

# Should redirect or respond (depends on NPM config)
```

**Test internal access:**

```bash
# From device on local network
curl -I http://budget-tracking.yourdomain.com

# Should connect to NPM
```

**Check UniFi logs:**

1. Go to **UniFi Controller** → **Insights** → **Events**
2. Filter by "Port Forward" to see traffic
3. Verify traffic is being forwarded to NPM

---

## Backup and Restore Procedures

### LXC Container Backup (Proxmox)

#### Create Manual Backup

**Via Proxmox Web Interface:**

1. Select the Budget Tracking container
2. Click **"Backup"** button
3. Click **"Backup now"**
4. Settings:
   ```
   Storage: local or backup storage
   Mode: Snapshot
   Compression: ZSTD
   ```
5. Click **"Backup"**

**Via Proxmox CLI:**

```bash
# Create backup
vzdump 100 --storage local --mode snapshot --compress zstd

# List backups
ls -lh /var/lib/vz/dump/
```

#### Automated LXC Backups

**Configure scheduled backups:**

1. In Proxmox web interface: **Datacenter** → **Backup**
2. Click **"Add"**
3. Configure:
   ```
   Node: [your-node]
   Storage: local (or backup storage)
   Schedule: Daily at 2:00 AM
   Selection mode: All
   Mode: Snapshot
   Compression: ZSTD
   Retention: Keep last 7
   ```
4. Click **"Create"**

### Database Backup

#### Manual Database Backup

```bash
# Inside Budget Tracking LXC
cd /opt/budget-tracking

# Run backup script
./scripts/backup-db.sh

# Verify backup was created
ls -lh /backups/
```

#### Automated Database Backups

**Configure cron job:**

```bash
# Edit crontab
crontab -e

# Add backup job (daily at 3 AM)
0 3 * * * /opt/budget-tracking/scripts/backup-db.sh >> /var/log/budget-backup.log 2>&1

# Save and exit
```

**Verify cron job:**

```bash
# List cron jobs
crontab -l

# Test backup script manually
/opt/budget-tracking/scripts/backup-db.sh

# Check backup log
tail -f /var/log/budget-backup.log
```

### Restore Procedures

#### Restore from Database Backup

```bash
# Inside Budget Tracking LXC
cd /opt/budget-tracking

# Run restore script (interactive)
./scripts/restore-db.sh

# Or specify backup file
./scripts/restore-db.sh /backups/budget_tracking_20231123_030000.sql.gz
```

#### Restore from LXC Backup

**Via Proxmox Web Interface:**

1. Select backup in **Backups** view
2. Click **"Restore"**
3. Choose:
   - Restore to new VMID (recommended for testing)
   - Or overwrite existing container
4. Click **"Restore"**

**Via Proxmox CLI:**

```bash
# List backups
ls -lh /var/lib/vz/dump/

# Restore to new container
pzrestore /var/lib/vz/dump/vzdump-lxc-100-2023_11_23-03_00_00.tar.zst 101

# Or restore to existing container (DANGER: overwrites current)
# pzrestore /var/lib/vz/dump/vzdump-lxc-100-2023_11_23-03_00_00.tar.zst 100
```

### Application Files Backup

**Backup important files:**

```bash
# Create backup directory
mkdir -p /backups/app-files

# Backup environment files
cp /opt/budget-tracking/backend/.env /backups/app-files/backend-env-$(date +%Y%m%d)
cp /opt/budget-tracking/frontend/.env /backups/app-files/frontend-env-$(date +%Y%m%d)

# Backup logs (optional)
tar -czf /backups/app-files/logs-$(date +%Y%m%d).tar.gz /opt/budget-tracking/logs/

# Set permissions
chmod 600 /backups/app-files/*
```

---

## Monitoring and Maintenance

### PM2 Monitoring

**View PM2 status:**

```bash
# Process status
pm2 status

# Real-time monitoring
pm2 monit

# View logs
pm2 logs budget-tracking-api

# View specific logs
pm2 logs budget-tracking-api --lines 100
pm2 logs budget-tracking-api --err  # Errors only
pm2 logs budget-tracking-api --out  # Output only

# Clear logs
pm2 flush
```

**PM2 process information:**

```bash
# Detailed process info
pm2 describe budget-tracking-api

# Process metrics
pm2 show budget-tracking-api
```

### System Resource Monitoring

**CPU and Memory:**

```bash
# Real-time monitoring
htop

# Simple process list
top

# Memory usage
free -h

# Disk usage
df -h

# Disk usage by directory
du -sh /opt/budget-tracking/*
du -sh /backups/*
```

**Network monitoring:**

```bash
# Active connections
netstat -tuln

# Check listening ports
ss -tuln | grep LISTEN

# Network statistics
netstat -s
```

### PostgreSQL Health

**Database monitoring:**

```bash
# Connect to database
sudo -u postgres psql -d budget_tracking

# Inside psql:
# Check database size
SELECT pg_size_pretty(pg_database_size('budget_tracking'));

# Check table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'budget_tracking';

# Check long-running queries
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '5 minutes';

\q
```

### Nginx Monitoring

**Nginx logs:**

```bash
# Access log
tail -f /var/log/nginx/budget-tracking-access.log

# Error log
tail -f /var/log/nginx/budget-tracking-error.log

# Count requests
wc -l /var/log/nginx/budget-tracking-access.log

# View recent errors
tail -100 /var/log/nginx/budget-tracking-error.log
```

**Nginx status:**

```bash
# Service status
systemctl status nginx

# Test configuration
nginx -t

# Reload configuration
systemctl reload nginx

# Restart service
systemctl restart nginx
```

### Log Management

**Setup log rotation:**

```bash
# Run logging setup script
cd /opt/budget-tracking
./scripts/setup-logging.sh
```

**View logs:**

```bash
# Use log viewer utility
cd /opt/budget-tracking
./scripts/view-logs.sh backend     # Backend logs
./scripts/view-logs.sh pm2         # PM2 logs
./scripts/view-logs.sh nginx-error # Nginx errors
./scripts/view-logs.sh all         # All logs
```

**Cleanup old logs:**

```bash
# Manual log cleanup
./scripts/cleanup-logs.sh
```

### Health Checks

**Run health check script:**

```bash
# Full health check
cd /opt/budget-tracking
./scripts/health-check.sh

# View last exit code (0 = healthy, 1 = unhealthy)
echo $?
```

**Automated health monitoring:**

```bash
# Add to crontab (every 15 minutes)
crontab -e

# Add line:
*/15 * * * * /opt/budget-tracking/scripts/monitor.sh --email admin@example.com >> /var/log/monitoring.log 2>&1
```

### Database Maintenance

**Run VACUUM and ANALYZE:**

```bash
# Connect to database
sudo -u postgres psql -d budget_tracking

# Full vacuum (recovers disk space)
VACUUM FULL;

# Analyze (updates statistics)
ANALYZE;

# Or combined
VACUUM FULL ANALYZE;

\q
```

**Reindex database:**

```bash
# Reindex all tables (improves query performance)
sudo -u postgres psql -d budget_tracking -c "REINDEX DATABASE budget_tracking;"
```

---

## Update and Rollback Procedures

### Safe Update Process

The recommended way to update the application:

```bash
# Inside Budget Tracking LXC
cd /opt/budget-tracking

# Run update script
./scripts/update-app.sh

# Or update from specific branch
./scripts/update-app.sh main
```

The update script will:
1. Create database backup
2. Pull latest code
3. Install new dependencies
4. Run migrations
5. Build frontend and backend
6. Restart services with zero-downtime
7. Verify health
8. Rollback automatically if it fails

### Manual Update Process

For more control:

#### 1. Create Backup

```bash
# Create database backup
./scripts/backup-db.sh

# Note current commit
cd /opt/budget-tracking
git log -1 --oneline
```

#### 2. Pull Latest Code

```bash
# Fetch and pull
git fetch origin
git pull origin main

# Or checkout specific version
git checkout v1.2.0
```

#### 3. Update Backend

```bash
cd /opt/budget-tracking/backend

# Install dependencies
npm ci --omit=dev

# Run migrations
npx prisma migrate deploy

# Rebuild
npm run build
```

#### 4. Update Frontend

```bash
cd /opt/budget-tracking/frontend

# Install dependencies
npm ci --omit=dev

# Rebuild
npm run build
```

#### 5. Restart Services

```bash
# Restart PM2 with zero-downtime
pm2 reload budget-tracking-api

# Or restart
pm2 restart budget-tracking-api

# Reload Nginx
systemctl reload nginx
```

#### 6. Verify Update

```bash
# Check API health
curl http://localhost:3001/api/health

# Check frontend
curl http://localhost:3000

# Check PM2 status
pm2 status

# Monitor logs
pm2 logs budget-tracking-api --lines 50
```

### Rollback Procedure

If an update causes issues:

#### Rollback Code

```bash
cd /opt/budget-tracking

# View commit history
git log --oneline -10

# Rollback to previous commit
git checkout [PREVIOUS_COMMIT_HASH]

# Example:
git checkout abc123f

# Rebuild
cd backend && npm run build
cd ../frontend && npm run build

# Restart services
pm2 restart budget-tracking-api
systemctl reload nginx
```

#### Rollback Database

```bash
# Only if database migration caused issues
cd /opt/budget-tracking

# Restore from backup
./scripts/restore-db.sh /backups/budget_tracking_pre-update_*.sql.gz
```

### Testing After Updates

**Test checklist:**

```bash
# 1. Backend API
curl http://localhost:3001/api/health
# Expected: {"status":"ok"}

# 2. Frontend
curl -I http://localhost:3000
# Expected: HTTP/1.1 200 OK

# 3. Database connection
sudo -u postgres psql -d budget_tracking -c "SELECT 1;"
# Expected: 1 row returned

# 4. PM2 status
pm2 status
# Expected: budget-tracking-api online

# 5. Check logs for errors
pm2 logs budget-tracking-api --lines 50 | grep -i error
tail -50 /var/log/nginx/budget-tracking-error.log
```

**Functional testing:**

1. Open application in browser
2. Test login
3. Test creating/viewing accounts
4. Test adding transactions
5. Verify charts display correctly

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Backend API Not Responding

**Symptoms:**
- `curl http://localhost:3001/api/health` fails
- NPM shows 502 Bad Gateway
- Frontend can't connect to API

**Diagnosis:**

```bash
# Check if backend is running
pm2 status

# Check backend logs
pm2 logs budget-tracking-api --err

# Check if port 3001 is listening
netstat -tuln | grep 3001

# Check backend process
ps aux | grep node
```

**Solutions:**

```bash
# Restart backend
pm2 restart budget-tracking-api

# If still failing, check configuration
cd /opt/budget-tracking/backend
cat .env  # Verify configuration

# Check database connection
psql $DATABASE_URL -c "SELECT 1;"

# Rebuild and restart
npm run build
pm2 restart budget-tracking-api
```

#### Issue: Frontend Not Loading

**Symptoms:**
- `curl http://localhost:3000` fails
- NPM shows 502 Bad Gateway
- Blank page or 404 errors

**Diagnosis:**

```bash
# Check Nginx status
systemctl status nginx

# Check Nginx error logs
tail -50 /var/log/nginx/budget-tracking-error.log

# Check if frontend files exist
ls -la /opt/budget-tracking/frontend/dist/

# Check Nginx configuration
nginx -t
```

**Solutions:**

```bash
# Rebuild frontend
cd /opt/budget-tracking/frontend
npm run build

# Restart Nginx
systemctl restart nginx

# Check Nginx configuration
cat /etc/nginx/sites-available/budget-tracking

# Test Nginx serves files
curl http://localhost:3000/index.html
```

#### Issue: Database Connection Failed

**Symptoms:**
- Backend logs show database connection errors
- "ECONNREFUSED" errors
- Prisma errors

**Diagnosis:**

```bash
# Check PostgreSQL status
systemctl status postgresql

# Check PostgreSQL logs
tail -50 /var/log/postgresql/postgresql-16-main.log

# Test database connection
sudo -u postgres psql -d budget_tracking -c "SELECT 1;"

# Verify database user
sudo -u postgres psql -c "\du"
```

**Solutions:**

```bash
# Start PostgreSQL if stopped
systemctl start postgresql

# Verify database exists
sudo -u postgres psql -l | grep budget_tracking

# Verify user permissions
sudo -u postgres psql -d budget_tracking -c "SELECT * FROM pg_user WHERE usename = 'budget_user';"

# Check DATABASE_URL in .env
cat /opt/budget-tracking/backend/.env | grep DATABASE_URL

# Test connection with psql
psql "$DATABASE_URL" -c "SELECT 1;"
```

#### Issue: SSL Certificate Error

**Symptoms:**
- Browser shows SSL warning
- "Certificate not valid" error
- NPM shows SSL error

**Diagnosis:**

```bash
# Check SSL certificate in NPM
# Go to NPM UI → SSL Certificates

# Test SSL certificate
openssl s_client -connect budget-tracking.yourdomain.com:443

# Check domain DNS
dig budget-tracking.yourdomain.com
```

**Solutions:**

In NPM:
1. Go to Proxy Hosts
2. Edit budget-tracking proxy host
3. SSL tab → Request New Certificate
4. Or use existing certificate
5. Ensure Force SSL is enabled

Check Cloudflare:
1. SSL/TLS → Overview
2. Ensure "Full (strict)" mode
3. Edge Certificates → Check status

#### Issue: CORS Error

**Symptoms:**
- Browser console shows CORS error
- "Access-Control-Allow-Origin" error
- API calls fail from frontend

**Diagnosis:**

```bash
# Check backend CORS configuration
cat /opt/budget-tracking/backend/.env | grep CORS_ORIGIN

# Test CORS headers
curl -H "Origin: https://budget-tracking.yourdomain.com" \
  -I http://localhost:3001/api/health
```

**Solutions:**

```bash
# Update CORS_ORIGIN in backend .env
cd /opt/budget-tracking/backend
nano .env

# Add your domain:
CORS_ORIGIN=https://budget-tracking.yourdomain.com

# Or multiple origins:
CORS_ORIGIN=https://budget-tracking.yourdomain.com,http://localhost:5173

# Restart backend
pm2 restart budget-tracking-api
```

#### Issue: High Memory Usage

**Symptoms:**
- PM2 shows high memory usage
- System slow or unresponsive
- OOM (Out of Memory) errors

**Diagnosis:**

```bash
# Check memory usage
free -h

# Check PM2 process memory
pm2 status

# Check top processes
htop

# Check logs for memory errors
dmesg | grep -i memory
```

**Solutions:**

```bash
# Restart PM2 process
pm2 restart budget-tracking-api

# Set memory limit in PM2
pm2 delete budget-tracking-api
pm2 start dist/index.js --name budget-tracking-api --max-memory-restart 500M

# Increase LXC container memory (in Proxmox)
# Resources → Memory → Increase to 6GB or 8GB

# Check for memory leaks in application
pm2 monit
```

#### Issue: Port Forwarding Not Working

**Symptoms:**
- External access fails
- Works internally but not externally
- NPM not accessible from internet

**Diagnosis:**

```bash
# From external network (mobile data):
curl -I http://[YOUR-PUBLIC-IP]

# Check UniFi port forwarding rules
# Go to UniFi Controller → Settings → Routing → Port Forwarding

# Check if ports are open
# Use online tool: https://www.yougetsignal.com/tools/open-ports/
```

**Solutions:**

In UniFi Controller:
1. Verify port forwarding rules exist (80, 443)
2. Check Forward IP matches NPM LXC IP
3. Ensure rules are enabled
4. Check firewall rules aren't blocking

Test connectivity:
```bash
# From outside network
telnet [YOUR-PUBLIC-IP] 80
telnet [YOUR-PUBLIC-IP] 443
```

#### Issue: PM2 Process Keeps Restarting

**Symptoms:**
- PM2 shows high restart count
- Application unstable
- Logs show repeated startup

**Diagnosis:**

```bash
# Check restart count
pm2 status

# View detailed process info
pm2 describe budget-tracking-api

# Check logs for errors
pm2 logs budget-tracking-api --err --lines 100
```

**Solutions:**

```bash
# Check for application errors
pm2 logs budget-tracking-api --lines 200

# Common issues:
# - Database connection
# - Port already in use
# - Missing environment variables
# - Syntax errors

# Verify .env file
cat /opt/budget-tracking/backend/.env

# Test application manually
cd /opt/budget-tracking/backend
node dist/index.js

# If working, restart PM2
pm2 restart budget-tracking-api
pm2 save
```

### Log Analysis

**Finding errors:**

```bash
# Backend errors
pm2 logs budget-tracking-api --err | grep -i "error\|exception\|failed"

# Nginx errors
grep -i "error" /var/log/nginx/budget-tracking-error.log

# PostgreSQL errors
sudo grep -i "error\|fatal" /var/log/postgresql/postgresql-16-main.log

# System logs
journalctl -xe | grep -i "error\|failed"
```

**Log locations:**

```
Backend:
  - PM2: ~/.pm2/logs/budget-tracking-api-*.log
  - App: /opt/budget-tracking/logs/backend.log

Nginx:
  - Access: /var/log/nginx/budget-tracking-access.log
  - Error: /var/log/nginx/budget-tracking-error.log

PostgreSQL:
  - /var/log/postgresql/postgresql-16-main.log

System:
  - journalctl -u budget-tracking-api
```

### Performance Issues

**Slow API responses:**

```bash
# Check response time
time curl http://localhost:3001/api/health

# Check database queries
sudo -u postgres psql -d budget_tracking -c "
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;
"

# Enable query logging temporarily
# Edit postgresql.conf
sudo nano /etc/postgresql/16/main/postgresql.conf
# Set: log_statement = 'all'
sudo systemctl reload postgresql
```

**High CPU usage:**

```bash
# Identify CPU-intensive processes
top -o %CPU

# Check PM2 process
pm2 monit

# Profile Node.js app (advanced)
pm2 start app.js --node-args="--prof"
```

### Getting Help

**Collect diagnostic information:**

```bash
# Create diagnostic report
cat > /tmp/diagnostic-report.txt <<EOF
=== System Information ===
$(uname -a)
$(lsb_release -a)

=== Service Status ===
PM2: $(pm2 status)
Nginx: $(systemctl status nginx --no-pager | head -5)
PostgreSQL: $(systemctl status postgresql --no-pager | head -5)

=== Resource Usage ===
$(free -h)
$(df -h)

=== Recent Logs ===
Backend (last 20 lines):
$(pm2 logs budget-tracking-api --lines 20 --nostream)

Nginx Errors (last 20 lines):
$(tail -20 /var/log/nginx/budget-tracking-error.log)

=== Configuration ===
NODE_ENV: $(grep NODE_ENV /opt/budget-tracking/backend/.env)
PORT: $(grep PORT /opt/budget-tracking/backend/.env)
EOF

cat /tmp/diagnostic-report.txt
```

**Support resources:**

- Project Repository: https://github.com/dmcguire80/Budget-Reduction-Tracking
- Proxmox Documentation: https://pve.proxmox.com/wiki/
- Nginx Proxy Manager: https://nginxproxymanager.com/
- Cloudflare Docs: https://developers.cloudflare.com/
- UniFi Community: https://community.ui.com/

---

## Summary Checklist

### Initial Deployment

- [ ] Proxmox LXC container created with correct resources
- [ ] LXC container network configured with static IP
- [ ] System packages installed (Node.js, PostgreSQL, Nginx, PM2)
- [ ] PostgreSQL database created and configured
- [ ] Application repository cloned to /opt/budget-tracking
- [ ] Backend .env configured with secure secrets
- [ ] Frontend .env configured with correct API URL
- [ ] Database migrations completed
- [ ] Backend built and running via PM2
- [ ] Frontend built and served by Nginx
- [ ] All services running and healthy

### External Access

- [ ] Domain added to Cloudflare
- [ ] Nameservers updated and propagated
- [ ] DNS A record created (proxied)
- [ ] Cloudflare SSL/TLS set to "Full (strict)"
- [ ] Cloudflare security and performance configured
- [ ] UniFi port forwarding rules created (80, 443 → NPM)
- [ ] NPM proxy host created for application
- [ ] NPM SSL certificate obtained (Let's Encrypt)
- [ ] Application accessible via https://budget-tracking.yourdomain.com
- [ ] SSL certificate valid and trusted

### Backup and Monitoring

- [ ] Automated LXC backups configured in Proxmox
- [ ] Database backup script tested
- [ ] Automated database backups configured (cron)
- [ ] Restore procedures tested
- [ ] Log rotation configured
- [ ] Health check script tested
- [ ] Monitoring script configured (optional)
- [ ] Alert notifications configured (optional)

### Security

- [ ] Strong, unique JWT secrets generated
- [ ] Database password changed from default
- [ ] All .env files have permissions 600
- [ ] UFW firewall enabled and configured
- [ ] NPM default password changed
- [ ] Cloudflare WAF enabled
- [ ] Only necessary ports exposed
- [ ] Regular security updates scheduled

---

**Deployment Guide Version**: 1.0
**Last Updated**: 2025-11-23
**Author**: Infrastructure & DevOps Agent

For questions, issues, or contributions, please visit the project repository.
