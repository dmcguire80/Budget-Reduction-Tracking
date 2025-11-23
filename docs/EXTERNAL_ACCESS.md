# External Access Setup Guide

This guide covers the complete setup for external access to your Budget Reduction Tracking app through Cloudflare, UniFi Gateway, and Nginx Proxy Manager.

## Overview

The external access stack works as follows:

```
Internet Users
    ↓
Cloudflare (DNS + CDN + DDoS Protection)
    ↓ (HTTPS)
Your Public IP (Home/Office)
    ↓
UniFi Gateway/Firewall (Port Forwarding)
    ↓ (Ports 80, 443)
Nginx Proxy Manager (Proxmox LXC)
    ↓ (Reverse Proxy + SSL Termination)
Budget Tracking App (Proxmox LXC)
    ↓ (Port 3000)
budget-tracking.yourdomain.com
```

## Prerequisites

- [ ] Domain name (e.g., yourdomain.com)
- [ ] Cloudflare account (free tier is fine)
- [ ] UniFi network controller access
- [ ] Nginx Proxy Manager installed (separate LXC on Proxmox)
- [ ] Budget Tracking app LXC container running

---

## Part 1: Cloudflare Setup

### 1.1 Add Domain to Cloudflare

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **"Add a Site"**
3. Enter your domain name (e.g., `yourdomain.com`)
4. Select **Free** plan
5. Click **"Continue"**

### 1.2 Update Nameservers at Domain Registrar

Cloudflare will provide two nameservers:

```
ns1.cloudflare.com
ns2.cloudflare.com
```

**Steps**:
1. Log in to your domain registrar (GoDaddy, Namecheap, etc.)
2. Find DNS/Nameserver settings
3. Change nameservers to Cloudflare's provided nameservers
4. Save changes
5. Wait for propagation (can take up to 24 hours, usually faster)

### 1.3 Create DNS Record

Once nameservers are active:

1. Go to **DNS** → **Records** in Cloudflare
2. Click **"Add record"**
3. Fill in:
   ```
   Type: A
   Name: budget-tracking (or @ for root domain)
   IPv4 address: <Your-Public-IP>
   Proxy status: ✓ Proxied (Orange Cloud)
   TTL: Auto
   ```
4. Click **"Save"**

**Finding Your Public IP**:
```bash
# From any device on your network
curl ifconfig.me
# or
curl icanhazip.com
```

### 1.4 Configure SSL/TLS Settings

1. Go to **SSL/TLS** → **Overview**
2. Set SSL/TLS encryption mode to **"Full (strict)"**
   - This ensures end-to-end encryption
   - NPM will handle the certificate between Cloudflare and your server

3. Go to **SSL/TLS** → **Edge Certificates**
   - **Always Use HTTPS**: ✓ On
   - **Automatic HTTPS Rewrites**: ✓ On
   - **Minimum TLS Version**: TLS 1.2
   - **TLS 1.3**: ✓ Enabled
   - **Opportunistic Encryption**: ✓ On

### 1.5 Configure Security Settings

1. Go to **Security** → **Settings**
   ```
   Security Level: Medium
   Challenge Passage: 30 minutes
   Browser Integrity Check: ✓ On
   Privacy Pass Support: ✓ On
   ```

2. **WAF (Web Application Firewall)** (Optional but recommended)
   - Go to **Security** → **WAF**
   - Enable **OWASP Core Ruleset**
   - Review and enable other managed rules as needed

### 1.6 Configure Speed/Caching Settings

1. Go to **Speed** → **Optimization**
   ```
   Auto Minify: ✓ JavaScript, ✓ CSS, ✓ HTML
   Brotli: ✓ On
   Early Hints: ✓ On
   ```

2. Go to **Caching** → **Configuration**
   ```
   Caching Level: Standard
   Browser Cache TTL: Respect Existing Headers
   ```

### 1.7 Create Page Rule for Budget Tracking (Optional)

1. Go to **Rules** → **Page Rules**
2. Click **"Create Page Rule"**
3. URL pattern: `budget-tracking.yourdomain.com/*`
4. Add settings:
   ```
   SSL: Full (strict)
   Security Level: Medium
   Cache Level: Standard
   Browser Cache TTL: Respect Existing Headers
   ```
5. Save and Deploy

---

## Part 2: UniFi Network Configuration

### 2.1 Access UniFi Controller

1. Log in to your UniFi controller (typically https://unifi.ui.com or local controller)
2. Select your network site

### 2.2 Create Port Forwarding Rules

1. Go to **Settings** → **Routing** → **Port Forwarding**
2. Click **"Create New Port Forwarding Rule"**

**Rule 1: HTTP (Port 80)**
```
Name: NPM-HTTP
Enabled: ✓
From: Any
Port: 80
Forward IP: <NPM-LXC-INTERNAL-IP> (e.g., 192.168.1.50)
Forward Port: 80
Protocol: TCP
Logging: ✓ (optional, for debugging)
```

**Rule 2: HTTPS (Port 443)**
```
Name: NPM-HTTPS
Enabled: ✓
From: Any
Port: 443
Forward IP: <NPM-LXC-INTERNAL-IP> (e.g., 192.168.1.50)
Forward Port: 443
Protocol: TCP
Logging: ✓ (optional, for debugging)
```

### 2.3 Configure Firewall Rules (Optional - Advanced)

For additional security, restrict access to only Cloudflare IPs:

1. Go to **Settings** → **Security** → **Firewall**
2. Create new rule: **"Allow Cloudflare IPs to NPM"**

**Cloudflare IPv4 Ranges** (update from [Cloudflare IPs](https://www.cloudflare.com/ips/)):
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

**Rule Configuration**:
```
Type: Allow
Protocol: TCP
From: <Cloudflare-IP-Range> (add each range)
To: <NPM-LXC-IP>
Destination Port: 80, 443
Action: Accept
```

### 2.4 Local DNS Entry (Optional - Recommended)

Create local DNS entry for internal network access:

1. Go to **Settings** → **Networks**
2. Select your LAN network (e.g., Default)
3. Scroll to **DHCP Name Server**
4. Enable **Manual**
5. Add DNS entry:
   ```
   Hostname: budget-tracking.yourdomain.com
   IP Address: <NPM-LXC-IP> (internal)
   ```

This allows local devices to bypass the internet and access the app directly through NPM internally.

---

## Part 3: Nginx Proxy Manager Configuration

### 3.1 Access NPM Web Interface

1. Open browser to NPM LXC IP: `http://<NPM-LXC-IP>:81`
2. Default login:
   ```
   Email: admin@example.com
   Password: changeme
   ```
3. **IMMEDIATELY** change the default password after first login

### 3.2 Create Proxy Host for Budget Tracking

1. Click **"Hosts"** → **"Proxy Hosts"**
2. Click **"Add Proxy Host"**

#### Details Tab
```
Domain Names: budget-tracking.yourdomain.com
Scheme: http
Forward Hostname/IP: <Budget-Tracking-LXC-IP> (e.g., 192.168.1.100)
Forward Port: 3000
Cache Assets: ✓
Block Common Exploits: ✓
Websockets Support: ✓ (if using websockets later)
Access List: None (or create custom access list)
```

#### SSL Tab
```
SSL Certificate: Request a new SSL Certificate
Force SSL: ✓
HTTP/2 Support: ✓
HSTS Enabled: ✓
HSTS Subdomains: ✓ (if using subdomains)
Email Address for Let's Encrypt: your-email@example.com
I Agree to the Let's Encrypt Terms of Service: ✓
```

**Important**: Make sure your Cloudflare DNS is properly configured BEFORE requesting the SSL certificate. Let's Encrypt needs to verify domain ownership.

### 3.3 Advanced Configuration (Optional)

Click **"Advanced"** tab and add custom Nginx configuration:

```nginx
# Increase upload size limit
client_max_body_size 10M;

# Increase timeout for long-running requests
proxy_connect_timeout 600;
proxy_send_timeout 600;
proxy_read_timeout 600;
send_timeout 600;

# Security headers (additional to NPM defaults)
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

### 3.4 Verify SSL Certificate

1. After saving, NPM will request SSL certificate from Let's Encrypt
2. This may take 1-2 minutes
3. Check the **SSL** tab shows a green checkmark
4. Certificate should show **Valid** with expiry date ~90 days

**Troubleshooting SSL Issues**:
- Ensure Cloudflare DNS is pointing to your public IP
- Ensure ports 80 and 443 are forwarded to NPM in UniFi
- Check NPM logs: Settings → View Logs
- Verify Cloudflare SSL mode is "Full (strict)"

### 3.5 Test Access

1. From external network (mobile data or different network):
   ```
   https://budget-tracking.yourdomain.com
   ```
2. From internal network:
   ```
   https://budget-tracking.yourdomain.com
   ```

Both should work and show valid SSL certificate.

---

## Part 4: Budget Tracking App Configuration

### 4.1 Update Backend .env File

Ensure your backend `.env` file has correct CORS origin:

```env
# /opt/budget-tracking/backend/.env
CORS_ORIGIN=https://budget-tracking.yourdomain.com
```

If you want to allow both production and local development:

```env
CORS_ORIGIN=https://budget-tracking.yourdomain.com,http://localhost:5173
```

### 4.2 Update Frontend .env File

```env
# /opt/budget-tracking/frontend/.env
VITE_API_URL=https://budget-tracking.yourdomain.com
```

### 4.3 Rebuild and Restart Application

```bash
# In Budget Tracking LXC
cd /opt/budget-tracking

# Rebuild frontend with new API URL
cd frontend
npm run build

# Restart backend with new CORS settings
cd ../backend
pm2 restart budget-tracking-api

# Verify
pm2 status
pm2 logs budget-tracking-api
```

---

## Part 5: Testing and Verification

### 5.1 DNS Propagation Check

```bash
# Check if DNS is resolving correctly
nslookup budget-tracking.yourdomain.com

# Should show Cloudflare IPs (proxied)
dig budget-tracking.yourdomain.com
```

### 5.2 SSL Certificate Check

```bash
# Check SSL certificate
openssl s_client -connect budget-tracking.yourdomain.com:443 -servername budget-tracking.yourdomain.com

# Or use online tool: https://www.ssllabs.com/ssltest/
```

### 5.3 Access Tests

Test from multiple locations:

1. **Internal Network**
   ```
   curl -I https://budget-tracking.yourdomain.com
   ```

2. **External Network** (mobile data)
   - Open in browser: https://budget-tracking.yourdomain.com
   - Should show valid SSL lock icon
   - Should load app correctly

3. **Different Devices**
   - Desktop browser
   - Mobile browser
   - Tablet

### 5.4 Performance Check

Use Cloudflare Analytics to monitor:

1. Go to Cloudflare Dashboard → **Analytics** → **Traffic**
2. Monitor requests, bandwidth, threats blocked
3. Check **Security** → **Events** for any blocked requests

---

## Part 6: Maintenance and Troubleshooting

### 6.1 SSL Certificate Renewal

Let's Encrypt certificates expire every 90 days. NPM handles auto-renewal, but verify:

1. Go to NPM → **SSL Certificates**
2. Check expiry dates
3. NPM auto-renews ~30 days before expiry
4. Monitor NPM logs for renewal attempts

### 6.2 Update Cloudflare IP Ranges (If Using Firewall Rules)

Cloudflare occasionally updates their IP ranges:

1. Check [Cloudflare IPs](https://www.cloudflare.com/ips/)
2. Update UniFi firewall rules if using IP whitelist

### 6.3 Common Issues

**Issue: "DNS_PROBE_FINISHED_NXDOMAIN"**
- Solution: DNS not propagated yet, wait longer
- Check nameservers: `dig NS yourdomain.com`

**Issue: "ERR_SSL_PROTOCOL_ERROR"**
- Solution: Check NPM SSL certificate status
- Verify Cloudflare SSL mode is "Full (strict)"
- Check NPM logs

**Issue: "502 Bad Gateway"**
- Solution: Budget Tracking app is down
- Check PM2: `pm2 status`
- Check Nginx in app LXC: `systemctl status nginx`
- Verify forward IP/port in NPM

**Issue: "CORS Error" in browser console**
- Solution: Update backend CORS_ORIGIN in .env
- Restart backend: `pm2 restart budget-tracking-api`

**Issue: Can't access from internal network**
- Solution: Check UniFi local DNS entry
- Try accessing via NPM IP directly: `http://<NPM-IP>`

### 6.4 Monitoring

**NPM Access Logs**:
```bash
# In NPM LXC
tail -f /data/logs/proxy-host-*.log
```

**Cloudflare Analytics**:
- Monitor traffic patterns
- Check for blocked threats
- Review cache hit rates

**Budget Tracking App Logs**:
```bash
# In Budget Tracking LXC
pm2 logs budget-tracking-api
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## Part 7: Security Best Practices

### 7.1 Cloudflare Security Settings

1. **Enable Bot Fight Mode** (free tier)
   - Security → Bots
   - Enable Bot Fight Mode

2. **Enable DDoS Protection** (automatic)
   - Already enabled on all Cloudflare plans

3. **Review Security Events**
   - Security → Events
   - Monitor for suspicious activity

### 7.2 NPM Security

1. **Change default admin password** (critical)
2. **Enable 2FA** (if NPM version supports it)
3. **Regularly update NPM**
4. **Use strong passwords**
5. **Limit access to NPM admin interface** (port 81)
   - Consider firewall rules to restrict admin access

### 7.3 Budget Tracking App Security

1. **Strong JWT secrets** in .env
2. **Rate limiting** enabled in backend
3. **Regular updates** (npm packages, system packages)
4. **Regular backups** (database and app files)
5. **Monitor logs** for suspicious activity

### 7.4 Network Security

1. **Disable UPnP** on UniFi gateway
2. **Enable IDS/IPS** on UniFi gateway
3. **Regular firmware updates** on UniFi devices
4. **Monitor UniFi threat management** dashboard

---

## Part 8: Scaling and Advanced Configuration

### 8.1 Multiple App Instances (Future)

If you need to scale, you can run multiple Budget Tracking LXCs:

```
NPM → Load Balance → [App LXC 1, App LXC 2, App LXC 3]
                   → Shared PostgreSQL LXC
```

NPM supports load balancing in advanced configuration.

### 8.2 Separate Database LXC (Future)

Move PostgreSQL to dedicated LXC:

```
Budget Tracking App LXC → PostgreSQL LXC
```

Update DATABASE_URL in backend .env to point to database LXC IP.

### 8.3 CDN Caching (Cloudflare)

Configure caching rules for static assets:

1. Cloudflare → **Caching** → **Cache Rules**
2. Create rule for static assets:
   ```
   If: URI Path contains "/assets/"
   Then: Cache Level = Standard, Browser Cache TTL = 1 year
   ```

---

## Summary Checklist

- [ ] Domain added to Cloudflare
- [ ] Nameservers updated at registrar
- [ ] DNS A record created (proxied)
- [ ] Cloudflare SSL/TLS set to "Full (strict)"
- [ ] Cloudflare security settings configured
- [ ] UniFi port forwarding rules created (80, 443)
- [ ] UniFi firewall rules created (optional)
- [ ] UniFi local DNS entry created (optional)
- [ ] NPM proxy host created
- [ ] NPM SSL certificate obtained
- [ ] Budget Tracking app .env files updated
- [ ] App rebuilt and restarted
- [ ] Access tested from internal network
- [ ] Access tested from external network
- [ ] SSL certificate verified
- [ ] Monitoring set up

---

## Support Resources

- **Cloudflare Docs**: https://developers.cloudflare.com/
- **Cloudflare Community**: https://community.cloudflare.com/
- **Nginx Proxy Manager Docs**: https://nginxproxymanager.com/
- **UniFi Community**: https://community.ui.com/
- **Let's Encrypt**: https://letsencrypt.org/

---

**Last Updated**: 2025-11-23
**Version**: 1.0
