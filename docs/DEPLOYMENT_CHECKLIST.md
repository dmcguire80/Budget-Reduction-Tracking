# Production Deployment Checklist

Complete checklist for deploying the Budget Reduction Tracking application to production on Proxmox LXC.

## Pre-Deployment Checklist

### Infrastructure Requirements

- [ ] Proxmox VE 7.0+ installed and configured
- [ ] Sufficient resources available:
  - [ ] 2 CPU cores minimum for app LXC
  - [ ] 2GB RAM minimum for app LXC
  - [ ] 20GB storage minimum for app LXC
  - [ ] Additional resources for PostgreSQL if separate LXC
- [ ] Network connectivity verified
- [ ] DNS records configured in Cloudflare
- [ ] Nginx Proxy Manager (NPM) LXC running
- [ ] SSL certificates available (Let's Encrypt via NPM)

### External Access Stack

- [ ] Domain name registered and active
- [ ] Cloudflare account configured:
  - [ ] Domain added to Cloudflare
  - [ ] Nameservers updated at registrar
  - [ ] DNS A record created (proxied)
  - [ ] SSL/TLS mode set to "Full (strict)"
  - [ ] Security settings configured
- [ ] UniFi Gateway configured:
  - [ ] Port forwarding rules created (80, 443)
  - [ ] Firewall rules configured (optional)
  - [ ] Local DNS entry created (optional)
- [ ] Nginx Proxy Manager configured:
  - [ ] Proxy host created for application
  - [ ] SSL certificate obtained from Let's Encrypt
  - [ ] Force SSL enabled

### Code Repository

- [ ] All code pushed to main/production branch
- [ ] Git tags created for version
- [ ] CHANGELOG.md updated
- [ ] No uncommitted changes
- [ ] All tests passing locally
- [ ] Code review completed (if applicable)

## LXC Container Setup

### 1. Create LXC Container

```bash
# On Proxmox host
pct create 100 local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
  --hostname budget-tracking \
  --memory 2048 \
  --cores 2 \
  --storage local-lvm \
  --rootfs local-lvm:20 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --unprivileged 1 \
  --features nesting=1

# Start container
pct start 100

# Enter container
pct enter 100
```

**Checklist:**
- [ ] LXC container created successfully
- [ ] Container assigned static IP (recommended): `192.168.1.x`
- [ ] Container can access internet
- [ ] Container can be accessed from Proxmox host

### 2. Run LXC Setup Script

```bash
# Inside LXC container
cd /tmp
wget https://raw.githubusercontent.com/yourusername/Budget-Reduction-Tracking/main/lxc/setup-lxc.sh
chmod +x setup-lxc.sh
./setup-lxc.sh
```

**Checklist:**
- [ ] Node.js 20 LTS installed
- [ ] PostgreSQL 16 installed and running
- [ ] Nginx installed and running
- [ ] PM2 installed globally
- [ ] Git installed
- [ ] Build tools installed (make, gcc, etc.)

### 3. Verify Installation

```bash
# Check versions
node --version    # Should be v20.x.x
npm --version     # Should be v10.x.x
psql --version    # Should be 16.x
nginx -v          # Should be nginx/1.x.x
pm2 --version     # Should be 5.x.x
```

**Checklist:**
- [ ] All versions match requirements
- [ ] Services are running:
  - [ ] `systemctl status postgresql`
  - [ ] `systemctl status nginx`

## Database Setup

### 1. Create Production Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside psql
CREATE DATABASE budget_tracking;
CREATE USER budget_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE budget_tracking TO budget_user;

# Grant schema privileges
\c budget_tracking
GRANT ALL ON SCHEMA public TO budget_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO budget_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO budget_user;

\q
```

**Checklist:**
- [ ] Database created: `budget_tracking`
- [ ] User created with strong password
- [ ] Privileges granted correctly
- [ ] Can connect: `psql -U budget_user -d budget_tracking -h localhost`

### 2. Configure PostgreSQL Security

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/16/main/pg_hba.conf

# Add line (if not exists):
# local   all             budget_user                             scram-sha-256

# Restart PostgreSQL
sudo systemctl restart postgresql
```

**Checklist:**
- [ ] Authentication configured
- [ ] PostgreSQL restarted
- [ ] Connection test successful

## Application Deployment

### 1. Clone Repository

```bash
# Create application directory
sudo mkdir -p /opt/budget-tracking
sudo chown $USER:$USER /opt/budget-tracking
cd /opt/budget-tracking

# Clone repository
git clone https://github.com/yourusername/Budget-Reduction-Tracking.git .

# Checkout production branch/tag
git checkout tags/v1.0.0  # Or main branch
```

**Checklist:**
- [ ] Repository cloned to `/opt/budget-tracking`
- [ ] Correct branch/tag checked out
- [ ] `.git` directory present
- [ ] All files present and readable

### 2. Backend Configuration

```bash
cd /opt/budget-tracking/backend

# Create .env file
cp .env.example .env
nano .env
```

**Edit `.env` with production values:**

```env
# Application
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://budget_user:STRONG_PASSWORD@localhost:5432/budget_tracking

# JWT Secrets (GENERATE NEW SECURE VALUES)
JWT_SECRET=<use-openssl-rand-base64-32>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=<use-openssl-rand-base64-32>
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://budget-tracking.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Password Hashing
BCRYPT_ROUNDS=12
```

**Generate secure secrets:**
```bash
# Generate JWT secrets
openssl rand -base64 32
openssl rand -base64 32
```

**Checklist:**
- [ ] `.env` file created in backend directory
- [ ] All environment variables set
- [ ] **JWT_SECRET** is strong (32+ characters)
- [ ] **REFRESH_TOKEN_SECRET** is strong (32+ characters)
- [ ] **DATABASE_URL** matches database configuration
- [ ] **CORS_ORIGIN** matches production domain
- [ ] **NODE_ENV** set to `production`
- [ ] File permissions: `chmod 600 .env`

### 3. Frontend Configuration

```bash
cd /opt/budget-tracking/frontend

# Create .env file
cp .env.example .env
nano .env
```

**Edit `.env` with production values:**

```env
VITE_API_URL=https://budget-tracking.yourdomain.com
VITE_APP_NAME=Budget Reduction Tracker
VITE_APP_VERSION=1.0.0
VITE_ENV_LABEL=Production
```

**Checklist:**
- [ ] `.env` file created in frontend directory
- [ ] **VITE_API_URL** matches production domain (HTTPS)
- [ ] All required variables set

### 4. Install Dependencies

```bash
# Backend
cd /opt/budget-tracking/backend
npm ci --production=false  # Install all dependencies for build

# Frontend
cd /opt/budget-tracking/frontend
npm ci
```

**Checklist:**
- [ ] Backend dependencies installed (check for errors)
- [ ] Frontend dependencies installed (check for errors)
- [ ] `node_modules` directories created
- [ ] No vulnerability warnings (or acceptable warnings only)

### 5. Run Database Migrations

```bash
cd /opt/budget-tracking/backend

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Verify migrations
npx prisma migrate status
```

**Checklist:**
- [ ] Prisma Client generated successfully
- [ ] All migrations applied
- [ ] No pending migrations
- [ ] Database schema created correctly

### 6. (Optional) Seed Database

```bash
cd /opt/budget-tracking/backend

# Only if you want demo data
npm run seed
```

**Checklist:**
- [ ] Demo user created (if seeded)
- [ ] Sample data available (if needed)
- [ ] **Note**: Skip this in production if you don't want demo data

### 7. Build Applications

```bash
# Build backend
cd /opt/budget-tracking/backend
npm run build

# Verify build
ls -la dist/

# Build frontend
cd /opt/budget-tracking/frontend
npm run build

# Verify build
ls -la dist/
```

**Checklist:**
- [ ] Backend TypeScript compiled to `dist/` directory
- [ ] `dist/index.js` exists
- [ ] Frontend built to `dist/` directory
- [ ] `dist/index.html` exists
- [ ] `dist/assets/` directory contains bundled JS/CSS
- [ ] No build errors

## Service Configuration

### 1. Configure PM2 for Backend

```bash
cd /opt/budget-tracking

# Copy PM2 config
cp lxc/pm2-ecosystem.config.js .

# Start backend with PM2
pm2 start pm2-ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions shown

# Verify backend is running
pm2 status
pm2 logs budget-tracking-api
```

**Checklist:**
- [ ] PM2 process started: `budget-tracking-api`
- [ ] Process status: `online`
- [ ] No errors in logs
- [ ] Backend responds: `curl http://localhost:3001/health`
- [ ] PM2 configured to start on boot

### 2. Configure Nginx for Frontend

```bash
# Copy nginx configuration
sudo cp /opt/budget-tracking/lxc/nginx-site.conf /etc/nginx/sites-available/budget-tracking

# Create symlink
sudo ln -s /etc/nginx/sites-available/budget-tracking /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Verify nginx is running
sudo systemctl status nginx
```

**Checklist:**
- [ ] Nginx configuration file created
- [ ] Nginx configuration valid: `nginx -t` passes
- [ ] Nginx reloaded successfully
- [ ] Nginx serving frontend: `curl http://localhost:3000`
- [ ] Nginx proxying backend: `curl http://localhost:3000/api/health`

## External Access Configuration

### 1. Verify Cloudflare DNS

```bash
# Check DNS resolution
nslookup budget-tracking.yourdomain.com
dig budget-tracking.yourdomain.com
```

**Checklist:**
- [ ] DNS resolves to Cloudflare IPs (proxied)
- [ ] TTL is appropriate (Auto or 300s)

### 2. Configure Nginx Proxy Manager

1. Log in to NPM at `http://<NPM-IP>:81`
2. Navigate to **Hosts** → **Proxy Hosts**
3. Click **Add Proxy Host**

**Details Tab:**
- [ ] Domain: `budget-tracking.yourdomain.com`
- [ ] Scheme: `http`
- [ ] Forward Hostname/IP: `<App-LXC-IP>`
- [ ] Forward Port: `3000`
- [ ] Cache Assets: ✓
- [ ] Block Common Exploits: ✓
- [ ] Websockets Support: ✓

**SSL Tab:**
- [ ] SSL Certificate: Request new certificate
- [ ] Force SSL: ✓
- [ ] HTTP/2 Support: ✓
- [ ] HSTS Enabled: ✓
- [ ] Email: `your-email@example.com`
- [ ] Agree to Let's Encrypt ToS: ✓

**Checklist:**
- [ ] Proxy host created
- [ ] SSL certificate obtained successfully
- [ ] Certificate shows as **Valid**

### 3. Test External Access

**From External Network (mobile data, etc.):**
```bash
# Test from external location
curl -I https://budget-tracking.yourdomain.com

# Expected: HTTP/2 200
```

**Checklist:**
- [ ] Application accessible from external network
- [ ] HTTPS working (green padlock in browser)
- [ ] No SSL certificate warnings
- [ ] API endpoints responding
- [ ] Frontend assets loading correctly

## Post-Deployment Verification

### 1. Functional Testing

- [ ] Homepage loads correctly
- [ ] Login page accessible
- [ ] User registration works:
  - [ ] Navigate to `/register`
  - [ ] Create new account
  - [ ] Verify email validation
  - [ ] Verify password requirements
- [ ] User login works:
  - [ ] Login with registered user
  - [ ] Verify JWT token received
  - [ ] Verify redirect to dashboard
- [ ] Dashboard displays:
  - [ ] Summary cards
  - [ ] Charts (if data exists)
  - [ ] Quick actions
- [ ] Account management:
  - [ ] Create new account
  - [ ] View account list
  - [ ] Edit account
  - [ ] Delete account
- [ ] Transaction management:
  - [ ] Add transaction
  - [ ] View transactions
  - [ ] Edit transaction
  - [ ] Delete transaction
- [ ] Analytics:
  - [ ] View projections
  - [ ] View charts
  - [ ] Export data (if implemented)

### 2. Performance Testing

```bash
# Install Apache Bench (if not installed)
sudo apt install apache2-utils

# Test homepage
ab -n 100 -c 10 https://budget-tracking.yourdomain.com/

# Test API endpoint
ab -n 100 -c 10 https://budget-tracking.yourdomain.com/api/health
```

**Checklist:**
- [ ] Homepage responds in < 1 second
- [ ] API endpoints respond in < 500ms
- [ ] No 500 errors
- [ ] No timeouts

### 3. Security Verification

- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] SSL certificate valid and trusted
- [ ] Security headers present:
  ```bash
  curl -I https://budget-tracking.yourdomain.com
  # Check for: X-Frame-Options, X-Content-Type-Options, etc.
  ```
- [ ] No sensitive data in browser console
- [ ] No sensitive data in network requests (except encrypted)
- [ ] JWT tokens expire correctly
- [ ] Refresh token rotation works
- [ ] Rate limiting active:
  ```bash
  # Send many requests quickly
  for i in {1..150}; do curl https://budget-tracking.yourdomain.com/api/health; done
  # Should see 429 Too Many Requests after limit
  ```

### 4. Monitoring Setup

**Check Application Logs:**
```bash
# Backend logs
pm2 logs budget-tracking-api

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

**Checklist:**
- [ ] Backend logs showing normal activity
- [ ] No errors in backend logs
- [ ] Nginx access logs showing requests
- [ ] No errors in nginx logs
- [ ] Database logs showing normal activity

### 5. Backup Configuration

**Database Backup Script:**
```bash
sudo nano /opt/budget-tracking/scripts/backup-database.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/budget-tracking"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

mkdir -p $BACKUP_DIR

# Create backup
pg_dump -U budget_user budget_tracking > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

```bash
chmod +x /opt/budget-tracking/scripts/backup-database.sh
```

**Setup Cron Job:**
```bash
# Edit crontab
crontab -e

# Add line (daily backup at 2 AM):
0 2 * * * /opt/budget-tracking/scripts/backup-database.sh >> /var/log/backup.log 2>&1
```

**Checklist:**
- [ ] Backup script created
- [ ] Backup script executable
- [ ] Cron job configured
- [ ] Test backup manually: `./backup-database.sh`
- [ ] Verify backup file created in `/opt/backups/budget-tracking/`

### 6. Update Documentation

- [ ] Update README.md with production URL
- [ ] Update docs/DEPLOYMENT.md with actual configuration
- [ ] Document any deviations from standard setup
- [ ] Create runbook for common operations
- [ ] Document backup and recovery procedures

## Monitoring and Maintenance

### Daily Checks

- [ ] Check PM2 status: `pm2 status`
- [ ] Check application logs: `pm2 logs budget-tracking-api --lines 50`
- [ ] Check nginx status: `systemctl status nginx`
- [ ] Check disk space: `df -h`
- [ ] Check memory usage: `free -h`

### Weekly Checks

- [ ] Review error logs for issues
- [ ] Check backup files exist and are recent
- [ ] Verify SSL certificate expiry (NPM auto-renews)
- [ ] Review Cloudflare analytics for anomalies
- [ ] Check for npm package updates (security)

### Monthly Checks

- [ ] Update npm packages (if needed)
- [ ] Update Node.js (if new LTS version)
- [ ] Review and archive old logs
- [ ] Test backup restoration procedure
- [ ] Review database performance
- [ ] Update system packages: `apt update && apt upgrade`

## Rollback Procedure

If deployment fails, follow these steps:

### 1. Stop Services

```bash
pm2 stop budget-tracking-api
sudo systemctl stop nginx
```

### 2. Rollback Code

```bash
cd /opt/budget-tracking
git checkout <previous-version-tag>
```

### 3. Rollback Database (if needed)

```bash
# Restore from backup
gunzip -c /opt/backups/budget-tracking/backup_YYYYMMDD_HHMMSS.sql.gz | psql -U budget_user budget_tracking
```

### 4. Rebuild and Restart

```bash
# Rebuild
cd backend && npm run build
cd ../frontend && npm run build

# Restart services
pm2 restart budget-tracking-api
sudo systemctl start nginx
```

## Troubleshooting

### Application Not Accessible

1. Check PM2: `pm2 status`
2. Check nginx: `systemctl status nginx`
3. Check firewall: UniFi port forwarding rules
4. Check NPM: Proxy host configuration
5. Check Cloudflare: DNS and SSL settings

### Database Connection Issues

1. Check PostgreSQL: `systemctl status postgresql`
2. Verify DATABASE_URL in .env
3. Test connection: `psql -U budget_user -d budget_tracking`
4. Check PostgreSQL logs: `/var/log/postgresql/`

### SSL Certificate Issues

1. Check NPM certificate status
2. Verify Cloudflare SSL mode: "Full (strict)"
3. Check Let's Encrypt rate limits
4. Renew certificate manually in NPM

## Final Sign-Off

- [ ] All checklist items completed
- [ ] Application accessible from internet
- [ ] All features working as expected
- [ ] Monitoring configured
- [ ] Backups configured
- [ ] Documentation updated
- [ ] Team notified of deployment
- [ ] Production URL shared: `https://budget-tracking.yourdomain.com`

**Deployed By:** _______________
**Date:** _______________
**Version:** _______________
**Deployment Time:** _______________

---

**Congratulations! Your Budget Reduction Tracking application is now live! 🎉**

For issues or questions, refer to the main documentation or contact the development team.
