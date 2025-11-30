#!/bin/bash
#
# Budget Reduction Tracking - Proxmox One-Liner Installer
#
# This script runs FROM the Proxmox host and creates an LXC container,
# then installs the Budget Reduction Tracking application inside it.
#
# Usage (from Proxmox host):
#   bash -c "$(curl -fsSL https://raw.githubusercontent.com/dmcguire80/Budget-Reduction-Tracking/main/proxmox-install.sh)"
#
# Requirements:
#   - Running on Proxmox VE host
#   - Ubuntu 22.04 LXC template downloaded
#   - Internet connectivity
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
HOSTNAME="budget-tracker"
TEMPLATE="local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst"
STORAGE="local-lvm"
DISK_SIZE="20"
MEMORY="4096"
SWAP="512"
CORES="4"
BRIDGE="vmbr0"

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
    echo -e "\n${BLUE}==>${NC} ${CYAN}$1${NC}\n"
}

# Banner
echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Budget Reduction Tracking - Proxmox Installer          ║
║   Automated LXC Container Deployment                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if running on Proxmox
log_step "Validating Proxmox environment"

if ! command -v pct &> /dev/null; then
    log_error "This script must be run on a Proxmox VE host"
    log_error "The 'pct' command was not found"
    exit 1
fi

if ! command -v pvesh &> /dev/null; then
    log_error "Proxmox tools not found. Are you running this on a Proxmox host?"
    exit 1
fi

log_info "✓ Proxmox VE environment detected"

# Check if template exists
log_step "Checking for Ubuntu 22.04 template"

if ! pveam list local | grep -q "ubuntu-22.04"; then
    log_warn "Ubuntu 22.04 template not found"
    log_info "Downloading Ubuntu 22.04 LXC template..."
    pveam download local ubuntu-22.04-standard_22.04-1_amd64.tar.zst
    log_info "✓ Template downloaded successfully"
else
    log_info "✓ Ubuntu 22.04 template found"
fi

# Find next available VMID
log_step "Finding available container ID"

VMID=100
while pvesh get /cluster/resources | grep -q "\"vmid\":$VMID"; do
    VMID=$((VMID + 1))
done

log_info "✓ Using VMID: $VMID (scanned VMs and LXC containers cluster-wide)"

# Create LXC container
log_step "Creating LXC container"

log_info "Container specifications:"
echo "  • VMID: $VMID"
echo "  • Hostname: $HOSTNAME"
echo "  • OS: Ubuntu 22.04"
echo "  • CPU: $CORES cores"
echo "  • RAM: $MEMORY MB"
echo "  • Swap: $SWAP MB"
echo "  • Disk: $DISK_SIZE GB"
echo "  • Network: DHCP on $BRIDGE"
echo ""

pct create $VMID $TEMPLATE \
    --hostname $HOSTNAME \
    --memory $MEMORY \
    --swap $SWAP \
    --cores $CORES \
    --net0 name=eth0,bridge=$BRIDGE,firewall=1,ip=dhcp \
    --storage $STORAGE \
    --rootfs $STORAGE:$DISK_SIZE \
    --unprivileged 1 \
    --features nesting=1 \
    --onboot 1 \
    --description "Budget Reduction Tracking v1.0.0"

log_info "✓ Container created successfully (VMID: $VMID)"

# Start container
log_step "Starting container"
pct start $VMID
log_info "✓ Container started"

# Wait for container to be ready
log_info "Waiting for container to initialize..."
sleep 10

# Wait for network
log_info "Waiting for network configuration..."
for i in {1..30}; do
    if pct exec $VMID -- ip addr show eth0 | grep -q "inet "; then
        log_info "✓ Network is up"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Timeout waiting for network"
        exit 1
    fi
    sleep 2
done

# Get container IP
CONTAINER_IP=$(pct exec $VMID -- hostname -I | awk '{print $1}')
log_info "✓ Container IP: $CONTAINER_IP"

# Install curl in container (needed for downloading install script)
log_step "Preparing container"
log_info "Installing curl..."
pct exec $VMID -- bash -c "apt update && apt install -y curl"
log_info "✓ Curl installed"

# Download and run install script inside container
log_step "Installing Budget Reduction Tracking"
log_info "This will take 5-10 minutes..."
echo ""

pct exec $VMID -- bash -c "export CONTAINER_IP='$CONTAINER_IP' && $(curl -fsSL https://raw.githubusercontent.com/dmcguire80/Budget-Reduction-Tracking/main/install.sh)"

# Get database credentials
log_step "Retrieving configuration"
DB_CREDS=$(pct exec $VMID -- cat /root/.budget-tracking/credentials 2>/dev/null || echo "")

# Print success message
log_step "Installation Complete!"

echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              ✓ INSTALLATION SUCCESSFUL                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
log_info "Container Information:"
echo "  • VMID: $VMID"
echo "  • Hostname: $HOSTNAME"
echo "  • IP Address: $CONTAINER_IP"
echo ""

log_info "Application Access:"
echo -e "  • Frontend: ${CYAN}http://$CONTAINER_IP:3000${NC}"
echo -e "  • Backend API: ${CYAN}http://$CONTAINER_IP:3001${NC}"
echo -e "  • Health Check: ${CYAN}http://$CONTAINER_IP:3001/health${NC}"
echo ""

log_info "Useful Commands:"
echo -e "  • Enter container: ${CYAN}pct enter $VMID${NC}"
echo -e "  • View logs: ${CYAN}pct exec $VMID -- pm2 logs${NC}"
echo -e "  • Check status: ${CYAN}pct exec $VMID -- pm2 status${NC}"
echo -e "  • Restart app: ${CYAN}pct exec $VMID -- pm2 restart budget-tracking-api${NC}"
echo -e "  • Stop container: ${CYAN}pct stop $VMID${NC}"
echo -e "  • Start container: ${CYAN}pct start $VMID${NC}"
echo ""

if [ -n "$DB_CREDS" ]; then
    log_info "Database credentials saved in container at:"
    echo -e "  ${CYAN}/root/.budget-tracking/credentials${NC}"
    echo ""
fi

log_warn "Next Steps:"
echo "  1. Open browser to http://$CONTAINER_IP:3000"
echo "  2. Register a new user account"
echo "  3. Start tracking your debt reduction!"
echo ""
echo "  For external access, configure Nginx Proxy Manager:"
echo "  • Forward Hostname/IP: $CONTAINER_IP"
echo "  • Forward Port: 3000"
echo "  • Enable SSL with Let's Encrypt"
echo ""

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "Installation completed successfully! 🎉"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
